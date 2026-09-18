# QUIC Proxy Routing

> Route HTTPS and HTTP/3 traffic through an authenticated QUIC proxy.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser 154.0.8037.17 or newer** with a matching profile package.
- **A QUIC proxy** that supports standard CONNECT and MASQUE CONNECT-UDP.
- **Proxy credentials** when the proxy requires Basic authentication.
- **BotBrowser ENT Tier3** for per-context routing with `BotBrowser.setBrowserContextFlags`.

---

<a id="quick-start"></a>

## Quick Start

Use the standard `--proxy-server` option with a `quic://` URL:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server="quic://user:pass@proxy.example.com:443" \
  --user-data-dir="$(mktemp -d)"
```

HTTPS requests use the proxy tunnel. Compatible HTTP/3 traffic uses MASQUE CONNECT-UDP through the same route.

---

<a id="per-context-routing"></a>

## Per-Context Routing (ENT Tier3)

Set the QUIC proxy before the first page starts in the BrowserContext:

```javascript
const client = await browser.target().createCDPSession();
const context = await browser.createBrowserContext();

await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: context._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=quic://user:pass@proxy.example.com:443",
  ],
});

const page = await context.newPage();
```

Each context can use its own supported proxy route. Wait for the context configuration command before creating pages or starting navigation.

---

<a id="compatibility"></a>

## Compatibility

- Basic credentials can be embedded in the proxy URL.
- Standard CONNECT carries HTTPS traffic.
- MASQUE CONNECT-UDP carries compatible UDP and HTTP/3 traffic.
- CONNECT-IP is not supported.
- An unavailable QUIC proxy does not fall back to a direct connection.

Use [UDP over SOCKS5](UDP_OVER_SOCKS5.md) when the proxy endpoint uses SOCKS5 UDP ASSOCIATE instead of MASQUE.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Proxy authentication fails | Confirm the username and password are embedded in the `quic://` URL and URL-encode special characters. |
| HTTPS works but HTTP/3 does not | Confirm the proxy supports MASQUE CONNECT-UDP and the browser was not launched with `--disable-quic`. |
| Navigation fails when the proxy is unavailable | This is expected. BotBrowser keeps the configured proxy route instead of using a direct connection. |
| A per-context route is not applied | Send the flags through a browser-level CDP session and wait for the command before creating the first page. |

---

<a id="next-steps"></a>

## Next Steps

- [Proxy Configuration](PROXY_CONFIGURATION.md). Review supported proxy schemes and credential formats.
- [Per-Context Proxy](PER_CONTEXT_PROXY.md). Assign independent proxy routes to BrowserContexts.
- [UDP over SOCKS5](UDP_OVER_SOCKS5.md). Route UDP through SOCKS5 UDP ASSOCIATE.
- [Proxy and Geolocation](PROXY_GEOLOCATION_ALIGNMENT.md). Align geographic signals with the proxy exit.

---

**Related documentation:** [CLI Flags Reference](../../../CLI_FLAGS.md#flag-proxy-server) | [Advanced Features](../../../ADVANCED_FEATURES.md#network-fingerprint-control) | [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) | [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
