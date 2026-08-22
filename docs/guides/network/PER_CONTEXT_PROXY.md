# Per-Context Proxy

> Assign different proxies to different BrowserContexts for multi-identity and multi-region automation.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser ENT Tier3 license**.
- **BotBrowser binary** with a valid profile loaded via `--bot-profile`.
- **Multiple proxy servers** for different geographic regions or identities.

---

<a id="quick-start"></a>

## Quick Start

### Puppeteer

```javascript
const puppeteer = require("puppeteer-core");

const browser = await puppeteer.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  defaultViewport: null,
  args: [`--bot-profile=${process.env.BOT_PROFILE_PATH}`],
});

const client = await browser.target().createCDPSession();

// Context 1: US proxy
const ctx1 = await browser.createBrowserContext({
  proxyServer: "socks5://user:pass@us-proxy.example.com:1080",
});
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx1._contextId,
  botbrowserFlags: ["--bot-profile=/path/to/profile.enc", "--proxy-ip=203.0.113.1"],
});
const page1 = await ctx1.newPage();

// Context 2: UK proxy
const ctx2 = await browser.createBrowserContext({
  proxyServer: "socks5://user:pass@uk-proxy.example.com:1080",
});
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx2._contextId,
  botbrowserFlags: ["--bot-profile=/path/to/profile.enc", "--proxy-ip=198.51.100.1"],
});
const page2 = await ctx2.newPage();

// Both contexts navigate with different proxies and geo signals
await Promise.all([
  page1.goto("https://example.com"),
  page2.goto("https://example.com"),
]);

await browser.close();
```

### Via botbrowserFlags (alternative)

You can also configure the proxy entirely through `botbrowserFlags`:

```javascript
// Puppeteer
const client = await browser.target().createCDPSession();

const ctx = await browser.createBrowserContext();
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@us-proxy.example.com:1080",
    "--proxy-ip=203.0.113.1",
    "--proxy-bypass-list=localhost;127.0.0.1",
  ],
});

const page = await ctx.newPage();
await page.goto("https://example.com");
```

---

<a id="how-it-works"></a>

## How It Works

Per-context proxy allows you to run multiple geographic identities within a single browser process. Each BrowserContext gets:

- Its own proxy connection.
- Independent geographic signal detection (timezone, locale, languages).
- Independent IP-based configuration.

This is more resource-efficient than launching separate browser instances for each proxy.

### Automatic Geo-Detection Per Context

Each context with a different proxy gets independent geo detection. BotBrowser detects the exit IP for each context's proxy and configures timezone, locale, and language accordingly:

```javascript
// Context A: Netherlands proxy
const ctxA = await browser.createBrowserContext({
  proxyServer: "http://nl-proxy:8080",
});
// -> navigator.languages = ["nl-NL","nl","en-US","en"]
// -> timezone = "Europe/Amsterdam"

// Context B: Japan proxy
const ctxB = await browser.createBrowserContext({
  proxyServer: "http://jp-proxy:8080",
});
// -> navigator.languages = ["ja","en-US","en"]
// -> timezone = "Asia/Tokyo"
```

Explicit geographic settings are resolved independently for each context and each setting. Settings left on `auto` continue to derive from that context's proxy.

### Using --proxy-ip to Skip Detection

When you know the exit IP for each proxy, pass it via `--proxy-ip` to skip the auto-detection step. This eliminates the one-time IP lookup overhead per context. The proxy routing set via `createBrowserContext({ proxyServer })` is preserved:

```javascript
const ctx = await browser.createBrowserContext({
  proxyServer: "socks5://user:pass@proxy.example.com:1080",
});
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-ip=203.0.113.1",
  ],
});
```

> **Note**: `--proxy-ip` only updates the exit IP used for geo-detection. Omitting `--proxy-server` in `setBrowserContextFlags` does not clear proxy routing already set via `createBrowserContext({ proxyServer })`. If the context was created without `proxyServer`, pass `--proxy-server` in `botbrowserFlags` to set the per-context proxy route.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Multi-region setup

