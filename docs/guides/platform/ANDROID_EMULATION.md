# Android Emulation

> Emulate Android Chrome on desktop with full fingerprint protection, including consistent mobile identity, touch events, and device metrics.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md).
- **An Android profile file** (`.enc` or `.json`). Android profiles are available with PRO license.
- **PRO license** for Android profile support.

---

<a id="overview"></a>

## Overview

BotBrowser can emulate Android Chrome on a desktop machine. When you load an Android profile, the browser reports Android-specific platform information, enables touch event support, adjusts the viewport to mobile dimensions, and configures all related API surfaces to match a real Android device.

This emulation happens at the browser engine level. JavaScript APIs, HTTP headers, and Client Hints all reflect the Android identity consistently, preventing cross-surface mismatches that would undermine identity consistency.

---

<a id="quick-start"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/android-profile.enc" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080
```

With Playwright:

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/android-profile.enc",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});

const page = await browser.newPage();

// Remove framework bindings
await page.addInitScript(() => {
  delete window.__playwright__binding__;
  delete window.__pwInitScripts;
});

await page.goto("https://example.com");

// Verify Android identity
const platform = await page.evaluate(() => navigator.platform);
const mobile = await page.evaluate(() => navigator.userAgentData.mobile);
console.log("Platform:", platform);   // "Linux armv81" or similar
console.log("Mobile:", mobile);       // true

await browser.close();
```

---

<a id="how-it-works"></a>

## How It Works

When running an Android profile, BotBrowser configures the following:

### Platform Identity

BotBrowser configures all platform-related surfaces to report Android identity: platform strings, Client Hints headers, mobile/tablet flags, and the User-Agent string. All values are internally consistent across JavaScript APIs and HTTP headers.

<a id="why-navigator-platform-reports-linux-armv81"></a>
#### Why `navigator.platform` reports `Linux armv81`

Android Chrome is a Linux build on ARM, so the profile's `navigator.platform` value reads `Linux armv81`, not `Android` or `Linux aarch64`. The suffix carries the ARM architecture string that Android Chrome reports, and here it comes from the profile, not from the host CPU. On an Apple Silicon Mac or an x64 Linux server the same Android profile still reports `Linux armv81`, because the profile owns that string and the engine-level patch keeps `navigator.platform`, `navigator.userAgentData.platform`, Client Hints headers, and the User-Agent on the same value.

To confirm the pairing in one page evaluation:

```javascript
console.log({
  platform: navigator.platform,                       // "Linux armv81"
  uaDataPlatform: navigator.userAgentData?.platform,  // "Android"
  mobile: navigator.userAgentData?.mobile,            // true for phone profiles
});
```

`navigator.userAgentData.platform` reports `Android` while `navigator.platform` reports `Linux armv81`. That split matches real Android Chrome; it is not an inconsistency to fix. A profile that returns `Win32` or `MacIntel` for `navigator.platform` is a desktop profile, and `--bot-mobile=true` alone will not make it an Android identity.

### Touch and Input

- **Touch events enabled.** Touch event support and touch point count reflect the profile value.
- **Pointer type.** The primary input reports as touch.
- **Motion and orientation events.** These events are available, consistent with a mobile device.
- **Force touch.** Configurable via `--bot-mobile-force-touch` or the profile's `mobileForceTouch` setting.

### Screen and Viewport

- **Mobile viewport.** The viewport matches the Android device's screen dimensions from the profile.
- **Device pixel ratio.** Reflects the profile's DPR (commonly 2.0 or 3.0 for mobile devices).
- **Screen orientation.** Reports the profile-defined orientation. Use `--bot-orientation=landscape|portrait` to control orientation at launch for both phone and tablet profiles.
- **Virtual keyboard viewport.** Use `--bot-mobile-keyboard` when editable-field focus should reduce the mobile visual viewport. The layout viewport remains unchanged.

### DevTools Interface

BotBrowser normalizes the DevTools inspector page zoom and font scaling when debugging Android profiles, keeping the interface readable on desktop.

