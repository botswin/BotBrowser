# Proxy Configuration

> Configure HTTP, SOCKS, and QUIC proxies for stable browser identity and network privacy.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed on your system. See [INSTALLATION.md](../../../INSTALLATION.md) for platform-specific setup.
- **Node.js** 18 or later (for Playwright/Puppeteer examples).
- **A profile file** (`.enc` for production, `.json` for local development).
- **A proxy server** with HTTP, HTTPS, SOCKS5, SOCKS5H, or QUIC proxy support.

---

<a id="quick-start"></a>

## Quick Start

Pass your proxy directly in the browser launch arguments using `--proxy-server`:

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
await page.goto("https://example.com");
console.log("Page title:", await page.title());
await browser.close();
```

BotBrowser auto-detects timezone, locale, and language from the proxy exit IP. No additional configuration is needed for geographic consistency.

---

<a id="how-it-works"></a>

## How It Works

BotBrowser extends the standard `--proxy-server` flag with two key enhancements:

1. **Embedded credentials.** Standard browsers require separate authentication. BotBrowser accepts `user:pass@host:port` directly in the proxy URL, eliminating the need for `page.authenticate()` or framework proxy options.

2. **Automatic geo-detection.** When a proxy is configured via `--proxy-server`, BotBrowser detects the proxy's exit IP and configures timezone, locale, and language to match. This happens before the first page loads. See [Proxy and Geolocation](PROXY_GEOLOCATION_ALIGNMENT.md) for the full pipeline.

### Supported Protocols

| Protocol | URL Prefix | Description |
|----------|-----------|-------------|
| HTTP | `http://` | Standard HTTP proxy |
| HTTPS | `https://` | TLS-encrypted proxy connection |
| SOCKS5 | `socks5://` | SOCKS5 proxy with local DNS resolution |
| SOCKS5H | `socks5h://` | SOCKS5 proxy with remote DNS resolution (hostname resolution stays within the tunnel) |
| QUIC | `quic://` | QUIC proxy with HTTPS tunneling and MASQUE CONNECT-UDP support |

### Credential Format

Embed username and password directly in the proxy URL:

```
protocol://username:password@hostname:port
```

Examples:

```bash
# HTTP with credentials
--proxy-server=http://myuser:mypass@proxy.example.com:8080

# SOCKS5 with credentials
--proxy-server=socks5://myuser:mypass@proxy.example.com:1080

# SOCKS5H with credentials (DNS resolved through the proxy)
--proxy-server=socks5h://myuser:mypass@proxy.example.com:1080

# QUIC proxy with credentials
--proxy-server=quic://myuser:mypass@proxy.example.com:443
```

### Structured Usernames

Many proxy providers encode routing information in the username using commas or pipes. BotBrowser supports these formats:

```bash
--proxy-server=socks5://user_abc,type_mobile,country_GB,session_1234:password@portal.proxy.example.com:1080
```

---

<a id="common-scenarios"></a>

## Common Scenarios

### Why use --proxy-server instead of framework proxy options

Always configure the proxy through `--proxy-server` in the browser launch arguments, not through Playwright's `proxy` option or Puppeteer's `page.authenticate()`.

```javascript
// Correct: BotBrowser handles proxy and auto-detects geo info
const browser = await chromium.launch({
  executablePath: BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    `--bot-profile=${BOT_PROFILE_PATH}`,
    "--proxy-server=http://user:pass@proxy.example.com:8080",
  ],
});

// Avoid: Playwright's built-in proxy skips BotBrowser's geo-detection
const browser = await chromium.launch({
  proxy: { server: "http://proxy.example.com:8080" }, // Not recommended
});
```

Using `--proxy-server` ensures BotBrowser can detect the proxy's geographic location and configure timezone, locale, and language automatically. Framework proxy options operate at a different layer and do not trigger this detection.

### Playwright example with SOCKS5

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
await page.addInitScript(() => {
  delete window.__playwright__binding__;
  delete window.__pwInitScripts;
});

