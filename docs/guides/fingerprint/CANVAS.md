# Canvas Fingerprinting

> Canvas API output is a widely used tracking signal. BotBrowser applies profile-driven protection to supported Canvas readback surfaces.

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

## Overview

Canvas fingerprinting uses the HTML5 Canvas API to generate a device-specific identifier. The rendering output varies across devices and platforms, producing a stable tracking signal that can identify users across sessions without their knowledge or consent.

Canvas fingerprinting is one of the most widely deployed tracking techniques. The Princeton Web Census found Canvas fingerprinting scripts on over 14,000 of the top 1 million websites. BotBrowser applies profile-driven protection to supported Canvas readback paths.

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

When a profile is loaded, BotBrowser uses its built-in font libraries and rendering engine to align Canvas output across supported hosts. Text glyph rasterization can retain platform-specific pixel differences, so compare the exact profile and host combination when pixel equality is required. See [Font Fingerprinting](FONT.md).

<a id="canvas-color-spaces"></a>

### Canvas Color Spaces

BotBrowser 150 keeps Canvas 2D protection active for standard and wide-gamut canvas color spaces, including `display-p3`. Color-space selection follows the page request while profile-backed replay and deterministic protection remain consistent with the session.

---

<a id="how-botbrowser-protects"></a>

## How BotBrowser Provides Protection

BotBrowser applies deterministic noise to supported Canvas 2D output in the rendering pipeline, not through JavaScript injection. The policy covers supported pixel readback and text measurement paths. Platform-specific rasterization can still affect pixels across hosts.

---

<a id="verification"></a>

## Effect Verification

To verify protection is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported Canvas hash and image data match the profile configuration, not the host machine.
3. To verify reproducibility, launch two sessions with the same profile and `--bot-noise-seed` on the same rendering path, then compare the Canvas fingerprint output.

### Checking a canvas fingerprint in the page

A canvas fingerprint check does not need a third-party site. Draw the same fixed scene, read it back, and compare the digest between runs:

```javascript
function canvasDigest() {
  const canvas = document.createElement("canvas");
  canvas.width = 240;
  canvas.height = 60;
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "top";
  ctx.font = "14px Arial";
  ctx.fillStyle = "#f60";
  ctx.fillRect(10, 10, 80, 30);
  ctx.fillStyle = "#069";
  ctx.fillText("BotBrowser canvas check", 14, 20);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText("BotBrowser canvas check", 18, 26);
  return canvas.toDataURL();
}

const first = canvasDigest();
const second = canvasDigest();
console.log("same within one page:", first === second);
console.log("length:", first.length);
```

Compare two launches of the same profile rather than one page against itself. Within a single page the two reads should always match; the question is whether the value is the same in the next session. Record the profile path, the seed, the host, and the digest length, then repeat with `toBlob` and with an `OffscreenCanvas` worker to see whether all readback paths agree.

| Observation | What it usually means |
|-------------|-----------------------|
| Digest differs between two runs of the same profile | `--bot-noise-seed` is missing or different, or the profile did not load |
| Digest matches the host browser | The profile is not loaded; check for `--bot-profile` errors at startup |
| Digest matches across hosts with the same profile | The profile-backed path is applied consistently for this measurement |
| `getImageData` differs from `toDataURL` on the same canvas | Readback-path difference; compare the same API on both runs |

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Canvas fingerprint changes between sessions with same profile | Verify you are using the same `--bot-noise-seed` value. Without a fixed seed, noise varies per session by design. |
| Canvas fingerprint differs between headless and headful mode | Ensure `--bot-noise-canvas=true` is set. Check that the same profile is used in both modes. |
| Canvas output matches raw system output (no noise) | Confirm the profile is loaded correctly with `--bot-profile`. Check for error messages at startup. |
| Different fingerprint on different host OS | This is expected without a profile. With the same BotBrowser profile and seed, compare the profile-supported Canvas surfaces; text rasterization and host graphics backends can still affect pixels. |
| Wide-gamut canvas behaves differently from standard canvas | Use a current BotBrowser release with a matching profile package. Confirm that the active profile includes support for the `display-p3` Canvas 2D workflow. |

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

---

**Related BotBrowser blog:** [Canvas fingerprinting: how it works and what helps](https://botbrowser.io/en/blog/canvas-fingerprinting/)
