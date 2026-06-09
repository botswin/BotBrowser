# Per-Context Fingerprint (ENT Tier3)

Run multiple independent fingerprint identities within a single browser instance. Shared GPU/Network/Browser processes. Reduced resource overhead.

> **Pairs with Trimmed Build (ENT Tier3).** Per-Context Fingerprint and [Trimmed Build](TRIMMED_BUILD.md) compose. Per-Context Fingerprint cuts memory and process count at scale; Trimmed Build cuts per-context spin-up by 85% and CPU peak by 68% on Linux x64. Together they form the densest deployment shape BotBrowser ships.

## The Problem

Traditional approaches require launching a separate browser instance for each fingerprint profile. This architecture has significant overhead due to Chromium's multi-process design.

**Chromium Process Architecture**

Each browser instance spawns multiple processes:

| Process | Function |
|---------|----------|
| Browser process | Main coordinator, UI, profile management |
| GPU process | Graphics API calls, compositing, hardware acceleration |
| Network process | HTTP/HTTPS requests, DNS resolution, WebSocket |
| Utility processes | Audio, video decoding, extension services |
| Renderer processes | Web page execution, JavaScript, DOM |

Running 50 browser instances means 50 GPU processes, 50 Network processes, and 50+ Utility processes, in addition to the renderer processes.

**Process Startup Cost**
- Each browser instance requires full initialization: loading shared libraries, spawning GPU/Network/Utility processes, initializing the JavaScript engine, and establishing IPC channels
- Disk I/O spikes occur as each instance reads profile data, cache structures, and font resources from storage
- CPU-intensive work happens during V8 isolate creation, Blink initialization, and compositor setup

**Per-Instance Resource Duplication**
- GPU process: shader cache, command buffers, GPU memory allocation duplicated per instance
- Network process: connection pools, DNS cache, certificate cache duplicated per instance
- Each instance maintains its own JavaScript VM heap (typically 64-128 MB minimum)
- Internal caches (HTTP cache, font cache) cannot be shared across instances

**Scaling Limitations**
- Running 50 profiles means 50 browser instances with 200+ total processes
- CPU load scales with process count due to duplicated background tasks (garbage collection, network polling, GPU command processing)
- OS scheduler overhead increases with process count

## The Solution

Per-Context Fingerprint assigns a complete fingerprint bundle to each BrowserContext within a single browser instance. One browser process, one GPU process, one Network process, serving multiple fingerprint identities.

**Shared Process, Isolated Fingerprint**

BotBrowser modifies Chromium's shared processes to be fingerprint-aware:

| Shared Process | Per-Context Isolation |
|----------------|----------------------|
| GPU process | Canvas/WebGL/WebGPU noise applied per-context |
| Network process | Proxy routing, IP detection per-context |
| Audio service | AudioContext noise seed per-context |
| Browser process | Timezone, locale, screen metrics per-context |

Each context operates with its own:

