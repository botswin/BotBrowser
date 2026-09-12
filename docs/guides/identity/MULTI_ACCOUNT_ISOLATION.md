# Multi-Account Isolation

> Run multi-account browser isolation with per-context fingerprints, proxies, and controls that reduce cross-account linkability.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md). Standard Build works for development and most workloads; **Trimmed Build** (ENT Tier3, enterprise channel) is recommended for high-density per-context fleets (62% lower wall time, 85% faster per-context creation on Linux x64). See [Trimmed Build](../../../TRIMMED_BUILD.md).
- **Node.js** 18 or later with Playwright or Puppeteer.
- **Multiple profile files** (`.enc` or `.json`) that match your BotBrowser major version. BotBrowser 150 and newer profiles are available through subscription or support at [support@botbrowser.io](mailto:support@botbrowser.io) or [@botbrowser_support](https://t.me/botbrowser_support).
- **ENT Tier3 license** for full per-context fingerprint support.

---

<a id="overview"></a>

## Overview

Traditional multi-account setups require launching a separate browser instance for each identity, both for resource reasons and to maintain fingerprint isolation between accounts. Each instance spawns its own GPU, Network, and Utility processes, consuming significant resources. BotBrowser's per-context fingerprint feature lets you assign independent fingerprint bundles to each BrowserContext within a single browser instance, keeping each identity's fingerprint private from the others. One browser process, one GPU process, one Network process, serving dozens of isolated identities.

Each context operates with its own profile, User-Agent, timezone, locale, noise seeds, proxy configuration, and most `--bot-*` CLI flags. Pages in one context cannot detect or influence the fingerprint of another context.

---

<a id="quick-start"></a>

## Quick Start

The key rule: call `BotBrowser.setBrowserContextFlags` **before** creating any pages in that context. The renderer process reads its flags at startup. If a page already exists, the flags will not take effect.

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/base-profile.enc",
  ],
});

// Browser-level CDP session (required for BotBrowser.* commands)
const client = await browser.newBrowserCDPSession();

// --- Account A: US identity ---
// 1. Snapshot existing context IDs
const { browserContextIds: beforeA } = await client.send("Target.getBrowserContexts");
// 2. Create context via Playwright
const ctxA = await browser.newContext();
// 3. Find the new browserContextId
const { browserContextIds: afterA } = await client.send("Target.getBrowserContexts");
const ctxIdA = afterA.filter((id) => !beforeA.includes(id))[0];
// 4. Set flags BEFORE creating any page
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctxIdA,
  botbrowserFlags: [
    "--bot-profile=path/to/us-profile.enc",
    "--proxy-server=socks5://user:pass@us-proxy.example.com:1080",
    "--bot-timezone=America/New_York",
    "--bot-languages=en-US,en",
    "--bot-locale=en-US",
  ],
});
// 5. Now create the page and navigate
const pageA = await ctxA.newPage();
await pageA.goto("https://example.com");

// --- Account B: German identity ---
const { browserContextIds: beforeB } = await client.send("Target.getBrowserContexts");
const ctxB = await browser.newContext();
const { browserContextIds: afterB } = await client.send("Target.getBrowserContexts");
const ctxIdB = afterB.filter((id) => !beforeB.includes(id))[0];

await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctxIdB,
  botbrowserFlags: [
    "--bot-profile=/path/to/de-profile.enc",
    "--proxy-server=socks5://user:pass@de-proxy.example.com:1080",
    "--bot-timezone=Europe/Berlin",
    "--bot-languages=de-DE,de,en-US,en",
    "--bot-locale=de-DE",
  ],
});

const pageB = await ctxB.newPage();
await pageB.goto("https://example.com");

// Both contexts run simultaneously with independent, profile-defined fingerprints
console.log("Account A title:", await pageA.title());
console.log("Account B title:", await pageB.title());

await browser.close();
```

---

<a id="how-it-works"></a>

## How It Works

1. **Single browser launch.** You start one browser instance with a base profile. This profile acts as the default for any context that does not receive custom flags.

2. **Context creation.** Each `browser.newContext()` call creates a new BrowserContext with its own storage, cookies, and session state.

3. **Fingerprint assignment.** The `BotBrowser.setBrowserContextFlags` CDP command assigns a complete fingerprint bundle to the context. This includes the profile file, proxy, timezone, locale, noise seeds, and other identity parameters.

4. **Renderer isolation.** When you create a page in that context, the renderer process starts with the assigned flags. Canvas noise, WebGL parameters, AudioContext values, screen metrics, and all other fingerprint surfaces reflect the context-specific identity.

5. **Proxy geo-detection.** If a `--proxy-server` is provided per context, BotBrowser detects the proxy exit IP and configures timezone, locale, and language automatically for that context. You can also pass `--proxy-ip` to skip the IP lookup and speed up initialization.

6. **Worker inheritance.** Dedicated Workers, Shared Workers, and Service Workers created within a context automatically inherit that context's fingerprint. No additional configuration is needed.

---

<a id="per-context-proxy"></a>

## Per-Context Proxy with Auto Geo-Detection

Each context can have its own proxy with independent geographic identity. BotBrowser derives timezone, locale, and language from each proxy's exit IP.

```javascript
// Browser-level CDP session (required for BotBrowser.* commands)
const client = await browser.newBrowserCDPSession();

// Context with US proxy - timezone and locale auto-detected from proxy IP
const { browserContextIds: beforeUS } = await client.send("Target.getBrowserContexts");
const ctxUS = await browser.newContext();
const { browserContextIds: afterUS } = await client.send("Target.getBrowserContexts");
const ctxIdUS = afterUS.filter((id) => !beforeUS.includes(id))[0];

