# Audio Fingerprinting

> The Web Audio API exposes device-specific audio processing characteristics. BotBrowser provides deterministic noise protection for all AudioContext-based tracking surfaces.

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

Web Audio API output can be used as a tracking identifier because it varies across devices and platforms. BotBrowser's profile-driven noise ensures the reported audio output matches the declared platform, maintaining consistent identity across sessions.

---

<a id="configuration"></a>

## Configuration

### Enabling/Disabling Audio Noise

AudioContext noise is enabled by default. To control it explicitly:

```bash
# Enable audio context noise (default)
--bot-noise-audio-context=true

# Disable audio context noise
--bot-noise-audio-context=false
```

### Noise Seed for Reproducibility

Use `--bot-noise-seed` to produce a specific, reproducible audio fingerprint:

```bash
# Each seed produces a unique but stable audio fingerprint
--bot-noise-seed=42
```

The noise seed affects AudioContext output alongside Canvas, WebGL, and other surfaces simultaneously.

### Cross-Worker Consistency

BotBrowser ensures that AudioContext fingerprints remain consistent across the main thread, Web Workers, and Service Workers within the same session.

---

<a id="how-botbrowser-protects"></a>

## How BotBrowser Provides Protection

BotBrowser applies deterministic noise to all Web Audio API output at the browser engine level. Audio properties, processing results, and frequency data all receive consistent noise controlled by the profile. Protection covers all execution contexts including Workers. API call patterns and timing remain consistent with native browser behavior.

---

<a id="verification"></a>

## Effect Verification

To verify protection is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported AudioContext hash and audio processing values match the profile configuration, not the host machine.
3. To verify reproducibility, launch two sessions with the same `--bot-noise-seed` and confirm that the audio fingerprint output is identical.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Audio fingerprint changes between sessions | Use `--bot-noise-seed` with a fixed value for reproducible output. Without a fixed seed, noise varies per session by design. |
| Audio fingerprint matches raw system output | Verify the profile is loaded with `--bot-profile`. Check for startup errors. Confirm `--bot-noise-audio-context` is not set to `false`. |
| Different audio hash in Worker vs main thread | This should not happen with BotBrowser. Check that the profile is loaded and noise is enabled. Report the issue if it persists. |
| AudioContext not available | Some headless configurations may not initialize audio. Ensure the BotBrowser binary supports audio in your deployment mode. |

---

<a id="next-steps"></a>

## Next Steps

- [AudioLab](../getting-started/AUDIOLAB.md). Record and analyze Web Audio API calls for forensic inspection.
- [Canvas Fingerprinting](CANVAS.md). Another rendering-based fingerprint surface.
- [Performance Fingerprinting](PERFORMANCE.md). Timing as a tracking vector.
- [Browser Fingerprinting Explained](BROWSER_OVERVIEW.md). The full fingerprinting landscape.
- [CLI Flags Reference](../../../CLI_FLAGS.md). All noise and configuration flags.

---

**Related documentation:** [Advanced Features: Multi-Layer Fingerprint Noise](../../../ADVANCED_FEATURES.md#multi-layer-fingerprint-noise) | [AudioLab Forensics Tool](../../../tools/audiolab/) | [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