Run contexts for multiple countries in a single browser:

```javascript
// Puppeteer
const regions = [
  { proxy: "socks5://user:pass@us.proxy.example.com:1080", ip: "203.0.113.1" },
  { proxy: "socks5://user:pass@uk.proxy.example.com:1080", ip: "198.51.100.1" },
  { proxy: "socks5://user:pass@de.proxy.example.com:1080", ip: "192.0.2.1" },
];

const client = await browser.target().createCDPSession();

for (const region of regions) {
  const ctx = await browser.createBrowserContext();
  await client.send("BotBrowser.setBrowserContextFlags", {
    browserContextId: ctx._contextId,
    botbrowserFlags: [
      "--bot-profile=/path/to/profile.enc",
      `--proxy-server=${region.proxy}`,
      `--proxy-ip=${region.ip}`,
    ],
  });

  const page = await ctx.newPage();
  await page.goto("https://example.com");
  console.log(`Region page loaded: ${await page.title()}`);
}
```

### Combining with different profiles

Each context can use a different profile alongside a different proxy:

```javascript
// Context 1: Windows profile + US proxy
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx1._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/windows-profile.enc",
    "--proxy-server=socks5://user:pass@us-proxy.example.com:1080",
  ],
});

// Context 2: macOS profile + UK proxy
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx2._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/macos-profile.enc",
    "--proxy-server=socks5://user:pass@uk-proxy.example.com:1080",
  ],
});
```

### Per-context proxy with bypass rules

Apply proxy bypass rules per context using `--proxy-bypass-list` or `--proxy-bypass-rgx`:

```javascript
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    "--proxy-bypass-list=localhost;127.0.0.1",
    "--proxy-bypass-rgx=\\.static\\.example\\.com$",
  ],
});
```

### Per-context UDP / QUIC policy (ENT Tier3)

Each context can independently enable or disable UDP proxy and HTTP/3 with `--bot-udp-proxy`, without taking the whole browser process off QUIC. Set a process-wide default on the main command line, then override per context:

```javascript
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    "--bot-udp-proxy=false",
  ],
});
```

See [UDP over SOCKS5](UDP_OVER_SOCKS5.md) for the full per-context UDP policy.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| All contexts use the same proxy | Ensure you set the proxy per context via `createBrowserContext({ proxyServer })` or `botbrowserFlags`. |
| Geo signals identical across contexts | Each context needs a different proxy. Verify proxies resolve to different IPs. |
| `setBrowserContextFlags` not found | Send CDP commands to the browser-level session, not a page-level session. |
| Flags not taking effect | Call `setBrowserContextFlags` before creating any page in the context. |
| Proxy seems lost after calling `setBrowserContextFlags` with `--proxy-ip` | Passing only `--proxy-ip` does not clear the proxy set via `createBrowserContext`. If no proxy was set during context creation, pass `--proxy-server` in `botbrowserFlags`; if the proxy still disappears, ensure you are on a current binary. |
| Need to change proxy after context creation | Use `BotBrowser.setBrowserContextProxy` (ENT Tier3) for runtime switching. See [Dynamic Proxy Switching](DYNAMIC_PROXY_SWITCHING.md). |

---

<a id="next-steps"></a>

## Next Steps

- [Dynamic Proxy Switching](DYNAMIC_PROXY_SWITCHING.md). Change proxy at runtime without recreating the context.
- [Proxy and Geolocation](PROXY_GEOLOCATION_ALIGNMENT.md). How auto-detection derives timezone, locale, and language.
- [Proxy Configuration](PROXY_CONFIGURATION.md). Supported protocols and credential formats.
- [Proxy Selective Routing](PROXY_SELECTIVE_ROUTING.md). Selectively route requests through or around the proxy.
- [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md). Full per-context fingerprint documentation.

---

**Related documentation:** [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md) | [CLI Flags Reference](../../../CLI_FLAGS.md) | [Advanced Features](../../../ADVANCED_FEATURES.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
