# Browser Brand Alignment

> Switch browser brand identity (Chrome, Edge, Brave, Opera, Chromium, WebView) with consistent fingerprint protection across all identity surfaces.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md).
- **A profile file** (`.enc` or `.json`).
- **ENT Tier2 license** for brand switching. WebView brand requires ENT Tier3.

---

<a id="overview"></a>

## Overview

Different Chromium-based browsers report different brand identities through their Client Hints values, HTTP headers, and User-Agent string. Each brand also follows its own version cadence. For example, Microsoft Edge releases on a different schedule than Google Chrome, so their full version numbers diverge even when they share the same Chromium major version.

BotBrowser lets you switch between brand identities at launch time using the `--bot-browser-brand` flag. When you set a brand, BotBrowser automatically adjusts the User-Agent string, `navigator.userAgentData` brands list, Client Hints headers, and all related API surfaces to match that brand's identity consistently.

---

<a id="quick-start"></a>

## Quick Start

```bash
# Launch as Microsoft Edge
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-browser-brand=edge \
  --bot-brand-full-version=142.0.3595.65
```

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    "--bot-browser-brand=edge",
    "--bot-brand-full-version=142.0.3595.65",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");

// Verify brand identity
const brands = await page.evaluate(() =>
  navigator.userAgentData.brands.map((b) => `${b.brand} ${b.version}`)
);
console.log("Brands:", brands);

await browser.close();
```

---

<a id="how-it-works"></a>

## How It Works

When you set `--bot-browser-brand`, BotBrowser modifies the following surfaces:

1. **User-Agent string.** The browser name and version in the UA string change to match the selected brand.

2. **`navigator.userAgentData.brands`.** The brands array includes the correct brand entry with proper GREASE tokens. For example, Edge reports `"Microsoft Edge"` alongside `"Chromium"` and `"Not A(Brand"`.

3. **Client Hints headers.** All Client Hints headers reflect the selected brand and its version.

4. **Full version list.** When `--bot-brand-full-version` is provided, the brand-specific version appears in high-entropy Client Hints results, separate from the base Chromium version.

These changes apply consistently across the main thread, Workers, and HTTP request headers.

### Supported Brands

| Brand | Flag Value | Description |
|-------|-----------|-------------|
| Google Chrome | `chrome` | Default. Standard Chrome identity. |
| Microsoft Edge | `edge` | Edge identity with Edge-specific version cadence. |
| Brave | `brave` | Brave browser identity. |
| Opera | `opera` | Opera identity with Opera-specific version cadence. |
| Chromium | `chromium` | Plain Chromium identity without vendor branding. |
| Android WebView | `webview` | WebView identity for in-app browser emulation. Requires ENT Tier3. |

---

<a id="brand-version-cadence"></a>

## Brand Version Cadence

Each brand follows its own release schedule. While they all share the same Chromium major version, their full version numbers differ.

For example, when Chromium is at version 142:
- **Chrome** might be `142.0.7444.60`
- **Edge** might be `142.0.3595.65`
- **Opera** might be `142.0.5481.40`

Use `--bot-brand-full-version` to set the brand-specific version, and `--bot-ua-full-version` to set the Chromium version. Both should share the same major version number.

```bash
# Edge with correct version cadence
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-browser-brand=edge \
  --bot-ua-full-version=142.0.7444.60 \
  --bot-brand-full-version=142.0.3595.65
```

---

<a id="common-scenarios"></a>

## Common Scenarios

### Running as Edge for enterprise site testing

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    "--bot-browser-brand=edge",
    "--bot-brand-full-version=142.0.3595.65",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});
```

### Running as Brave

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    "--bot-browser-brand=brave",
  ],
});
```

### Different brands per context (ENT Tier3)

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: ["--bot-profile=/path/to/base-profile.enc"],
});

// Browser-level CDP session (required for BotBrowser.* commands)
const client = await browser.newBrowserCDPSession();

// Context 1: Chrome
const { browserContextIds: before1 } = await client.send("Target.getBrowserContexts");
const ctx1 = await browser.newContext();
const { browserContextIds: after1 } = await client.send("Target.getBrowserContexts");
const ctxId1 = after1.filter((id) => !before1.includes(id))[0];
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctxId1,
  botbrowserFlags: ["--bot-browser-brand=chrome"],
});
const page1 = await ctx1.newPage();

// Context 2: Edge
const { browserContextIds: before2 } = await client.send("Target.getBrowserContexts");
const ctx2 = await browser.newContext();
const { browserContextIds: after2 } = await client.send("Target.getBrowserContexts");
const ctxId2 = after2.filter((id) => !before2.includes(id))[0];
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctxId2,
  botbrowserFlags: [
    "--bot-browser-brand=edge",
    "--bot-brand-full-version=142.0.3595.65",
  ],
});
const page2 = await ctx2.newPage();
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Brand not reflected in UA string | Ensure `--bot-browser-brand` is passed in `args`, not as a Playwright option. |
| Version mismatch in Client Hints | Set `--bot-brand-full-version` to the brand-specific version, not the Chromium version. |
| WebView brand not working | WebView requires ENT Tier3. See [Android WebView](../platform/ANDROID_WEBVIEW.md). |

---

<a id="next-steps"></a>

## Next Steps

- [Custom User-Agent](CUSTOM_USER_AGENT.md). Build a fully custom browser identity with userAgentData control.
- [Android WebView](../platform/ANDROID_WEBVIEW.md). WebView-specific emulation details.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete flag documentation.
- [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md). Set brand via profile JSON.

---

**Related documentation:** [CLI Flags Reference](../../../CLI_FLAGS.md) | [Advanced Features](../../../ADVANCED_FEATURES.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
