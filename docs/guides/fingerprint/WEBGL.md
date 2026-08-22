# WebGL Fingerprinting

> WebGL is a privacy-relevant surface. BotBrowser provides comprehensive, profile-driven protection across all WebGL fingerprint surfaces.

---

<a id="prerequisites"></a>

## Prerequisites

- Familiarity with [Browser Fingerprinting Explained](BROWSER_OVERVIEW.md).
- BotBrowser installed with a valid profile. See [Installation](../../../INSTALLATION.md).

---

<a id="overview"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

Start with this launch to establish a clean baseline before adding extra overrides.

## Overview

WebGL is a privacy-relevant API surface. BotBrowser provides profile-driven control over all WebGL output, ensuring consistent results regardless of the host GPU.

---

<a id="configuration"></a>

## Configuration

### WebGL Mode

Control WebGL behavior with the `--bot-config-webgl` flag:

```bash
# Use profile-defined WebGL settings (default)
--bot-config-webgl=profile

# Use real system WebGL (no protection)
--bot-config-webgl=real

# Disable WebGL entirely
--bot-config-webgl=disabled
```

### WebGL Image Noise

Enable deterministic noise on WebGL image readback:

```bash
# Enable WebGL image noise (default)
--bot-config-noise-webgl-image=true

# Disable WebGL image noise
--bot-config-noise-webgl-image=false
```

### Noise Seed

Use `--bot-noise-seed` for reproducible WebGL image output:

```bash
--bot-noise-seed=42
```

### GPU Simulation for Headless Servers

On headless Linux servers without a physical GPU, BotBrowser provides full GPU context simulation (ENT Tier2). The profile's GPU information is presented to WebGL regardless of the host's actual hardware.

### Translated shader source

When the `WEBGL_debug_shaders` extension is available, the translated shader source follows the
target platform represented by the active profile. This keeps shader-language output consistent
with the profile instead of exposing the host operating system or graphics backend. The same
profile policy applies when the page runs in a separate BrowserContext.

---

<a id="how-botbrowser-protects"></a>

## How BotBrowser Provides Protection

BotBrowser controls all WebGL output surfaces at the browser engine level: GPU identity strings, parameter values, shader output, image readback, extension availability, and precision formats. WebGL2 receives the same protections. All values are returned through the same code paths as a native browser, not through JavaScript interception.

---

<a id="verification"></a>

## Effect Verification

To verify protection is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported WebGL vendor, renderer, and parameter values match the profile configuration, not the host GPU.
3. To verify reproducibility, launch two sessions with the same `--bot-noise-seed` and confirm that the WebGL image fingerprint output is identical.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| WebGL renderer shows host GPU instead of profile GPU | Verify profile is loaded with `--bot-profile`. Check startup logs for profile loading errors. |
| WebGL not available on headless server | GPU simulation requires ENT Tier2. Verify your license tier supports headless GPU simulation. |
| WebGL image fingerprint varies between runs | Use `--bot-noise-seed` with a fixed value for reproducible output. |
| Shader output reveals host OS | Ensure `--bot-config-webgl=profile` is active. The profile normalizes shader translation output. |
| `WEBGL_debug_shaders` returns an unexpected shader language | Confirm that the intended profile is loaded in the current BrowserContext and that WebGL is using `profile` mode. Check the returned source for the profile's target language, not the host machine's native backend. |

---

<a id="next-steps"></a>

## Next Steps

- [Canvas Fingerprinting](CANVAS.md). 2D Canvas as a fingerprint surface.
- [Performance Fingerprinting](PERFORMANCE.md). GPU timing as a tracking vector.
- [CLI Flags Reference](../../../CLI_FLAGS.md). All WebGL and noise configuration flags.

---

**Related documentation:** [Advanced Features: Multi-Layer Fingerprint Noise](../../../ADVANCED_FEATURES.md#multi-layer-fingerprint-noise) | [Advanced Features: Graphics & Rendering Engine](../../../ADVANCED_FEATURES.md#graphics-rendering-engine)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
