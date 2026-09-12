# Getting Started with Puppeteer

> Launch BotBrowser with Puppeteer using Chrome-mode startup and profile-controlled viewport behavior.

---

<a id="prerequisites"></a>

## Prerequisites

- BotBrowser installed. See [Installation](../../../INSTALLATION.md).
- Node.js 18+.
- `puppeteer-core` installed.
- Profile file (`.enc` for production).

---

<a id="quick-start"></a>

## Quick Start

```bash
npm init -y
npm install puppeteer-core
```

```javascript
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  browser: "chrome",
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  defaultViewport: null,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");
await browser.close();
```

---

<a id="how-it-works"></a>

## How It Works

Puppeteer integration has three key requirements in addition to normal BotBrowser launch:

1. Use `browser: "chrome"` when launching with `puppeteer-core`.
2. Set `defaultViewport: null` so profile dimensions remain authoritative.
3. Use BotBrowser flags in `args` (`--bot-profile`, optional `--proxy-server`).

For shared automation guidance (runtime consistency, console behavior, bot-script fallback), see [Automation Consistency](AUTOMATION_CONSISTENCY.md).

---

<a id="common-scenarios"></a>

## Common Scenarios

### Geo override with Puppeteer

```javascript
const browser = await puppeteer.launch({
  browser: "chrome",
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  defaultViewport: null,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    "--bot-timezone=Asia/Tokyo",
    "--bot-locale=ja-JP",
    "--bot-languages=ja-JP,ja,en-US,en",
  ],
});
```

### Browser-level CDP call

```javascript
const browser = await puppeteer.launch({
  browser: "chrome",
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  defaultViewport: null,
  args: [`--bot-profile=${process.env.BOT_PROFILE_PATH}`],
});

const cdp = await browser.target().createCDPSession();
await cdp.send("BotBrowser.setCustomHeaders", {
  headers: { "x-client-app": "bb" },
});
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Viewport is 800x600 | Set `defaultViewport: null`. |
| Launch error in puppeteer-core | Ensure `browser: "chrome"` is present and executable path is valid. |
| Geo values do not match proxy | Pass proxy via `args` with `--proxy-server`; avoid framework-only proxy auth patterns. |
| Multiple instances conflict | Provide unique `--user-data-dir` per instance. |

---

<a id="next-steps"></a>

## Next Steps

- [Automation Consistency](AUTOMATION_CONSISTENCY.md)
- [Playwright Guide](PLAYWRIGHT.md)
- [Proxy Geolocation Alignment](../network/PROXY_GEOLOCATION_ALIGNMENT.md)
- [Multi-Account Isolation](../identity/MULTI_ACCOUNT_ISOLATION.md)
- [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**Related documentation:** [Examples](../../../examples/puppeteer/) | [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
