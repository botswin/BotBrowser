# Incognito Mode Fingerprint Consistency

> Private browsing mode can introduce behavioral differences. BotBrowser keeps fingerprint surfaces consistent between regular and incognito sessions.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md).
- **A profile file** (`.enc` or `.json`).

---

<a id="quick-start"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

Use this baseline first, then verify that regular and incognito contexts return the same fingerprint profile.

<a id="overview"></a>

## Overview

Incognito (private browsing) changes storage lifetime and several storage-related behaviors. BotBrowser keeps the profile-backed identity policy consistent across regular and private contexts, while preserving storage isolation and the host browser's extension rules.

---

<a id="how-it-works"></a>

## How BotBrowser Provides Protection

BotBrowser normalizes incognito-related differences at the browser engine level:

1. **Storage quota consistency.** Storage quota values remain consistent regardless of browsing mode. The profile defines the quota values, and BotBrowser enforces them in both modes.

2. **API behavior alignment.** APIs whose capability values follow the profile use the same values in regular and private contexts. Storage contents, persistence, and access boundaries remain isolated by context.

3. **Fingerprint policy parity.** Profile-backed Canvas, WebGL, WebGPU, font, screen, and device policies remain active in private contexts. Output depending on host graphics, storage state, or user configuration can still differ.

4. **Timing consistency.** Storage operation timing is normalized to match profile expectations across both browsing modes.

5. **`X-Client-Data` header consistency.** With [`--bot-enable-variations-in-context`](../../../CLI_FLAGS.md#flag-bot-enable-variations-in-context) (ENT Tier2), incognito contexts send `X-Client-Data` headers on Google domains, same as regular browsing.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Regular mode session

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");

// ... use the page as needed ...

await browser.close();
```

### Incognito mode session

```javascript
const context = await browser.newContext({
  // Incognito-like context with no persistent storage
});

const page = await context.newPage();
await page.goto("https://example.com");

// ... use the page as needed ...

await context.close();
```

### Verifying consistency

To verify that the profile-backed policy remains active in both modes:

1. Launch BotBrowser with a profile and open a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/) in a regular context.
2. Open the same site in a new (incognito-like) context using `browser.newContext()`.
3. Compare the reported configuration values on the same host and rendering path. Account for private-mode storage isolation and any context-specific overrides.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Storage values differ between modes | Private contexts have separate storage contents. Compare quota policy and supported capability values separately from stored data. |
| Extensions not loading in incognito | This is standard browser behavior. BotBrowser does not modify extension loading policies. |
| Fingerprint values differ between modes | Verify both sessions use the same `--bot-profile` and identical `--bot-*` flags. |

---

<a id="next-steps"></a>

## Next Steps

- [Multi-Account Isolation](../identity/MULTI_ACCOUNT_ISOLATION.md). Run multiple isolated sessions with different fingerprints.
- [Cross-Platform Profiles](../platform/CROSS_PLATFORM_PROFILES.md). Consistent profiles across operating systems.
- [Advanced Features](../../../ADVANCED_FEATURES.md#headless-incognito-compatibility). Technical details on headless and incognito consistency.

---

**Related documentation:** [Advanced Features](../../../ADVANCED_FEATURES.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md) | [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [Why Incognito Mode Does Not Protect Against Fingerprinting](https://botbrowser.io/en/blog/incognito-detection/)
