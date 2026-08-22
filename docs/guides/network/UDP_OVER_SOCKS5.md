# UDP over SOCKS5

> Route UDP protocols like QUIC and STUN through SOCKS5 to prevent IP leaks and keep network identity consistent.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser ENT Tier3 license.**
- **A SOCKS5 proxy** that supports the UDP ASSOCIATE command.
- **BotBrowser binary** with a valid profile loaded via `--bot-profile`.

---

<a id="quick-start"></a>

## Quick Start

No additional flags are needed. When your SOCKS5 proxy supports UDP, BotBrowser automatically tunnels UDP traffic through the proxy:

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
// QUIC and STUN traffic are automatically tunneled through the proxy
await browser.close();
```

If your deployment should avoid QUIC/HTTP/3, add the standard `--disable-quic` flag. In BotBrowser 149.0.7827.102 and newer, UDP-over-SOCKS5 keeps SOCKS5 proxying active while this flag opts out of QUIC/HTTP/3. The SOCKS5 proxy setting stays the same.

---

<a id="how-it-works"></a>

## How It Works

### Why UDP Matters

Modern web traffic relies on two key UDP protocols:

**QUIC (HTTP/3).** Chrome uses QUIC for faster connections to supported servers (Google and many others). QUIC traffic uses UDP instead of TCP. Without UDP tunneling, QUIC connections go outside the proxy tunnel, revealing your real IP to the destination server.

**STUN (WebRTC).** STUN servers help browsers discover their public IP for peer-to-peer connections. STUN requests use UDP. Without UDP tunneling, STUN probes reveal your real IP even when HTTP traffic goes through the proxy.

### How BotBrowser Tunnels UDP

BotBrowser supports SOCKS5 UDP ASSOCIATE, tunneling QUIC and STUN traffic through the proxy when supported:

1. BotBrowser negotiates a UDP association with the proxy server.
2. QUIC and STUN traffic are tunneled through the proxy.
3. WebRTC ICE candidates reflect the proxy IP instead of the host IP.
4. The proxy server forwards UDP packets to the destination and relays responses back.

This happens transparently. No external proxy chains, no additional software, no configuration beyond specifying the SOCKS5 proxy.

### Relationship with WebRTC ICE Presets

When UDP-over-SOCKS5 is active, STUN responses already reflect the proxy's IP. This means `--bot-webrtc-ice` presets are often unnecessary, since ICE candidates are already consistent with your proxy identity. ICE presets are still useful when your proxy does not support UDP.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Standard SOCKS5 with UDP support

If your proxy supports UDP, everything works automatically:

```bash
--proxy-server=socks5://user:pass@proxy.example.com:1080
```

QUIC and STUN traffic are tunneled through the proxy. TCP traffic is proxied as usual.

### Disable QUIC while keeping SOCKS5

Use the standard `--disable-quic` flag when you want HTTP traffic to stay on TCP protocols:

```bash
--proxy-server=socks5://user:pass@proxy.example.com:1080
--disable-quic
```

This disables QUIC/HTTP/3. It does not disable WebRTC or STUN; those continue to follow your UDP-over-SOCKS5 and WebRTC settings.

### Per-context UDP policy (ENT Tier3)

When several browser contexts share one profile, use `--bot-udp-proxy` to keep UDP proxy and HTTP/3 on for some contexts and off for others in the same browser process. A bare flag means true.

```bash
--bot-udp-proxy=false   # process-wide default for this profile
--bot-udp-proxy=true    # per-context override through Per-Context Fingerprint
```

Set the process default on the main command line, then override it per context through Per-Context Fingerprint. Unlike `--disable-quic`, which takes the whole process off QUIC, this policy stays scoped to the context that sets it. It applies only to profiles that already carry the UDP entitlement.

### When the proxy does not support UDP

If the proxy does not support UDP ASSOCIATE, BotBrowser falls back gracefully:

- QUIC connections fall back to HTTP/2 over TCP (which is proxied normally).
- STUN probes may reveal your real IP. Use `--bot-webrtc-ice=google` to control ICE endpoints.

```bash
# Proxy without UDP support - add ICE control for WebRTC protection
--proxy-server=socks5://user:pass@proxy.example.com:1080 --bot-webrtc-ice=google
```

### Combining with per-context proxy

Each BrowserContext can have its own SOCKS5 proxy. UDP tunneling is handled at the browser level, but each context's proxy endpoint is respected:

```javascript
// Puppeteer
const client = await browser.target().createCDPSession();

const ctx = await browser.createBrowserContext();
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});

const page = await ctx.newPage();
// UDP traffic for this context goes through its own proxy
```

---

<a id="limitations"></a>

## Limitations

- **Proxy must support UDP ASSOCIATE.** Not all SOCKS5 proxies support UDP. Check with your provider. HTTP and HTTPS proxies do not support UDP tunneling.
- **Proxy transport stays browser-level.** The SOCKS5 UDP association is negotiated per proxy route. `--bot-udp-proxy` controls whether a context uses UDP proxying and HTTP/3, and applies only to profiles that carry the UDP entitlement.
- **QUIC control.** Use `--disable-quic` when your workload should avoid QUIC/HTTP/3. This does not disable WebRTC.
- **Performance.** UDP-over-SOCKS5 adds latency compared to direct UDP. For latency-sensitive WebRTC applications, this trade-off favors privacy over raw speed.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| QUIC connections not going through proxy | Verify your SOCKS5 proxy supports UDP ASSOCIATE. Not all providers do. |
| I do not want QUIC traffic | Add `--disable-quic`. SOCKS5 proxying remains active for TCP traffic. |
| WebRTC still shows real IP | Confirm UDP support. If unavailable, use `--bot-webrtc-ice=google` for ICE control. |
| Increased latency on some sites | UDP tunneling adds overhead. This is expected. For sites that support both QUIC and HTTP/2, performance should be comparable. |
| Feature not available | UDP-over-SOCKS5 requires an ENT Tier3 license. |

---

<a id="next-steps"></a>

## Next Steps

- [WebRTC Leak Prevention](WEBRTC_LEAK_PREVENTION.md). Additional WebRTC protection options.
- [Proxy Configuration](PROXY_CONFIGURATION.md). Supported protocols and credential formats.
- [DNS Leak Prevention](DNS_LEAK_PREVENTION.md). Prevent DNS queries from leaking.
- [Per-Context Proxy](PER_CONTEXT_PROXY.md). Assign different proxies to different contexts.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**Related documentation:** [Advanced Features: Network Fingerprint Control](../../../ADVANCED_FEATURES.md#network-fingerprint-control) | [CLI Flags: UDP over SOCKS5](../../../CLI_FLAGS.md#udp-over-socks5-ent-tier3)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
