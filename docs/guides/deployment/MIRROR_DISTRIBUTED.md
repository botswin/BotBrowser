# Mirror: Distributed Privacy Consistency

> Run distributed browser sessions with synchronized actions and consistent fingerprint protection across multiple nodes.

Mirror is used for multi-node browser automation, cross-machine fingerprint consistency checks, and distributed validation workflows.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser ENT Tier3** subscription.
- **Two or more machines** (physical or virtual) with BotBrowser installed.
- **Network connectivity** between the controller and all client nodes.
- **A profile file** (`.enc` for production) available on each node.

---

<a id="quick-start"></a>

## Quick Start

### 1. Start the controller

On the machine that will control the session:

```bash
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-mirror-controller-endpoint=0.0.0.0:9333 \
    --proxy-server=socks5://user:pass@proxy.example.com:1080
```

### 2. Start a client

On each machine that should mirror the controller's actions:

```bash
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-mirror-client-endpoint=controller-ip:9333 \
    --proxy-server=socks5://user:pass@proxy.example.com:1080
```

### 3. Interact with the controller

Navigate, click, and interact with the controller instance. All actions are replicated to every connected client in real time.

---

<a id="how-it-works"></a>

## How It Works

Mirror provides remote browser control for distributed setups that replay the same browser actions across multiple BotBrowser instances:

1. **Controller instance.** One BotBrowser instance acts as the controller. It captures user interactions (navigation, clicks, keyboard input, scrolling) and broadcasts them to all connected clients.

2. **Client instances.** Each client receives the controller's actions and replays them locally. Using the same profile provides a common identity configuration for comparing fingerprint output across nodes.

3. **Fingerprint consistency.** Every node loads the same profile and receives the same sequence of actions, allowing profile-backed output to be compared across platforms and networks. Input synchronization alone does not guarantee identical rendering or fingerprint values.

4. **Cross-platform verification.** Run the controller on Windows, with clients on macOS and Ubuntu. Compare the profile-controlled values, then inspect host-dependent text layout, glyph rendering, and graphics output separately.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Team collaboration

Multiple team members can observe and interact with a shared browser session. The controller drives navigation while clients follow along in real time:

```bash
# Team lead (controller)
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-mirror-controller-endpoint=0.0.0.0:9333

# Team member 1 (client)
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-mirror-client-endpoint=lead-machine:9333

# Team member 2 (client)
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-mirror-client-endpoint=lead-machine:9333
```

### Cross-platform consistency verification

Verify that a profile keeps its supported privacy policy aligned on different operating systems:

```bash
# Controller on Windows
chrome.exe --bot-profile="C:\profiles\profile.enc" --bot-mirror-controller-endpoint=0.0.0.0:9333

# Client on macOS
/Applications/Chromium.app/Contents/MacOS/Chromium --bot-profile="profiles/profile.enc" --bot-mirror-client-endpoint=windows-machine:9333

# Client on Ubuntu
chromium-browser --bot-profile="profiles/profile.enc" --bot-mirror-client-endpoint=windows-machine:9333
```

Navigate to a fingerprint testing site on the controller, compare the profile-controlled values reported by each client, and record host-dependent output separately.

### CDP-based Mirror control

Start and stop Mirror at runtime using Chrome DevTools Protocol:

```javascript
// Puppeteer: start as controller via CDP
const cdpSession = await browser.target().createCDPSession();
await cdpSession.send("BotBrowser.startMirrorController", {
    bindHost: "0.0.0.0",
    port: 9333,
});
```

### Distributed testing across networks

Run clients on different networks to verify that proxy-based geo-lookup produces consistent results when combined with the same profile:

```bash
# Controller with US proxy
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-mirror-controller-endpoint=0.0.0.0:9333 \
    --proxy-server=socks5://user:pass@us-proxy.example.com:1080

# Client with same US proxy on a different network
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-mirror-client-endpoint=controller-host:9333 \
    --proxy-server=socks5://user:pass@us-proxy.example.com:1080
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Client cannot connect to controller | Verify the controller's IP and port are reachable. Check firewall rules allow traffic on the Mirror port (default 9333). |
| Actions not replaying on client | Ensure both controller and client use the same profile version. Mismatched profiles may cause inconsistent behavior. |
| High latency in action replay | Mirror works best on low-latency networks. For high-latency connections, actions may appear delayed on clients. |
| Mirror endpoint already in use | Another process is using the port. Choose a different port or stop the existing process. |
| Feature not available | Mirror requires ENT Tier3 subscription. Verify your license tier. |

---

<a id="next-steps"></a>

## Next Steps

- [Mirror Documentation](../../../tools/mirror/). Complete setup instructions, CDP examples, and advanced configuration.
- [Advanced Features](../../../ADVANCED_FEATURES.md). Mirror architecture and technical details.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Mirror-related CLI flags.
- [Docker Deployment](DOCKER_DEPLOYMENT.md). Run Mirror controller and clients in containers.

---

**Related documentation:** [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md) | [Playwright Guide](../getting-started/PLAYWRIGHT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [Docker Deployment Guide](https://botbrowser.io/en/blog/docker-deployment-guide/)