### External Protocol Isolation

Android-target contexts prevent unsupported external URL schemes from opening applications on the desktop host. Standard web navigation continues normally.

---

<a id="phone-vs-tablet"></a>

## Phone vs. Tablet

The key difference between phone and tablet emulation is the mobile flag. Phones report `true`, tablets report `false`. This flag affects both JavaScript values and Client Hints headers.

For Android identities, the reported form factors follow that mobile setting across page APIs, Workers, iframes, and request headers. A phone identity reports Mobile, and a tablet identity reports Desktop. Explicit tablet selection from a separate platform-specific control remains independent of this rule.

Use `--bot-mobile` to override this value:

```bash
# Phone emulation
chromium-browser \
  --bot-profile="/path/to/android-profile.enc" \
  --bot-mobile=true

# Tablet emulation
chromium-browser \
  --bot-profile="/path/to/android-profile.enc" \
  --bot-mobile=false
```

---

<a id="common-scenarios"></a>

## Common Scenarios

### Android phone with specific device model

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/android-profile.enc",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    "--bot-model=SM-G991B",
    "--bot-platform-version=14",
    "--bot-mobile=true",
  ],
});
```

### Android with custom User-Agent (ENT Tier3)

```bash
chromium-browser \
  --bot-profile="/path/to/android-profile.enc" \
  --user-agent="Mozilla/5.0 (Linux; Android {platform-version}; {model}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{ua-full-version} Mobile Safari/537.36" \
  --bot-platform=Android \
  --bot-platform-version=13 \
  --bot-model=SM-G991B \
  --bot-mobile=true \
  --bot-architecture=arm \
  --bot-bitness=64
```

### Android tablet in landscape mode

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/android-tablet-profile.enc",
    "--bot-orientation=landscape",
  ],
});
```

### Force touch events

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/android-profile.enc",
    "--bot-mobile-force-touch",
  ],
});
```

<a id="mobile-keyboard-visual-viewport"></a>

### Mobile keyboard visual viewport

The mobile keyboard model is opt-in and applies only to mobile profiles:

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/android-profile.enc",
    "--bot-mobile-keyboard",
  ],
});
```

Trusted user focus on an editable field reduces `visualViewport.height` while keeping `window.innerHeight` stable. Blur restores the visual viewport. Use `--bot-mobile-keyboard=false` to keep the default disabled behavior explicitly.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| `navigator.userAgentData.mobile` is `false` | Use `--bot-mobile=true` to force phone mode, or verify the profile is configured for phone (not tablet). |
| Touch events not firing | Ensure the profile is an Android profile and `--bot-mobile-force-touch` is set if needed. |
| Viewport too large for mobile | Do not set explicit viewport options in Playwright. Let the Android profile control dimensions. |
| Editable-field focus does not resize the visual viewport | Add `--bot-mobile-keyboard` and confirm the loaded profile is mobile. The feature is disabled by default and does not apply to desktop profiles. |
| Android profile not loading | Verify your license supports PRO features. Android profiles require PRO or higher. |
| Tablet orientation not changing | Use `--bot-orientation=landscape` or `portrait`. This works for both phone and tablet Android profiles. |

---

<a id="next-steps"></a>

## Next Steps

- [Android WebView](ANDROID_WEBVIEW.md). Emulate in-app browser behavior.
- [Custom User-Agent](../identity/CUSTOM_USER_AGENT.md). Full userAgentData control for Android identities.
- [Device Emulation](DEVICE_EMULATION.md). Control screen dimensions and device metrics.
- [Cross-Platform Profiles](CROSS_PLATFORM_PROFILES.md). Run Android profiles on any desktop OS.

---

**Related documentation:** [CLI Flags Reference](../../../CLI_FLAGS.md) | [Advanced Features](../../../ADVANCED_FEATURES.md) | [Profiles README](../../../profiles/README.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [Android Browser Profile Testing on Desktop and Server](https://botbrowser.io/en/blog/android-emulation/)
