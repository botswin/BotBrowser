# WebRTC Leak Prevention

> Prevent WebRTC IP leaks by controlling ICE behavior and candidate exposure under proxy usage.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** with a valid profile loaded via `--bot-profile`.
- **A proxy server** configured via `--proxy-server` (recommended for full protection).

---

<a id="quick-start"></a>

## Quick Start

BotBrowser provides WebRTC protection by default through SDP and ICE candidate control. For additional control over ICE server endpoints, use the `--bot-webrtc-ice` flag:

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    "--bot-webrtc-ice=google",
  ],
});

const page = await browser.newPage();
await page.goto("https://browserleaks.com/webrtc");
await browser.close();
```

---

<a id="how-it-works"></a>

## How It Works

### How BotBrowser Protects Against WebRTC Leaks

WebRTC can expose your real IP addresses even when using a proxy. BotBrowser prevents this at the browser engine level.

BotBrowser implements protection at the browser engine level:

**SDP Control.** SDP offers and answers present consistent IPv4 and IPv6 address information matching your configured identity.

**ICE Candidate Control.** ICE candidates present a consistent network topology. Local IP addresses are not exposed through `RTCPeerConnection` events.

When a proxy cannot carry datagrams, the default mode keeps unproxied traffic from leaving the host and presents the proxy address in candidate data. Use `--bot-webrtc=real` only when direct traffic is intended. This behavior is verified on BotBrowser 156; other release lines carry the same source change but were not compiled for this verification.

<a id="why-no-loopback-candidates-appear"></a>
#### Why no loopback (127.0.0.1 / ::1) candidates appear

You cannot disable loopback candidates with a flag, because BotBrowser never emits them to page JavaScript. Stock Chromium gathers a host candidate for every local interface, and that list includes loopback when ICE gathering runs without a proxy or with `iceTransportPolicy: "all"`. BotBrowser generates the candidate list from the profile's network identity instead: host candidates carry the declared proxy addresses, and loopback, link-local, and private interface addresses are not part of that list. Chrome's mDNS candidate obfuscation (`<uuid>.local`) plays no role here, because there is no local address left to obfuscate.

Verify it from page JavaScript by gathering candidates on a page that is already behind the proxy:

```javascript
const pc = new RTCPeerConnection({ iceServers: [] });
pc.createDataChannel("probe");
const seen = new Set();
pc.onicecandidate = e => {
  if (!e.candidate) return;
  seen.add(e.candidate.candidate);
};
await pc.setLocalDescription(await pc.createOffer());
await new Promise(r => setTimeout(r, 3000));
console.log([...seen].join("\n"));
console.log("loopback leaked:", /(^| )127\.\d+\.\d+\.\d+|(^| )::1( |$)/.test([...seen].join(" ")));
```

If `loopback leaked` prints `true`, the page is not running with the proxy you expect. Socket-level scan probes are a separate concern and are covered by [Port Protection](PORT_PROTECTION.md).

**STUN/TURN Consistency.** STUN and TURN responses reflect your configured network identity. When combined with UDP-over-SOCKS5 (ENT Tier3), STUN probes themselves are tunneled through the proxy.

When a proxy has only one public address family, declare the unavailable family with `--proxy-ip=ipv4_none,<ipv6>` or `--proxy-ip=<ipv4>,ipv6_none`. This keeps WebRTC candidate handling aligned with the declared proxy identity.

### ICE Server Control

The `--bot-webrtc-ice` flag (ENT Tier1) controls which STUN and TURN endpoints are visible to page JavaScript:

**Presets:**

```bash
# Use Google's public STUN servers (consistent with standard Chrome behavior)
--bot-webrtc-ice=google
```

**Custom servers:**

```bash
# Specify custom STUN and TURN servers
--bot-webrtc-ice="custom:stun:stun.example.com:19302,turn:turn.example.com:3478"
```

---

<a id="common-scenarios"></a>

## Common Scenarios

### Profile-based WebRTC configuration

Use the profile's built-in WebRTC settings:

```bash
--bot-webrtc=profile
```

This applies the WebRTC configuration defined in your profile file, providing consistent behavior across sessions with the same profile.

### Disabling WebRTC entirely

If your use case does not require WebRTC, you can disable it:

```bash
--bot-webrtc=disabled
```

This prevents all WebRTC-related API calls from functioning, which eliminates any possibility of IP disclosure through this channel.

### Per-context WebRTC configuration

Different BrowserContexts can have different WebRTC settings:

```javascript
// Puppeteer
const client = await browser.target().createCDPSession();

// Context 1: WebRTC with Google STUN
const ctx1 = await browser.createBrowserContext();
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx1._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--bot-webrtc-ice=google",
  ],
});

// Context 2: WebRTC disabled
const ctx2 = await browser.createBrowserContext();
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: ctx2._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--bot-webrtc=disabled",
  ],
});
```

### Combined with UDP-over-SOCKS5

With ENT Tier3, STUN probes are automatically tunneled through the SOCKS5 proxy when it supports UDP. This means ICE presets are often unnecessary because STUN responses already reflect the proxy's IP:

```bash
# UDP (QUIC/STUN) auto-tunneled when the SOCKS5 proxy supports UDP associate
--proxy-server=socks5://user:pass@proxy.example.com:1080
```

See [UDP over SOCKS5](UDP_OVER_SOCKS5.md) for details.

---

<a id="testing"></a>

## Verifying WebRTC Protection

To verify protection is active, visit [BrowserLeaks WebRTC test](https://browserleaks.com/webrtc) and confirm that only the proxy IP (or no IP) is visible, and no local or real IPs appear in the results.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Real IP appears in WebRTC test | Ensure proxy is set via `--proxy-server`, not framework options. Add `--bot-webrtc-ice=google` for ICE control. |
| WebRTC completely non-functional | Check if `--bot-webrtc=disabled` is set. Change to `profile` or `real` if WebRTC is needed. |
| ICE candidates show unexpected IPs | Use `--bot-webrtc-ice=google` (ENT Tier1) or a custom server list to control which STUN endpoints are queried. |
| STUN probes not going through proxy | STUN uses UDP. If your proxy does not support UDP, use `--bot-webrtc-ice` (ENT Tier1) to control ICE servers. UDP proxy tunneling itself is an ENT Tier3 capability. |

---

<a id="next-steps"></a>

## Next Steps

- [DNS Leak Prevention](DNS_LEAK_PREVENTION.md). Prevent DNS queries from leaking outside the proxy tunnel.
- [UDP over SOCKS5](UDP_OVER_SOCKS5.md). Tunnel QUIC and STUN traffic through the proxy.
- [Proxy Configuration](PROXY_CONFIGURATION.md). Basic proxy setup and supported protocols.
- [Port Protection](PORT_PROTECTION.md). Protect local service ports from being scanned.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**Related documentation:** [Advanced Features: WebRTC Leak Protection](../../../ADVANCED_FEATURES.md#webrtc-leak-protection) | [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [WebRTC network identity and privacy](https://botbrowser.io/en/blog/webrtc-network-identity-privacy/)
