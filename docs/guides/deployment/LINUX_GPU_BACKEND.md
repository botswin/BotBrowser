# Linux GPU Backend Selection

> Choose the right software rendering backend on Linux servers so WebGL1, WebGL2, and WebGPU stay available with consistent output, without depending on deprecation-gated Chromium flags. CPU behavior varies significantly by deployment mode, see the profile table below for realistic expectations.

---

<a id="prerequisites"></a>

## Prerequisites

- **Ubuntu 20.04 or later** (22.04 recommended). Debian 11/12 also works.
- **BotBrowser Ubuntu binary** installed via `.deb` or the install script. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).
- **Xvfb** for headless servers. See [Headless Server Setup](HEADLESS_SERVER_SETUP.md).

> **Note:** Ubuntu/Linux binaries require an ENT Plan Tier 1 or higher subscription. `--bot-gpu-emulation` requires ENT Tier 2.

---

<a id="quick-start"></a>

## Quick Start

### 1. Install Mesa software rendering packages

```bash
sudo apt-get update
sudo apt-get install -y \
    libgl1-mesa-dri \
    libglx-mesa0 \
    libegl-mesa0 \
    libvulkan1
```

### 2. Launch BotBrowser with the Mesa llvmpipe backend

For the default (new) headless mode, no `DISPLAY` is required:

```bash
chromium-browser \
    --headless \
    --no-sandbox \
    --user-data-dir="$(mktemp -d)" \
    --bot-profile="/path/to/profile.enc" \
    --use-angle=gl \
    --bot-gpu-emulation=false \
    --proxy-server=socks5://user:pass@proxy.example.com:1080
```

For a headed / Xvfb session (screenshots, manual QA, or the legacy `--headless=old` path), run without `--headless` and provide an Xvfb display:

```bash
DISPLAY=:10.0 chromium-browser \
    --no-sandbox \
    --user-data-dir="$(mktemp -d)" \
    --bot-profile="/path/to/profile.enc" \
    --use-angle=gl \
    --bot-gpu-emulation=false \
    --proxy-server=socks5://user:pass@proxy.example.com:1080
```

`--use-angle=gl` routes ANGLE through the system OpenGL stack, and Mesa loads `llvmpipe` (its multi-threaded LLVM JIT rasterizer) automatically when no hardware GPU is present. `--bot-gpu-emulation=false` tells BotBrowser to let the real GL driver render WebGL output while keeping Canvas 2D noise and the `--bot-noise-seed` variance layer active.

---

<a id="how-it-works"></a>

## How It Works

Servers without a physical GPU have three different software rendering paths available through Chromium. They are not equivalent.

<a id="backend-comparison"></a>

### Backend Comparison

| Backend | Required Flags | WebGPU adapter | WebGL1 | WebGL2 | Forward compatible |
|---------|----------------|----------------|--------|--------|--------------------|
| **Mesa llvmpipe** (recommended) | `--use-angle=gl --bot-gpu-emulation=false` | yes | yes | yes | yes |
| SwiftShader | `--disable-gpu --enable-unsafe-swiftshader --use-gl=angle --ignore-gpu-blocklist` | yes | yes | yes | deprecated and unsafe-gated |
| Mesa lavapipe (bare metal, Ubuntu 22.04) | `--use-angle=vulkan --enable-features=Vulkan,DefaultANGLEVulkan,VulkanFromANGLE` | no (null) | yes | no | yes on Ubuntu 24.04+ |
| Mesa lavapipe (Docker, any distro) | same as above | no (null) | no | no | not production-viable |
| Bare `--disable-gpu` (no other flags) | `--disable-gpu` alone | no (null) | no | no | yes but unusable |

Note: `navigator.gpu` (the property) is present on all five rows. The column above tracks whether `navigator.gpu.requestAdapter()` returns a usable adapter.

**Mesa llvmpipe via ANGLE GL** is the recommended default. It uses ANGLE's OpenGL backend to talk to the system `libGL`, which Mesa binds to `llvmpipe` when no hardware GPU is present. WebGL1, WebGL2, and WebGPU entry points all stay available, and the configuration does not depend on any Chromium flag labelled `unsafe`.

**SwiftShader** remains functional on current Chromium but only through `--enable-unsafe-swiftshader`, which Chromium has publicly labelled as a deprecation-gated path. If that flag is removed in a future Chromium release, pipelines that still rely on SwiftShader will lose WebGL altogether. Migrating to Mesa llvmpipe ahead of any such change avoids a forced cutover.

When the browser starts in profile WebGL mode on SwiftShader, it compiles and links shaders in parallel. This shortens shader-heavy page startup and keeps completion checks from occupying the renderer. Real WebGL mode keeps the host driver's native scheduling.

