# Timezone, Locale & Language

> Configure timezone, locale, and language to protect geographic identity and keep it consistent across browser APIs.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md).
- **A profile file** (`.enc` or `.json`).
- **A proxy** (recommended). BotBrowser auto-detects timezone, locale, and language from the proxy IP by default.
- **ENT Tier1 license** for manual overrides of timezone, locale, and languages.

---

<a id="overview"></a>

## Overview

Geographic identity in a browser involves three interconnected settings: timezone, locale, and language. These affect how dates are formatted, what language the browser reports to websites, and how internationalization APIs behave. BotBrowser keeps all three settings aligned with each other and with the proxy's geographic location.

BotBrowser provides two modes for locale and languages, and three modes for timezone:

- **`auto`** (default): Derive the value from the proxy IP. This is the recommended approach.
- **`real`** (timezone only): Use the host system's actual timezone.
- **Manual override**: Specify an exact value (e.g., `America/New_York`, `de-DE`).

---

<a id="quick-start"></a>

## Quick Start

### Auto mode (recommended)

Simply provide a proxy. BotBrowser detects timezone, locale, and language automatically:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@de-proxy.example.com:1080
```

### Manual override

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080 \
  --bot-config-timezone=Europe/Berlin \
  --bot-config-locale=de-DE \
  --bot-config-languages=de-DE,de,en-US,en
```

---

<a id="how-it-works"></a>

## How It Works

### Timezone (`--bot-config-timezone`)

Controls how the browser reports time zone information across all APIs.

| Value | Behavior |
|-------|----------|
| `auto` (default) | Detected from proxy IP. |
| `real` | Uses the host system's timezone. |
| IANA timezone name | Manual override with a specific timezone. |

All date/time formatting and timezone reporting APIs reflect the configured timezone value.

**Common IANA timezone names:**

| Region | Timezone |
|--------|----------|
| US Eastern | `America/New_York` |
| US Central | `America/Chicago` |
| US Pacific | `America/Los_Angeles` |
| UK | `Europe/London` |
| Germany | `Europe/Berlin` |
| Japan | `Asia/Tokyo` |
| Australia Eastern | `Australia/Sydney` |
| Brazil | `America/Sao_Paulo` |

### Locale (`--bot-config-locale`)

Controls the browser's locale for number formatting, date formatting, and other internationalization APIs.

| Value | Behavior |
|-------|----------|
| `auto` (default) | Derived from the proxy IP and detected language. |
| BCP 47 tag | Manual override (e.g., `en-US`, `de-DE`, `ja-JP`). |

All internationalization formatting APIs use the configured locale as their default.

### Languages (`--bot-config-languages`)

Controls the browser's reported language preferences.

| Value | Behavior |
|-------|----------|
| `auto` (default) | Detected from proxy IP. |
| Comma-separated list | Manual override (e.g., `de-DE,de,en-US,en`). |

All language-related JavaScript properties and HTTP headers reflect the configured language list.

### Configuration Priority

Settings are resolved in this order (highest priority first):

1. **CLI flags** (`--bot-config-timezone`, `--bot-config-locale`, `--bot-config-languages`)
2. **Profile `configs`** (`timezone`, `locale`, `languages` fields in the profile JSON)
3. **Auto-detected** from proxy IP (default behavior)

An `auto` value selects automatic alignment rather than acting as a manual override. Explicit values apply per setting, so the remaining settings can continue to follow the proxy.

---

<a id="common-scenarios"></a>

## Common Scenarios

### German identity with German proxy

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@de-proxy.example.com:1080",
    "--bot-config-timezone=Europe/Berlin",
    "--bot-config-locale=de-DE",
    "--bot-config-languages=de-DE,de,en-US,en",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");

// ... use the page as needed ...

await browser.close();
```

### Japanese identity

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@jp-proxy.example.com:1080",
    "--bot-config-timezone=Asia/Tokyo",
    "--bot-config-locale=ja-JP",
    "--bot-config-languages=ja-JP,en-US,en",
  ],
});
```

### Let auto-detection handle everything

When the proxy IP accurately reflects the desired location, no manual overrides are needed:

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@us-proxy.example.com:1080",
    // No timezone/locale/language flags needed.
    // BotBrowser detects everything from the proxy IP.
  ],
});
```

### Per-context geographic identity (ENT Tier3)

```javascript
// Browser-level CDP session (required for BotBrowser.* commands)
const client = await browser.newBrowserCDPSession();

const { browserContextIds: before } = await client.send("Target.getBrowserContexts");
const ctx = await browser.newContext();
const { browserContextIds: after } = await client.send("Target.getBrowserContexts");
const ctxId = after.filter((id) => !before.includes(id))[0];

await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctxId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@br-proxy.example.com:1080",
    "--bot-config-timezone=America/Sao_Paulo",
    "--bot-config-locale=pt-BR",
    "--bot-config-languages=pt-BR,pt,en-US,en",
  ],
});

const page = await ctx.newPage();
await page.goto("https://example.com");
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Timezone shows host system time | Use `--proxy-server` in `args`, not Playwright's `proxy` option. Auto-detection requires BotBrowser to handle the proxy. |
| `navigator.language` not matching | Set `--bot-config-languages` with the desired language first in the list (e.g., `de-DE,de,en-US,en`). |
| Locale formatting is wrong | Set `--bot-config-locale` to a valid BCP 47 tag (e.g., `de-DE`, not `de_DE`). |
| Auto-detection picks wrong timezone | The proxy IP may geolocate to a different region than expected. Use manual overrides. |

---

<a id="next-steps"></a>

## Next Steps

- [Proxy & Geolocation](../network/PROXY_GEOLOCATION_ALIGNMENT.md). How BotBrowser detects geographic information from proxies.
- [Multi-Account Isolation](MULTI_ACCOUNT_ISOLATION.md). Different geographic identities per context.
- [Cross-Platform Profiles](../platform/CROSS_PLATFORM_PROFILES.md). Consistent profiles across operating systems.
- [Identity flags](../../../CLI_FLAGS.md#flag-group-identity). CLI values and availability.

---

**Related documentation:** [CLI Flags Reference](../../../CLI_FLAGS.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md) | [Playwright Guide](../getting-started/PLAYWRIGHT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
