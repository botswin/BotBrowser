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

Incognito (private browsing) mode changes several browser behaviors that can create measurable differences. BotBrowser maintains consistent fingerprint protection across both regular and incognito modes. The fingerprint values produced in incognito are identical to those in a regular session with the same profile.

---

<a id="how-it-works"></a>

## How BotBrowser Provides Protection

BotBrowser normalizes incognito-related differences at the browser engine level:

1. **Storage quota consistency.** Storage quota values remain consistent regardless of browsing mode. The profile defines the quota values, and BotBrowser enforces them in both modes.

2. **API behavior alignment.** APIs that behave differently in incognito mode are normalized to produce identical responses. This includes storage-related APIs and file system access patterns.

3. **Fingerprint surface parity.** All fingerprint surfaces (Canvas, WebGL, AudioContext, fonts, screen metrics, etc.) produce identical values in both regular and incognito modes when using the same profile.

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

To verify that regular and incognito modes produce identical fingerprints:

1. Launch BotBrowser with a profile and open a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/) in a regular context.
2. Open the same site in a new (incognito-like) context using `browser.newContext()`.
3. Compare the reported fingerprint values between both contexts. All values (Canvas, WebGL, storage quota, etc.) should be identical when using the same profile.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Storage quota differs between modes | Ensure you are using the same profile for both sessions. Different profiles may define different quota values. |
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