**Mesa lavapipe** is the Vulkan software rasterizer. On Ubuntu 22.04 the packaged Mesa (23.2) does not ship every Vulkan extension ANGLE needs for WebGL2, so WebGL2 context creation fails on bare metal (WebGL1 still works, but `navigator.gpu.requestAdapter()` returns null). Inside Docker containers Vulkan ICD loading is additionally fragile, and lavapipe commonly fails to come up at all, so WebGL1 also stops working. On Ubuntu 24.04 with Mesa 24.2 or later the bare-metal story improves, but the container behavior is still unreliable today.

**Bare `--disable-gpu`** without any other flags disables WebGPU adapter discovery and both WebGL contexts on current Chromium. If you had a working `--disable-gpu` based setup before, it was only working because SwiftShader unsafe-gated flags were present alongside it.

<a id="cpu-profile"></a>

### CPU profile: headed vs headless

Measured on an Ubuntu 22.04 x86_64 server with a standard Windows 11 profile, 25-30 second Canvas 2D + WebGL2 workload, `ps pcpu` summed across all Chromium processes, two repeat runs averaged:

| Mode | Backend | CPU mean | Notes |
|------|---------|----------|-------|
| Headed (`Xvfb`) | SwiftShader | ~999% | baseline |
| Headed (`Xvfb`) | Mesa llvmpipe | ~513% | about 49% lower than SwiftShader |
| Headed (`Xvfb`) | Mesa lavapipe | ~153% | WebGL2 disabled, not a valid production option |
| Headless (default) | SwiftShader (with full unsafe-gated set) | 713.5% | baseline |
| Headless (default) | Mesa llvmpipe | 713.3% | roughly equal, RSS peak ~100 MB higher |

The primary reason to choose Mesa llvmpipe is **consistent WebGL / WebGL2 / WebGPU availability without relying on `--enable-unsafe-*` flags**, not CPU. Two supporting observations about CPU:

1. **In the default headless mode, the CPU cost of SwiftShader and Mesa llvmpipe is essentially identical.** Under headless compositing, rendering goes into an offscreen buffer regardless of the backend, so the Canvas / WebGL workload itself dominates. Don't expect CPU savings when migrating if you were already running the new headless mode.
2. **In headed mode (real Xvfb session, screenshot workflows, or the legacy `--headless=old` path), Mesa llvmpipe runs at roughly half the CPU of SwiftShader** for the same workload. If any part of your pipeline is headed, the resource gain is real.

---

<a id="common-scenarios"></a>

## Common Scenarios

<a id="migrate-from-swiftshader"></a>

### Migrate from a SwiftShader + `--disable-gpu` setup

A common legacy configuration uses `--disable-gpu` paired with several escape-hatch flags to keep SwiftShader working on modern Chromium:

```bash
# Legacy, works but depends on unsafe-gated, deprecated flags
chromium-browser \
    --disable-gpu \
    --enable-unsafe-swiftshader \
    --enable-unsafe-webgpu \
    --use-gl=angle \
    --ignore-gpu-blocklist \
    --headless \
    --bot-profile="/path/to/profile.enc"
```

Replace with:

```bash
# Recommended: Mesa llvmpipe via ANGLE GL
chromium-browser \
    --headless \
    --use-angle=gl \
    --bot-gpu-emulation=false \
    --bot-profile="/path/to/profile.enc"
```

Flags to remove when you migrate:

| Remove | Reason |
|--------|--------|
| `--disable-gpu` | On current Chromium it disables WebGPU adapter discovery and both WebGL contexts, and it wins over `--use-angle=gl` regardless of headed / headless mode. Keeping it means Mesa llvmpipe never takes effect. |
| `--enable-unsafe-swiftshader` | Unsafe-gated, only needed to keep SwiftShader alive. Remove once you leave SwiftShader. |
| `--use-gl=swiftshader` | Explicit SwiftShader opt-in, superseded when you switch to Mesa llvmpipe. |
| `--use-gl=angle` | Older flag form superseded by `--use-angle=gl` in current Chromium. Keeping both risks conflicting selection of the ANGLE backend. |
| `--ignore-gpu-blocklist` | No longer needed: Mesa llvmpipe is not on the blocklist. |
| `--enable-features=Vulkan,DefaultANGLEVulkan,VulkanFromANGLE` | Pins the Vulkan (lavapipe) path, which disables WebGL2 on Ubuntu 22.04 bare metal and collapses WebGL entirely inside Docker. |
| `--use-angle=vulkan` | Same reason, forces the lavapipe path. |
| `--disable-vulkan-surface` | Only relevant to the Vulkan path. |

Flags you keep:

