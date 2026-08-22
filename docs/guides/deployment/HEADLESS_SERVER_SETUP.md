# Headless Server Setup

> Set up BotBrowser on headless Ubuntu servers for stable production automation with consistent fingerprint protection.

---

<a id="prerequisites"></a>

## Prerequisites

- **Ubuntu 20.04 or later** (x86_64 or arm64).
- **BotBrowser Ubuntu binary** installed via dpkg or the install script. See [Installation Guide](../../../INSTALLATION.md).
- **A matching profile package** (`.enc` for production). BotBrowser 150 and newer profiles are available through subscription or support at [support@botbrowser.io](mailto:support@botbrowser.io) or [@botbrowser_support](https://t.me/botbrowser_support).
- **Root or sudo access** for installing system packages.

> **Note:** Ubuntu/Linux binaries require an ENT Plan Tier 1 or higher subscription.

---

<a id="quick-start"></a>

## Quick Start

### 1. Install required system packages

```bash
sudo apt-get update
sudo apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0 \
    libgtk-3-0 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libwayland-client0 \
    libwayland-server0 \
    libdbus-1-3 \
    libatspi2.0-0 \
    libasound2 \
    libxss1 \
    fonts-liberation \
    xvfb
```

### 2. Set up a virtual display

BotBrowser requires a virtual display on headless servers, even when running in headless mode. Start Xvfb on display `:10.0`:

```bash
Xvfb :10 -screen 0 1920x1080x24 &
export DISPLAY=:10.0
```

### 3. Launch BotBrowser

```bash
DISPLAY=:10.0 chromium-browser \
    --headless \
    --no-sandbox \
    --user-data-dir="$(mktemp -d)" \
    --bot-profile="/path/to/profile.enc" \
    --proxy-server=socks5://user:pass@proxy.example.com:1080 \
    --remote-debugging-port=9222
```

### 4. Verify the instance is running

```bash
curl http://localhost:9222/json/version
```

---

<a id="how-it-works"></a>

## How It Works

On a headless server, BotBrowser needs a few components that are normally present on desktop systems:

1. **System libraries.** Chrome depends on GTK, NSS, ALSA, and other shared libraries. Without them, the binary crashes immediately on startup.

2. **Virtual display (Xvfb).** Even in `--headless` mode, BotBrowser requires an X11 display server. Xvfb provides a virtual framebuffer that satisfies this requirement without a physical monitor. The `DISPLAY=:10.0` environment variable must be set for every BotBrowser process.

3. **GPU rendering.** Servers typically lack a physical GPU, so BotBrowser relies on a software rendering backend for WebGL and WebGPU output. On current Chromium there are multiple software backends with different trade-offs: Mesa llvmpipe via ANGLE GL (recommended, keeps WebGL1/WebGL2/WebGPU available without unsafe-gated flags), SwiftShader (still functional but requires `--enable-unsafe-swiftshader` on current Chromium and is on a deprecation path), and Mesa lavapipe (Vulkan software rasterizer, not production-viable on Ubuntu 22.04 or inside Docker). Backend selection and flag migration are covered in [Linux GPU Backend Selection](LINUX_GPU_BACKEND.md).

4. **Profile-based fingerprinting.** All fingerprint properties (screen resolution, fonts, GPU info, etc.) come from the profile file, not from the server hardware. This means a Windows profile running on an Ubuntu server produces identical fingerprint output.

5. **Headless profile guidance.** BotBrowser 150 does not open visible profile guidance windows in headless mode. Missing, invalid, expired, and version-mismatched profile states are written to terminal output and the process follows the startup failure path. GUI/headful launches keep user-facing profile guidance.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Running multiple instances

Use separate user data directories and debugging ports for each instance:

```bash
for i in 1 2 3; do
    DISPLAY=:10.0 chromium-browser \
        --headless \
        --no-sandbox \
        --user-data-dir="/tmp/bb-instance-$i" \
        --bot-profile="/path/to/profile.enc" \
        --remote-debugging-port=$((9222 + i)) &
done
```

### Systemd service for persistent operation

Create `/etc/systemd/system/botbrowser.service` (requires the Xvfb service defined in the next section):

```ini
[Unit]
Description=BotBrowser Instance
After=network.target xvfb.service
Requires=xvfb.service

[Service]
Type=simple
User=botbrowser
Environment=DISPLAY=:10.0
ExecStart=/usr/bin/chromium-browser \
    --headless \
    --no-sandbox \
    --user-data-dir=/var/lib/botbrowser/data \
    --bot-profile=/var/lib/botbrowser/profile.enc \
    --remote-debugging-port=9222
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable botbrowser
sudo systemctl start botbrowser
```

### Dedicated Xvfb systemd service

For production, run Xvfb as a separate service so it starts before BotBrowser:

Create `/etc/systemd/system/xvfb.service`:

```ini
[Unit]
Description=X Virtual Frame Buffer
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/Xvfb :10 -screen 0 1920x1080x24 -ac
Restart=always

[Install]
WantedBy=multi-user.target
```

Then update the BotBrowser service to depend on it:

```ini
[Unit]
Description=BotBrowser Instance
After=network.target xvfb.service
Requires=xvfb.service
```

### Monitoring with health checks

Create a simple health check script:

```bash
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9222/json/version)
if [ "$response" != "200" ]; then
    echo "BotBrowser is not responding, restarting..."
    systemctl restart botbrowser
fi
```

Add to cron for periodic checks:

```bash
*/5 * * * * /usr/local/bin/bb-healthcheck.sh
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Crash on startup with missing `.so` files | Install all required packages listed above. Run `ldd chromium-browser` to identify missing libraries. |
| "Cannot open display" error | Ensure Xvfb is running and `DISPLAY=:10.0` is set. Verify with `echo $DISPLAY`. |
| GPU process crashes in logs | Expected on servers without a GPU. Switch to the Mesa llvmpipe backend (`--use-angle=gl --bot-gpu-emulation=false`) for stable WebGL/WebGPU. Do **not** add `--disable-gpu` on current Chromium: it disables WebGPU adapter discovery and both WebGL contexts. See [Linux GPU Backend Selection](LINUX_GPU_BACKEND.md). |
| Screenshot timeouts | Confirm the virtual display is running. Increase the Xvfb resolution if the profile's screen dimensions exceed 1920x1080. |
| High memory usage with many instances | Each instance uses 200-500 MB. Use `--bot-profile-dir` for random profile selection instead of launching extra instances. |
| "Operation not permitted" with `--no-sandbox` | Run as a non-root user, or use `--no-sandbox` when running as root inside containers. |
| Zombie processes accumulating | Use `--init` in Docker or `init: true` in docker-compose. For systemd, the service manager handles this. |
| Browser exits without opening a page | Check terminal output for missing, invalid, expired, or version-mismatched profile guidance. Headless BotBrowser 150 does not show a visible startup window. |
| Container logs mention unavailable desktop or graphics services | Confirm the browser reaches its debugging endpoint and pages load. BotBrowser 150 suppresses several benign startup diagnostics, but host libraries and the selected graphics backend must still be configured correctly. |

---

<a id="next-steps"></a>

## Next Steps

- [Docker Deployment](DOCKER_DEPLOYMENT.md). Containerized setup with orchestration and scaling.
- [Linux GPU Backend Selection](LINUX_GPU_BACKEND.md). Choose and migrate between Mesa llvmpipe, SwiftShader, and lavapipe software rendering backends on Linux.
- [Performance Optimization](PERFORMANCE_OPTIMIZATION.md). Reduce resource usage and improve speed.
- [Screenshot Best Practices](SCREENSHOT_BEST_PRACTICES.md). Capture screenshots correctly on headless servers.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**Related documentation:** [Installation Guide](../../../INSTALLATION.md) | [Playwright Guide](../getting-started/PLAYWRIGHT.md) | [Advanced Features](../../../ADVANCED_FEATURES.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
