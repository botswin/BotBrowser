# Docker Deployment

> Deploy BotBrowser in Docker for reproducible, isolated browser automation with consistent fingerprint protection.

---

<a id="prerequisites"></a>

## Prerequisites

- **Docker** 20.10 or later.
- **Docker Compose** v2 (optional, for multi-instance setups).
- **BotBrowser Ubuntu `.deb` package** from [GitHub Releases](https://github.com/botswin/BotBrowser/releases) for the **Standard Build**, or from the enterprise distribution for **Trimmed Build** (ENT Tier3).
- **A profile file** (`.enc` for production).

> **Note:** Ubuntu/Linux binaries require an ENT Plan Tier 1 or higher subscription.
>
> **Trimmed Build for container fleets**: For container farms running short-session, high-concurrency automation, Trimmed Build cuts per-context spin-up by 85% and CPU peak by 68% versus Standard Build on Linux x64, returning headroom directly to the container's CPU and memory budgets. Profile, CLI, and CDP behavior are identical; you can build images against Standard Build locally and swap in the Trimmed `.deb` in production. Product overview: [TRIMMED_BUILD.md](../../../TRIMMED_BUILD.md). See [Choosing a Build](../../../INSTALLATION.md#choosing-a-build).

---

<a id="quick-start"></a>

## Quick Start

### 1. Create a Dockerfile

```dockerfile
FROM --platform=linux/amd64 ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:10.0

# Install required system libraries and Xvfb
RUN apt-get update && apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libxkbcommon0 libgtk-3-0 \
    libpangocairo-1.0-0 libpango-1.0-0 \
    libwayland-client0 libwayland-server0 \
    libdbus-1-3 libatspi2.0-0 libasound2 libxss1 \
    fonts-liberation libcurl4 libvulkan1 \
    xvfb curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install BotBrowser
COPY botbrowser_*.deb /tmp/
RUN dpkg -i /tmp/botbrowser_*.deb || apt-get install -f -y \
    && rm /tmp/botbrowser_*.deb

# Create directories for profiles and data
RUN mkdir -p /app/profiles /app/data

WORKDIR /app

# Start Xvfb and BotBrowser
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
```

### 2. Create the entrypoint script

```bash
#!/bin/bash
# entrypoint.sh

# Start virtual display
Xvfb :10 -screen 0 1920x1080x24 -ac &
sleep 1

# Launch BotBrowser with any additional args passed to the container
exec chromium-browser \
    --headless \
    --no-sandbox \
    --disable-dev-shm-usage \
    --user-data-dir=/app/data \
    --remote-debugging-port=9222 \
    --remote-debugging-address=0.0.0.0 \
    "$@"
```

### 3. Build and run

```bash
docker build -t botbrowser:latest .

docker run -d \
    --name botbrowser \
    --init \
    -v /path/to/profiles:/app/profiles:ro \
    -p 9222:9222 \
    botbrowser:latest \
    --bot-profile=/app/profiles/profile.enc \
    --proxy-server=socks5://user:pass@proxy.example.com:1080
```

### 4. Verify

```bash
curl http://localhost:9222/json/version
```

---

<a id="how-it-works"></a>

## How It Works

Running BotBrowser in Docker provides process isolation and reproducible environments:

1. **Base image.** Ubuntu 22.04 provides all the shared libraries Chrome depends on. The `--platform=linux/amd64` flag ensures consistent builds on any host architecture.

2. **Virtual display.** Xvfb runs inside the container to provide the X11 display server that BotBrowser requires, even in headless mode. The `DISPLAY=:10.0` environment variable connects BotBrowser to this virtual display.

3. **Shared memory.** The `--disable-dev-shm-usage` flag tells Chrome to write shared memory files to `/tmp` instead of `/dev/shm`, which is limited to 64 MB by default in Docker containers.

4. **Profile mounting.** Profiles are mounted as read-only volumes. The image stays unchanged when profiles change, and supported fingerprint values come from the profile instead of the container host.

5. **Remote debugging.** Port 9222 is exposed for CDP (Chrome DevTools Protocol) connections from automation frameworks running on the host or other containers.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Docker Compose with multiple instances

```yaml
version: '3.8'

services:
  botbrowser-1:
    build: .
    image: botbrowser:latest
    container_name: bb-instance-1
    platform: linux/amd64
    init: true
    ports:
      - "9222:9222"
    volumes:
      - ./profiles:/app/profiles:ro
      - bb1-data:/app/data
    command:
      - --bot-profile=/app/profiles/profile-1.enc
      - --proxy-server=socks5://user:pass@proxy1.example.com:1080
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9222/json/version"]
      interval: 30s
      timeout: 10s
      retries: 3

  botbrowser-2:
    build: .
    image: botbrowser:latest
    container_name: bb-instance-2
    platform: linux/amd64
    init: true
    ports:
      - "9223:9222"
    volumes:
      - ./profiles:/app/profiles:ro
      - bb2-data:/app/data
    command:
      - --bot-profile=/app/profiles/profile-2.enc
      - --proxy-server=socks5://user:pass@proxy2.example.com:1080
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9222/json/version"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  bb1-data:
  bb2-data:
```

### Random profile selection per container

Use `--bot-profile-dir` to let each container start with a random profile:

```yaml
services:
  botbrowser:
    image: botbrowser:latest
    volumes:
      - ./profiles:/app/profiles:ro
    command:
      - --bot-profile-dir=/app/profiles
```

### Connecting from the host with Playwright

```javascript
import { chromium } from "playwright-core";

// Connect to BotBrowser running in Docker
const browser = await chromium.connectOverCDP("http://localhost:9222");
const context = browser.contexts()[0];
const page = await context.newPage();

await page.addInitScript(() => {
    delete window.__playwright__binding__;
    delete window.__pwInitScripts;
});

await page.goto("https://example.com");
console.log(await page.title());
await browser.close();
```

### Scaling with Docker Compose

```bash
# Scale to 5 instances (each gets a random port)
docker compose up -d --scale botbrowser=5
```

When scaling, remove fixed port mappings and use dynamic ports:

```yaml
services:
  botbrowser:
    image: botbrowser:latest
    init: true
    ports:
      - "9222"  # Docker assigns a random host port
    volumes:
      - ./profiles:/app/profiles:ro
    command:
      - --bot-profile-dir=/app/profiles
    restart: unless-stopped
```

### Increasing shared memory

If you encounter crashes related to shared memory, increase the `/dev/shm` size:

```yaml
services:
  botbrowser:
    image: botbrowser:latest
    shm_size: '2gb'
```

Or with `docker run`:

```bash
docker run -d --shm-size=2g botbrowser:latest ...
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Container exits immediately | Check logs with `docker logs <container>`. Usually a missing library or incorrect profile path. |
| "Cannot open display" | Ensure the entrypoint starts Xvfb before launching BotBrowser. Verify `DISPLAY=:10.0` is set. |
| Crashes with "out of memory" | Increase `shm_size` or add `--disable-dev-shm-usage` to browser args. |
| Cannot connect to port 9222 | Add `--remote-debugging-address=0.0.0.0` so Chrome listens on all interfaces inside the container. |
| Zombie processes accumulating | Always use `init: true` in docker-compose or `--init` with `docker run`. |
| Profile not found | Verify the volume mount path matches the `--bot-profile` path inside the container. Use `docker exec` to check. |
| Slow startup | The first launch may take longer as Chrome initializes. Subsequent starts with the same `user-data-dir` are faster. |

---

<a id="next-steps"></a>

## Next Steps

- [Headless Server Setup](HEADLESS_SERVER_SETUP.md). Bare-metal Ubuntu deployment without Docker.
- [Linux GPU Backend Selection](LINUX_GPU_BACKEND.md). Choose the right Mesa or SwiftShader path inside containers, with a Dockerfile fragment for Mesa llvmpipe.
- [Performance Optimization](PERFORMANCE_OPTIMIZATION.md). Tune resource usage for production workloads.
- [Playwright Guide](../getting-started/PLAYWRIGHT.md). Integrate with Playwright for automation.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**Related documentation:** [Installation Guide](../../../INSTALLATION.md) | [Advanced Features](../../../ADVANCED_FEATURES.md) | [Docker examples](../../../docker/)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [Docker Deployment Guide](https://botbrowser.io/en/blog/docker-deployment-guide/)
