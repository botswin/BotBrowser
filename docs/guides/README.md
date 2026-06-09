# BotBrowser Guides

> Comprehensive documentation for configuring, deploying, and verifying BotBrowser's fingerprint protection capabilities.

These guides cover everything from initial setup to advanced deployment scenarios. Each guide is self-contained with prerequisites, code examples, and troubleshooting steps.

---

<a id="getting-started"></a>
## Getting Started

| Guide | Description |
|-------|-------------|
| [Playwright](getting-started/PLAYWRIGHT.md) | Integrate BotBrowser with Playwright for stable fingerprint behavior and automation-safe launches. |
| [Puppeteer](getting-started/PUPPETEER.md) | Integrate BotBrowser with Puppeteer for consistent fingerprint control in automation workflows. |
| [Bot Script](getting-started/BOT_SCRIPT.md) | Automate BotBrowser without Playwright or Puppeteer using `--bot-script` and Chrome Debugger APIs. |
| [CLI Recipes](getting-started/CLI_RECIPES.md) | Use copy-paste CLI recipes for proxy, fingerprint, identity, and deployment scenarios. |
| [Profile Management](getting-started/PROFILE_MANAGEMENT.md) | Manage profile files, versions, and lifecycle for reproducible browser identity. |
| [First Verification](getting-started/FIRST_VERIFICATION.md) | Validate fingerprint consistency with CreepJS and BrowserLeaks. |
| [Automation Consistency Practices](getting-started/AUTOMATION_CONSISTENCY.md) | Reduce framework-related inconsistency signals in Playwright/Puppeteer workflows. |
| [CanvasLab](getting-started/CANVASLAB.md) | Record Canvas 2D, WebGL, and WebGL2 API calls to study graphics signal collection and verify fingerprint protection. |
| [AudioLab](getting-started/AUDIOLAB.md) | Record Web Audio API calls to study audio fingerprint collection and verify audio privacy protection. |
| [V8Log Forensics](getting-started/V8LOG.md) | Review browser-runtime calls, arguments, and return previews for authorized privacy validation. |

<a id="network-proxy"></a>
## Network and Proxy

| Guide | Description |
|-------|-------------|
| [Proxy Configuration](network/PROXY_CONFIGURATION.md) | Configure HTTP/SOCKS proxy routing for stable browser identity and network privacy. |
| [Proxy and Geolocation](network/PROXY_GEOLOCATION_ALIGNMENT.md) | Align proxy IP, timezone, locale, and language for consistent geolocation signals. |
| [Dynamic Proxy Switching](network/DYNAMIC_PROXY_SWITCHING.md) | Switch proxies at runtime per BrowserContext without restarting sessions. |
| [WebRTC Leak Prevention](network/WEBRTC_LEAK_PREVENTION.md) | Prevent WebRTC IP leaks by controlling ICE behavior and candidate exposure. |
| [DNS Leak Prevention](network/DNS_LEAK_PREVENTION.md) | Prevent DNS leaks by controlling local vs proxy-path resolution behavior. |
| [Custom HTTP Headers](network/CUSTOM_HTTP_HEADERS.md) | Configure custom request headers for all outgoing browser traffic. |
| [Port Protection](network/PORT_PROTECTION.md) | Block remote pages from scanning localhost and internal service ports. |
| [UDP over SOCKS5](network/UDP_OVER_SOCKS5.md) | Route QUIC/STUN UDP traffic through SOCKS5 for consistent network identity. |
| [Per-Context Proxy](network/PER_CONTEXT_PROXY.md) | Assign different proxies to different contexts for multi-identity automation. |
| [Proxy Selective Routing](network/PROXY_SELECTIVE_ROUTING.md) | Control selective proxy routing with regex-based direct/proxied paths. |
| [GeoIP Database](network/GEOIP_DATABASE.md) | Map proxy IPs to consistent timezone, locale, and language settings. |

<a id="fingerprint-protection"></a>
## Fingerprint Protection

| Guide | Description |
|-------|-------------|
| [Browser Fingerprinting Explained](fingerprint/BROWSER_OVERVIEW.md) | Learn core fingerprinting techniques and how BotBrowser keeps browser signals consistent. |
| [Canvas Fingerprinting](fingerprint/CANVAS.md) | Control Canvas readback behavior and noise for consistent, privacy-protective output. |
| [WebGL Fingerprinting](fingerprint/WEBGL.md) | Manage GPU-exposed WebGL parameters and rendering output consistency. |
| [Font Fingerprinting](fingerprint/FONT.md) | Control font availability and text metrics for cross-platform consistency. |
| [CSS Signal Consistency](fingerprint/CSS_SIGNAL_CONSISTENCY.md) | Reduce CSS media-query and feature-detection fingerprint leakage. |
| [Audio Fingerprinting](fingerprint/AUDIO.md) | Manage AudioContext-derived fingerprint signals with consistent behavior. |
| [Performance Fingerprinting](fingerprint/PERFORMANCE.md) | Control timing-based fingerprint signals across browser performance APIs. |
| [Navigator Properties](fingerprint/NAVIGATOR_PROPERTIES.md) | Keep navigator properties aligned across pages, workers, and headers. |
| [Screen and Window Fingerprinting](fingerprint/SCREEN_WINDOW.md) | Normalize screen/window metrics to avoid display-identity mismatches. |
| [Speech Synthesis Fingerprinting](fingerprint/SPEECH_SYNTHESIS.md) | Control speech voice lists and TTS metadata exposure. |
| [MIME and Codec Fingerprinting](fingerprint/MIME_CODEC.md) | Configure MIME/codec capability surfaces to match target identity. |
| [Noise Seed Reproducibility](fingerprint/NOISE_SEED_REPRODUCIBILITY.md) | Use deterministic noise seeds for repeatable fingerprint behavior. |
| [DRM Fingerprinting](fingerprint/DRM.md) | Keep DRM/EME capability responses consistent with platform identity. |
| [Stack Depth Fingerprinting](fingerprint/STACK_DEPTH.md) | Control recursive stack-depth signals across JS execution contexts. |
| [FPS Control](fingerprint/FPS_CONTROL.md) | Tune frame-rate behavior to reduce rendering-timing fingerprints. |
| [Storage Quota Fingerprinting](fingerprint/STORAGE_QUOTA.md) | Control storage and memory quota surfaces used for device profiling. |
| [Incognito Fingerprinting](fingerprint/INCOGNITO.md) | Keep fingerprint surfaces consistent between regular and private browsing sessions. |
| [Console Suppression](fingerprint/CONSOLE_SUPPRESSION.md) | Suppress CDP-forwarded console artifacts that can affect runtime consistency checks. |
| [Active Window Emulation](fingerprint/ACTIVE_WINDOW.md) | Prevent focus-based tracking by keeping windows in an always-active state. |
| [WebGPU Fingerprint Protection](fingerprint/WEBGPU.md) | Control WebGPU adapter information and rendering behavior across platforms. |
| [Media Devices Privacy](fingerprint/MEDIA_DEVICES.md) | Control device enumeration to return consistent audio/video device lists. |
| [CPU Core Scaling Protection](fingerprint/CPU_CORE_SCALING.md) | Constrain Worker parallelism to match the profile's claimed core count. |