- `--headless` (the browser's default headless mode is already the `new` implementation, no explicit value needed)
- `--no-sandbox` (if you were using it)
- All `--bot-*` flags, including `--bot-profile`, `--bot-noise-seed`, `--bot-webrtc-ice`, `--bot-inject-random-history`, etc.
- `--proxy-server`, `--proxy-ip`, `--user-data-dir`

<a id="gpu-emulation-modes"></a>

### `--bot-gpu-emulation` modes

`--bot-gpu-emulation` accepts three values:

| Value | Behavior |
|-------|----------|
| `false` | Disable BotBrowser's GPU emulation. Hand WebGL rendering to the real GL driver (Mesa llvmpipe via ANGLE GL on Linux). Recommended for the Linux software-rendering path described above. |
| `true` (default) | Standard emulation mode. Historical default and unchanged. |
| `priority` | Standard emulation plus prioritized GPU/WebGPU command-buffer scheduling. Opt-in mode for workloads running many concurrent BrowserContexts under one browser instance, where GPU work from sibling contexts can otherwise stall latency-sensitive challenges. |

When to use `priority`:

- Running high-concurrency automation (for example, one browser instance with 20+ per-context fingerprints under residential proxies) and observing GPU/WebGPU work delays affecting interactive challenges.
- Default behavior is unchanged. Existing setups continue to use the standard `true` mode unless they explicitly opt in.

```bash
chromium-browser \
    --headless \
    --no-sandbox \
    --use-angle=gl \
    --bot-gpu-emulation=priority \
    --bot-profile="/path/to/profile.enc"
```

Combine with the Linux software-rendering setup as needed: `priority` operates on the GPU scheduler layer and is independent from the GL backend selection. If you have already moved to `--bot-gpu-emulation=false` for Mesa llvmpipe, you do not need `priority` because the real GL driver handles GPU work directly.

<a id="docker-deployment"></a>

### Docker deployment

Add the Mesa packages to your Dockerfile and pass the two backend flags at launch. Example fragment for an image based on [Docker Deployment](DOCKER_DEPLOYMENT.md):

```dockerfile
FROM --platform=linux/amd64 ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV DISPLAY=:10.0

RUN apt-get update && apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxkbcommon0 \
    libgtk-3-0 libpangocairo-1.0-0 libpango-1.0-0 \
    libwayland-client0 libwayland-server0 libdbus-1-3 \
    libatspi2.0-0 libasound2 libxss1 fonts-liberation libcurl4 \
    libgl1-mesa-dri libglx-mesa0 libegl-mesa0 libvulkan1 \
    xvfb curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY botbrowser_*.deb /tmp/
RUN dpkg -i /tmp/botbrowser_*.deb || apt-get install -f -y \
    && rm /tmp/botbrowser_*.deb
```

And at launch:

```bash
chromium-browser \
    --headless \
    --no-sandbox \
    --use-angle=gl \
    --bot-gpu-emulation=false \
    --bot-profile=/app/profiles/profile.enc \
    --user-data-dir="$(mktemp -d)" \
    --remote-debugging-port=9222
```

For better container stability, run with `--shm-size=2g`:

```bash
docker run --rm --shm-size=2g your-botbrowser-image
```

<a id="with-noise-seed"></a>

### Keeping `--bot-noise-seed` reproducibility under Mesa llvmpipe

`--bot-gpu-emulation=false` turns off BotBrowser's internal WebGL noise layers, but it does not disable the global noise RNG or Canvas 2D noise. `--bot-noise-seed` continues to produce deterministic, seed-dependent output for Canvas 2D, WebGL readback, text metrics, ClientRect measurements, and offline audio hashes:

```bash
# Same seed across runs: identical hashes for Canvas 2D and WebGL readback
chromium-browser --use-angle=gl --bot-gpu-emulation=false \
    --bot-noise-seed=100 --bot-profile="/path/to/profile.enc" ...

# Different seed: different, stable hashes
chromium-browser --use-angle=gl --bot-gpu-emulation=false \
    --bot-noise-seed=200 --bot-profile="/path/to/profile.enc" ...
```

The reproducibility contract described in [Noise Seed Reproducibility](../fingerprint/NOISE_SEED_REPRODUCIBILITY.md) is unchanged when you switch to Mesa llvmpipe.

<a id="verify-backend"></a>

### Verify the active backend

Open `chrome://gpu` inside the running session and look at the "Graphics Feature Status" table. Under Mesa llvmpipe, the WebGL, WebGL2, and WebGPU rows should report `Software only (via ANGLE/OpenGL)` rather than `Disabled`. The top of the same page also shows the active ANGLE and driver string, which lets you confirm Mesa llvmpipe is in use.

For a deployment smoke test that does not require visual inspection, run your existing Playwright or Puppeteer flow against the new flag set and confirm it completes without the WebGL-related launch errors you may have seen under a broken backend. See [Playwright](../getting-started/PLAYWRIGHT.md) and [Puppeteer](../getting-started/PUPPETEER.md) for launch patterns.

---

<a id="troubleshooting"></a>

## Troubleshooting

### `navigator.gpu.requestAdapter()` returns `null`, and WebGL1 + WebGL2 both fail

`navigator.gpu` itself (the property) is still present, but no adapter can be acquired and neither `getContext('webgl')` nor `getContext('webgl2')` succeeds. Two common causes:

- **`--disable-gpu` is present on its own** (without the unsafe-gated SwiftShader flags alongside it). On current Chromium it disables WebGPU adapter discovery and both WebGL contexts, and it wins over `--use-angle=gl` regardless of mode, so adding the Mesa flag without removing `--disable-gpu` does not help.
- **You are on the Vulkan (lavapipe) path inside a Docker container.** Vulkan ICD loading under container isolation is fragile, and lavapipe frequently fails to come up at all, leaving the adapter null and WebGL unusable.

Fix:

- Remove `--disable-gpu`.
- Remove `--enable-features=Vulkan,DefaultANGLEVulkan,VulkanFromANGLE`, `--use-angle=vulkan`, `--use-gl=swiftshader`, `--use-gl=angle`.
- Keep only `--use-angle=gl --bot-gpu-emulation=false`.

### WebGL1 works, `canvas.getContext('webgl2')` returns `null`, and `requestAdapter()` also returns `null`

You are on the Vulkan (lavapipe) path on a **bare-metal** Linux host (not Docker). On bare metal, lavapipe comes up far enough to serve WebGL1, but your distribution's Mesa version does not advertise every Vulkan extension ANGLE needs for WebGL2, and the WebGPU adapter also fails to initialize. Common on Ubuntu 22.04 (Mesa 23.2). Ubuntu 24.04 with Mesa 24.2+ fixes the extension coverage, but most production fleets are still on 22.04.

- Remove `--enable-features=Vulkan,DefaultANGLEVulkan,VulkanFromANGLE`.
- Remove `--use-angle=vulkan`.
- Switch to `--use-angle=gl` (Mesa llvmpipe via ANGLE GL covers WebGL2 and WebGPU even on Ubuntu 22.04).

### `libGL error: failed to load driver: swrast`

Mesa userspace is missing.

```bash
sudo apt-get install -y libgl1-mesa-dri libglx-mesa0 libegl-mesa0
```

### `chrome://gpu` still shows SwiftShader after the migration

Some flag is forcing SwiftShader back. Check for and remove:

- `--use-gl=swiftshader`
- `--enable-unsafe-swiftshader`
- `--disable-gpu`

Restart the process: flag changes are only read at launch.

### CPU did not drop after migrating

You are running in the default headless mode, and your workload is dominated by the cost of the Canvas / WebGL work itself rather than the GL backend. This matches the measurements in the [CPU profile table](#cpu-profile) above: the two backends run at nearly identical CPU in the default headless path. The primary value of the migration is consistent WebGL / WebGPU availability and a smaller, forward-compatible flag set. CPU reductions appear in headed / Xvfb / legacy-headless scenarios.

### WebGL pixel output changed after migrating

Expected. Different software rasterizers produce different pixel output for the same shader, so the exact bytes coming out of `readPixels` or `toDataURL` will differ between SwiftShader and Mesa llvmpipe. Fingerprint identity fields exposed to the web (User-Agent, platform, UNMASKED vendor and renderer strings) stay controlled by your profile and are unchanged by the migration. `--bot-noise-seed` reproducibility behavior is also unchanged: same seed still produces the same output on the new backend, different seeds still produce different output.

---

<a id="related-documentation"></a>

## Related Documentation


- [Headless Server Setup](HEADLESS_SERVER_SETUP.md) - base Xvfb and system package setup
- [Docker Deployment](DOCKER_DEPLOYMENT.md) - full container template
- [Performance Optimization](PERFORMANCE_OPTIMIZATION.md) - other levers for startup and throughput
- [Performance Benchmark](../../../BENCHMARK.md) - BotBrowser's own fingerprint-protection overhead (Speedometer, fingerprint API latency, per-context scale)
- [WebGPU Fingerprint Protection](../fingerprint/WEBGPU.md) - how WebGPU adapter surfaces are controlled
- [WebGL Fingerprinting](../fingerprint/WEBGL.md) - WebGL parameter consistency
- [Noise Seed Reproducibility](../fingerprint/NOISE_SEED_REPRODUCIBILITY.md) - deterministic variance under `--bot-noise-seed`
- [CLI Flags: `--bot-gpu-emulation`](../../../CLI_FLAGS.md#flag-bot-gpu-emulation) and [`--bot-noise-seed`](../../../CLI_FLAGS.md#flag-bot-noise-seed)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [Mesa llvmpipe vs SwiftShader for Chromium on Linux](https://botbrowser.io/en/blog/mesa-llvmpipe-vs-swiftshader-chromium-linux/)