await page.goto("https://example.com");
await browser.close();
```

### Puppeteer example with HTTP proxy

```javascript
const puppeteer = require("puppeteer-core");

const browser = await puppeteer.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  defaultViewport: null,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--proxy-server=http://user:pass@proxy.example.com:8080",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");
await browser.close();
```

### Using SOCKS5H for remote DNS resolution

When privacy requires that DNS queries also go through the proxy tunnel, use `socks5h://`. This prevents DNS queries from leaking to your local resolver.

```bash
--proxy-server=socks5h://user:pass@proxy.example.com:1080
```

With `socks5h`, the proxy server resolves hostnames, so the target domain name is never visible to your local DNS resolver.

### PAC routing and request callback

Use the standard `--proxy-pac-url` flag when proxy routing should be controlled by a PAC script:

```bash
--proxy-pac-url=file:///absolute/path/to/proxy.pac
```

Standard PAC routing works through `FindProxyForURL(url, host)`. Approved ENT Tier3 profiles can also define BotBrowser's trusted request callback in the same PAC script:

```javascript
function BotBrowserFindProxyForRequest(url, host, method, headersB64, bodyB64, bodyState) {
  if (shExpMatch(url, "https://media.example.test/*")) {
    return "SOCKS5 media-user:media-pass@media-proxy.example.net:1080";
  }
  return "CONTINUE";
}
```

Standard and request-aware PAC routes can include proxy credentials. Approved request callbacks loaded from `file:` or `data:` PAC sources can also return `RESPONSE <raw_http_response_b64>` or `RESPONSE_FILE <path>` for controlled synthetic responses. Keep PAC sources explicit and controlled. Use PAC auto-detect/WPAD only for standard routing. See [PAC-Like Request Callback](PAC_REQUEST_POLICY.md).

The PAC callback guide documents the full parameter list, URL-based proxy examples, routing fallback behavior, response rules, and trusted-source requirements.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Proxy authentication fails | Verify credentials are embedded in the URL. Do not use `page.authenticate()`. |
| Timezone does not match proxy location | Use `--proxy-server` in launch args, not framework proxy options. |
| Special characters in password | URL-encode special characters (e.g., `@` becomes `%40`, `#` becomes `%23`). |
| DNS leaking to local resolver | Switch from `socks5://` to `socks5h://` so DNS resolves through the proxy. |
| Structured username not working | Ensure commas and pipes are in the username portion, not the password. |
| QUIC proxy does not carry HTTP/3 traffic | Confirm the proxy supports MASQUE CONNECT-UDP and that QUIC is not disabled for the browser session. |

---

<a id="next-steps"></a>

## Next Steps

- [Proxy and Geolocation](PROXY_GEOLOCATION_ALIGNMENT.md). How BotBrowser auto-detects geographic signals from your proxy IP.
- [Per-Context Proxy](PER_CONTEXT_PROXY.md). Assign different proxies to different BrowserContexts.
- [Dynamic Proxy Switching](DYNAMIC_PROXY_SWITCHING.md). Change proxy at runtime without restarting.
- [QUIC Proxy Routing](QUIC_PROXY.md). Route HTTPS and HTTP/3 traffic through a `quic://` proxy.
- [PAC-Like Request Callback](PAC_REQUEST_POLICY.md). Use trusted PAC scripts for routing and enterprise request callback workflows.
- [WebRTC Leak Prevention](WEBRTC_LEAK_PREVENTION.md). Protect against IP disclosure through WebRTC.
- [DNS Leak Prevention](DNS_LEAK_PREVENTION.md). Prevent DNS queries from leaking outside the proxy tunnel.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**Related documentation:** [CLI Flags Reference](../../../CLI_FLAGS.md) | [Advanced Features](../../../ADVANCED_FEATURES.md) | [Getting Started with Playwright](../getting-started/PLAYWRIGHT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
