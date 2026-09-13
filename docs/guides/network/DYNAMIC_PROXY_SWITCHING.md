# Dynamic Proxy Switching

> Switch proxies at runtime per BrowserContext without restarting BotBrowser sessions.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser ENT Tier3 license.**
- **BotBrowser binary** with a valid profile loaded via `--bot-profile`.
- **A running browser instance** with at least one BrowserContext.

---

<a id="quick-start"></a>

## Quick Start

Use the CDP command `BotBrowser.setBrowserContextProxy` to change the proxy for an existing context:

```javascript
const puppeteer = require("puppeteer-core");

const browser = await puppeteer.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  defaultViewport: null,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--proxy-server=socks5://user:pass@us-proxy.example.com:1080",
  ],
});

const ctx = await browser.createBrowserContext();
const page = await ctx.newPage();
const client = await browser.target().createCDPSession(); // must use browser-level session

// Switch to a UK proxy at runtime
await client.send("BotBrowser.setBrowserContextProxy", {
  browserContextId: ctx._contextId,
  proxyServer: "socks5://user:pass@uk-proxy.example.com:1080",
});

// Geo signals (timezone, locale, languages) are re-detected automatically
await page.goto("https://example.co.uk");

await browser.close();
```

---

<a id="how-it-works"></a>

## How It Works

When you call `BotBrowser.setBrowserContextProxy`, BotBrowser:

1. Updates the proxy configuration for the specified BrowserContext.
2. Re-detects the new proxy's exit IP (unless `proxyIp` is provided).
3. Re-configures timezone, locale, and language to match the new proxy location.
4. Completes the command after the updated geographic state is applied to the context.
5. Uses the new proxy for subsequent network requests from that context.

Pages already loaded in the context continue to function. Await the command before starting a new navigation that depends on the updated proxy location.

Keep proxy changes, context flag updates, and proxy clearing on the same BrowserContext serialized. Wait for each CDP command to resolve before sending the next update or starting dependent navigation.

### CDP Command Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `browserContextId` | Yes | The ID of the BrowserContext to update. |
| `proxyServer` | Yes | Proxy URL with embedded credentials (e.g., `socks5://user:pass@host:port`). |
| `proxyIp` | No | The proxy's exit IP. Accepts IPv4, IPv6, or a comma-separated pair with one address from each family. Use `ipv4_none` or `ipv6_none` when that family is unavailable; this skips auto-detection for faster geo configuration. |
| `proxyBypassList` | No | Semicolon-separated list of hosts to connect directly (e.g., `localhost;127.0.0.1`). |
| `proxyBypassRgx` | No | Regex pattern (RE2 syntax) for URLs that should connect directly. |

### Clearing the Proxy

To remove the proxy override and revert to the browser-level proxy (or direct connection):

```javascript
await client.send("BotBrowser.clearBrowserContextProxy", {
  browserContextId: ctx._contextId,
});
```

---

<a id="common-scenarios"></a>

## Common Scenarios

### Rotating proxies across regions

Switch between geographic regions within the same context, with automatic geo re-detection after each switch:

```javascript
const client = await browser.target().createCDPSession(); // must use browser-level session

// Start with US proxy
await client.send("BotBrowser.setBrowserContextProxy", {
  browserContextId: ctx._contextId,
  proxyServer: "socks5://user:pass@us-proxy.example.com:1080",
  proxyIp: "203.0.113.1",
});
await page.goto("https://example.com");

// Switch to UK proxy
await client.send("BotBrowser.setBrowserContextProxy", {
  browserContextId: ctx._contextId,
  proxyServer: "socks5h://user:pass@uk-proxy.example.com:1080",
  proxyIp: "198.51.100.1",
});
await page.goto("https://example.co.uk");

// Switch to Japan proxy
await client.send("BotBrowser.setBrowserContextProxy", {
  browserContextId: ctx._contextId,
  proxyServer: "socks5://user:pass@jp-proxy.example.com:1080",
  proxyIp: "192.0.2.1",
});
await page.goto("https://example.co.jp");
```

### Using proxyIp to skip detection

When you know the exit IP upfront, pass `proxyIp` to skip the IP detection step. It can contain IPv4, IPv6, or one address from each family separated by a comma. Use `ipv4_none` or `ipv6_none` to declare a family that the proxy does not provide. This eliminates the one-time detection latency on the first navigation after each switch:

```javascript
await client.send("BotBrowser.setBrowserContextProxy", {
  browserContextId: ctx._contextId,
  proxyServer: "socks5://user:pass@proxy.example.com:1080",
  proxyIp: "203.0.113.1", // Skip IP detection, configure geo instantly
});
```

### Switching with proxy bypass rules

Apply selective routing when switching proxies. Some requests can connect directly while others go through the proxy:

```javascript
await client.send("BotBrowser.setBrowserContextProxy", {
  browserContextId: ctx._contextId,
  proxyServer: "socks5://user:pass@proxy.example.com:1080",
  proxyBypassList: "localhost;127.0.0.1",
  proxyBypassRgx: "cdn\\.example\\.com|/static/",
});
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| `setBrowserContextProxy` not found | The `BotBrowser` CDP domain is only available on **browser-level** sessions. Use `browser.target().createCDPSession()` (Puppeteer) or `browser.newBrowserCDPSession()` (Playwright) instead of `page.createCDPSession()`. Also ensure you have an ENT Tier3 license. |
| Geo signals not updating after switch | Await the command before starting a navigation that depends on the updated proxy location. |
| Slow proxy switch | Pass `proxyIp` to skip IP auto-detection on each switch. |
| Old proxy still used for some requests | In-flight requests complete on the previous proxy. New requests use the updated proxy. |

---

<a id="next-steps"></a>

## Next Steps

- [Proxy Configuration](PROXY_CONFIGURATION.md). Basic proxy setup and supported protocols.
- [Proxy and Geolocation](PROXY_GEOLOCATION_ALIGNMENT.md). How auto-detection derives timezone, locale, and language.
- [Per-Context Proxy](PER_CONTEXT_PROXY.md). Assign different proxies to different contexts at creation time.
- [Proxy Selective Routing](PROXY_SELECTIVE_ROUTING.md). Selectively route requests through or around the proxy.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**Related documentation:** [Advanced Features](../../../ADVANCED_FEATURES.md#dynamic-proxy-switching) | [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md) | [CDP Quick Reference](../../../ADVANCED_FEATURES.md#cdp-quick-reference)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