await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctxIdUS,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@us-proxy.example.com:1080",
  ],
});
const pageUS = await ctxUS.newPage();

// Context with JP proxy - Japanese timezone and locale auto-detected
const { browserContextIds: beforeJP } = await client.send("Target.getBrowserContexts");
const ctxJP = await browser.newContext();
const { browserContextIds: afterJP } = await client.send("Target.getBrowserContexts");
const ctxIdJP = afterJP.filter((id) => !beforeJP.includes(id))[0];

await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctxIdJP,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@jp-proxy.example.com:1080",
  ],
});
const pageJP = await ctxJP.newPage();
```

To skip the IP lookup and speed up context creation, provide `--proxy-ip`:

```javascript
// Use the browser-level CDP session (see Quick Start for setup)
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctxId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@us-proxy.example.com:1080",
    "--proxy-ip=203.0.113.1",
  ],
});
```

---

<a id="per-context-noise-seed"></a>

## Per-Context Noise Seed

Assign a unique noise seed to each context so that Canvas, WebGL, AudioContext, and text metric fingerprints differ across accounts while remaining stable within each account's session.

```javascript
// Browser-level CDP session (required for BotBrowser.* commands)
const client = await browser.newBrowserCDPSession();

// Account 1: noise seed 1001
// Create context, find its ID, set flags, then create page
const { browserContextIds: before1 } = await client.send("Target.getBrowserContexts");
const ctx1 = await browser.newContext();
const { browserContextIds: after1 } = await client.send("Target.getBrowserContexts");
const ctxId1 = after1.filter((id) => !before1.includes(id))[0];

await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctxId1,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--bot-noise-seed=1001",
  ],
});
const page1 = await ctx1.newPage();

// Account 2: noise seed 2002
const { browserContextIds: before2 } = await client.send("Target.getBrowserContexts");
const ctx2 = await browser.newContext();
const { browserContextIds: after2 } = await client.send("Target.getBrowserContexts");
const ctxId2 = after2.filter((id) => !before2.includes(id))[0];

await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctxId2,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--bot-noise-seed=2002",
  ],
});
const page2 = await ctx2.newPage();
```

Each seed produces a unique, reproducible fingerprint. The same seed always produces the same noise output, making sessions consistent across restarts.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Running 10 accounts with different profiles and proxies

```javascript
const accounts = [
  { profile: "/path/to/profile-1.enc", proxy: "socks5://u:p@proxy1.example.com:1080" },
  { profile: "/path/to/profile-2.enc", proxy: "socks5://u:p@proxy2.example.com:1080" },
  // ... up to 10
];

const client = await browser.newBrowserCDPSession();

for (const account of accounts) {
  const { browserContextIds: before } = await client.send("Target.getBrowserContexts");
  const ctx = await browser.newContext();
  const { browserContextIds: after } = await client.send("Target.getBrowserContexts");
  const ctxId = after.filter((id) => !before.includes(id))[0];

  await client.send("BotBrowser.setBrowserContextFlags", {
    browserContextId: ctxId,
    botbrowserFlags: [
      `--bot-profile=${account.profile}`,
      `--proxy-server=${account.proxy}`,
    ],
  });

  const page = await ctx.newPage();
  await page.goto("https://example.com");
}
```

### Same profile, different environments

Use a single profile (same device model) but vary the proxy, timezone, and locale to simulate the same device in different locations.

```javascript
const locations = [
  { proxy: "socks5://u:p@us.example.com:1080", tz: "America/Chicago", lang: "en-US" },
  { proxy: "socks5://u:p@uk.example.com:1080", tz: "Europe/London", lang: "en-GB" },
  { proxy: "socks5://u:p@jp.example.com:1080", tz: "Asia/Tokyo", lang: "ja-JP,en-US" },
];

const client = await browser.newBrowserCDPSession();

for (const loc of locations) {
  const { browserContextIds: before } = await client.send("Target.getBrowserContexts");
  const ctx = await browser.newContext();
  const { browserContextIds: after } = await client.send("Target.getBrowserContexts");
  const ctxId = after.filter((id) => !before.includes(id))[0];

  await client.send("BotBrowser.setBrowserContextFlags", {
    browserContextId: ctxId,
    botbrowserFlags: [
      "--bot-profile=/path/to/profile.enc",
      `--proxy-server=${loc.proxy}`,
      `--bot-timezone=${loc.tz}`,
      `--bot-languages=${loc.lang}`,
    ],
  });

  const page = await ctx.newPage();
  await page.goto("https://example.com");
}
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Flags not taking effect | Ensure `setBrowserContextFlags` is called before creating any page in that context. |
| "BotBrowser domain not found" error | Send CDP commands on a browser-level session, not a page-level session. In Playwright, use `browser.newBrowserCDPSession()`. In Puppeteer, use `browser.target().createCDPSession()`. |
| All contexts share the same fingerprint | Verify each context receives a unique `setBrowserContextFlags` call with different parameters. |
| Timezone does not match proxy | Use `--proxy-server` in the flags, not Playwright's built-in proxy option. |
| Slow context creation | Provide `--proxy-ip` to skip the IP lookup step. |

---

<a id="next-steps"></a>

## Next Steps

- [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md). Full technical documentation with Puppeteer and Playwright examples.
- [Timezone, Locale & Language](TIMEZONE_LOCALE_LANGUAGE.md). Control geographic identity per context.
- [Proxy & Geolocation](../network/PROXY_GEOLOCATION_ALIGNMENT.md). How auto-detection works for each context.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of flags supported per context.

---

**Related documentation:** [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md) | [Advanced Features](../../../ADVANCED_FEATURES.md) | [Playwright Guide](../getting-started/PLAYWRIGHT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
