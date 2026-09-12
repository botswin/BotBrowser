# WebGPU Fingerprinting and GPU Profile Consistency

> Keep WebGPU adapter behavior aligned with the selected browser profile.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser** installed. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).

---

<a id="overview"></a>

## Overview

WebGPU is a modern graphics API that can expose GPU adapter family, capability limits, feature support, and rendering behavior. These properties can become a fingerprint surface because they vary by hardware, driver, operating system, and browser profile.

BotBrowser keeps WebGPU behavior aligned with the selected profile so a browser identity does not expose the host GPU by accident.

---

<a id="quick-start"></a>

## Quick Start

```bash
# Default: use profile-defined WebGPU values (recommended)
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --user-data-dir="$(mktemp -d)"
```

By default, BotBrowser uses the profile's WebGPU adapter data. No extra flags needed.

---

<a id="configuration"></a>

## Configuration

The `--bot-webgpu` flag controls WebGPU behavior:

| Value | Behavior |
|-------|----------|
| `profile` (default) | Return profile-defined adapter information. GPU probes see the target device's values regardless of the host hardware. |
| `real` | Use the host system's actual GPU. Useful when you need native GPU performance and don't need WebGPU fingerprint protection. |
| `disabled` | Disable WebGPU entirely. `navigator.gpu.requestAdapter()` returns `null`. |

```bash
# Use profile GPU identity (default)
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-webgpu=profile

# Use host GPU directly
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-webgpu=real

# Disable WebGPU
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-webgpu=disabled
```

---

<a id="common-scenarios"></a>

## Common Scenarios

### Cross-platform consistency

Run a Windows profile on a Linux server. The WebGPU adapter reports the profile's GPU identity, not the host's:

```javascript
const browser = await chromium.launch({
    executablePath: process.env.BOTBROWSER_EXEC_PATH,
    headless: true,
    args: [
        "--bot-profile=/path/to/win-profile.enc",
    ],
});

const page = await browser.newPage();
const adapter = await page.evaluate(async () => {
    const gpu = navigator.gpu;
    if (!gpu) return null;
    const adapter = await gpu.requestAdapter();
    if (!adapter) return null;
    const info = await adapter.requestAdapterInfo();
    return { vendor: info.vendor, architecture: info.architecture };
});
console.log(adapter); // Profile's GPU, not host's
await browser.close();
```

### Disable WebGPU for lightweight tasks

If your workload does not require WebGPU, disable it to reduce resource usage:

```bash
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-webgpu=disabled \
    --user-data-dir="$(mktemp -d)"
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| `requestAdapter()` returns `null` | On headless Linux servers, ensure GPU emulation is active (default). If you set `--bot-gpu-emulation=false`, use `--use-angle=gl` with `libgl1-mesa-dri` installed so ANGLE picks up Mesa llvmpipe. Do not add `--disable-gpu`: it disables WebGPU adapter discovery on current Chromium. Full backend matrix in [Linux GPU Backend Selection](../deployment/LINUX_GPU_BACKEND.md). |
| WebGPU shows host GPU info | Check that `--bot-webgpu` is set to `profile` (default) and not `real`. |
| High CPU during WebGPU operations | Expected on software-rendered environments. See [Linux GPU Backend Selection](../deployment/LINUX_GPU_BACKEND.md#cpu-profile) for CPU behavior across SwiftShader, Mesa llvmpipe, and lavapipe. |

---

<a id="next-steps"></a>

## Next Steps

- [WebGL Fingerprint Protection](WEBGL.md). Control WebGL parameters and rendering consistency.
- [Canvas Fingerprint Protection](CANVAS.md). Deterministic noise for Canvas 2D rendering.
- [Linux GPU Backend Selection](../deployment/LINUX_GPU_BACKEND.md). Pick and migrate between Mesa llvmpipe, SwiftShader, and lavapipe software rendering backends on Linux servers.
- [Performance Optimization](../deployment/PERFORMANCE_OPTIMIZATION.md). General performance tuning for production workloads.
- [`--bot-webgpu`](../../../CLI_FLAGS.md#flag-bot-webgpu). CLI values and availability.

---

**Related documentation:** [Advanced Features](../../../ADVANCED_FEATURES.md#multi-layer-fingerprint-noise) | [CLI Flags](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
