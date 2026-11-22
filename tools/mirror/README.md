# Mirror: Distributed Privacy Consistency (ENT Tier3)

Ensure your privacy defenses work effectively across platforms and networks. A controller instance captures your clicks, keyboard input, and scroll events and broadcasts them to clients on other machines or platforms so you can compare profile-backed behavior across supported hosts.

## What Is Mirror?

Mirror enables distributed privacy consistency verification across Windows, macOS, Linux, and remote deployment environments. By running a controller and clients with the same profile, you can replay one input sequence and compare the supported browser surfaces under different hosts and network paths.

Use Mirror for:
- **Cross-platform privacy comparison**: Compare how the same profile applies its privacy policy on Windows and macOS
- **Multi-geography privacy verification**: Assure privacy protection across geographically distributed deployment nodes
- **Profile protection assurance**: Ensure multiple privacy profiles maintain protected behavior across versions
- **Distributed privacy validation**: Verify privacy protection across multiple machines and OS environments simultaneously
- **Privacy research**: Record synchronized behavior across platforms to study protection mechanisms and verify privacy defenses

## Architecture

Mirror follows a simple controller-client model:

1. **Controller**: Captures user input (mouse, keyboard, scroll) from a single browser window
2. **Network**: Transmits events as JSON lines over TCP
3. **Clients**: Receive events and replay them on their own instances
4. **Synchronization**: All instances stay synchronized without manual coordination

All coordinates are window-relative (measured from the browser window's top-left corner), ensuring that cross-platform and multi-monitor setups work correctly without coordinate translation.

## Getting Started

### Quick Start: Local Privacy Verification

Open three terminal windows and run:

**Terminal 1: Controller (your primary instance)**
```bash
chromium --bot-profile="/absolute/path/to/profile.enc" \
  --bot-mirror-controller-endpoint=127.0.0.1:9990 \
  --user-data-dir="$(mktemp -d)"
```

**Terminal 2: Client 1 (same machine, different instance)**
```bash
chromium --bot-profile="/absolute/path/to/profile.enc" \
  --bot-mirror-client-endpoint=127.0.0.1:9990 \
  --user-data-dir="$(mktemp -d)"
```

**Terminal 3: Client 2 (optional, different profile or OS)**
```bash
chromium --bot-profile="/different/path/to/profile.enc" \
  --bot-mirror-client-endpoint=127.0.0.1:9990 \
  --user-data-dir="$(mktemp -d)"
```

Now navigate the controller instance. Clicks, typing, and scrolling automatically synchronize across all client windows.

### Distributed Privacy Verification: Cross-Network & Cross-Platform

For verifying privacy protection across different machines or geographic locations:

**Machine 1 (e.g., macOS, primary controller):**
```bash
chromium --bot-profile="/path/to/macos/profile.enc" \
  --bot-mirror-controller-endpoint=0.0.0.0:9990 \
  --user-data-dir="$(mktemp -d)"
```

**Machine 2 (e.g., Linux, different continent):**
```bash
# Replace 192.168.1.100 with the actual IP of your controller machine
chromium --bot-profile="/path/to/linux/profile.enc" \
  --bot-mirror-client-endpoint=192.168.1.100:9990 \
  --user-data-dir="$(mktemp -d)"
```

**Machine 3 (e.g., Windows, another location):**
```bash
chromium --bot-profile="/path/to/windows/profile.enc" \
  --bot-mirror-client-endpoint=192.168.1.100:9990 \
  --user-data-dir="$(mktemp -d)"
```

Actions on the macOS controller instantly synchronize across all connected clients, allowing you to assure privacy protection across multiple platforms and geographies in real time.

### Programmatic Activation (CDP)

Activate Mirror roles at runtime via the Chrome DevTools Protocol:

```javascript
const puppeteer = require('puppeteer-core');

const controller = await puppeteer.launch({
  executablePath: '/path/to/chromium',
  args: ['--bot-profile=/path/to/profile.enc'],
  headless: false
});

const client = await puppeteer.launch({
  executablePath: '/path/to/chromium',
  args: ['--bot-profile=/path/to/profile.enc'],
  headless: false
});

// Start controller
const cSession = await controller.target().createCDPSession();
await cSession.send('BotBrowser.startMirrorController', {
  bindHost: '127.0.0.1',
  port: 9990
});

// Start client
const clientSession = await client.target().createCDPSession();
await clientSession.send('BotBrowser.startMirrorClient', {
  host: '127.0.0.1',
  port: 9990
});

// Now interact with the controller. All inputs sync to the client.
```

## Platform-Specific Notes

### macOS

Mirror captures input through Views framework components (tabstrip, omnibox, toolbar) and WebContents equally. Supports macOS keyboard shortcuts without requiring window activation. Works reliably with multiple instances running simultaneously.

### Windows

Mirror routes all input through Aura's unified event system. Keyboard input is intelligently split: non-text keys (arrows, enter, etc.) use the standard dispatch path, while printable characters route through text input handling to preserve IME and input method behavior. Scroll wheel events include tick count information to prevent small deltas from being lost.

## Important Notes

### Constraints

- Controller and client windows should be the same size (no automatic scaling)
- Does not depend on window activation (avoids focus conflicts in multi-client scenarios)
- Network transmission is unencrypted and unauthenticated (intended for local development and trusted networks only)

### Performance

Mirror operates with minimal latency. Events flow from user input on the controller to network transmission to client-side injection, typically within a few milliseconds. Exact timing depends on your system's input handling and network conditions.

### Coordinate System

Mirror sends window-relative coordinates, not absolute screen coordinates. The same click location works wherever the window is positioned and across multi-monitor layouts.

## Troubleshooting

**Clients don't receive events:**
- Verify controller is running and listening on the correct port
- Check that firewall or network policies allow TCP connections on the port
- Enable logging and check for error messages

**Events go to wrong window:**
- Ensure all controller and client instances have the same window size
- Verify that windows are arranged side-by-side for easy visual inspection

**Keyboard input missing:**
- Windows: verify keyboard routing logic is selecting the correct dispatch method
- macOS: ensure window has received initial focus before typing

---

Guide: [Mirror Distributed](https://botbrowser.io/docs/deployment/mirror-distributed/)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

