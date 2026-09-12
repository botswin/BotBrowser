# Canvas Fingerprinting

> Canvas API output is a widely used tracking signal. BotBrowser provides deterministic, profile-driven protection for all Canvas readback surfaces.

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

Canvas fingerprinting uses the HTML5 Canvas API to generate a device-specific identifier. The rendering output varies across devices and platforms, producing a stable tracking signal that can identify users across sessions without their knowledge or consent.

Canvas fingerprinting is one of the most widely deployed tracking techniques. The Princeton Web Census found Canvas fingerprinting scripts on over 14,000 of the top 1 million websites. BotBrowser provides profile-driven protection across all Canvas readback surfaces.

---

<a id="configuration"></a>

## Configuration

### Enabling/Disabling Canvas Noise

Canvas noise is enabled by default. To control it explicitly:

```bash
# Enable canvas noise (default)
--bot-noise-canvas=true

# Disable canvas noise
--bot-noise-canvas=false
```

### Noise Seed for Reproducibility

Use `--bot-noise-seed` to produce a specific, reproducible noise pattern:

```bash
# Each seed produces a unique but stable canvas fingerprint
--bot-noise-seed=42
```

The noise seed affects Canvas 2D, WebGL, WebGPU, text metrics, and other surfaces simultaneously. See [CLI Flags Reference](../../../CLI_FLAGS.md) for the full list of affected surfaces.

### Cross-Platform Consistency

When a profile is loaded, BotBrowser uses its built-in font libraries and rendering engine to produce identical Canvas output regardless of the host operating system. A Windows profile running on a Linux server produces the same Canvas fingerprint as it would on a Windows machine.

<a id="canvas-color-spaces"></a>

### Canvas Color Spaces

BotBrowser 150 keeps Canvas 2D protection active for standard and wide-gamut canvas color spaces, including `display-p3`. Color-space selection follows the page request while profile-backed replay and deterministic protection remain consistent with the session.

---

<a id="how-botbrowser-protects"></a>

## How BotBrowser Provides Protection

BotBrowser applies deterministic noise to all Canvas 2D output at the rendering pipeline level, not through JavaScript injection. This covers all pixel readback and text measurement operations. Built-in rendering produces consistent results across hosts, and platform-appropriate emoji sets are loaded from the profile. API call patterns and timing remain consistent with native browser behavior.

---

<a id="verification"></a>

## Effect Verification

To verify protection is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported Canvas hash and image data match the profile configuration, not the host machine.
3. To verify reproducibility, launch two sessions with the same `--bot-noise-seed` and confirm that the Canvas fingerprint output is identical.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Canvas fingerprint changes between sessions with same profile | Verify you are using the same `--bot-noise-seed` value. Without a fixed seed, noise varies per session by design. |
| Canvas fingerprint differs between headless and headful mode | Ensure `--bot-noise-canvas=true` is set. Check that the same profile is used in both modes. |
| Canvas output matches raw system output (no noise) | Confirm the profile is loaded correctly with `--bot-profile`. Check for error messages at startup. |
| Different fingerprint on different host OS | This is expected without a profile. With a BotBrowser profile, Canvas output should be identical across hosts. |
| Wide-gamut canvas behaves differently from standard canvas | Use BotBrowser 150.0.7871.46 or newer with a matching profile package. Canvas protection covers both standard and `display-p3` Canvas 2D workflows. |

---

<a id="next-steps"></a>

## Next Steps

- [WebGL Fingerprinting](WEBGL.md). GPU-level rendering as a fingerprint surface.
- [Font Fingerprinting](FONT.md). How font differences contribute to Canvas fingerprinting.
- [Browser Fingerprinting Explained](BROWSER_OVERVIEW.md). The full picture of fingerprint-based tracking.
- [CLI Flags Reference](../../../CLI_FLAGS.md). All noise and configuration flags.

---

**Related documentation:** [Advanced Features: Multi-Layer Fingerprint Noise](../../../ADVANCED_FEATURES.md#multi-layer-fingerprint-noise) | [CanvasLab Forensics Tool](../../../tools/canvaslab/)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
