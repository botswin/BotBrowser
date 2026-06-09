<h1 align="center"><img src="docs/assets/logo-32.svg" alt="BotBrowser logo" width="32" height="32" /> BotBrowser</h1>

<h4 align="center">Advanced Privacy Browser Core with Unified Fingerprint Defense 🚀</h4>

<p align="center">
  Identical privacy posture on any OS • Cross-platform & WebView simulation • Fingerprint protection validated across 31+ tracking scenarios
</p>

<p align="center">
  <a href="https://github.com/botswin/BotBrowser/releases">
    <img src="https://img.shields.io/github/v/release/botswin/BotBrowser?style=flat-square" alt="Latest Release">
  </a>
  <a href="https://github.com/botswin/BotBrowser/commits/main/">
    <img src="https://img.shields.io/github/commit-activity/m/botswin/BotBrowser?style=flat-square" alt="Commit Activity">
  </a>
  <a href="https://github.com/botswin/BotBrowser/issues">
    <img src="https://img.shields.io/github/issues/botswin/BotBrowser?style=flat-square" alt="Issues">
  </a>
  <a href="https://github.com/botswin/BotBrowser/fork">
    <img src="https://img.shields.io/github/forks/botswin/BotBrowser?style=flat-square" alt="GitHub Forks">
  </a>
  <a href="https://github.com/botswin/BotBrowser">
    <img src="https://img.shields.io/github/stars/botswin/BotBrowser" alt="GitHub Stars">
  </a>
  <a href="https://botbrowser.io">
    <img src="https://img.shields.io/badge/Website-botbrowser.io-blue?style=flat-square" alt="Website">
  </a>
</p>

<div align="center">
  <img width="600" alt="BotBrowser GUI - Your Command Center" src="https://github.com/user-attachments/assets/0f003494-ec92-4c3a-b879-b08d3521a0fb">
</div>

---
## What Is BotBrowser?

BotBrowser is a privacy-first browser core designed to protect users from browser fingerprinting, a technique recognized as a privacy threat by W3C, major browser vendors, privacy regulators, and academic research ([see references](FINGERPRINT_PRIVACY.md)). It keeps fingerprint signals uniform across every platform, preventing tracking systems from collecting and correlating data to identify users. Run the same profile on Windows, macOS, or Linux and the fingerprint posture stays identical each time.

All engineering focuses on privacy research, cross-platform tracking-resistance validation, and maintaining protected environments for authorized defensive benchmarking. Review the project [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md) before using the software.

---

## Why BotBrowser

> **What makes BotBrowser different:** Cross-platform privacy browser core with unified fingerprint technology that prevents tracking data collection and device linkage.

<table cellspacing="0" cellpadding="8">
  <tr>
    <td width="50%"><strong>High-Fidelity, Always-Current Profiles</strong> including <a href="docs/guides/platform/ANDROID_WEBVIEW.md">Android WebView</a> and <a href="WEBKIT_PROFILE_CONSISTENCY.md">WebKit-family profile consistency</a>, built on the latest stable Chromium so fingerprints stay aligned with current browser behavior and reduce stale-engine correlation risk</td>
    <td width="50%"><strong>Network Stack Parity</strong> with <a href="ADVANCED_FEATURES.md#network-fingerprint-control">Full-Proxy QUIC/STUN</a> (UDP over SOCKS5) delivers Chromium-level tunneling so geo metadata does not leak and privacy labs maintain clean transport parity</td>
  </tr>
  <tr>
    <td width="50%"><strong>Advanced Programmatic Control</strong> offers <a href="examples/">Playwright/Puppeteer integration</a> with CDP leak blocking so privacy tooling leaves no telemetry residue</td>
    <td width="50%"><strong>Distributed Privacy Consistency</strong> lets you verify privacy protection across multiple browser instances simultaneously <a href="tools/mirror/">with Mirror</a>, synchronizing input and validating privacy posture in parallel</td>
  </tr>
  <tr>
    <td width="50%"><strong>Per-Context Fingerprint</strong> enables <a href="PER_CONTEXT_FINGERPRINT.md">independent fingerprint bundles per BrowserContext</a> without spawning new processes, with millisecond-level switching and reduced memory overhead</td>
    <td width="50%"><strong>Zero-Overhead Performance</strong> adds <a href="BENCHMARK.md">no measurable latency</a>: Speedometer 3.0 within &lt;1% of stock Chrome, zero fingerprint API overhead across macOS/Linux/Windows, 29% memory savings at scale with Per-Context Fingerprint, and a <a href="BENCHMARK.md#trimmed-build">Trimmed Build</a> (ENT Tier3) delivering 62% lower wall time and 85% faster per-context spin-up on Linux x64</td>
  </tr>
