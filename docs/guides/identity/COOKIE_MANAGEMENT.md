# Cookie Management

> Inject, persist, and restore cookies for pre-authenticated sessions and repeatable browser state.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md).
- **A profile file** (`.enc` or `.json`).
- **PRO license** for the `--bot-cookies` flag.

---

<a id="overview"></a>

## Overview

The `--bot-cookies` flag lets you inject cookies into BotBrowser sessions at launch time. Cookies are loaded before the first page navigation, so the browser starts with the desired session state. This is useful for restoring authenticated sessions, setting consent preferences, or pre-populating any cookie-dependent state.

With [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md), `--bot-cookies` can also be passed when creating a BrowserContext. This lets each context start with its own cookie state while sharing one browser process.

You can provide cookies as inline JSON directly in the flag value, or load them from a JSON file.

---

<a id="quick-start"></a>

## Quick Start

### Inline JSON

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-cookies='[{"url":"https://example.com","name":"session_id","value":"abc123","domain":".example.com"}]'
```

### From a file

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-cookies="@/path/to/cookies.json"
```

The file should contain a JSON array of cookie objects.

---

<a id="how-it-works"></a>

## How It Works

1. **Cookie parsing.** At launch, BotBrowser reads the `--bot-cookies` value. If it starts with `@`, the remainder is treated as a file path. Otherwise, the value is parsed as inline JSON.

2. **Cookie injection.** Cookies are injected into the browser's cookie store before any page navigation occurs. This means the first HTTP request already includes the injected cookies.

3. **Domain matching.** Each cookie must include a `url` field. The browser uses it to set the cookie origin and only sends cookies to matching domains, following standard cookie rules.

4. **Per-context import.** When `--bot-cookies` is passed through `botbrowserFlags` at BrowserContext creation time, cookies are imported into that context only.

### Cookie Format

Each cookie object supports these fields:

| Field | Required | Description |
|-------|----------|-------------|
| `url` | Yes | Full URL used to set the cookie (e.g., `https://example.com`). Required for the cookie to be accepted. |
| `name` | Yes | Cookie name. |
| `value` | Yes | Cookie value. |
| `domain` | No | Domain the cookie belongs to. Prefix with `.` for subdomains (e.g., `.example.com`). |
| `path` | No | Cookie path. Defaults to `/`. |
| `secure` | No | Whether the cookie requires HTTPS. Defaults to `true`. |
| `httpOnly` | No | Whether the cookie is HTTP-only (not accessible via JavaScript). Defaults to `false`. |
| `sameSite` | No | SameSite attribute: `strict`, `lax`, or `none`. |
| `expirationDate` | No | Expiration time as a Unix timestamp (seconds since epoch). |

---

<a id="common-scenarios"></a>

## Common Scenarios

### Pre-authenticated session (Playwright)

```javascript
import { chromium } from "playwright-core";

const cookies = JSON.stringify([
  {
    url: "https://example.com",
    name: "session_id",
    value: "abc123def456",
    domain: ".example.com",
    path: "/",
    secure: true,
    httpOnly: true,
  },
  {
    url: "https://example.com",
    name: "user_prefs",
    value: "theme=dark",
    domain: ".example.com",
    path: "/",
  },
]);

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    `--bot-cookies=${cookies}`,
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com/dashboard"); // Loads as authenticated user
await browser.close();
```

### Pre-authenticated session (Puppeteer)

With Puppeteer, use `browser.defaultBrowserContext()` to access the context that `--bot-cookies` injects into. `context.cookies()` returns all cookies for the context without a URL argument.

```javascript
import puppeteer from "puppeteer-core";

const cookies = JSON.stringify([
  {
    url: "https://example.com",
    name: "session_id",
    value: "abc123def456",
    domain: ".example.com",
    path: "/",
    secure: true,
    httpOnly: true,
  },
]);

const browser = await puppeteer.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    `--bot-cookies=${cookies}`,
  ],
});

const context = browser.defaultBrowserContext();
const page = await context.newPage();
await page.goto("https://example.com/dashboard");

const injectedCookies = await context.cookies();
console.log(injectedCookies);

await browser.close();
```

### Cookie consent pre-set

```javascript
const consentCookies = JSON.stringify([
  {
    url: "https://example.com",
    name: "cookie_consent",
    value: "accepted",
    domain: ".example.com",
    path: "/",
    expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
  },
]);

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    `--bot-cookies=${consentCookies}`,
  ],
});
```

### Loading cookies from a file

Create a `cookies.json` file:

```json
[
  {
    "url": "https://example.com",
    "name": "session_id",
    "value": "abc123",
    "domain": ".example.com",
    "path": "/",
    "secure": true,
    "httpOnly": true
  },
  {
    "url": "https://example.com",
    "name": "locale",
    "value": "en-US",
    "domain": ".example.com",
    "path": "/"
  }
]
```

Then launch with:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-cookies="@/path/to/cookies.json"
```

### Per-context cookie state

Use `--bot-cookies` inside `botbrowserFlags` when each BrowserContext needs its own session state:

```javascript
const client = await browser.newBrowserCDPSession();

const cookies = JSON.stringify([
  {
    url: "https://example.com",
    name: "session_id",
    value: "context-a",
    domain: ".example.com",
    path: "/",
    secure: true,
    httpOnly: true
  }
]);

const { browserContextId } = await client.send("Target.createBrowserContext", {
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--bot-cookies=" + cookies
  ]
});
```

Create pages after the context is created so the first navigation uses the context-scoped cookie state.

### JavaScript flag construction

When building the `--bot-cookies` flag in JavaScript, do not wrap the JSON value in extra quotes:

```javascript
// Correct
const cookies = [{ url: "https://example.com", name: "sid", value: "abc", domain: ".example.com" }];
args.push("--bot-cookies=" + JSON.stringify(cookies));

// Wrong - extra quotes become part of the value
args.push(`--bot-cookies='${JSON.stringify(cookies)}'`);
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Cookies not injected (silently skipped) | Each cookie object must include a `url` field (e.g., `"url": "https://example.com"`). Without it, the cookie is silently dropped. |
| Puppeteer: `context.cookies()` returns empty | For startup cookies, use `browser.defaultBrowserContext()`. For Per-Context Fingerprint, pass `--bot-cookies` through `botbrowserFlags` when creating the BrowserContext. |
| Cookies not sent with requests | Verify the `domain` field matches the target site. Use `.example.com` (with leading dot) to include subdomains. |
| "Invalid JSON" error | Check that the cookie value is a valid JSON array. Use a JSON validator if needed. |
| File not found | When using `@/path/to/file.json`, ensure the path is absolute. |
| Secure cookies not working | Set `secure: true` and access the site via HTTPS. |

---

<a id="next-steps"></a>

## Next Steps

- [Bookmark Seeding](BOOKMARK_SEEDING.md). Pre-populate bookmarks for session authenticity.
- [History Seeding](HISTORY_SEEDING.md). Add browsing history for privacy protection.
- [CLI Flags Reference](../../../CLI_FLAGS.md#--bot-cookies). Full flag documentation.
- [Playwright Guide](../getting-started/PLAYWRIGHT.md). Framework integration basics.
- [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md). Context-scoped profile and session state.

---

**Related documentation:** [CLI Flags Reference](../../../CLI_FLAGS.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