<a id="identity-session"></a>
## Identity and Session

| Guide | Description |
|-------|-------------|
| [Multi-Account Isolation](identity/MULTI_ACCOUNT_ISOLATION.md) | Run multi-account browser isolation with per-context fingerprints and reduced cross-account linkability. |
| [Browser Brand Alignment](identity/BROWSER_BRAND_ALIGNMENT.md) | Present as Chrome, Edge, Brave, Opera, or WebView with consistent UA-CH metadata. |
| [Custom User-Agent](identity/CUSTOM_USER_AGENT.md) | Configure User-Agent and Client Hints with internally consistent browser identity. |
| [Timezone, Locale, and Language](identity/TIMEZONE_LOCALE_LANGUAGE.md) | Configure timezone, locale, and language for consistent geographic identity APIs. |
| [Cookie Management](identity/COOKIE_MANAGEMENT.md) | Inject, persist, and restore cookies for pre-authenticated session state. |
| [Bookmark Seeding](identity/BOOKMARK_SEEDING.md) | Inject realistic bookmarks to strengthen cross-session browser state consistency. |
| [History Seeding](identity/HISTORY_SEEDING.md) | Inject browsing history to reduce fresh-profile and empty-state signals. |
| [Plaintext Storage Access](identity/STORAGE_ACCESS.md) | Read cookies, passwords, and LocalStorage directly from disk after a session. |

<a id="platform-emulation"></a>
## Platform Emulation

| Guide | Description |
|-------|-------------|
| [Cross-Platform Profiles](platform/CROSS_PLATFORM_PROFILES.md) | Run the same profile across Windows, macOS, and Linux with consistent output. |
| [Android Emulation](platform/ANDROID_EMULATION.md) | Emulate Android browser identity on desktop with mobile API behavior. |
| [Android WebView](platform/ANDROID_WEBVIEW.md) | Configure Android WebView identity for in-app browser simulation. |
| [WebKit-family Profile Consistency](platform/WEBKIT_PROFILE_CONSISTENCY.md) | Use premium WebKit-family profiles for runtime, network, and protocol consistency. |
| [Windows on Mac/Linux](platform/WINDOWS_ON_MAC_LINUX.md) | Use Windows-target profiles while running on macOS or Linux hosts. |
| [CJK Font Rendering](platform/CJK_FONT_RENDERING.md) | Keep Chinese/Japanese/Korean font rendering consistent across hosts. |
| [Widevine DRM Setup](platform/WIDEVINE_DRM_SETUP.md) | Set up Widevine/CDM compatibility for DRM playback workflows. |
| [Device Emulation](platform/DEVICE_EMULATION.md) | Configure device models and metrics with matching hardware signals. |

<a id="deployment-operations"></a>
## Deployment and Operations

| Guide | Description |
|-------|-------------|
| [Headless Server Setup](deployment/HEADLESS_SERVER_SETUP.md) | Set up headless Ubuntu servers for stable production BotBrowser automation. |
| [Docker Deployment](deployment/DOCKER_DEPLOYMENT.md) | Deploy BotBrowser in Docker for reproducible, isolated automation environments. |
| [Linux GPU Backend Selection](deployment/LINUX_GPU_BACKEND.md) | Choose the right Linux software rendering backend to keep WebGL1/WebGL2/WebGPU available with stable performance. |
| [Performance Optimization](deployment/PERFORMANCE_OPTIMIZATION.md) | Tune startup speed, memory usage, and throughput for high-scale workloads. Includes guidance on when to choose [Trimmed Build (ENT Tier3)](deployment/PERFORMANCE_OPTIMIZATION.md#when-to-consider-trimmed-build) for short-session automation (-62% wall time, -85% per-context creation on Linux x64). |
| [Screenshot Best Practices](deployment/SCREENSHOT_BEST_PRACTICES.md) | Capture stable screenshots across headless and headful environments. |
| [Mirror Distributed](deployment/MIRROR_DISTRIBUTED.md) | Run distributed sessions with synchronized actions and consistent fingerprint output. |

---

**Related documentation:** [Installation](../../INSTALLATION.md) | [CLI Flags Reference](../../CLI_FLAGS.md) | [Profile Configuration](../../profiles/PROFILE_CONFIGS.md) | [Validation](../../VALIDATION.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