</table>

### Cross-Platform Fingerprint Protection

- Single profile, every host OS: identical UA, screen metrics, touch surfaces, fonts, and device APIs on Windows, macOS, Linux (ENT Tier1), Android (PRO), WebView (ENT Tier3), and WebKit-family profile bundles (ENT Tier4) for consistent browser identity across environments.
- Built-in configuration handles touch simulation, device metrics, and locale/timezone detection from the proxy IP while still allowing CLI overrides when privacy experiments require them.
- Quick demos: [▶️ CreepJS Android](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs-Android) • [▶️ Iphey](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-iphey-iphey-Android) • [▶️ Pixelscan](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-pixelscan-pixelscan-Android)

---

## Getting Started

### Quick Start

**Step 1: Download**
- [Latest release](https://github.com/botswin/BotBrowser/releases) for your OS
- [Demo profile](profiles/) (any `.enc` file)

**Step 2: Launch**
- **GUI:** Use [BotBrowserLauncher](launcher/) for one-click profile selection and multi-instance management
- **CLI** (use absolute paths):
  ```cmd
  chrome.exe --bot-profile="C:\absolute\path\to\profile.enc" --user-data-dir="%TEMP%\botprofile_%RANDOM%"
  ```
- macOS/Linux commands follow the same pattern; see [INSTALLATION.md](INSTALLATION.md) for full instructions.

**Step 3: Verify**
- Visit [CreepJS](https://abrahamjuliot.github.io/creepjs/) or your preferred tracking observatory to confirm identical privacy posture.
- Timezone/locale/language auto-derive from your proxy/IP; override via CLI only when needed.


**[Complete Installation Guide →](INSTALLATION.md)**

### Minimal Playwright Example

```javascript
const browser = await chromium.launch({
  headless: true,
  executablePath: BOTBROWSER_EXEC_PATH,
  args: [`--bot-profile=${BOT_PROFILE_PATH}`,
  '--proxy-server=socks5://usr:pwd@127.0.0.1:8989']  // or: http://usr:pwd@127.0.0.1:8989
});
const page = await browser.newPage();
await page.addInitScript(() => { delete window.__playwright__binding__; delete window.__pwInitScripts; });
await page.goto('https://abrahamjuliot.github.io/creepjs/');
```

**Notes:**
- Use `--user-data-dir` with a unique temporary folder to avoid conflicts with running Chromium instances
- Prefer `--proxy-server` or [per-context proxies](PER_CONTEXT_FINGERPRINT.md) (ENT Tier1); auto timezone/locale detection applies in both cases
- Avoid framework-specific proxy/auth options (e.g., `page.authenticate()`), which disable BotBrowser's geo-detection and may leak location information

Examples: [Playwright](examples/playwright/) • [Puppeteer](examples/puppeteer/)

**More options:**
- Framework-less approach: [`--bot-script`](CLI_FLAGS.md#--bot-script) + [CDP](examples/bot-script/) (privileged context, earlier hook, fewer artifacts)
- Docker: [docker/README.md](docker/)
- Full flags: [CLI_FLAGS.md](CLI_FLAGS.md)

<a id="builds"></a>
## Builds

BotBrowser ships in two builds. Both share the same fingerprint protection model, the same profile format, the same CLI flag surface, and the same CDP commands.

| | Standard Build | Trimmed Build (ENT Tier3) |
|---|---|---|
| **Distribution** | Public [releases](https://github.com/botswin/BotBrowser/releases) | Enterprise channel only |
| **Built for** | Long-running and interactive sessions | Short-session, high-concurrency automation |
| **Browser feature surface** | Full | Tuned for short-session workloads |
| **Fingerprint protection** | Same | Same |
| **Per-Context Fingerprint** | Same | Same |
| **Profile compatibility** | Same | Same |

**Linux x64 benchmark (400 official samples, `1..20 contexts × 10 repeats × 2 builds`)**: Trimmed Build cuts wall time by **62%**, per-context creation by **85%**, first navigation by **38%**, CPU peak by **68%**, PSS peak by **31%** versus Standard, with **100% success rate** and **0 residual processes** for both builds.

Trimmed Build is the right choice when context spin-up dominates total wall time, when CPU peak per context limits density, or when shared memory is the binding constraint. Standard Build remains the right choice for interactive workflows and scenarios that exercise the full browser feature surface.

Product overview, engineering design, FAQ: [TRIMMED_BUILD.md](TRIMMED_BUILD.md). Full performance table: [BENCHMARK.md#trimmed-build](BENCHMARK.md#trimmed-build). Access: [Enterprise](https://botbrowser.io/enterprise/) or [Pricing](https://botbrowser.io/pricing/).

## Feature Reference

> Configuration priority: [CLI flags](CLI_FLAGS.md) (highest) > [Profile configs](profiles/PROFILE_CONFIGS.md) > defaults. Timezone, locale, and language auto-derive from your proxy IP.

### Network & Proxy

| Feature | Reference | Guide |
|---------|-----------|-------|
| Proxy with embedded credentials (HTTP/SOCKS5/SOCKS5H) | [Proxy Configuration](CLI_FLAGS.md#enhanced-proxy-configuration) | [Guide](https://botbrowser.io/docs/network/proxy-configuration/) |
| Regex-based proxy routing rules | [--proxy-bypass-rgx](CLI_FLAGS.md#--proxy-bypass-rgx) | [Guide](https://botbrowser.io/docs/network/proxy-selective-routing/) |
| Per-context proxy with auto geo-detection | [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) | [Guide](https://botbrowser.io/docs/network/per-context-proxy/) |
| Dynamic proxy switching at runtime | [Dynamic Proxy Switching](ADVANCED_FEATURES.md#dynamic-proxy-switching) | [Guide](https://botbrowser.io/docs/network/dynamic-proxy-switching/) |
| UDP over SOCKS5 (QUIC/STUN tunneling) | [UDP over SOCKS5](CLI_FLAGS.md#udp-over-socks5-ent-tier3) | [Guide](https://botbrowser.io/docs/network/udp-over-socks5/) |
| Local DNS solver | [--bot-local-dns](CLI_FLAGS.md#--bot-local-dns-ent-tier1) | [Guide](https://botbrowser.io/docs/network/dns-leak-prevention/) |
| Port protection for local services | [--bot-port-protection](CLI_FLAGS.md#--bot-port-protection-pro) | [Guide](https://botbrowser.io/docs/network/port-protection/) |
| WebRTC leak protection (SDP/ICE control) | [WebRTC Leak Protection](ADVANCED_FEATURES.md#webrtc-leak-protection) | [Guide](https://botbrowser.io/docs/network/webrtc-leak-prevention/) |

### Fingerprint & Rendering

| Feature | Reference | Guide |
|---------|-----------|-------|
| Canvas / WebGL / WebGPU deterministic noise | [Multi-Layer Noise](ADVANCED_FEATURES.md#multi-layer-fingerprint-noise) | [Canvas](https://botbrowser.io/docs/fingerprint/canvas/) · [WebGL](https://botbrowser.io/docs/fingerprint/webgl/) |
| AudioContext noise calibration | [Multi-Layer Noise](ADVANCED_FEATURES.md#multi-layer-fingerprint-noise) | [Guide](https://botbrowser.io/docs/fingerprint/audio/) |
| Text metrics & ClientRects noise | [Multi-Layer Noise](ADVANCED_FEATURES.md#multi-layer-fingerprint-noise) | [Guide](https://botbrowser.io/docs/fingerprint/font/) |
| Deterministic noise seeds (reproducible per-tenant) | [--bot-noise-seed](CLI_FLAGS.md#behavior--protection-toggles) | [Guide](https://botbrowser.io/docs/fingerprint/noise-seed-reproducibility/) |
| Performance timing protection (27 browser operations) | [Performance Timing Protection](ADVANCED_FEATURES.md#performance-timing-protection) | [Guide](https://botbrowser.io/docs/fingerprint/performance/) |
| Stack depth fingerprint control (main/Worker/WASM) | [Stack Depth Control](ADVANCED_FEATURES.md#stack-depth-control) | [Guide](https://botbrowser.io/docs/fingerprint/stack-depth/) |
| Network information privacy (rtt/downlink/effectiveType) | [Network Info Privacy](ADVANCED_FEATURES.md#network-info-privacy) | [Guide](https://botbrowser.io/docs/fingerprint/navigator-properties/) |
| CPU core scaling protection | [CPU Core Scaling](ADVANCED_FEATURES.md#cpu-core-scaling) | [Guide](https://botbrowser.io/docs/fingerprint/cpu-core-scaling/) |
| Cross-platform font engine (Win/Mac/Android) | [Font Engine](ADVANCED_FEATURES.md#cross-platform-font-engine) | [Guide](https://botbrowser.io/docs/fingerprint/font/) |
| GPU simulation on headless servers | [Headless Compatibility](ADVANCED_FEATURES.md#headless-incognito-compatibility) | [Guide](https://botbrowser.io/docs/fingerprint/incognito/) |

### Identity & Platform

| Feature | Reference | Guide |
|---------|-----------|-------|
| Cross-platform profile portability (Win / Mac / Linux) | [Advanced Features](ADVANCED_FEATURES.md) | [Guide](https://botbrowser.io/docs/platform/cross-platform-profiles/) |
| Browser brand switching (Chrome/Edge/Brave/Opera) | [Profile Overrides](CLI_FLAGS.md#profile-configuration-override-flags) | [Guide](https://botbrowser.io/docs/identity/browser-brand-alignment/) |
| Custom User-Agent with full userAgentData control | [Profile Overrides](CLI_FLAGS.md#profile-configuration-override-flags) | [Guide](https://botbrowser.io/docs/identity/custom-user-agent/) |
| Client Hints alignment (DPR, device-memory, UA-CH) | [Browser & OS](ADVANCED_FEATURES.md#browser-os-fingerprinting) | [Guide](https://botbrowser.io/docs/fingerprint/navigator-properties/) |
| Android WebView emulation | [Profile Overrides](CLI_FLAGS.md#profile-configuration-override-flags) | [Guide](https://botbrowser.io/docs/platform/android-webview/) |
| WebKit-family profile consistency (ENT Tier4) | [Feature Page](WEBKIT_PROFILE_CONSISTENCY.md) | [Guide](docs/guides/platform/WEBKIT_PROFILE_CONSISTENCY.md) |
| Chrome behavior emulation (HTTP/2, HTTP/3, headers) | [Chrome Behavior](ADVANCED_FEATURES.md#chrome-behavior-emulation) | |

### Automation & Scripting

| Feature | Reference | Guide |
|---------|-----------|-------|
| Playwright / Puppeteer integration | [Examples](examples/) | [Playwright](https://botbrowser.io/docs/getting-started/playwright/) · [Puppeteer](https://botbrowser.io/docs/getting-started/puppeteer/) |
| Framework-less bot-script (chrome.debugger API) | [--bot-script](CLI_FLAGS.md#--bot-script) | [Guide](https://botbrowser.io/docs/getting-started/bot-script/) |
| Per-context fingerprint (multiple profiles per process) | [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) | [Guide](https://botbrowser.io/docs/identity/multi-account-isolation/) |
| Console message suppression | [Behavior Toggles](CLI_FLAGS.md#behavior--protection-toggles) | [Guide](https://botbrowser.io/docs/fingerprint/console-suppression/) |
| Headless / GUI parity | [Headless Compatibility](ADVANCED_FEATURES.md#headless-incognito-compatibility) | [Guide](https://botbrowser.io/docs/fingerprint/incognito/) |
| Mirror: distributed privacy consistency | [Mirror Documentation](tools/mirror/) | [Guide](https://botbrowser.io/docs/deployment/mirror-distributed/) |
| CanvasLab: Canvas 2D / WebGL / WebGL2 recorder and ENT Tier4 Canvas Replay | [--bot-canvas-record-file](CLI_FLAGS.md#--bot-canvas-record-file) | [Guide](https://botbrowser.io/docs/proof/canvaslab/) |
| AudioLab: Web Audio API recorder | [--bot-audio-record-file](CLI_FLAGS.md#--bot-audio-record-file) | [Guide](https://botbrowser.io/docs/proof/audiolab/) |
| V8Log Forensics | [--bot-v8-log](CLI_FLAGS.md#--bot-v8-log) | [Guide](docs/guides/getting-started/V8LOG.md) · [Tool](tools/v8log/) |

### Session & Behavior

| Feature | Reference | Guide |
|---------|-----------|-------|
| Cookie management (inline JSON or file) | [--bot-cookies](CLI_FLAGS.md#--bot-cookies) | [Guide](https://botbrowser.io/docs/identity/cookie-management/) |
| Bookmark injection | [--bot-bookmarks](CLI_FLAGS.md#--bot-bookmarks) | [Guide](https://botbrowser.io/docs/identity/bookmark-seeding/) |
| History injection (random or precise count) | [Behavior Toggles](CLI_FLAGS.md#behavior--protection-toggles) | [Guide](https://botbrowser.io/docs/identity/history-seeding/) |
| Incognito `X-Client-Data` consistency | [Behavior Toggles](CLI_FLAGS.md#behavior--protection-toggles) | [Guide](https://botbrowser.io/docs/fingerprint/incognito/) |
| Always-active windows (anti-focus-tracking) | [Active Window](ADVANCED_FEATURES.md#active-window-emulation) | [Guide](https://botbrowser.io/docs/fingerprint/active-window/) |
| Custom HTTP headers (CLI + CDP) | [--bot-custom-headers](CLI_FLAGS.md#--bot-custom-headers-pro) | [Guide](https://botbrowser.io/docs/network/custom-http-headers/) |
| Plaintext storage access (cookies, localStorage) | [Storage Access](examples/storage-access/) | [Guide](https://botbrowser.io/docs/identity/storage-access/) |
| Precision FPS simulation | [Behavior Toggles](CLI_FLAGS.md#behavior--protection-toggles) | [Guide](https://botbrowser.io/docs/fingerprint/fps-control/) |
| Timing scale (performance.now compression) | [Behavior Toggles](CLI_FLAGS.md#behavior--protection-toggles) | [Guide](https://botbrowser.io/docs/fingerprint/performance/) |
| Window/screen dimension control | [Profile Overrides](CLI_FLAGS.md#profile-configuration-override-flags) | [Guide](https://botbrowser.io/docs/platform/device-emulation/) |
| Mobile screen orientation control | [--bot-config-orientation](CLI_FLAGS.md#profile-configuration-override-flags) | [Guide](https://botbrowser.io/docs/platform/device-emulation/) |

<details>
<summary><strong>Fingerprint Protection Implementation: Privacy Controls → Technical Design → Validation</strong></summary>

This reference maps privacy protection goals to BotBrowser implementation details and validation evidence.

| Privacy Protection | Implementation | Reference |
|---|---|---|
| API standardization | navigator.webdriver standardized across all platforms so trackers cannot use API presence/absence as identification signal | [ADVANCED_FEATURES#Chrome Behavior Emulation](ADVANCED_FEATURES.md#chrome-behavior-emulation) |
| Execution environment protection | Isolated execution context prevents framework artifacts from exposing privacy leaks | [ADVANCED_FEATURES#Playwright/Puppeteer Integration](ADVANCED_FEATURES.md#playwright-puppeteer-integration) |
| Graphics rendering consistency | Deterministic noise across Canvas, WebGL, WebGPU, and audio ensures protected fingerprints even in GPU-dependent scenarios | [ADVANCED_FEATURES#Graphics & Rendering Engine](ADVANCED_FEATURES.md#graphics-rendering-engine) |
| GPU fingerprint uniformity | Canvas and WebGPU rendering shares deterministic properties so GPU probes like [WebBrowserTools](https://webbrowsertools.com/webgpu-fingerprint/) return authentic results | [CHANGELOG#2025-12-08](CHANGELOG.md#2025-12-08) |
| Typography consistency | Embedded font engines for Windows, macOS, Linux, and Android ensure text rendering remains identical across platforms | [ADVANCED_FEATURES#Cross-Platform Font Engine](ADVANCED_FEATURES.md#cross-platform-font-engine) |
| Font availability uniformity | DOM queries return authentic font lists from embedded bundles so host system fonts cannot leak platform identity | [ADVANCED_FEATURES#Cross-Platform Font Engine](ADVANCED_FEATURES.md#cross-platform-font-engine) |
| Device capabilities | Profile-based device properties maintain protected device claims across all platforms | [Profile Configs](profiles/PROFILE_CONFIGS.md) |
| Network topology privacy | WebRTC signaling stays protected through SDP and ICE controls preventing network topology leakage | [ADVANCED_FEATURES#WebRTC Leak Protection](ADVANCED_FEATURES.md#webrtc-leak-protection) |
| User agent coherence | Browser brand and version parity prevents UA string from revealing platform differences | [CLI_FLAGS#Profile Configuration Override Flags](CLI_FLAGS.md#profile-configuration-override-flags) |
| Header to API parity | Client Hints headers DPR, device-memory, and UA-CH align with JavaScript reported values preventing header based identification | [ADVANCED_FEATURES#Browser & OS Fingerprinting](ADVANCED_FEATURES.md#browser-os-fingerprinting) |
| Execution mode parity | GPU, WebGPU, and media signals remain identical whether running headless or in GUI mode | [ADVANCED_FEATURES#Headless & Incognito Compatibility](ADVANCED_FEATURES.md#headless-incognito-compatibility) |
| DNS privacy | Use local DNS solver (ENT Tier1) for private resolution that avoids DNS leaks and provider restrictions, or use SOCKS5H to keep DNS within proxy tunnels | [CLI_FLAGS#Enhanced Proxy Configuration](CLI_FLAGS.md#enhanced-proxy-configuration) |
| Public IP discovery | Customizable IP lookup backend for geo derivation via `--bot-ip-service` (supports comma-separated endpoints; BotBrowser races them and uses the fastest successful response) | [CLI_FLAGS#Enhanced Proxy Configuration](CLI_FLAGS.md#enhanced-proxy-configuration) |
| Protocol conformance | HTTP/2 and HTTP/3 behavior matches Chrome specifications preventing protocol based differentiation | [ADVANCED_FEATURES#Chrome Behavior Emulation](ADVANCED_FEATURES.md#chrome-behavior-emulation) |
| TLS behavior consistency | Network protocol behavior aligned with the active profile family across supported platforms | [CHANGELOG](CHANGELOG.md) |
| DRM capability consistency | Widevine persistent license support with platform-appropriate license negotiation prevents tracking via EME capability fingerprinting | [ADVANCED_FEATURES](ADVANCED_FEATURES.md#complete-fingerprint-control) |
| Authentication capability uniformity | WebAuthn client capabilities return platform-specific values preventing tracking via Touch ID, Bluetooth authenticator, and payment extension detection | [ADVANCED_FEATURES](ADVANCED_FEATURES.md#complete-fingerprint-control) |

**Fingerprint Protection Matrix: Cross-Platform Coverage**

| Category | Sample Capabilities |
|----------|---------------------|
| **Graphics** | Canvas/WebGL rendering, GPU micro-benchmarks, texture hash configuration |
| **Network** | WebRTC SDP configuration, proxy auth, connection management |
| **Platform** | Font fallback chains, cross-worker protection, OS-specific features |
| **Performance** | FPS simulation, memory timing, animation frame optimization |

</details>


**[Advanced Features (architecture & design) →](ADVANCED_FEATURES.md)** | **[CLI Flags (all options) →](CLI_FLAGS.md)**



---

## Fingerprint Protection Validation

Fingerprint protection validated across 31+ tracking scenarios. See [DISCLAIMER](DISCLAIMER.md) for authorized use.

<table cellspacing="0" cellpadding="8">
  <tr>
    <td width="20%"><strong><a href="tests/tests/antibots/cloudflare.spec.ts">Cloudflare Protection Validation</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-cloudflare-turnstile">▶️ Validation Recording</a></td>
    <td width="20%"><strong><a href="tests/tests/antibots/creepjs.spec.ts">CreepJS Fingerprint Analysis</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs">▶️ Desktop Protection</a> / <a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs-Android">▶️ Android Profile</a></td>
  </tr>
  <tr>
    <td width="20%"><strong><a href="tests/tests/antibots/datadome.spec.ts">DataDome Detection Environment</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-datadome-fifa">▶️ Scenario Analysis</a></td>
    <td width="20%"><strong><a href="tests/tests/antibots/fingerprintjs.spec.ts">FingerprintJS Pro Analysis</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-fingerprintjs-botdetection">▶️ Tracking Methodology</a></td>
  </tr>
  <tr>
    <td width="20%"><strong><a href="tests/tests/antibots/perimeterx.spec.ts">PerimeterX Protection Study</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-perimeterx-zillow">▶️ Protection Validation</a></td>
    <td width="20%"><strong><a href="tests/tests/antibots/pixelscan.spec.ts">Pixelscan Fingerprint Assessment</a></strong></td>
    <td width="30%"><a href="//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-pixelscan-pixelscan">▶️ Comprehensive Study</a></td>
  </tr>
</table>

### Cross-Platform Protection Validation
- **Windows Profile on macOS:** Fingerprint protection maintained so privacy defenses remain effective across platforms
- **Android Emulation on Desktop (PRO):** Mobile API parity enables fingerprint testing for cross-device privacy research
- **Headless vs GUI Mode:** Identical fingerprint behavior ensures privacy validation results remain effective across execution contexts

**[Complete Validation Results & Research Data →](VALIDATION.md)**

---

## Engine Internals

BotBrowser's engine is built in-house on top of Chromium, with no forks or external project dependencies. Selected patch examples, build configurations, and the Chromium source directory tree are published in [patches/](patches/). The full core remains proprietary.

---

## Resources & Support

### Documentation

- [Guides](https://botbrowser.io/docs/) - Step-by-step guides for proxy, fingerprint, identity, platform emulation, and deployment
- [llms.txt](llms.txt) - Indexed entry point for LLMs (project summary plus links to core docs and guides)
- [Installation Guide](INSTALLATION.md) - Platform-specific setup, Docker deployment, troubleshooting
- [Advanced Features](ADVANCED_FEATURES.md) - Architecture and design details
- [CLI Flags Reference](CLI_FLAGS.md) - Core and extended runtime flags with examples
- [Profile Configuration](profiles/PROFILE_CONFIGS.md) - Profile JSON field reference
- [Validation Results](VALIDATION.md) - Research data across 31+ tracking scenarios
- [Performance Benchmark](BENCHMARK.md) - Speedometer 3.0, fingerprint API overhead, and scale performance data

### Support Channels

<table>
  <tr><td>Website</td><td>Documentation, guides, blog</td><td><a href="https://botbrowser.io">botbrowser.io</a></td></tr>
  <tr><td>Email</td><td>Technical questions, source code access</td><td><a href="mailto:support@botbrowser.io">support@botbrowser.io</a></td></tr>
  <tr><td>Telegram</td><td>Community support, quick questions</td><td><a href="https://t.me/botbrowser_support">@botbrowser_support</a></td></tr>
</table>

---

## Responsible Use

- Review the detailed [Responsible Use Guidelines](RESPONSIBLE_USE.md) and [Legal Disclaimer](DISCLAIMER.md) before requesting binaries or premium profiles.
- Maintain written authorization for every environment you test, and record the synthetic data sets you rely on.
- Contact the maintainers at [support@botbrowser.io](mailto:support@botbrowser.io) if you observe suspicious activity or need to report an abuse incident.

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
