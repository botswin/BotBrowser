# Getting Started with Playwright

> Launch BotBrowser with Playwright using profile-first configuration and framework-specific cleanup.

---

<a id="prerequisites"></a>

## Prerequisites

- BotBrowser installed. See [Installation](../../../INSTALLATION.md).
- Node.js 18+.
- `playwright-core` installed.
- Profile file (`.enc` for production).

---

<a id="quick-start"></a>

## Quick Start

```bash
npm init -y
npm install playwright-core
```

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});

const page = await browser.newPage();

// Playwright-specific cleanup before first navigation
await page.addInitScript(() => {
  delete window.__playwright__binding__;
  delete window.__pwInitScripts;
});

await page.goto("https://example.com");
await browser.close();
```

---

<a id="how-it-works"></a>

## How It Works

Playwright integration has one key requirement in addition to normal BotBrowser launch:

1. Launch with BotBrowser flags in `args` (`--bot-profile`, optional `--proxy-server`).
2. Run `addInitScript()` before first navigation to remove Playwright-injected bindings.
3. Keep profile-managed identity surfaces unchanged (no custom viewport overrides unless required).

For shared automation guidance (runtime consistency, bot-script fallback, troubleshooting baseline), see [Automation Consistency](AUTOMATION_CONSISTENCY.md).

---

<a id="common-scenarios"></a>

## Common Scenarios

### Geo override with Playwright

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    "--bot-timezone=Europe/Berlin",
    "--bot-locale=de-DE",
    "--bot-languages=de-DE,de,en-US,en",
  ],
});
```

### Per-context fingerprint assignment

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [`--bot-profile=${process.env.BOT_PROFILE_PATH}`],
});

const client = await browser.newBrowserCDPSession();

// Snapshot existing context IDs
const { browserContextIds: before } = await client.send("Target.getBrowserContexts");
const context = await browser.newContext();
const { browserContextIds: after } = await client.send("Target.getBrowserContexts");
const contextId = after.filter(id => !before.includes(id))[0];

await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/another.enc",
    "--proxy-server=socks5://user:pass@proxy2.example.com:1080",
  ],
});
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Playwright bindings still visible | Ensure `addInitScript()` runs before first `page.goto()`. |
| Geo values do not match proxy | Pass proxy via `args` using `--proxy-server`, not framework proxy options. |
| Launch fails | Verify `BOTBROWSER_EXEC_PATH` points to BotBrowser binary and has execute permission. |
| Multiple instances conflict | Provide unique `--user-data-dir` per instance. |

---

<a id="next-steps"></a>

## Next Steps

- [Automation Consistency](AUTOMATION_CONSISTENCY.md)
- [Puppeteer Guide](PUPPETEER.md)
- [Proxy Geolocation Alignment](../network/PROXY_GEOLOCATION_ALIGNMENT.md)
- [Multi-Account Isolation](../identity/MULTI_ACCOUNT_ISOLATION.md)
- [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**Related documentation:** [Examples](../../../examples/playwright/) | [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
