# DNS Leak Prevention

> Prevent DNS leak scenarios by controlling whether domain resolution uses local DNS or the proxy path.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** with a valid profile loaded via `--bot-profile`.
- **A proxy server** configured via `--proxy-server`.

---

<a id="quick-start"></a>

## Quick Start

Enable BotBrowser's built-in DNS resolver with the `--bot-local-dns` flag. This keeps DNS resolution local and independent of the proxy provider's DNS behavior:

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    "--bot-local-dns",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");
await browser.close();
```

---

<a id="how-it-works"></a>

## How It Works

### DNS Resolution Paths

When using a proxy, DNS queries can leak outside the tunnel and expose browsing activity. The resolution path depends on the proxy protocol and the LocalDNS setting.

BotBrowser provides two layers of DNS leak protection:

**SOCKS5H protocol.** When you use `socks5h://` as the proxy protocol, the proxy server resolves the hostname. The hostname is sent through the tunnel instead of to the local resolver:

```bash
--proxy-server=socks5h://user:pass@proxy.example.com:1080
```

**Local DNS resolver (`--bot-local-dns`, ENT Tier1).** This flag enables BotBrowser's built-in DNS resolver. It keeps name resolution on the local resolver path instead of relying on the proxy provider's DNS behavior. This is useful when:

- The proxy provider blocks or rewrites DNS lookups.
- You want to control DNS resolution behavior independently from the proxy.
- You need consistent DNS behavior across different proxy providers.

For supported proxy connections, LocalDNS prefers destination addresses matching the active proxy connection. This is not a strict IPv4-only policy. See [IPv4-Only Proxy Compatibility](IPV4_ONLY_PROXY_COMPATIBILITY.md) for destination support and troubleshooting.

```bash
--bot-local-dns
--bot-local-dns=true
--bot-local-dns=8.8.8.8
--bot-local-dns=127.0.0.1:5353
```

Accepted values:

- Bare flag or `true`: resolve proxy targets through the browser's built-in resolver.
- `false`: disable LocalDNS and let the proxy resolve names.
- `IP` or `IP:port`: resolve proxy targets through the specified DNS server only. Port defaults to `53`. Invalid values are treated as `false`.

When a custom DNS server is configured, BotBrowser does not use the system resolver if the chosen DNS returns no answer.

**DNS prefetch handling.** Supported proxy and resolver configurations apply the selected resolution path to DNS prefetch requests as well.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Using SOCKS5H for remote DNS resolution

The simplest approach. Switch from `socks5://` to `socks5h://`:

```bash
# DNS resolved locally (potential leak)
--proxy-server=socks5://user:pass@proxy.example.com:1080

# DNS resolved through the proxy tunnel (protected)
--proxy-server=socks5h://user:pass@proxy.example.com:1080
```

With `socks5h`, the target hostname is never visible to your local DNS resolver. The proxy server handles all name resolution.

### Choosing a DNS resolution path

Choose one resolution path for each proxy configuration. Use `socks5h://` when the proxy should resolve target hostnames. Use `--bot-local-dns` with a proxy mode that supports local target resolution when BotBrowser should resolve those targets locally. For `socks5h://`, proxy-side target resolution takes precedence; adding `--bot-local-dns` does not switch that target to local resolution.

### HTTP proxy DNS behavior

HTTP and HTTPS proxies use the CONNECT method for tunneling. DNS resolution for the target host is performed by the proxy server, not locally. DNS leaks with HTTP proxies are less common, but DNS prefetch can still cause leaks for link targets found on pages:

```bash
--proxy-server=http://user:pass@proxy.example.com:8080
```

---

<a id="testing"></a>

## Verifying DNS Protection

To verify the selected path, inspect the browser's network diagnostics or the proxy provider's DNS records while loading a controlled hostname. For remote resolution, the provider should report the lookup. For local resolution, the lookup should remain on the configured local resolver path.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| The provider does not report DNS lookups | Switch from `socks5://` to `socks5h://` when the proxy should resolve DNS. |
| DNS queries slow through proxy | Use `--bot-local-dns` when local resolution is allowed by your network policy. |
| Proxy blocks certain domains via DNS | Use `--bot-local-dns` to control DNS independently from the proxy provider. |
| DNS behavior differs on certain domains | Check DNS prefetch and confirm that the selected proxy and resolver configuration applies to those requests. |

---

<a id="next-steps"></a>

## Next Steps

- [Proxy Configuration](PROXY_CONFIGURATION.md). Supported protocols including SOCKS5H.
- [IPv4-Only Proxy Compatibility](IPV4_ONLY_PROXY_COMPATIBILITY.md). Distinguish proxy endpoint and destination support.
- [WebRTC Leak Prevention](WEBRTC_LEAK_PREVENTION.md). Prevent real IP disclosure through WebRTC.
- [Port Protection](PORT_PROTECTION.md). Protect local service ports from being scanned.
- [UDP over SOCKS5](UDP_OVER_SOCKS5.md). Tunnel UDP traffic through the proxy.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**Related documentation:** [Advanced Features: Network Fingerprint Control](../../../ADVANCED_FEATURES.md#network-fingerprint-control) | [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [Proxy Configuration](https://botbrowser.io/en/blog/proxy-configuration/)
