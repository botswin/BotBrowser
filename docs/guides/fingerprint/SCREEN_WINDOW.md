# Screen and Window Protection

> Screen dimensions, window properties, and display characteristics are privacy-relevant surfaces. BotBrowser provides full control over these values to maintain consistent display identity.

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

Screen and window properties vary across devices and monitor configurations. The combination of screen resolution, available dimensions, device pixel ratio, color depth, and window frame sizes creates a device-specific profile that is accessible without any permissions and stable across sessions. BotBrowser provides full control over these values at the browser engine level.

---

<a id="configuration"></a>

## Configuration

### Window Dimensions

Control window size with `--bot-window`:

```bash
# Use profile's window settings (default for headless)
--bot-window=profile

# Use real system window dimensions (default for desktop headful)
--bot-window=real

# Direct size specification (innerWidth x innerHeight)
--bot-window=1920x1080

# Full JSON customization
--bot-window='{"innerWidth":1920,"innerHeight":1080,"devicePixelRatio":2}'
```

When using `WxH` format, `outerWidth` and `outerHeight` are auto-derived from the profile's border definitions to maintain consistent frame dimensions.

### Screen Properties

Control screen dimensions with `--bot-screen`:

```bash
# Use profile's screen settings (default for headless)
--bot-screen=profile

# Use real system screen dimensions (default for desktop headful)
--bot-screen=real

# Direct size specification (width x height)
--bot-screen=2560x1440

# Full JSON customization
--bot-screen='{"width":2560,"height":1440,"availWidth":2560,"availHeight":1400}'
```

### Device Scale Factor

Use [`--bot-dpr`](DEVICE_PIXEL_RATIO.md) to select profile, host, or compatibility display-scale behavior. See [Device Pixel Ratio Policy](DEVICE_PIXEL_RATIO.md) for mode selection and per-context setup.

The separate GUI scaling control does not select a DPR policy:

```bash
--bot-disable-device-scale-factor=true
```

### Headful Mode Note

Desktop profiles default to `real` in headful mode, meaning the browser uses actual system window and screen dimensions. To apply profile-defined dimensions in headful mode, set both flags explicitly:

```bash
--bot-window=profile
--bot-screen=profile
```

<a id="per-context-configuration"></a>

### Per-Context Configuration

For Per-Context Fingerprint, pass `--bot-window` and `--bot-screen` in `botbrowserFlags` before the context creates its first page or worker. The selected display policy then remains associated with that BrowserContext across desktop and mobile profile workflows. See [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md) for the setup order.

---

<a id="how-botbrowser-controls"></a>

## How BotBrowser Provides Protection

BotBrowser controls all screen and window properties at the browser engine level. Screen dimensions, available area, window size, device pixel ratio, color depth, and frame dimensions are all defined by the profile. CSS media queries, JavaScript property access, and Client Hints headers return consistent values.

---

<a id="troubleshooting"></a>

## Common Scenarios

- Capture a baseline result using the Quick Start setup.
- Change one relevant setting at a time and compare the new output.
- Keep your final launch command documented so future checks are reproducible.

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Viewport doesn't match profile | Do not set `defaultViewport` in Puppeteer. Do not set viewport options in Playwright. Let the profile control dimensions. |
| Screen size shows host display in headful mode | Set `--bot-screen=profile` and `--bot-window=profile` explicitly for headful. |
| Frame dimensions inconsistent with claimed OS | Verify the profile matches your intended platform. Frame borders are OS-specific. |
| devicePixelRatio shows host value | Load the intended profile and select `--bot-dpr=profile`. GUI scaling is controlled separately. |

---

<a id="next-steps"></a>

## Next Steps

- [CSS Signal Consistency](CSS_SIGNAL_CONSISTENCY.md). CSS media queries that probe display characteristics.
- [Navigator Properties](NAVIGATOR_PROPERTIES.md). Browser API surfaces that complement screen data.
- [Browser Fingerprinting Explained](BROWSER_OVERVIEW.md). The full fingerprinting landscape.
- [CLI Flags Reference](../../../CLI_FLAGS.md). All window and screen configuration flags.

---

**Related documentation:** [Advanced Features: Display & UI Control](../../../ADVANCED_FEATURES.md#complete-fingerprint-control)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
