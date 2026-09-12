# Device Emulation

> Control device metrics, screen dimensions, and input capabilities for consistent fingerprint protection across sessions.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md).
- **A profile file** (`.enc` or `.json`).

---

<a id="overview"></a>

## Overview

Device metrics are a core part of browser fingerprinting. Screen resolution, window dimensions, device pixel ratio, touch support, and device memory all contribute to a device's fingerprint. BotBrowser gives you full control over these values through profile settings and CLI flags.

Two key flags control the primary display metrics:

- **`--bot-window`**: Controls window dimensions, position, and device pixel ratio.
- **`--bot-screen`**: Controls screen resolution, available area, and color depth.

---

<a id="quick-start"></a>

## Quick Start

### Use profile defaults (recommended for headless)

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --headless
```

In headless mode, BotBrowser defaults to `profile` for both window and screen settings.

### Custom dimensions

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-window=1920x1080 \
  --bot-screen=2560x1440
```

---

<a id="how-it-works"></a>

## How It Works

### Window Dimensions (`--bot-window`)

| Value | Behavior |
|-------|----------|
| `profile` | Use the profile's window dimensions. Default for headless and Android profiles. |
| `real` | Use the host system's actual window dimensions. Default for desktop headful mode. |
| `WxH` | Set `innerWidth` and `innerHeight` directly (e.g., `1920x1080`). `outerWidth` and `outerHeight` are auto-derived from the profile's window border sizes. |
| JSON | Full control over all window properties. |

**JSON format example:**

```bash
--bot-window='{"innerWidth":1920,"innerHeight":1080,"outerWidth":1936,"outerHeight":1152,"screenX":0,"screenY":0,"devicePixelRatio":2}'
```

### Screen Dimensions (`--bot-screen`)

| Value | Behavior |
|-------|----------|
| `profile` | Use the profile's screen metrics. Default for headless and Android profiles. |
| `real` | Use the host system's actual screen metrics. Default for desktop headful mode. |
| `WxH` | Set `width` and `height` directly (e.g., `2560x1440`). `availWidth` and `availHeight` are auto-derived from the profile. |
| JSON | Full control over all screen properties. |

**JSON format example:**

```bash
--bot-screen='{"width":2560,"height":1440,"availWidth":2560,"availHeight":1400,"colorDepth":24,"pixelDepth":24}'
```

### Device Pixel Ratio

Device pixel ratio (DPR) is controlled by the display-scale policy. Use `--bot-dpr` to choose `profile`, `real`, or `advanced` behavior. See [Device Pixel Ratio Policy](../fingerprint/DEVICE_PIXEL_RATIO.md) for mode selection and per-context setup. For a direct numeric DPR, keep using the JSON form of `--bot-window`.

Common profile values:

| Device Type | Typical DPR |
|------------|-------------|
| Standard desktop monitor | 1 |
| Some high-DPI Windows displays | 1.5 |
| macOS Retina | 2 |
| Modern mobile phones | 2 or 3 |

DPR affects the `DPR` Client Hints header and `window.devicePixelRatio`. Set the policy before the first page or worker in a BrowserContext.

### Touch Emulation

For mobile profiles, touch events are automatically enabled. The profile defines the touch point count, touch event availability, and primary pointer type.

Use `--bot-mobile-force-touch[=true|false]` to explicitly enable or disable touch events for Android and iOS/WebKit-family mobile profiles. It can be combined with `--bot-mobile-keyboard`:

```bash
# Force touch events on
chromium-browser \
  --bot-profile="/path/to/android-profile.enc" \
  --bot-mobile-force-touch
```

<a id="mobile-keyboard-visual-viewport"></a>

### Mobile Keyboard Visual Viewport

Use `--bot-mobile-keyboard` with a matching Android or WebKit-family mobile profile when editable-field focus should follow mobile visual viewport behavior:

```bash
chromium-browser \
  --bot-profile="/path/to/android-profile.enc" \
  --bot-mobile-keyboard
```

The option is disabled by default. On supported mobile profiles, trusted user focus reduces `visualViewport.height` without changing the layout viewport or `window.innerHeight`. Blur restores the visual viewport. Desktop profiles ignore this option.

### Headful vs. Headless Defaults

| Mode | Window Default | Screen Default |
|------|---------------|----------------|
| Headless | `profile` | `profile` |
| Headful (desktop) | `real` | `real` |
| Android profile | `profile` | `profile` |

To apply profile dimensions in headful mode, explicitly set both flags:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-window=profile \
  --bot-screen=profile
```

---

<a id="common-scenarios"></a>

## Common Scenarios

### Fixed viewport for consistent screenshots

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    "--bot-window=1920x1080",
    "--bot-screen=2560x1440",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");
await page.screenshot({ path: "screenshot.png" });

await browser.close();
```

### Mobile dimensions with high DPR

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/android-profile.enc",
    '--bot-window={"innerWidth":412,"innerHeight":915,"devicePixelRatio":2.625}',
    '--bot-screen={"width":412,"height":915,"colorDepth":24}',
    "--bot-mobile-force-touch",
  ],
});
```

<a id="mobile-form-keyboard-viewport"></a>

### Mobile form with keyboard viewport behavior

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/android-profile.enc",
    "--bot-mobile-force-touch",
    "--bot-mobile-keyboard",
  ],
});
```

### Per-context device metrics (ENT Tier3)

```javascript
// Puppeteer: browser-level CDP session (required for BotBrowser.* commands)
const client = await browser.target().createCDPSession();

// Create a new browser context BEFORE setting flags
const context = await browser.createBrowserContext();

// Set per-context flags BEFORE creating any page
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: context._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--bot-window=1366x768",
    "--bot-screen=1920x1080",
  ],
});

// NOW create a page. The renderer will start with the correct flags.
const page = await context.newPage();
await page.goto("https://example.com");

// Visit a fingerprint testing site to verify device metrics
// match the profile's configuration, not the host machine
await page.goto("https://browserleaks.com/");
```

### Verify device consistency

To verify device emulation is working correctly:

1. Launch BotBrowser with your device profile and visit [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that screen dimensions, DPR, touch support, and hardware values match the profile's target device.
3. Run the same profile on a different host machine and verify identical results.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Window size does not match profile | In headful mode, window defaults to `real`. Set `--bot-window=profile` explicitly. |
| Screen dimensions show host values | In headful mode, screen defaults to `real`. Set `--bot-screen=profile` explicitly. |
| DPR does not match the intended profile | Select `--bot-dpr=profile`. For a numeric override, include `devicePixelRatio` in the JSON form of `--bot-window`. |
| Playwright overrides dimensions | Do not set explicit viewport options in Playwright. Let the profile control viewport dimensions. |
| Touch events not available | Use `--bot-mobile-force-touch` or ensure the profile is an Android/mobile profile. |
| Mobile keyboard does not change the visual viewport | Add `--bot-mobile-keyboard`, use a mobile profile, and focus an editable field through a trusted user action. |

---

<a id="next-steps"></a>

## Next Steps

- [Android Emulation](ANDROID_EMULATION.md). Mobile device emulation with touch support.
- [Cross-Platform Profiles](CROSS_PLATFORM_PROFILES.md). Consistent device metrics across hosts.
- [Multi-Account Isolation](../identity/MULTI_ACCOUNT_ISOLATION.md). Different device metrics per context.
- [Display and input flags](../../../CLI_FLAGS.md#flag-group-display). CLI values and availability.

---

**Related documentation:** [CLI Flags Reference](../../../CLI_FLAGS.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md) | [Advanced Features](../../../ADVANCED_FEATURES.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