- Profile file (via `--bot-profile`)
- User-Agent and userAgentData
- Device model and platform
- Screen resolution and color depth
- Timezone, locale, and languages
- Canvas/WebGL/Audio noise seeds
- Proxy configuration and public IP
- Most `--bot-*` CLI flags (see [Supported Flags](#supported-flags))

Contexts are isolated within BotBrowser's fingerprint model. Pages in Context A cannot detect or influence the fingerprint of Context B. The shared GPU/Network/Utility processes route fingerprint-specific data to the correct context.

## Why Per-Context Outperforms Multi-Instance

| Resource | Multi-Instance (50 profiles) | Per-Context (50 contexts) |
|----------|------------------------------|---------------------------|
| Browser processes | 50 | 1 |
| GPU processes | 50 | 1 |
| Network processes | 50 | 1 |
| Utility processes | 50+ | Shared |
| Renderer processes | 50+ | 50+ |
| **Total process count** | **200+** | **~55** |
| Browser startup I/O | 50x (shared libs, GPU init) | 1x |
| Add new identity | 1-3s (launch browser) | Fast (create context) |

Renderer processes scale with page count in both approaches. The key savings come from sharing GPU, Network, Browser, and Utility processes across all contexts.

For detailed scale benchmarks (memory, process count, creation time at 1/10/25/50 concurrent profiles), see [BENCHMARK.md](BENCHMARK.md#scale-performance-per-context-vs-multi-instance).

## Worker Inheritance

Workers created within a BrowserContext automatically inherit that context's fingerprint:

- **Dedicated Workers**: Inherit parent context fingerprint
- **Shared Workers**: Inherit parent context fingerprint
- **Service Workers**: Inherit parent context fingerprint

No additional configuration needed. Fingerprint consistency is maintained across main thread, workers, and all execution contexts.

## Quick Start

### Via CDP (Runtime Configuration)

Configure fingerprint flags on an existing BrowserContext.

> **Critical**: `BotBrowser.setBrowserContextFlags` must be called on a **browser-level** CDP session, and **before** any page is created in that context. The renderer process reads its flags at startup. If a page already exists, the flags will not take effect.

```javascript
const puppeteer = require('puppeteer-core');

const browser = await puppeteer.launch({
  executablePath: '/path/to/botbrowser',
  args: ['--bot-profile=/path/to/base-profile.enc']
});

// Browser-level CDP session (required for BotBrowser.* commands)
const client = await browser.target().createCDPSession();

// Create a new browser context
const context = await browser.createBrowserContext();

// Set per-context fingerprint flags BEFORE creating any page
// Load a different profile and customize locale settings
await client.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: context._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/android-profile.enc',
    '--bot-config-timezone=Asia/Tokyo',
    '--bot-config-languages=ja-JP,en-US',
    '--bot-config-locale=ja-JP'
  ]
});

// NOW create a page. The renderer will start with the correct flags.
const page = await context.newPage();
await page.goto('https://example.com');
```

### Via Target.createBrowserContext

Pass fingerprint and proxy flags when creating the context:

```javascript
const client = await browser.target().createCDPSession();

// Fingerprint-only context
const { browserContextId } = await client.send('Target.createBrowserContext', {
  botbrowserFlags: [
    '--bot-profile=/path/to/windows-profile.enc',
    '--bot-config-timezone=America/New_York',
    '--bot-config-languages=en-US'
  ]
});

// Context with proxy configured at creation time
const { browserContextId: ctxWithProxy } = await client.send('Target.createBrowserContext', {
  botbrowserFlags: [
    '--bot-profile=/path/to/profile.enc',
    '--proxy-server=socks5://user:pass@proxy.example.com:1080',
    '--proxy-ip=203.0.113.1',
    '--proxy-bypass-list=localhost;127.0.0.1',
    '--proxy-bypass-rgx=\\.example\\.com$'
  ]
});

const { targetId } = await client.send('Target.createTarget', {
  url: 'about:blank',
  browserContextId
});
```

### Multiple Contexts Example

```javascript
// Browser-level CDP session (reuse for all contexts)
const client = await browser.target().createCDPSession();

// Context 1: Windows profile with US location
const ctx1 = await browser.createBrowserContext();
await client.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx1._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/windows-profile.enc',
    '--bot-config-timezone=America/Chicago',
    '--bot-config-languages=en-US'
  ]
});
const page1 = await ctx1.newPage();

// Context 2: macOS profile with UK location
const ctx2 = await browser.createBrowserContext();
await client.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx2._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/macos-profile.enc',
    '--bot-config-timezone=Europe/London',
    '--bot-config-languages=en-GB'
  ]
});
const page2 = await ctx2.newPage();

// Both contexts run simultaneously with completely different fingerprints
await Promise.all([
  page1.goto('https://example.com'),
  page2.goto('https://example.com')
]);
```

### Per-Context Proxy with Known IP

Pass the proxy via context creation options, and set `--proxy-ip` via CDP to skip IP lookups.

> **Note**: Puppeteer uses `proxyServer`, Playwright uses `proxy: { server }`. See [examples/](examples/) for framework-specific syntax. `--proxy-ip` only updates the exit IP for geo-detection. When calling `setBrowserContextFlags` with only `--proxy-ip` (no `--proxy-server`), the proxy routing set via `createBrowserContext({ proxyServer })` is preserved.

```javascript
// Puppeteer example
const client = await browser.target().createCDPSession();

// Context 1: US proxy with known IP
const ctx1 = await browser.createBrowserContext({
  proxyServer: 'socks5://user:pass@us-proxy.example.com:1080'
});
await client.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx1._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/profile.enc',
    '--proxy-ip=203.0.113.1'
  ]
});
const page1 = await ctx1.newPage();

// Context 2: UK proxy with known IP
const ctx2 = await browser.createBrowserContext({
  proxyServer: 'socks5://user:pass@uk-proxy.example.com:1080'
});
await client.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx2._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/profile.enc',
    '--proxy-ip=198.51.100.1'
  ]
});
const page2 = await ctx2.newPage();

// All contexts navigate without IP lookup overhead
// BotBrowser derives timezone and locale from the provided proxy IP
await Promise.all([
  page1.goto('https://example.com'),
  page2.goto('https://example.com')
]);
```

### Per-Context Proxy via botbrowserFlags

Configure proxy and other settings together through `botbrowserFlags`:

```javascript
const client = await browser.target().createCDPSession();

// Context 1: US proxy via botbrowserFlags
const ctx1 = await browser.createBrowserContext();
await client.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx1._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/profile.enc',
    '--proxy-server=socks5://user:pass@us-proxy.example.com:1080',
    '--proxy-ip=203.0.113.1',
    '--proxy-bypass-list=localhost;127.0.0.1',
    '--bot-config-timezone=America/Chicago'
  ]
});
const page1 = await ctx1.newPage();

// Context 2: UK proxy via botbrowserFlags (with regex bypass)
const ctx2 = await browser.createBrowserContext();
await client.send('BotBrowser.setBrowserContextFlags', {
  browserContextId: ctx2._contextId,
  botbrowserFlags: [
    '--bot-profile=/path/to/profile.enc',
    '--proxy-server=socks5://user:pass@uk-proxy.example.com:1080',
    '--proxy-ip=198.51.100.1',
    '--proxy-bypass-rgx=\\.static\\.example\\.com$',
    '--bot-config-timezone=Europe/London'
  ]
});
const page2 = await ctx2.newPage();

// Both contexts run with different proxies and settings
await Promise.all([
  page1.goto('https://example.com'),
  page2.goto('https://example.com')
]);
```

Configure proxy directly in `botbrowserFlags` for unified proxy and fingerprint settings in a single call. Supported proxy flags: `--proxy-server`, `--proxy-ip`, `--proxy-bypass-list`, `--proxy-bypass-rgx`.

> **Tip:** Need to switch proxies at runtime without restarting a context? See [Dynamic Proxy Switching (ENT Tier3)](ADVANCED_FEATURES.md#dynamic-proxy-switching) in Advanced Features.

## Supported Flags

Most `--bot-*` flags from [CLI_FLAGS.md](CLI_FLAGS.md) work with per-context configuration. Browser-level exceptions are noted in [Important Notes](#important-notes).

| Category | Example Flags |
|----------|---------------|
| Profile | `--bot-profile` (load a completely different profile per context), `--bot-profile-dir` (select from a directory at context creation) |
| Noise Seed | [`--bot-noise-seed`](CLI_FLAGS.md#behavior--protection-toggles) for deterministic fingerprint variance |
| Timing | [`--bot-time-scale`](CLI_FLAGS.md#behavior--protection-toggles) for performance timing control, [`--bot-time-seed`](ADVANCED_FEATURES.md#performance-timing-protection) for deterministic timing diversity, [`--bot-stack-seed`](ADVANCED_FEATURES.md#stack-depth-control) for stack depth variation, [`--bot-fps`](CLI_FLAGS.md#behavior--protection-toggles) for frame rate control |
| Network | [`--bot-network-info-override`](ADVANCED_FEATURES.md#network-info-privacy) for profile-defined `navigator.connection` values |
| WebRTC | [`--bot-webrtc-ice`](ADVANCED_FEATURES.md#webrtc-leak-protection) for ICE endpoint control |
| Window | [`--bot-always-active`](ADVANCED_FEATURES.md#active-window-emulation) to maintain active window state |
| Session | `--bot-inject-random-history` for session authenticity (supports precise count, e.g., `=15`), `--bot-cookies` for context-scoped cookie import at creation time |
| Automation | `--bot-script` for context-scoped framework-less automation bootstrap at creation time |
| Google Headers | [`--bot-enable-variations-in-context`](CLI_FLAGS.md#behavior--protection-toggles) for `X-Client-Data` consistency in incognito contexts (ENT Tier2) |
| Proxy | [`--proxy-server`](CLI_FLAGS.md#enhanced-proxy-configuration) (configure proxy per-context via `botbrowserFlags`), `--proxy-ip` to skip IP lookups |
| HTTP | [`--bot-custom-headers`](CLI_FLAGS.md#--bot-custom-headers-pro) for custom HTTP request headers per context |
| Config | [`--bot-config-platform`, `--bot-config-timezone`, `--bot-config-noise-canvas`, `--bot-config-webgl=disabled`, `--bot-config-webgpu=disabled`, etc.](CLI_FLAGS.md#profile-configuration-override-flags) |

See [CLI_FLAGS.md](CLI_FLAGS.md) for the complete flag reference.

## Use Cases

**Privacy Research at Scale**
- Run fingerprint protection validation across multiple configurations simultaneously
- Compare behavior across different platform/locale combinations
- Study signal collection behavior with controlled, isolated contexts

**Cross-Platform Testing**
- Validate application behavior across different platform fingerprints
- Test localization across multiple locales in parallel
- Verify responsive behavior across device configurations

**Resource-Efficient Automation**
- Reduce infrastructure costs by consolidating browser instances
- Scale research capacity on CPU-limited environments (VPS, containers)
- Enable high-concurrency scenarios previously blocked by resource constraints

## Important Notes

⚠️ `BotBrowser.setBrowserContextFlags` must be called on a **browser-level CDP session** (`browser.target().createCDPSession()` in Puppeteer, `browser.newBrowserCDPSession()` in Playwright). Page-level CDP sessions (`page.createCDPSession()`) do not have access to the `BotBrowser` domain.

⚠️ `setBrowserContextFlags` must be called **before** creating any page in that context. The renderer process reads its flags at startup. If a page already exists, the new flags will not apply to that renderer. Correct order: `createBrowserContext` → `setBrowserContextFlags` → `newPage`.

⚠️ Per-context proxy via `botbrowserFlags` or `createBrowserContext` must be set before navigation. To switch proxies at runtime, use `BotBrowser.setBrowserContextProxy` (ENT Tier3). See [Dynamic Proxy Switching](ADVANCED_FEATURES.md#dynamic-proxy-switching).

⚠️ Some network-layer settings ([`--bot-local-dns`](CLI_FLAGS.md#--bot-local-dns-ent-tier1), UDP proxy support) apply at the browser level and cannot be configured per-context.

⚠️ Each context can load a completely different profile (`--bot-profile`), or use `--bot-config-*` flags to override specific settings from the browser's base profile.

⚠️ Proxy merge semantics are explicit: `--proxy-server` in `botbrowserFlags` sets or replaces the context proxy route, while `--proxy-ip` only supplies the exit IP for geo-detection. If a context was created with `createBrowserContext({ proxyServer })`, a later `setBrowserContextFlags` call with only `--proxy-ip` preserves that proxy route.

## High-Concurrency Tuning

When running many per-context fingerprints under one browser instance (for example, 20+ concurrent BrowserContexts), launch with [`--bot-gpu-emulation=priority`](CLI_FLAGS.md#--bot-gpu-emulation) to prioritize GPU and WebGPU command-buffer scheduling across sibling contexts. Default behavior is unchanged; this is an opt-in mode for high-concurrency workloads. See [`--bot-gpu-emulation` modes](docs/guides/deployment/LINUX_GPU_BACKEND.md#gpu-emulation-modes).

## Related Documentation

- [Guides](https://botbrowser.io/docs/) - Comprehensive guides for all BotBrowser features
- [CLI Flags Reference](CLI_FLAGS.md)
- [Advanced Features](ADVANCED_FEATURES.md)
- [Profile Configuration](profiles/PROFILE_CONFIGS.md)
- [Per-Context Fingerprint Example (Puppeteer)](examples/puppeteer/per_context_fingerprint.js)
- [Per-Context Fingerprint Example (Playwright)](examples/playwright/nodejs/per_context_fingerprint.js)
- [Per-Context Proxy Example (Puppeteer)](examples/puppeteer/per_context_proxy.js)
- [Per-Context Proxy Example (Playwright)](examples/playwright/nodejs/per_context_proxy.js)

Related guides: [Multi-Account Isolation](https://botbrowser.io/docs/identity/multi-account-isolation/), [Per-Context Proxy](https://botbrowser.io/docs/network/per-context-proxy/), [Dynamic Proxy Switching](https://botbrowser.io/docs/network/dynamic-proxy-switching/)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
