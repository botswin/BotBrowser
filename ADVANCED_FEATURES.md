# BotBrowser Advanced Features

Architecture and capability reference for BotBrowser fingerprint protection. For configuration syntax, availability, and setup, use the [CLI Flag Directory](CLI_FLAGS.md#flag-directory).

> License tiers: Some capabilities show tier hints in parentheses (PRO, ENT Tier1/Tier2/Tier3/Tier4); those options are subscription-gated.

---

<a id="capabilities-index"></a>
## Capabilities Index

- **Network:** [architecture](#network-fingerprint-control), [PAC request policy](docs/guides/network/PAC_REQUEST_POLICY.md), [WebRTC](#webrtc-leak-protection), [port protection](#port-protection), [dynamic proxy switching](#dynamic-proxy-switching), [flags](CLI_FLAGS.md#flag-group-network)
- **Fingerprint:** [rendering and audio](#multi-layer-fingerprint-noise), [fonts](#cross-platform-font-engine), [browser and OS](#browser-os-fingerprinting), [headless and incognito](#headless-incognito-compatibility), [flags](CLI_FLAGS.md#flag-group-rendering)
- **Performance:** [timing](#performance-timing-protection), [stack depth](#stack-depth-control), [network information](#network-info-privacy), [storage and memory](#memory-storage-quota-controls), [video FPS](#video-fps-control), [flags](CLI_FLAGS.md#flag-group-rendering)
- **Platform:** [device and platform](#device-platform-emulation), [WebKit-family profiles](#webkit-family-profile-consistency), [display and input](#complete-fingerprint-control), [identity flags](CLI_FLAGS.md#flag-group-identity), [display flags](CLI_FLAGS.md#flag-group-display)
- **Automation:** [framework integration](#playwright-puppeteer-integration), [per-context fingerprint](#per-context-fingerprint), [Mirror](#mirror-distributed-privacy-consistency), [CDP](#cdp-quick-reference), [flags](CLI_FLAGS.md#flag-group-session)

---

## Configuration

BotBrowser offers three configuration interfaces with a clear priority order:

1. **CLI `--bot-config-*` flags** (highest priority): [CLI Flag Directory](CLI_FLAGS.md#flag-directory)
2. **Profile `configs` JSON** (medium priority): [Profile Configuration Guide](profiles/PROFILE_CONFIGS.md)
3. **CDP commands** (runtime, per-context): [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) | [CDP Quick Reference](#cdp-quick-reference)

Smart auto-configuration: timezone, locale, and languages derive from your proxy IP. Override only when your scenario requires it.

---

<a id="network-fingerprint-control"></a>
## Network Fingerprint Control

**Scope:** Network-layer traits that tracking systems often score.

- **HTTP Headers & Protocol:** Chrome-like request headers; authentic HTTP/2 and HTTP/3 behavior (see [Chrome Behavior Emulation](#chrome-behavior-emulation)).
- **DNS Routing:** SOCKS5 proxies route all lookups through the proxy tunnel, preventing local DNS leakage.
- **UDP over SOCKS5 (ENT Tier3):** Automatic UDP associate when supported to tunnel QUIC and STUN; ICE presets often unnecessary if UDP is available.
- **WebRTC:** SDP/ICE manipulation and candidate filtering to prevent local IP disclosure (see [WebRTC Leak Protection](#webrtc-leak-protection)).
- **TLS behavior consistency:** Network protocol behavior is aligned with the active profile family across supported platforms.

**Stack differentiators:**
- [Per-context proxies](PER_CONTEXT_FINGERPRINT.md) with proxy-based geo detection (timezone/locale/language) across contexts and sessions
- DNS-through-proxy plus credentialed proxy URLs keep browser-level geo signals protected
- UDP-over-SOCKS5 tunnel (ENT Tier3) for QUIC/STUN so ICE presets are only needed when UDP is unavailable
- The standard `--disable-quic` flag remains available for deployments that prefer TCP-based HTTP protocols while keeping SOCKS5 proxying
- PAC-like request callback (ENT Tier3) for trusted PAC sources, authenticated PAC proxy routes, controlled synthetic responses, and request-aware policy workflows that preserve standard PAC routing behavior and help maintain HTTP/2 continuity in automation-heavy sessions
- Optional ICE control via [`--bot-webrtc-ice`](CLI_FLAGS.md#flag-bot-webrtc-ice) (ENT Tier1) when the proxy lacks UDP support
- Proxy routing remains browser-managed without an external proxy chain

> Note: Many privacy-oriented browsers disable QUIC or skip UDP entirely. BotBrowser implements UDP-over-SOCKS5 directly inside Chromium's network stack so QUIC/STUN stay proxied and consistent with TCP traffic.

For proxy configuration syntax and examples, see [CLI Flags: Enhanced Proxy Configuration](CLI_FLAGS.md#enhanced-proxy-configuration).

**Related guides:** [Proxy Configuration](docs/guides/network/PROXY_CONFIGURATION.md) · [DNS Leak Prevention](docs/guides/network/DNS_LEAK_PREVENTION.md) · [UDP over SOCKS5](docs/guides/network/UDP_OVER_SOCKS5.md) · [WebRTC Leak Prevention](docs/guides/network/WEBRTC_LEAK_PREVENTION.md) · [Port Protection](docs/guides/network/PORT_PROTECTION.md) · [Dynamic Proxy Switching](docs/guides/network/DYNAMIC_PROXY_SWITCHING.md)

<a id="port-protection"></a>
### Port Protection (PRO)

Protect local service ports (VNC, RDP, development servers, etc.) from being scanned by remote pages. Prevents detection of which services are running on localhost.

Covers 30 commonly-probed ports across:
- IPv4 loopback (`127.0.0.0/8`)
- IPv6 loopback (`::1`)
- `localhost` hostname

Enable via CLI (`--bot-port-protection`) or profile JSON (`configs.portProtection`). See [`--bot-port-protection`](CLI_FLAGS.md#flag-bot-port-protection) for details.

<a id="dynamic-proxy-switching"></a>
### Dynamic Per-Context Proxy Switching (ENT Tier3)

Switch proxy servers for a specific BrowserContext at runtime without restarting the context. Use the CDP command `BotBrowser.setBrowserContextProxy` to change proxies on the fly. Supports multiple switches per context, with automatic timezone and language adaptation after each switch.

```javascript
const ctx = await browser.createBrowserContext();
const page = await ctx.newPage();
const client = await browser.target().createCDPSession(); // must use browser-level session

// Set initial proxy - US endpoint
await client.send('BotBrowser.setBrowserContextProxy', {
  browserContextId: ctx._contextId,
  proxyServer: 'socks5://user:pass@us-proxy.example.com:1080',
  proxyIp: '203.0.113.1'  // optional: skip IP lookup for faster geo detection
});
await page.goto('https://example.com');

// Switch to UK proxy with bypass rules
await client.send('BotBrowser.setBrowserContextProxy', {
  browserContextId: ctx._contextId,
  proxyServer: 'socks5h://user:pass@uk-proxy.example.com:1080',
  proxyBypassList: 'localhost;127.0.0.1',                  // standard bypass list
  proxyBypassRgx: 'cdn\\.example\\.com|/static/'          // regex bypass (RE2 syntax)
});
await page.goto('https://example.co.uk');
```

**Supported protocols:** `socks5://`, `socks5h://`, `http://`, `https://`, all with embedded authentication (`user:pass@host:port`).

**Optional parameters:**
- `proxyIp`: provides the proxy's exit IP to skip automatic IP detection, resulting in faster geo-based timezone and language adaptation.
- `proxyBypassList`: semicolon-separated list of hosts/patterns that should bypass the proxy (e.g., `localhost;*.internal.com`).
- `proxyBypassRgx`: regex pattern (RE2 syntax) for URLs that should bypass the proxy. Supports `|` for multiple patterns (e.g., `cdn\.example\.com|/api/health`).

---

## Privacy Protection & Fingerprint Consistency

<a id="multi-layer-fingerprint-noise"></a>
### Multi-Layer Fingerprint Noise

Deterministic noise generation prevents fingerprint collection while maintaining session consistency.

- **Canvas**: Controlled variance applied to Canvas 2D rendering
- **Canvas Replay (ENT Tier4)**: Profile-backed deterministic Canvas responses for approved validation workflows
- **WebGL image**: Controlled variance applied to WebGL readback
- **WebGPU**: Deterministic noise applied to WebGPU canvases by default so GPU-only probes inherit the same reproducible noise characteristics
- **AudioContext**: Inaudible noise calibration (Chromium 141+) with cross-worker consistency
- **ClientRects/TextRects**: Realistic font measurement variance with cross-worker consistency
- **Deterministic noise seeds (ENT Tier2)**: Reproducible yet distinct noise fields per tenant; each seed shapes Canvas 2D, WebGL, WebGPU imagery, text metrics, HarfBuzz layout, ClientRects, and offline audio hashes. See [`--bot-noise-seed`](CLI_FLAGS.md#flag-bot-noise-seed)

Protection model:
- Stable noise algorithms maintain session consistency while varying across different sessions
- GPU tuning preserves authentic WebGL and WebGPU behavior (1.0 and 2.0 contexts)
- Text metrics and ClientRects noise sustains realistic font measurements with cross-worker consistency

For noise configuration flags, see [CLI Flags: Rendering, Noise & Media/RTC](CLI_FLAGS.md#profile-configuration-override-flags).

**Related guides:** [Canvas](docs/guides/fingerprint/CANVAS.md) · [WebGL](docs/guides/fingerprint/WEBGL.md) · [Audio](docs/guides/fingerprint/AUDIO.md) · [Noise Seed Reproducibility](docs/guides/fingerprint/NOISE_SEED_REPRODUCIBILITY.md) · [Font](docs/guides/fingerprint/FONT.md)

<a id="active-window-emulation"></a>
### Active Window Emulation

Maintains protected window state to prevent focus-based tracking even when the host window is unfocused.

- [`--bot-always-active`](CLI_FLAGS.md#flag-bot-always-active) (PRO, default true) maintains protected `blur` and `visibilitychange` event patterns, keeping `document.hidden=false`
- Protects against window-focus-based tracking heuristics that monitor caret blinking, FocusManager events, or inactive viewport throttling

<a id="headless-incognito-compatibility"></a>
### Headless & Incognito Compatibility

Consistent behavior across execution modes.

**GPU Simulation in Headless Mode (ENT Tier2):**
- Full GPU context simulation without physical GPU
- WebGL and WebGPU rendering consistency
- Hardware-accelerated video decoding simulation
- Automatic GPU rendering backend selection on Linux via [`--bot-gpu-emulation`](CLI_FLAGS.md#flag-bot-gpu-emulation). Detects and prefers system GPU/GL drivers when available, with shader caching enabled by default. Optional `--bot-gpu-emulation=priority` adds prioritized GPU/WebGPU command-buffer scheduling for high-concurrency BrowserContext workloads. For backend choice and flag migration on Linux servers, see [Linux GPU Backend Selection](docs/guides/deployment/LINUX_GPU_BACKEND.md)

**Incognito-Mode Consistency:**
- Fingerprint protection maintained in incognito mode
- Consistent fingerprint between normal and incognito modes
- `X-Client-Data` header consistency in incognito contexts via [`--bot-enable-variations-in-context`](CLI_FLAGS.md#flag-bot-enable-variations-in-context) (ENT Tier2)

<a id="webrtc-leak-protection"></a>
### WebRTC Leak Protection

Complete WebRTC fingerprint protection and network privacy.

**SDP Control:**
- IPv4 and IPv6 Session Description Protocol (SDP) standardization across platforms
- ICE candidate filtering and protection management
- STUN and TURN server response standardization

**Real-Time Communication Privacy:**
- MediaStream API protection across execution contexts
- RTCPeerConnection behavior standardization
- Network topology protection through controlled signal patterns
- ICE server presets and custom lists via [`--bot-webrtc-ice`](CLI_FLAGS.md#flag-bot-webrtc-ice) (ENT Tier1) to standardize STUN and TURN endpoints observed by page JavaScript
- Combined with [UDP-over-SOCKS5](CLI_FLAGS.md#udp-over-socks5-ent-tier3) (ENT Tier3) for Chromium-level QUIC and STUN tunneling

**Related guides:** [WebRTC Leak Prevention](docs/guides/network/WEBRTC_LEAK_PREVENTION.md) · [Incognito Fingerprinting](docs/guides/fingerprint/INCOGNITO.md)

<a id="chrome-behavior-emulation"></a>
### Chrome Behavior Emulation

Consistent Chrome-compatible behaviors and standardized API responses.

**Protocol Headers:**
- Standard HTTP headers matching Chrome specifications
- Consistent HTTP/2 and HTTP/3 behavior across platforms
- Standardized request timing and protocol patterns

**API Standardization:**
- Chrome-compatible API implementations
- Standardized JavaScript API responses matching Chrome specifications

**Widevine CDM Integration (ENT Tier2):**
> Note: BotBrowser does not distribute proprietary modules (e.g., Widevine). End users must obtain playback components via official channels.

---

<a id="device-platform-emulation"></a>
## Device & Platform Emulation

<details>
<summary><strong>Full details: Device & Platform Emulation</strong></summary>

<a id="cross-platform-font-engine"></a>
### Cross-Platform Font Engine

Advanced font rendering with consistent results across hosts.

**Built-In Font Libraries:**
- Windows fonts (Segoe UI, Arial, Times New Roman, etc.)
- macOS fonts (San Francisco, Helvetica, Times, etc.)
- Android fonts (Roboto, Noto, etc.) (PRO)
- Complete emoji sets for all platforms

**Accurate Font-Fallback Chains:**
- Accurate CJK (Chinese, Japanese, Korean) font fallback
- Rare symbol and Unicode character support
- Cross-worker consistency
- HarfBuzz text shaping integration
- Profile-backed local font requests and request-by-name loading

**Text-Rendering Features:**
- Skia anti-aliasing integration
- Multi-language support (CJK/RTL/emoji)
- Platform-specific font metrics
- Consistent text measurement across workers
- DOM text renders exclusively from the embedded Windows/macOS font bundles (Linux requires ENT Tier1; Android requires PRO) so layouts never fall through to host fonts

> **Implementation Detail:** Low-level rendering paths in Skia (2D/Canvas) and HarfBuzz (text shaping) are tuned to align metrics and glyph shaping across OS targets. Targeted WebGL/WebGPU parameter controls keep visual output stable across contexts.

**Related guides:** [Font Fingerprinting](docs/guides/fingerprint/FONT.md) · [CJK Font Rendering](docs/guides/platform/CJK_FONT_RENDERING.md)

### Cross-Platform Consistency

Maintains fingerprint and behavior consistency across different host systems.

**Platform Profile Portability:**
- Windows profile produces identical fingerprints on macOS and Linux (ENT Tier1) hosts
- macOS profile maintains consistency across Windows and Linux (ENT Tier1) hosts
- Android profile (PRO) operates identically when emulated on any desktop OS
- Android DevTools interface (PRO) maintains readability during emulation because the inspector normalizes page zoom and font scaling

**Behavioral Consistency:**
- Eliminates host-OS-specific behavioral differences
- Simulates platform-specific UI element behavior consistently
- Maintains identical touch and mouse event patterns
- Emulates authentic device behavior across platforms

**Related guides:** [Cross-Platform Profiles](docs/guides/platform/CROSS_PLATFORM_PROFILES.md) · [Windows on Mac/Linux](docs/guides/platform/WINDOWS_ON_MAC_LINUX.md) · [Android Emulation](docs/guides/platform/ANDROID_EMULATION.md) · [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md)

### Touch & Input Reliability

- Pointer/touch bridging fixes ensure `Input.dispatchMouseEvent` and synthesized taps land reliably, even in nested iframe trees
- Mobile flows keep consistent tap timing and coordinates when `mobileForceTouch` is enabled

### Hardware Fingerprint Control

Comprehensive hardware emulation and fingerprint management.

**CPU-Architecture Emulation:**
- x86/x64/ARM architecture simulation
- Authentic CPU core count and timing
- Hardware concurrency simulation
- JavaScript & WebAssembly parity across baseline, Turbo, and SIMD pipelines

**Screen and Display Control:**
- Device pixel ratio emulation
- Screen resolution and color depth control
- Multi-monitor configuration simulation
- Refresh rate and orientation control via [`--bot-config-orientation`](CLI_FLAGS.md#flag-bot-config-orientation) for mobile profiles, covering all orientation APIs and CSS media queries
- Opt-in mobile keyboard visual viewport behavior via [`--bot-mobile-keyboard`](CLI_FLAGS.md#flag-bot-mobile-keyboard) for Android and WebKit-family mobile profiles

**Device-Behavior Simulation:**
- Authentic device memory reporting
- Battery status and charging simulation
- Network connection type emulation
- Sensor availability and behavior

</details>

---

## Deep System Integration

<a id="performance-timing-protection"></a>

**Performance Timing Protection** (ENT Tier2): Every device has a unique "speed signature": how fast it renders a Canvas path, compiles a WebGL shader, or measures a font. Tracking systems collect these execution times to build a hardware-level fingerprint. When multiple browser instances share the same hardware, their timing profiles are identical, making them vulnerable to correlation. [`--bot-time-seed=<integer>`](CLI_FLAGS.md#flag-bot-time-seed) (valid range: 1-UINT32_MAX, `0` = disabled) protects each instance with its own stable performance profile across 27 browser operations. This also covers `performance.getEntries()`, `performance.getEntriesByType("navigation")`, and `performance.timing` with authentic per-session redistribution of resource and navigation timing values.

> `--bot-time-seed` varies actual operation execution speeds (the workload). `--bot-time-scale` compresses `performance.now()` intervals globally (the clock). They protect against different tracking vectors and can be used together.

<a id="stack-depth-control"></a>

**Stack Depth Fingerprint Control** (ENT Tier2): JavaScript engines expose a measurable recursive call stack depth that varies by browser build, platform, and architecture. Tracking systems use this as a stable fingerprint signal. [`--bot-stack-seed`](CLI_FLAGS.md#flag-bot-stack-seed) controls stack depth across main thread, Worker, and WASM contexts. Accepts `profile` (match profile's exact depth), `real` (use native depth), or a positive integer seed (1-UINT32_MAX) for per-session depth variation.

<a id="network-info-privacy"></a>

**Network Information Privacy**: [`--bot-network-info-override`](CLI_FLAGS.md#flag-bot-network-info-override) applies profile, native, or field-level custom JSON policies to network information properties and corresponding Client Hints. The same resolved policy follows the active BrowserContext across pages, workers, and requests. `configs.networkInfoOverride` remains a profile-level `true` or `false` setting.

<a id="memory-storage-quota-controls"></a>

**Memory and Storage Quota Controls**: [`--bot-js-heap-size-limit`](CLI_FLAGS.md#flag-bot-js-heap-size-limit) and [`--bot-storage-quota`](CLI_FLAGS.md#flag-bot-storage-quota) let a session or context use profile values, native Chromium behavior, or explicit byte values for memory and storage quota policy.

<a id="cpu-core-scaling"></a>

**CPU Core Scaling Protection**: When `navigator.hardwareConcurrency` is set by the profile, Worker threads are automatically constrained to match the claimed core count via CPU affinity on Linux and Windows. This ensures parallel computation scaling curves align with the claimed value.

<a id="video-fps-control"></a>

**Video FPS Control** (ENT Tier2): [`--bot-video-fps=<actual>[:<reported>]`](CLI_FLAGS.md#flag-bot-video-fps) separates video playback cadence from media FPS reporting for video-heavy workloads on profiles with Video FPS Control enabled. Use it when lower actual video cadence is acceptable and CPU density matters. For example, `--bot-video-fps=1:30` updates video frames at 1 FPS while keeping media reporting at 30 FPS. Visual pixel updates follow the actual cadence.

**Related guides:** [Performance](docs/guides/fingerprint/PERFORMANCE.md) · [Stack Depth](docs/guides/fingerprint/STACK_DEPTH.md) · [FPS Control](docs/guides/fingerprint/FPS_CONTROL.md) · [Storage and Memory Consistency](docs/guides/fingerprint/STORAGE_QUOTA.md) · [Navigator Properties](docs/guides/fingerprint/NAVIGATOR_PROPERTIES.md)

<details>
<summary><strong>Full details: Deep System Integration</strong></summary>

### Precise FPS Simulation (ENT Tier2)

- Frame rate control via [`--bot-fps`](CLI_FLAGS.md#flag-bot-fps): `profile` (use profile data), `real` (native rate), or a number (e.g., `60`)
- requestAnimationFrame delay matching target FPS
- Emulate target refresh rates (60Hz, 120Hz, 144Hz, etc.)
- Simulate high-FPS macOS behavior on Ubuntu hosts (Ubuntu requires ENT Tier1)
- Authentic vsync and frame timing patterns
- Video playback cadence control via [`--bot-video-fps`](CLI_FLAGS.md#flag-bot-video-fps): `<actual>[:<reported>]`, such as `1:30` for lower decode/render cadence with 30 FPS media reporting, or `1:real` to report the media's reported cadence where available

### Performance Fingerprint Controls

- Realistic memory allocation patterns and garbage collection timing
- IndexedDB, localStorage, and Cache API response timing
- JavaScript execution timing and WebAssembly performance simulation
- Deterministic noise seeds via [`--bot-noise-seed`](CLI_FLAGS.md#flag-bot-noise-seed) (ENT Tier2, 1-UINT32_MAX) to stabilize noise distributions across sessions
- Performance timing protection via [`--bot-time-seed`](CLI_FLAGS.md#flag-bot-time-seed) (ENT Tier2): deterministic execution timing diversity across 27 browser operations, plus resource and navigation timing redistribution (see above)
- Stack depth control via [`--bot-stack-seed`](CLI_FLAGS.md#flag-bot-stack-seed) (ENT Tier2): `profile`, `real`, or integer seed for stack depth across main thread, Worker, and WASM contexts
- Runtime timing scaling via [`--bot-time-scale`](CLI_FLAGS.md#flag-bot-time-scale) (ENT Tier2) to compress `performance.now()` deltas
- Network information privacy via [`--bot-network-info-override`](CLI_FLAGS.md#flag-bot-network-info-override): profile, native, or field-level custom JSON policies across JavaScript and Client Hints
- Memory and storage quota controls via [`--bot-js-heap-size-limit`](CLI_FLAGS.md#flag-bot-js-heap-size-limit) and [`--bot-storage-quota`](CLI_FLAGS.md#flag-bot-storage-quota): `profile`, `real`, or explicit byte values
- CPU core scaling: Worker threads automatically constrained to match `navigator.hardwareConcurrency` on Linux and Windows

### Extended Media Types & WebCodecs APIs

- Extended MIME type support beyond browser defaults
- Platform-specific codec availability simulation
- WebCodecs API support: videoDecoder/audioDecoder authentic reporting
- Realistic mediaCapabilities.decodingInfo() responses (ENT Tier2)
- Default configuration uses `expand` to prioritize local decoders

### GPU Driver Micro-Benchmarks

- GPU command execution timing and shader compilation performance
- Texture upload/download speeds and buffer allocation rates
- NVIDIA, AMD, Intel driver behavior patterns
- Realistic performance scaling with memory bandwidth limitations

### Dynamic Blink Features

- Windows-specific, macOS-exclusive, and Android mobile (PRO) Blink features
- Authentic feature availability reporting and runtime capability discovery
- Linux distribution variations (ENT Tier1)

</details>

---

<a id="complete-fingerprint-control"></a>
## Complete Fingerprint Control

<details>
<summary><strong>Full details: Complete Fingerprint Control</strong></summary>

<a id="browser-os-fingerprinting"></a>
### Browser & OS Fingerprinting

| Component | Capabilities |
|-----------|-------------|
| **User Agent** | Version control, userAgentData brands, full version override, custom UA with placeholders (ENT Tier3) |
| **Platform Detection** | Windows/macOS/Android(PRO) with authentic APIs |
| **Browser Features** | Debugger control, CDP leak protection, Chrome-specific behavior, WebView brand (ENT Tier3), WebKit-family profile consistency (ENT Tier4) |
| **Font System** | Built-in cross-platform fonts, Blink features, authentic fallback chains |
| **Client Hints** | DPR, device-memory, UA-CH, and other CH values stay aligned with JavaScript-visible metrics |
| **userAgentData** | Full control over platform, platformVersion, model, architecture, bitness, mobile (ENT Tier3) |

<a id="webkit-family-profile-consistency"></a>
### WebKit-Family Profile Consistency (ENT Tier4)

WebKit-family Profile Consistency extends premium profiles beyond browser-brand metadata. The browser runtime, workers, CSS behavior, fonts, canvas output, permission states, navigation headers, TLS behavior, HTTP/2 behavior, and per-context isolation are shaped to match the selected WebKit-family profile across supported host platforms.

Supported profile bundles cover desktop and mobile WebKit-family identities. Use this capability for authorized privacy validation when a workflow needs browser-family consistency while keeping BotBrowser's profile, automation, and per-context control model.

See [WebKit-family Profile Consistency](WEBKIT_PROFILE_CONSISTENCY.md) for the full feature page and setup notes.

### Location & Time Management

| Component | Capabilities |
|-----------|-------------|
| **Timezone** | Automatic IP-based detection, manual override, DST handling |
| **Geolocation** | Coordinate consistency, accuracy simulation, permission handling |
| **Time APIs** | Date/time consistency, performance.now() behavior, timezone transitions |

### Display & UI Control

| Component | Capabilities |
|-----------|-------------|
| **Screen Properties** | Resolution, color depth, orientation, pixel density |
| **Window Dimensions** | Size control, viewport management, responsive behavior |
| **Color Schemes** | matchMedia queries, prefers-color-scheme, system colors |
| **UI Elements** | System colors, scrollbar styling, form control appearance |

### Input & Navigation Systems

| Component | Capabilities |
|-----------|-------------|
| **Keyboard** | Layout emulation, key timing, input method simulation |
| **Touch Interface** | Touch event simulation, gesture recognition, mobile patterns, opt-in mobile keyboard visual viewport behavior |
| **Mouse Patterns** | Movement algorithms, click timing, scroll behavior |
| **Languages** | Accept-Language headers, navigator.languages, speech recognition |
| **Permissions** | Profile-backed permission states, notification handling, media access, and per-context consistency |
| **Navigation** | History management, referrer control, navigation timing |

<a id="graphics-rendering-engine"></a>
### Graphics & Rendering Engine

| Component | Capabilities |
|-----------|-------------|
| **Canvas** | 2D context noise, standard and wide-gamut color-space consistency, consistent image data, cross-worker consistency |
| **WebGL** | Precision GPU micro-benchmarks, driver-specific behavior, extension simulation |
| **WebGPU** | Modern GPU API support, compute shader capabilities, buffer management |
| **Text Rendering** | HarfBuzz text shaping, cross-platform fonts, emoji rendering consistency |
| **Performance** | Precise FPS simulation, texture hash fidelity, render timing control |

### Network & Media Subsystems

| Component | Capabilities |
|-----------|-------------|
| **Proxy** | Authentication embedding, credential management, geo-detection, authenticated PAC routing, PAC-like request callback, controlled synthetic responses |
| **WebRTC** | SDP control, ICE candidate filtering, media stream simulation |
| **HTTP Headers** | Google-specific headers (ENT Tier2), Chrome behavior patterns, request timing |
| **Media Devices** | AudioContext simulation, speech synthesis, device enumeration |
| **Codecs** | Extended media types, WebCodecs APIs, hardware acceleration simulation, video FPS control |
| **Widevine DRM** | Persistent license support, platform-appropriate license negotiation, EME capability fingerprinting prevention |
| **WebAuthn** | Platform-specific client capabilities, Touch ID/Bluetooth/payment authenticator detection prevention |

### Performance Characteristics

| Component | Capabilities |
|-----------|-------------|
| **Memory** | Allocation timing, garbage collection patterns, heap behavior |
| **Storage** | IndexedDB latency, cache timing, quota management |
| **Animation** | requestAnimationFrame precision, frame timing, smooth scrolling, video playback cadence |
| **Computation** | JavaScript execution timing, WebAssembly performance, crypto operations |

</details>

---

## Integration with Automation Frameworks

<a id="cdp-mouse-move-coalescing"></a>
### CDP Mouse Move Coalescing

[`--bot-cdp-coalesce`](CLI_FLAGS.md#flag-bot-cdp-coalesce) is an opt-in BrowserContext policy for serial CDP hover movement. It groups short runs of plain mouse moves before Chromium delivers them, while button, drag, wheel, keyboard, touch, pen, and relative-motion input keep their normal paths.

Documentation: [Automation Consistency](docs/guides/getting-started/AUTOMATION_CONSISTENCY.md#cdp-mouse-move-coalescing)

### Framework-Less Automation ([`--bot-script`](CLI_FLAGS.md#flag-bot-script))

Execute JavaScript with privileged `chrome.debugger` access, with no framework dependencies.

- **Earlier intervention.** Execute before page navigation.
- **Privileged context.** Full `chrome.debugger` API access.
- **Isolated execution.** Framework artifacts do not appear in page context.

Documentation: [Bot Script Examples](examples/bot-script) · [Guide](docs/guides/getting-started/BOT_SCRIPT.md)

<a id="playwright-puppeteer-integration"></a>
### Playwright/Puppeteer Integration

Privacy-preserving integration with popular frameworks.

- Prevents CDP artifacts from appearing in page context
- Maintains authentic browser behavior in all contexts
- Eliminates framework-specific fingerprint signatures
- ChromeDriver compatibility and Selenium Grid integration support

**Related guides:** [Playwright](docs/guides/getting-started/PLAYWRIGHT.md) · [Puppeteer](docs/guides/getting-started/PUPPETEER.md) · [Automation Consistency](docs/guides/getting-started/AUTOMATION_CONSISTENCY.md)

---

<a id="mirror-distributed-privacy-consistency"></a>
## Mirror: Distributed Privacy Consistency (ENT Tier3)

Verify that privacy protection works consistently across platforms and networks. Run a controller instance and multiple clients to ensure all instances maintain identical privacy defenses.

**[Complete Mirror documentation](tools/mirror/)** including setup, CLI flags, CDP examples, and troubleshooting. See also the [deployment guide](docs/guides/deployment/MIRROR_DISTRIBUTED.md).

---

<a id="per-context-fingerprint"></a>
## Per-Context Fingerprint (ENT Tier3)

Assign independent fingerprint bundles per BrowserContext without spawning new browser processes. Each context can have its own profile, timezone, locale, noise seeds, and all other fingerprint parameters. Workers automatically inherit the parent context fingerprint.

**[Complete Per-Context Fingerprint documentation](PER_CONTEXT_FINGERPRINT.md)** including CDP examples, supported flags, and use cases.

---

<a id="cdp-quick-reference"></a>
## CDP Quick Reference

All commands live under the `BotBrowser` CDP domain. Send them through a **browser-level** CDP session (`browser.target().createCDPSession()` in Puppeteer, `browser.newBrowserCDPSession()` in Playwright). Page-level sessions (`page.createCDPSession()`) do not have access to this domain.

| Command | Scope | Tier | Description | Documentation |
|---------|-------|------|-------------|---------------|
| `setBrowserContextFlags` | browser | ENT Tier3 | Assign independent fingerprint flags to a BrowserContext | [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) |
| `setBrowserContextProxy` | browser | ENT Tier3 | Switch proxy for a BrowserContext at runtime | [Dynamic Proxy Switching](#dynamic-proxy-switching) |
| `clearBrowserContextProxy` | browser | ENT Tier3 | Remove proxy override from a BrowserContext | [Dynamic Proxy Switching](#dynamic-proxy-switching) |
| `setCustomHeaders` | browser | PRO | Replace all custom HTTP request headers | [`--bot-custom-headers`](CLI_FLAGS.md#flag-bot-custom-headers) |
| `getCustomHeaders` | browser | PRO | Retrieve current custom headers | [`--bot-custom-headers`](CLI_FLAGS.md#flag-bot-custom-headers) |
| `addCustomHeader` | browser | PRO | Add or update a single custom header | [`--bot-custom-headers`](CLI_FLAGS.md#flag-bot-custom-headers) |
| `removeCustomHeader` | browser | PRO | Remove a single custom header | [`--bot-custom-headers`](CLI_FLAGS.md#flag-bot-custom-headers) |
| `clearCustomHeaders` | browser | PRO | Remove all custom headers | [`--bot-custom-headers`](CLI_FLAGS.md#flag-bot-custom-headers) |
| `startMirrorController` | browser | ENT Tier3 | Start this instance as a Mirror controller | [Mirror](tools/mirror/) |
| `startMirrorClient` | browser | ENT Tier3 | Connect this instance as a Mirror client | [Mirror](tools/mirror/) |
| `stopMirror` | browser | ENT Tier3 | Stop Mirror controller or client role | [Mirror](tools/mirror/) |
| `getMirrorStatus` | browser | ENT Tier3 | Query current Mirror connection status | [Mirror](tools/mirror/) |

> All BotBrowser CDP commands are browser-level only. Use `browser.target().createCDPSession()` (Puppeteer) or `browser.newBrowserCDPSession()` (Playwright).

---

## Related Documentation

- [CLI Flag Directory](CLI_FLAGS.md#flag-directory) - Flags by task, tier, timing, and primary guide
- [Profile Configuration](profiles/PROFILE_CONFIGS.md) - Profile JSON field reference
- [Installation Guide](INSTALLATION.md) - Platform-specific setup
- [Guides](docs/guides/README.md) - Setup and troubleshooting by workflow
- [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) - Independent fingerprint per BrowserContext
- [Validation Results](VALIDATION.md) - Research and testing data
- [Mirror](tools/mirror/) - Distributed privacy consistency verification
- [CanvasLab](tools/canvaslab/) - Canvas 2D / WebGL / WebGL2 forensics and privacy validation tool
- [AudioLab](tools/audiolab/) - Web Audio API forensics and audio fingerprint collection analysis tool
- [V8Log Forensics](tools/v8log/) - Browser-runtime evidence and exact API filters for authorized fingerprint protection sessions
- [Examples](examples/) - Playwright, Puppeteer, bot-script integration
- [Main README](README.md) - Project overview and quick start

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
