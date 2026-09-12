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

### How BotBrowser Prevents DNS Leaks

When using a proxy, DNS queries can leak outside the tunnel and expose browsing activity. BotBrowser prevents this across all DNS resolution paths, including prefetch queries.

BotBrowser provides two layers of DNS leak protection:

**SOCKS5H protocol.** When you use `socks5h://` as the proxy protocol, all DNS resolution happens on the proxy server side. The hostname is sent through the tunnel and resolved remotely. This is the simplest way to prevent DNS leaks:

```bash
--proxy-server=socks5h://user:pass@proxy.example.com:1080
```

**Local DNS resolver (`--bot-local-dns`, ENT Tier1).** This flag enables BotBrowser's built-in DNS resolver that keeps DNS resolution local instead of relying on the proxy provider's DNS behavior. This is useful when:

- The proxy provider blocks or rewrites DNS lookups.
- You want to control DNS resolution behavior independently from the proxy.
- You need consistent DNS behavior across different proxy providers.

For supported proxy connections, LocalDNS keeps dual-stack target selection aligned with the active proxy route. No additional flag is required.

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

**DNS prefetch protection.** BotBrowser routes DNS prefetch queries through the same proxy tunnel to prevent leaking outside the configured path.

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

### Combining with local DNS resolver

For maximum control, combine `socks5h` with `--bot-local-dns`:

```bash
--proxy-server=socks5h://user:pass@proxy.example.com:1080 --bot-local-dns
```

This gives you local DNS resolution behavior while keeping queries within the proxy tunnel.

### HTTP proxy DNS behavior

HTTP and HTTPS proxies use the CONNECT method for tunneling. DNS resolution for the target host is performed by the proxy server, not locally. DNS leaks with HTTP proxies are less common, but DNS prefetch can still cause leaks for link targets found on pages:

```bash
--proxy-server=http://user:pass@proxy.example.com:8080
```

---

<a id="testing"></a>

## Verifying DNS Protection

To verify protection is active, visit [BrowserLeaks DNS test](https://browserleaks.com/dns) or [DNS Leak Test](https://www.dnsleaktest.com) and confirm that all reported DNS servers match your proxy region, not your local ISP.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| DNS test shows local ISP servers | Switch from `socks5://` to `socks5h://` to resolve DNS through the proxy. |
| DNS queries slow through proxy | Use `--bot-local-dns` for local DNS resolution that stays protected. |
| Proxy blocks certain domains via DNS | Use `--bot-local-dns` to control DNS independently from the proxy provider. |
| DNS leak only on certain domains | Check for DNS prefetch. BotBrowser prevents prefetch leaks, but verify your configuration. |

---

<a id="next-steps"></a>

## Next Steps

- [Proxy Configuration](PROXY_CONFIGURATION.md). Supported protocols including SOCKS5H.
- [WebRTC Leak Prevention](WEBRTC_LEAK_PREVENTION.md). Prevent real IP disclosure through WebRTC.
- [Port Protection](PORT_PROTECTION.md). Protect local service ports from being scanned.
- [UDP over SOCKS5](UDP_OVER_SOCKS5.md). Tunnel UDP traffic through the proxy.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**Related documentation:** [Advanced Features: Network Fingerprint Control](../../../ADVANCED_FEATURES.md#network-fingerprint-control) | [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
