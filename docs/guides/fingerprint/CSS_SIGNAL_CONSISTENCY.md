# CSS Signal Consistency

> CSS features can leak platform and hardware information. BotBrowser normalizes these signals for consistent privacy protection.

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

CSS provides several mechanisms that reveal information about the user's operating system, display hardware, and browser configuration. Media queries, `@supports` rules, system colors, and CSS function behavior all contribute platform-specific signals. BotBrowser normalizes all of these at the browser engine level so that reported values match the loaded profile, regardless of the host system.

---

<a id="configuration"></a>

## Configuration

### Color Scheme

Control the reported color scheme:

```bash
--bot-color-scheme=light
--bot-color-scheme=dark
```

### Font System

The font configuration controls how system font keywords resolve:

```bash
# Profile fonts (system-ui maps to profile's platform font)
--bot-fonts=profile

# Real system fonts (no protection)
--bot-fonts=real
```

### Display Properties

Screen and display characteristics are controlled through profile configuration:

```bash
# Use profile-defined screen properties (color depth, dimensions)
--bot-screen=profile
```

---

<a id="how-botbrowser-normalizes"></a>

## How BotBrowser Normalizes These Signals

BotBrowser normalizes all CSS-related signals at the browser engine level. Color scheme, feature availability, rendering behavior, and system colors all match the profile's declared platform regardless of the host OS.

BotBrowser 150 expands profile-backed browser-family consistency for CSS interface shape, supported feature inventory, computed style output, system colors, system fonts, and mobile CSS behavior. WebKit-family profiles apply their own profile family rules without changing Chromium-family sessions.

---

<a id="troubleshooting"></a>

## Common Scenarios

- Capture a baseline result using the Quick Start setup.
- Change one relevant setting at a time and compare the new output.
- Keep your final launch command documented so future checks are reproducible.

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| System font renders as host OS font | Verify `--bot-fonts=profile` is set. |
| Color scheme doesn't match expectation | Set explicitly with `--bot-color-scheme=light` or `dark`. |
| @supports query reveals wrong platform | Check that the profile matches your intended platform. Feature availability follows the profile. |
| CSS system colors expose host theme | Ensure profile is loaded. System colors are controlled at the engine level. |

---

<a id="next-steps"></a>

## Next Steps

- [Font Fingerprinting](FONT.md). Deeper coverage of font-based tracking.
- [Screen and Window Fingerprinting](SCREEN_WINDOW.md). Display properties as fingerprint surfaces.
- [Navigator Properties](NAVIGATOR_PROPERTIES.md). JavaScript API surfaces that complement CSS signals.
- [Browser Fingerprinting Explained](BROWSER_OVERVIEW.md). The full fingerprinting landscape.

---

**Related documentation:** [Advanced Features](../../../ADVANCED_FEATURES.md) | [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
