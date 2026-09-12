# Android WebView Emulation

> Emulate Android WebView, the embedded browser used inside Android apps, with consistent identity and fingerprint protection.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md).
- **An Android profile file** (`.enc` for production).
- **ENT Tier3 license** for WebView brand support.
- **PRO license** for `--bot-custom-headers` (if injecting app headers).

---

<a id="overview"></a>

## Overview

Android WebView is the embedded browser component that Android apps use to display web content. It differs from regular Chrome in several ways: the User-Agent string includes a `wv` token, Client Hints report different brand values, and certain JavaScript APIs expose app-specific objects like `window.android`. Each of these differences is a fingerprint surface that must remain internally consistent to prevent identity mismatches.

BotBrowser can emulate WebView identity using the `--bot-browser-brand=webview` flag. This changes the User-Agent, `navigator.userAgentData.brands`, Client Hints headers, and other surfaces to match a real WebView environment.

---

<a id="quick-start"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/android-profile.enc" \
  --bot-browser-brand=webview \
  --bot-platform=Android \
  --bot-platform-version=13 \
  --bot-model=SM-G991B \
  --bot-mobile=true \
  --user-agent="Mozilla/5.0 (Linux; Android {platform-version}; {model} Build/TP1A.220624.021; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/{ua-full-version} Mobile Safari/537.36"
```

---

<a id="how-it-works"></a>

## How It Works

### What Makes WebView Different

WebView differs from regular Chrome in several identity surfaces: the User-Agent string includes a `wv` token and a `Version/4.0` prefix, the brand identity reports "Android WebView" instead of "Google Chrome", and apps may inject custom headers like `X-Requested-With`. BotBrowser configures all of these surfaces consistently when using the `webview` brand.

### What BotBrowser Configures

When you set `--bot-browser-brand=webview`:

1. **Brand identity.** `navigator.userAgentData.brands` includes `"Android WebView"` instead of `"Google Chrome"`.
2. **Client Hints.** All Client Hints headers reflect the WebView brand.
3. **User-Agent placeholder.** The `{ua-full-version}` placeholder in `--user-agent` resolves to the Chromium version, which WebView shares with Chrome.

### Android 16+ UA Reduction

Starting with Android 16, Google applies [UA reduction](https://developer.chrome.com/docs/privacy-security/user-agent-reduction) to WebView. When the profile's `platform-version` is 16 or higher, BotBrowser automatically freezes the UA string placeholders to reduced values (`{platform-version}` becomes `10`, `{model}` becomes `K`, `{ua-full-version}` becomes a frozen major version). Client Hints continue to report the real values. The same `--user-agent` template works for both old and new Android versions without modification.

### Custom HTTP Headers for App Identity

Many Android apps inject an `X-Requested-With` header containing their package name. Use `--bot-custom-headers` to replicate this:

```bash
chromium-browser \
  --bot-profile="/path/to/android-profile.enc" \
  --bot-browser-brand=webview \
  --bot-custom-headers='{"X-Requested-With":"com.example.app"}'
```

Or via CDP:

```javascript
const cdpSession = await browser.newBrowserCDPSession();
await cdpSession.send("BotBrowser.setCustomHeaders", {
  headers: { "X-Requested-With": "com.example.app" },
});
```

---

<a id="common-scenarios"></a>

## Common Scenarios

### Full WebView identity with Playwright

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/android-profile.enc",
    "--bot-browser-brand=webview",
    "--bot-platform=Android",
    "--bot-platform-version=13",
    "--bot-model=SM-G991B",
    "--bot-mobile=true",
    "--bot-architecture=arm",
    "--bot-bitness=64",
    '--user-agent=Mozilla/5.0 (Linux; Android {platform-version}; {model} Build/TP1A.220624.021; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/{ua-full-version} Mobile Safari/537.36',
    '--bot-custom-headers={"X-Requested-With":"com.example.app"}',
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});

const page = await browser.newPage();
await page.addInitScript(() => {
  delete window.__playwright__binding__;
  delete window.__pwInitScripts;
});

await page.goto("https://example.com");

// Verify WebView identity
const brands = await page.evaluate(() =>
  navigator.userAgentData.brands.map((b) => b.brand)
);
console.log("Brands:", brands); // Includes "Android WebView"

await browser.close();
```

### WebView with app header

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/android-profile.enc",
    "--bot-browser-brand=webview",
    "--bot-platform=Android",
    "--bot-mobile=true",
    '--bot-custom-headers={"X-Requested-With":"com.example.app"}',
  ],
});
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Brands still show "Google Chrome" | Ensure `--bot-browser-brand=webview` is in the `args` array. WebView brand requires ENT Tier3. |
| User-Agent missing `wv` token | Set `--user-agent` with the WebView UA format. BotBrowser does not auto-modify the UA string for WebView. |
| Custom headers not sent | Use `--bot-custom-headers` (CLI) or `BotBrowser.setCustomHeaders` (CDP on browser-level session). |

---

<a id="next-steps"></a>

## Next Steps

- [Android Emulation](ANDROID_EMULATION.md). Full Android Chrome emulation on desktop.
- [Browser Brand Alignment](../identity/BROWSER_BRAND_ALIGNMENT.md). Switch between Chrome, Edge, Brave, Opera, and WebView.
- [Custom User-Agent](../identity/CUSTOM_USER_AGENT.md). Build custom UA strings with placeholders.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete flag documentation.

---

**Related documentation:** [CLI Flags Reference](../../../CLI_FLAGS.md) | [Advanced Features](../../../ADVANCED_FEATURES.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
