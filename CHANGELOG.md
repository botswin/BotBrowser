# CHANGELOG

> **Research scope:** Entries in this changelog describe features evaluated in authorized labs and defensive benchmarking programs. Follow the [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md). We work with security vendors to investigate any misuse, so report concerns to [support@botbrowser.io](mailto:support@botbrowser.io).


## [2026-06-09]
### Major
- **Chromium Core -> 149.0.7827.59**: Updated to Chrome 149 stable (149.0.7827.59). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### New
- **WebKit-Family Profile Consistency (ENT Tier4)**: Added premium WebKit-family profile support for desktop and mobile browser-family identity consistency on the BotBrowser browser core. This extends profile consistency beyond browser brand and platform metadata into engine-level runtime behavior, CSS behavior, media capability behavior, navigation headers, TLS behavior, HTTP/2 behavior, and BrowserContext isolation, giving privacy teams a controlled way to validate WebKit-family profile bundles across supported host platforms.

### Improvements
- **Per-Context Fingerprint Flag Coverage**: Expanded validated per-context support for `--bot-profile-dir`, `--bot-script`, `--bot-cookies`, graphics mode controls, lifecycle controls, and WebRTC ICE settings.


## [2026-06-06]
### Major
- **Chromium Core -> 148.0.7778.254**: Updated the Chrome 148 stable line to 148.0.7778.254. Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### Improvements
- **Cross-Platform Screen Policy**: Improved default screen handling for cross-platform profiles so headed sessions keep profile-backed display behavior more consistent across Linux, Windows, and macOS hosts.
- **Android Profile Consistency**: Improved maintained Android profile behavior for profile-backed font and capability surfaces, helping validation and production runs stay closer to the expected profile shape.


## [2026-06-04]
### Major
- **Chromium Core -> 149.0.7827.54**: Updated to Chrome 149 stable (149.0.7827.54). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.


## [2026-06-02]
### Improvements
- **Graphics Capability Consistency**: Improved profile-backed WebGL behavior across host environments, keeping graphics fingerprint protection more consistent during validation and production runs.
- **V8Log Forensics**: Improved runtime evidence readability and review workflow, making authorized privacy validation easier to compare, triage, and document.


## [2026-05-31]
### Major
- **Chromium Core -> 148.0.7778.217**: Updated to Chrome 148 stable (148.0.7778.217). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### New
- **V8Log Forensics (`--bot-v8-log`, `--bot-v8-log-dir`)**: Added gated browser-runtime forensics for authorized privacy validation, helping teams review runtime signal collection without changing normal browsing behavior.

### Improvements
- **Cross-Platform Profile Consistency**: Improved profile fidelity across desktop and mobile profiles so the same profile behaves more consistently across macOS, Windows, and Linux hosts.
- **Per-Context Isolation**: Strengthened per-context behavior for profile-specific capabilities, storage, permissions, browser identity, theme preference, and proxy settings.
- **Speech and Device Capability Consistency**: Improved profile-backed speech, device, and network capability behavior across main sessions and per-context sessions.
- **Rendering and Media Stability**: Improved font, canvas, WebGL, media capability, and browser-engine compatibility coverage for profile-backed sessions.
- **Mobile Profile Parity**: Improved Android profile behavior across target-platform policy, device capability, storage, focus, sensor, and locale-related surfaces.
- **Network and Proxy Reliability**: Improved proxy-authenticated navigation reliability across redirects and tunnel setup while keeping credentials scoped to the proxy layer.
- **Release Validation Coverage**: Expanded deterministic release gates and focused validation for profile replay, browser-context isolation, and engine-specific network behavior.


## [2026-05-25]
### Major
- **Chromium Core → 148.0.7778.180**: Updated to Chrome 148 stable (148.0.7778.180). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### New
- **Custom DNS Server for LocalDNS**: `--bot-local-dns` now accepts an explicit DNS server address (for example `--bot-local-dns=8.8.8.8` or `--bot-local-dns=127.0.0.1:5353`) so per-context name resolution can be pointed at a chosen DNS server.

### Improvements
- **WebRTC Proxy Exit Consistency**: WebRTC public candidates now consistently reflect the per-context proxy exit IP across HTTP and SOCKS proxies, keeping `icecandidate` events and SDP aligned with the proxy identity.
- **WebRTC TURN Connectivity**: TURN relay candidates are now serialized with their original relay address, improving compatibility with sites that rely on TURN-only WebRTC paths.
- **Per-Context History Parity**: `--bot-inject-random-history` behaves identically through the main launch path and per-context `BotBrowser.setBrowserContextFlags`, producing the same `history.length` regardless of how the context is created.
- **High-Concurrency Context Creation**: `Target.createBrowserContext` scales consistently under high-concurrency workloads where many contexts are created back to back.

### Fixes
- **`navigator.mediaDevices` Stability**: Resolved unexpected behavior on certain Windows profiles when sites enumerated `navigator.mediaDevices`.


## [2026-05-17]
### Improvements
- **Cross-Origin Frame Consistency**: Permission state in cross-origin frames now aligns with real Chrome behavior.
- **Canvas Replay Stability**: Canvas fingerprint replay is now stable across text rendering paths.
- **Trimmed Build Performance**: Trimmed Build on Linux x64 delivers further reductions in context creation time and CPU usage.


## [2026-05-15]
### Major
- **Chromium Core → 148.0.7778.168**: Updated to Chrome 148 stable (148.0.7778.168). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### Improvements
- **Per-Context Proxy Stability**: `setBrowserContextFlags` now preserves the context proxy route when a later call only supplies `--proxy-ip`. Existing proxies configured via `Target.createBrowserContext` stay active, and explicit `--proxy-server` overrides still replace the route for new targets.
- **Canvas Fingerprint Replay**: Full WebGPU canvas recording and kernel-side replay are now production-ready. Canvas operations across 2D, WebGL, and WebGPU are recorded, matched by operation hash at runtime, and returned from profile data rather than live GPU execution.


## [2026-05-09]
### Major
- **Chromium Core → 148.0.7778.120**: Updated to Chrome 148 stable (148.0.7778.120). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### Improvements
- **WebGPU Profile Consistency**: Corrected `device.features` enumeration, feature ordering, WGSL language feature ordering, and experimental feature isolation in `--bot-config-webgpu=profile` and `real` modes to match current Chrome behavior.


## [2026-05-07]
### New
- **GPU Emulation Priority Mode (`--bot-gpu-emulation=priority`)**: New opt-in `priority` mode for `--bot-gpu-emulation` that prioritizes GPU and WebGPU scheduling, keeping workloads responsive when running many concurrent browser contexts. Default behavior remains unchanged; opt in with `--bot-gpu-emulation=priority`.


## [2026-05-05]
### Major
- **Chromium Core → 148.0.7778.97**: Updated to Chrome 148 Early Stable Release (148.0.7778.97). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.


## [2026-05-02]
### Major
- **Chromium Core → 147.0.7727.139**: Updated to Chrome 147 stable (147.0.7727.139). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### Improvements
- **GeoIP Database Upgrade**: Geolocation database now uses multi-source fusion for improved coverage and accuracy across residential, mobile, and datacenter IP ranges.


## [2026-05-01]
### Major
- **Chromium Core → 147.0.7727.138**: Updated to Chrome 147 stable (147.0.7727.138). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### Improvements
- **Internal Stability Hardening**: Strengthened resilience for rare edge cases across custom header validation, WebGL canvas readback, and network context recovery paths.

- **Timezone Auto-Detection Resilience**: Improved `Intl` timezone fallback under unstable proxy networks, ensuring auto-detection more reliably reflects the proxy exit location.


## [2026-04-28]
### Major
- **Chromium Core → 147.0.7727.118**: Updated to Chrome 147 stable (147.0.7727.118). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### Improvements
- **GeoIP Database Refresh**: Updated geolocation database with refined country-timezone mappings for improved location accuracy.


## [2026-04-27]
### Major
- **Chromium Core → 147.0.7727.117**: Updated to Chrome 147 stable (147.0.7727.117). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### New
- **Device Posture Consistency**: `navigator.devicePosture` and the `device-posture` CSS media query now return profile-defined values for foldable and standard device profiles.

### Improvements
- **Non-Chrome Brand Background Traffic**: Edge, Opera, Brave, and other non-Chrome brand profiles no longer emit Chrome-specific background requests, keeping HTTP-layer behavior consistent with the chosen brand.


## [2026-04-16]
### Major
- **Chromium Core → 147.0.7727.102**: Updated to Chrome 147 stable (147.0.7727.102). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### Fixes
- **WebGL Availability on Minimal Linux Servers**: WebGL fingerprint protection now stays available on Linux server environments that lack desktop GPU driver packages.


## [2026-04-09]
### Major
- **Chromium Core → 147.0.7727.56**: Updated to Chrome 147 stable (147.0.7727.56). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### Improvements
- **WebGPU Fingerprint Protection**: Extended protection coverage across the full WebGPU API surface.


## [2026-04-05]
### Major
- **Chromium Core → 147.0.7727.24**: Updated to Chrome 147 early stable (147.0.7727.24) to stay ahead with the latest Chrome development. This maintains Web Platform parity, rendering consistency, and security patches with upstream.


## [2026-04-02]
### Major
- **Chromium Core → 146.0.7680.178**: Updated to Chrome 146 stable (146.0.7680.178). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### Improvements
- **Per-Context Privacy Consistency**: Non-default browser contexts now behave consistently with the main context across all privacy-related checks.

- **GeoIP Bootstrap with Local DNS**: Internal geolocation requests now work correctly when `--bot-local-dns` is enabled, ensuring accurate proxy-based location data.

### Fixes
- **Cookie Consent Navigation Stability**: Resolved a crash that could occur when accepting cookie consent banners triggered a page reload.


## [2026-03-26]
### Major
- **Chromium Core → 146.0.7680.165**: Updated to Chrome 146 stable (146.0.7680.165). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### New
- **Incognito `X-Client-Data` Consistency (`--bot-enable-variations-in-context`)** (ENT Tier2): Incognito browser contexts now include `X-Client-Data` headers on Google domains when enabled, matching the behavior of normal browsing sessions.

- **Custom History Depth (`--bot-inject-random-history={number}`)**: History injection now accepts a specific count (e.g., `--bot-inject-random-history=15`) for precise control over `history.length`, in addition to the existing random mode.

### Improvements
- **High-Concurrency Stability**: 100+ concurrent browser contexts now run without crashes or memory corruption.

- **Emoji Rendering on Cross-Platform Profiles**: Emoji now renders in color when running macOS profiles on Linux hosts, producing correct Canvas toDataURL output.


## [2026-03-23]
### Major
- **Chromium Core → 146.0.7680.154**: Updated to Chrome 146 stable (146.0.7680.154). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### New
- **AudioLab (`--bot-audio-record-file`)**: New diagnostic tool that records all WebAudio API calls in real time, outputting structured JSONL logs to help understand how websites collect audio fingerprints.

- **Screen Orientation Control (`--bot-config-orientation`)**: Control mobile profile screen orientation at launch via `--bot-config-orientation=landscape|portrait|profile`. All orientation-related APIs and CSS media queries stay consistent with the selected mode.

- **WebView UA Reduction for Android 16+**: WebView profiles on Android 16+ now automatically apply Google's UA reduction policy, matching real WebView behavior with frozen values in the UA string and full values in Client Hints.

### Improvements
- **GPU Rendering Backend Selection** (ENT Tier2): Automatically selects the optimal GPU rendering backend on Linux, with shader caching enabled by default. Configurable via `--bot-gpu-emulation`.

- **Per-Context Setup Performance**: Reduced per-context fingerprint initialization latency, improving throughput for high-concurrency workloads.

- **sec-ch-ua GREASE Consistency**: GREASE brand strings and ordering in `sec-ch-ua` headers now remain consistent across all request types within the same session.

- **CJK Page Rendering Stability**: Improved memory efficiency for CJK-heavy pages with cross-platform profiles on macOS, ensuring stable rendering on sites with dense Chinese, Japanese, or Korean content.

- **Shader Compilation Efficiency**: Reduced CPU usage during WebGL shader compilation on software-rendered environments.

- **Country Privacy Consistency**: Country identification now correctly uses proxy-based geolocation data, ensuring location privacy consistency with the target profile.

- **Android `getInstalledRelatedApps` Consistency**: `navigator.getInstalledRelatedApps()` now returns results consistent with real Android Chrome behavior on Android profiles.

### Fixes
- **Container WebGL Availability**: Fixed WebGL becoming unavailable in certain container environments.


## [2026-03-12]
### Major
- **Chromium Core → 146.0.7680.111**: Updated to Chrome 146 stable (146.0.7680.111). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### Improvements
- **GeoIP Auto-Language Accuracy**: `navigator.languages` and `Accept-Language` auto-detection now returns the complete, correct language list for each country, with proper regional variants and consistent `Intl` locale behavior.

- **Font Metrics Cross-Platform Accuracy**: Canvas text measurement values now match the target platform's native behavior across all host operating systems.

### Fixes
- **WebRTC Codec Capabilities Consistency**: `RTCRtpSender.getCapabilities()` and `RTCRtpReceiver.getCapabilities()` now return results consistent with the target profile.


## [2026-03-09]
### Major
- **Chromium Core → 146.0.7680.66**: Updated to Chrome 146 stable (146.0.7680.66). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### New
- **Resource and Navigation Timing Protection**: `performance.getEntries()`, `performance.getEntriesByType("navigation")`, and `performance.timing` now return authentic, per-session timing values consistent with natural browser behavior.

- **Network Information Privacy**: `navigator.connection` properties (`rtt`, `downlink`, `effectiveType`, `saveData`) and corresponding Client Hints headers now return profile-defined values. Enable via `--bot-network-info-override` or `configs.networkInfoOverride`.

- **Stack Depth Fingerprint Control** (ENT Tier2): JavaScript recursive call stack depth now matches the target profile across main thread, Worker, and WASM contexts. `--bot-stack-seed` accepts `profile` (match exact depth), `real` (native depth), or a positive integer seed (1–UINT32_MAX) for per-session variation.

- **CPU Core Scaling Protection**: Worker threads are automatically constrained to match `navigator.hardwareConcurrency`, ensuring consistent parallel computation behavior on Linux and Windows.

### Improvements
- **Canvas 2D Noise System**: Complete rewrite with per-operation noise direction, DPR-aware adjustments for consistent results across all display densities, and expanded `--bot-noise-seed` range (1–UINT32_MAX) for greater fingerprint diversity.

- **Performance Timing Calibration**: Refined `--bot-time-seed` delay ranges to better align with real-world hardware variance across all browser operations.

### Fixes
- **DNS Prefetch Privacy**: HTML `<link rel="dns-prefetch">` no longer triggers local DNS queries when a proxy is configured, preventing unintended DNS exposure.


## [2026-03-04]
### New
- **Performance Timing Protection (`--bot-time-seed`)** (ENT Tier2): Protects against performance fingerprinting and timing-based tracking. `--bot-time-seed=<integer>` (1–UINT32_MAX, `0` = disabled) produces authentic, deterministic timing diversity across 27 browser operations (Canvas, WebGL, Audio, Font, DOM, and more), giving each instance a unique and stable performance profile.

### Improvements
- **Startup Performance**: Faster browser startup and profile loading, especially on lower-spec machines.

### Fixes
- **Sub-Pixel Border Rendering Consistency**: Sub-pixel border measurements now return correct `offsetHeight` values matching the target profile's display density, including Retina and high-DPI configurations across all host environments.


## [2026-03-01]
### Major
- **Chromium Core → 146.0.7680.31**: Updated the engine to Chrome 146 early release (146.0.7680.31) to stay ahead with the latest Chrome development. This maintains Web Platform parity, rendering consistency, and security patches with upstream.


## [2026-02-26]
### Major
- **Chromium Core → 145.0.7632.118**: Updated to Chrome 145 stable (145.0.7632.118). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### Improvements
- **Local GeoIP Lookup**: Geolocation data is now resolved locally instead of relying on external API services. Eliminates third-party dependencies, reduces startup latency, and removes rate-limit risks.

### Fixes
- **DRM Cross-Platform Consistency**: Widevine DRM behavior now correctly matches the target platform in all scenarios, including initial license negotiation patterns.

- **URL Scheme Origin Consistency**: `new URL()` origin property now returns correct values for browser-specific URL schemes when using multi-brand profiles.

- **Android Tablet Client Hints**: `sec-ch-ua-mobile` and `navigator.userAgentData.mobile` now correctly return `?0` / `false` on Android tablet profiles.


## [2026-02-23]
### Major
- **Chromium Core → 145.0.7632.110**: Updated to Chrome 145 stable (145.0.7632.110). Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### New
- **CanvasLab WebGL/WebGL2 Recording**: CanvasLab now records WebGL and WebGL2 API calls in addition to Canvas 2D, enabling complete analysis of graphics-based fingerprint collection across all canvas contexts.

- **Profile Compression**: Optimized fingerprint profile format to reduce file size by 25-30% without affecting privacy protection. Reduces disk I/O and speeds up profile loading, especially beneficial for large-scale deployments.

### Improvements
- **Per-Context Proxy Routing Completeness**: `botbrowserFlags` now supports the full proxy parameter set (`--proxy-server`, `--proxy-ip`, `--proxy-bypass-list`, `--proxy-bypass-rgx`) across both `Target.createBrowserContext` and `BotBrowser.setBrowserContextFlags` CDP paths.

### Fixes
- **SpeechSynthesis Voice Consistency**: `speechSynthesis.getVoices()` now returns profile-defined voices on headless Linux hosts and Docker containers, matching the target platform's voice list regardless of host TTS availability.

- **Cross-Platform Renderer Stability**: Resolved a rare renderer crash when loading certain pages with cross-platform profile configurations on macOS.


## [2026-02-18]
### Major
- **Chromium Core → 145.0.7632.76**: Updated to Chrome 145 stable. This ensures Web Platform consistency, rendering accuracy, and security patches stay aligned with upstream Chrome.

### New
- **Per-Context Proxy Switching** (ENT Tier3): Dynamically [switch proxy servers per BrowserContext](ADVANCED_FEATURES.md#dynamic-proxy-switching) at runtime without restarting contexts via CDP `BotBrowser.setBrowserContextProxy()`. Supports SOCKS5, SOCKS5h, HTTP, HTTPS protocols with authentication. Automatically adapts timezone and language based on proxy location.

- **Port Protection** (PRO): Protect [local service ports](ADVANCED_FEATURES.md#port-protection) (VNC, RDP, development servers, etc.) from being scanned by remote pages. Covers 30 commonly-probed ports across IPv4 (`127.0.0.0/8`), IPv6 (`::1`), and `localhost`. Enable via `--bot-port-protection` or profile JSON (`configs.portProtection`).

### Improvements
- **CSS Media Feature Consistency**: CSS media queries now authentically reflect the profile's display characteristics, ensuring consistency between CSS-level and JavaScript-level reporting.


## [2026-02-11]
### Major
- **Chromium Core → 145.0.7632.46**: Updated the engine to Chrome 145 stable (145.0.7632.46). This keeps Web Platform behavior, rendering consistency, and security patches aligned with upstream Chrome.

### New
- **GPU Cross-Platform Consistency**: GPU-related API outputs now correctly match the target platform profile across all host operating systems, with full per-context support.

- **FPS Control (`--bot-fps`)**: Added `--bot-fps` flag to control frame rate behavior. Supports `profile` (use profile data), `real` (use native frame rate), or a specific number (e.g., `--bot-fps=60`).

- **Request Header Integrity**: Authentic request header generation for Google-associated domains, with validation seeds precisely aligned to each Chrome minor version.

### Improvements
- **Text Metrics Cross-Platform Precision**: Text measurement precision characteristics now match the target platform's native behavior, ensuring consistent results across all host operating systems.

### Fixes
- **Cross-Origin Iframe Click Handling**: Fixed an issue where click events could miss their target in cross-origin iframes when using `--bot-config-window=profile`.

- **Custom Headers CORS Compatibility**: `--bot-custom-headers` no longer triggers CORS preflight for cross-origin requests, matching expected browser behavior.

- **Windows Installer Widevine Packaging**: Fixed Widevine DRM component missing from Windows installation packages. Linux and macOS packages were unaffected.


## [2026-02-06]
### Major
- **Chromium Core → 144.0.7559.111**: Updated the engine to Chrome 144 stable (144.0.7559.111). This keeps Web Platform behavior, rendering consistency, and security patches aligned with upstream Chrome.

- **Android WebView Simulation**: Complete Android WebView fingerprint support with authentic behavior. Properly handles WebView-specific disabled features, permission differences, and Privacy Sandbox restrictions. Enables accurate WebView identity when using `--user-agent` with WebView user-agent strings.

### New
- **Regex Proxy Rules (PRO)**: Added `--proxy-bypass-rgx` flag to define URL patterns via regular expressions for proxy routing control. Supports RE2 syntax with `|` for multiple patterns and works in conjunction with `--proxy-bypass-list`.

- **Custom HTTP Headers (PRO)**: Added `--bot-custom-headers` flag to inject custom HTTP request headers into all outgoing requests. Configure via CLI (`--bot-custom-headers='{"X-Custom":"value"}'`), profile JSON (`configs.customHeaders`), or CDP (`BotBrowser.setCustomHeaders`).

### Improvements
- **Window/Screen Size CLI Formats**: Extended `--bot-config-window` and `--bot-config-screen` to support WxH format (e.g., `1920x1080`) and full JSON configuration, in addition to existing `real` and `profile` options.

### Fixes
- **Per-Context Fingerprint on Windows (ENT Tier3)**: Fixed per-context fingerprints not applying correctly on Windows.

- **Per-Context HTTP Headers (ENT Tier3)**: HTTP request headers (`User-Agent`, `sec-ch-ua-*`) now correctly reflect per-context fingerprint settings, matching the JavaScript API values.

- **Performance Memory API Consistency**: `performance.memory` values now show natural fluctuations consistent with real browser behavior.

- **Docker Font Consistency**: Font fingerprints now remain consistent regardless of host system font availability in containerized environments.

- **Windows Profile Extension Loading**: Fixed `--bot-script` extensions failing to load when using Windows fingerprint profiles on Linux/macOS hosts.


## [2026-01-31]
### Major
- **Chromium Core → 145.0.7632.26**: Updated the engine to Chrome 145 early release (145.0.7632.26) to stay ahead with the latest Chrome development. This maintains Web Platform parity, rendering consistency, and security patches with upstream.


## [2026-01-27]
### Major
- **Chromium Core → 144.0.7559.97**: Updated the engine to the latest Chrome 144 stable (144.0.7559.97). This keeps Web Platform behavior, rendering consistency, and security patches aligned with upstream Chrome.

### New
- **Widevine Persistent License Support**: Added full support for Widevine persistent license capabilities. DRM capability queries now correctly reflect the target platform's Widevine implementation, preventing tracking via EME (Encrypted Media Extensions) capability fingerprinting.

- **WebAuthn Client Capabilities**: Implemented support for `PublicKeyCredential.getClientCapabilities()` API with platform-specific capability profiles. Returns correct values for the emulated platform, preventing tracking via Touch ID, Bluetooth authenticator, and payment extension detection.

- **Widevine Challenge Refinement**: Enhanced Widevine license request generation to align with target platform behavior. DRM request patterns now match real platform output, preventing tracking via license negotiation fingerprints.

### Improvements
- **Per-Context Proxy Support (ENT Tier3)**: Per-Context Fingerprint now supports `--proxy-server` configuration via `botbrowserFlags` parameter in `BotBrowser.setBrowserContextFlags` or `Target.createBrowserContext`, consistent with main process behavior. Previously only `proxyServer` in `createBrowserContext` was supported.

- **Chrome Component Plugin Versioning**: Chrome component plugin (ID: `ghbmnnjooekpmoecnnnilnnbdlolhkhi`) now strictly matches the Chrome version number. Improves authenticity for systems that validate plugin metadata against browser version.

- **Storage Quota Stability**: Improved robustness of storage quota APIs, reducing edge cases where quota values could drift from profile expectations. Quota limits and usage calculations now remain stable across complex storage operations.

- **URL Protocol Detection Consistency**: Refined URL protocol parsing to correctly reflect OS-specific path handling conventions. Protocol validation now matches the emulated platform, closing a cross-platform detection vector.

- **Cross-Platform Math Function Consistency**: Unified floating-point and mathematical operation behavior across Windows, macOS, and Linux by embedding standardized implementations. Eliminates platform-specific numerical computation differences from UCRT (Windows), Accelerate.framework (macOS), and glibc libm (Linux) that could expose the underlying host environment.

### Fixes
- **Per-Context Fingerprint WebRTC SDP Handling (ENT Tier3)**: Fixed an issue where WebRTC negotiation could fail when using Per-Context Fingerprint in certain network configurations. SDP handling now works correctly with per-context fingerprint isolation.

- **Per-Context Fingerprint Linux Initialization (ENT Tier3)**: Resolved a rare edge case on Linux where per-context fingerprint initialization could fail due to zygote process restrictions in specific system configurations. Context fingerprints now apply reliably across all Linux distributions and containerized environments.


## [2026-01-19]
### Major
- **Per-Context Fingerprint (ENT Tier3)**: Assign independent fingerprint bundles per BrowserContext without spawning new browser processes. Configure via CDP (`BotBrowser.setBrowserContextFlags` or `Target.createBrowserContext` with `botbrowserFlags`). All `--bot-*` flags are supported per-context, including `--bot-profile` to load entirely different profiles. Workers (Dedicated, Shared, Service) automatically inherit the parent context fingerprint. See [PER_CONTEXT_FINGERPRINT.md](PER_CONTEXT_FINGERPRINT.md) for usage.

### New
- **Plaintext Storage Access (ENT Tier1)**: Browser storage (cookies, passwords, credit cards) is now accessible in plaintext for direct SQLite reading. This enables session extraction, cross-machine profile migration, and debugging workflows without decryption barriers. Passwords and credit cards auto-save without confirmation prompts. See [examples/storage-access/](examples/storage-access/) for usage.


## [2026-01-16]
### Major
- **Chromium Core → 144.0.7559.76**: Updated the engine to the latest Chrome 144 stable (144.0.7559.76). This keeps Web Platform behavior, rendering consistency, and security patches aligned with upstream Chrome.

- **Custom User-Agent and userAgentData (ENT Tier3)**: Full control over User-Agent string and `navigator.userAgentData` for building any browser identity, including Android WebView simulation. Configure platform, platformVersion, model, architecture, bitness, and mobile flag via `--user-agent` with placeholders (`{platform}`, `{model}`, etc.) that get replaced at runtime. BotBrowser auto-generates matching brands, fullVersionList with GREASE, and Sec-CH-UA-* headers. Values stay consistent across main thread, workers, and HTTP requests. See [CLI_FLAGS.md](CLI_FLAGS.md#custom-user-agent-with-webview-ent-tier3) for usage.

### Improvements
- **UDP over SOCKS5 stability (ENT Tier3)**: Improved UDP associate handling for QUIC and STUN traffic over SOCKS5 proxies. The implementation now handles complex network environments more gracefully, reducing connection timeouts, latency spikes, and stuttering during high-throughput or unstable network conditions.


## [2026-01-12]
### Major
- **Chromium Core → 144.0.7559.59**: Updated the engine to Chrome 144 early release (144.0.7559.59) to stay ahead with the latest Chrome development. This maintains Web Platform parity, rendering consistency, and security patches with upstream.


## [2026-01-08]
### Major
- **Chromium Core → 143.0.7499.194**: Updated the engine to 143.0.7499.194 to stay aligned with the latest Chrome release. This maintains Web Platform parity, rendering consistency, and security patches with upstream.


## [2026-01-05]
### Major
- **Mirror: Distributed Privacy Consistency (ENT Tier3)**: Verify privacy protection works reliably across platforms and networks. Run a controller instance and multiple clients to ensure identical privacy defenses against tracking across Windows, macOS, Linux, and remote environments. Controller captures input events (mouse, keyboard, scroll) and broadcasts them to clients in real time via TCP, enabling synchronous privacy validation across geographies and platforms.

### New
- **Profile randomization (--bot-profile-dir)**: Added `--bot-profile-dir` flag to specify a directory containing multiple `.enc` profile files. BotBrowser will randomly select one profile on each startup for fingerprint diversity without manual configuration.
- **Cookie file import (--bot-cookies)**: `--bot-cookies` now supports reading from a JSON file path in addition to inline JSON strings. Use `--bot-cookies="@/path/to/cookies.json"` to load cookies from disk and inject them into storage on startup.

### Improvements
- **Mouse screen position patch removal**: Removed the `mouse_event.diff` patch after upstream Chromium fix landed in [CL 6917162](https://chromium-review.googlesource.com/c/chromium/src/+/6917162) for [issue 40280325](https://issues.chromium.org/issues/40280325). BotBrowser now tracks the upstream implementation directly.
- **Android layout centering**: Improved Android emulation layout by centering page content within the browser UI, providing better visual consistency with real mobile device behavior.

### Fixes
- **PaymentRequest capability leak**: Fixed a privacy leak where `PaymentRequest` capability detection could expose information during capacity checks. Capability queries now remain properly isolated within the profile.
- **Bookmark file reading**: Resolved an issue where `--bot-bookmarks` would fail to read from JSON files in certain conditions. File I/O now handles edge cases reliably across platforms.
- **Geolocation precision**: Fixed `navigator.geolocation.getCurrentPosition()` in some scenarios where coordinates failed to match the proxy IP location precisely. Geolocation coordinates now derive accurately from proxy-based geo detection every time.


## [2025-12-24]
### Major
- **Chromium Core → 143.0.7499.170**: Updated the engine to 143.0.7499.170 to stay aligned with the latest Chrome release. This maintains Web Platform parity, rendering consistency, and security patches with upstream.

### Improvements
- **Sandbox flag now optional**: `--no-sandbox` is no longer required for BotBrowser startup. The browser now manages sandbox configuration internally, simplifying command-line invocation and reducing flag verbosity.

- **Boolean flag syntax simplification**: Toggle flags like `--bot-local-dns`, `--bot-mobile-force-touch`, and `--bot-always-active` no longer require `=true` suffix. Use `--bot-local-dns` instead of `--bot-local-dns=true` for cleaner and more intuitive CLI syntax.

### Fixes
- **Mobile force-touch reliability**: Fixed an edge case where the `--bot-mobile-force-touch` toggle could fail to apply in certain configurations. Touch event emission is now stable across device profiles and initialization paths.

- **System font alignment (system-ui, emoji)**: Corrected an issue where `system-ui` and emoji fonts could fail to align with their system counterparts in certain scenarios. Font fallback chains now consistently resolve to the correct system fonts, improving text rendering accuracy and cross-platform consistency.


## [2025-12-22]
### Improvements
- **FPS control precision (ENT Tier2)**: Fingerprint-based FPS simulation that precisely matches profile refresh rates even on low-spec hosts (e.g., VPS running 30 FPS can emit 120 FPS behavior). Recovers high-refresh-rate profiles without leaking underlying infrastructure framerate, and reduces timing jitter in timing-sensitive scenarios.

### Fixes
- **Iframe content dimensions**: Resolved an edge case where iframe content dimensions (height/width) could be reported as zero in certain layout conditions. Frame boundaries now render reliably to prevent layout-based fingerprinting.
- **navigator.plugins empty state**: Fixed a scenario where `navigator.plugins` could return an empty collection despite the profile defining valid plugins. Plugin enumeration is now stable across sessions.


## [2025-12-17]
### Major
- **Chromium Core → 143.0.7499.147**: Updated the engine to 143.0.7499.147 to stay aligned with the latest Chrome Stable. This keeps Web Platform behavior, DevTools schemas, and version keyed heuristics in lockstep with upstream.

### New
- **Local DNS solver (ENT Tier1)**: Added a local DNS resolver that can be enabled with `--bot-local-dns`. This improves privacy and resolution speed, avoids common DNS poisoning scenarios, and manages DNS resolution for proxy compatibility.
- **Custom public IP service**: Added `--bot-ip-service` so you can point BotBrowser at your own IP lookup endpoint when you want full control over how the public egress IP is detected. Multiple endpoints can be provided as a comma-separated list, and BotBrowser will race them and use the fastest successful response.

### Improvements
- **Proxy auth parsing**: Proxy credentials now support additional separators in the username field, including `,` and `|`. This makes structured usernames work reliably with common proxy provider formats, for example `socks5://user_abc,type_mobile,country_GB,session_1234:11111@portal.proxy.example.com:1080`.
- **Extension sync (ENT Tier2)**: Updated extension `ghbmnnjooekpmoecnnnilnnbdlolhkhi` to version 1.98.1 to match the latest Chrome Stable packaging and behavior.

### Fixes
- **Windows headless without GPU**: Fixed a startup failure affecting the Windows binary in headless mode when no GPU is available in the environment.
- **Android touch simulation cleanup**: Fixed a memory leak when using Android fingerprints and repeatedly creating and closing contexts, where touch emulation resources were not released correctly.
- **Multi monitor screen offsets**: Fixed incorrect `screenLeft` and `screenTop` values on certain multi monitor setups.


## [2025-12-08]
### New
- **WebGPU canvas noise augmentor**: Added deterministic noise controls to WebGPU canvas outputs (validated on [webbrowsertools.com/webgpu-fingerprint](https://webbrowsertools.com/webgpu-fingerprint/)) so GPU fingerprints stay aligned with the rest of the noise stack; replayed recordings now preserve the expected variance across browsers that probe WebGPU specifically.
- **Embedded font rendering per platform**: DOM text rendering now stays within the bundled cross-platform font sets (not just fallback chains), so Windows/macOS/Linux/Android simulations paint both DOM and fallback fonts from the same embedded assets, preventing host font leaks when a site walks `document.fonts` or measures inline text.

### Improvements
- **Canvas noise edge-cases**: Fixed a rare convergence case spotted on <https://browserscan.com/canvas> where certain seeds produced identical hashes, preventing host hashes from leaking through and ensuring per-profile canvases remain distinguishable across sessions.
- **HarfBuzz perturbation precision**: Noise applied inside HarfBuzz now respects prior precision and only adjusts `x_advance` / `y_advance` inside a minimal range, which keeps shaping believable on multilingual text (including CJK) while maintaining diversity for creepJS-style text metrics.

### Fixes
- **Pixelscan WebGL noise**: Refined WebGL canvas noise so <http://pixelscan.net> no longer flags the fraud heuristics triggered by earlier, coarse noise variance; multi-pass renders now inherit the same noise field as the base frame.
- **Client Hints DPR parity**: `sec-ch-dpr` now matches `window.devicePixelRatio`, eliminating mismatches between Client Hints metadata and JS-observable values, ensuring consistency across fingerprint probes.


## [2025-12-03]
### Major
- **Chromium Core → 143.0.7499.52**: Core aligned with Chrome 143 stable. You pick up the latest security work, platform refinements, and the 143 UA-CH major for sites that already gate on it.

### Fixes
- **x-browser client marker (ENT Tier1)**: Only **Chrome brand** emits the x-browser marker. Other brands no longer inherit it, which avoids unnecessary compatibility checks on non-Chrome brands.
- **Android connection type**: Android emulation now reports the correct network connection type so network heuristics match the emulated device.
- **WebGL context attributes**: `getContext('webgl/webgl2', attrs)` receives the intended `contextAttributes` again, which improves driver compatibility and feature negotiation.
- **OOPIF devicePixelRatio**: Out-of-process iframes now inherit the right `devicePixelRatio`, keeping layout, media queries, and canvas scaling protected across frame trees.
- **JS heap size limit**: `js_heap_size_limit` is read from the fingerprint in all environments so memory-related probes no longer see host defaults.
- **matchMedia: device-width / device-height**: Media queries now reflect the actual emulated device metrics. Breakpoints and responsive rules evaluate to the expected values.
- **Android brand exposure**: `chrome.app` is no longer present in Android emulation, aligning the surface with what real mobile Chrome exposes.
- **Screen metrics from profile**: `screen.width/height` now reliably come from the profile on every path, avoiding one-off host reads in edge cases.

### Improvements
- **SOCKS5H support**: Added full support for SOCKS5H protocol across platforms and failure modes. Hostname resolution remains within proxy tunnels, avoiding DNS exposure, with improved connection setup on flaky endpoints.
- **Noise-seed stability**: Noise seeds adapt more naturally to environment changes so fingerprints remain protected across runs while keeping per-profile diversity.

---

## [2025-11-29]
### New
- **Runtime timing scaler (ENT Tier1)**: `--bot-time-scale` compresses `performance.now()` deltas to emulate lower CPU load profiles for timing-sensitive research flows.
- **Deterministic noise seed (ENT Tier2)**: `--bot-noise-seed` deterministically augments privacy variance across Canvas 2D/WebGL/WebGPU imagery, text metrics/HarfBuzz layout, ClientRects, and offline audio hashes so each seed behaves like a reproducible fingerprint ID while remaining stable across sessions.
- **UDP over SOCKS5 (ENT Tier3)**: Automatic UDP associate for QUIC and STUN over SOCKS5 proxies; ICE presets often unnecessary when UDP is available.
- **socks5h proxy support**: Added support for `socks5h://` endpoints for tunnel-based hostname resolution.

### Fixes
- **Android text autosizing**: Adjusted Android profile emulation to avoid overly small fonts when Chrome 143's `ForceOffTextAutosizing` defaults to enabled.
- **Cached-font CJK rendering**: Corrected a font cache edge case that could suppress CJK glyphs in some flows; characters now render consistently.


---

## [2025-11-24]
### Major
- **Chromium Core → 143.0.7499.40 (Early Stable)**: The core moves to Chrome 143 early stable. You gain the latest security work, platform refinements, and DevTools/CDP updates from the 143 line. Version-based heuristics on target sites have less drift to key on, and UA-CH now reports the expected major for 143-gated features.

### Notes
- **API and feature parity**: Small shifts are expected around UA-CH negotiation, CSS/JS behavior tightened by spec clarifications, and CDP domain schemas that reflect 143. Nothing in BotBrowser’s flag surface changes for this bump.
- **Rollout guidance**: If you pin site-specific workarounds to a Chrome major, run quick validation on your critical flows with 143 before rolling to full traffic. A short canary helps catch sites that already gate on 143.


---

## [2025-11-17]
### Major
- **Chromium Core → 142.0.7444.163**: Engine updated to Chrome’s current stable. You get up-to-date security work and web-platform behavior, and version-based heuristics have less room to flag mismatches.

### New
- **Brand full-version override**: `--bot-config-brand-full-version` sets the brand’s full version independently of the UA full version. Helpful where a vendor’s cadence diverges from Chromium and sites cross-check UA-CH with brand metadata.

Example (Edge browser emulation):
```bash
--bot-config-browser-brand=edge \  # ENT Tier2 feature
--bot-config-ua-full-version=142.0.7444.135 \  # ENT Tier2 feature
--bot-config-brand-full-version=142.0.3595.65  # ENT Tier2 feature
```

- **Opera brand**: `--bot-config-browser-brand=opera` is supported. UA, Client Hints, and brand cues are shaped to look like real Opera.

### Improvements
- **Canvas2D noise**: Noise insertion is steadier frame-to-frame and less tied to individual draw operations. Probes see a calmer fingerprint surface while the image stays the same.
- **Android DevTools ergonomics**: Under Android emulation, the inspector no longer inherits page zoom or CSS font scaling. Tool panes and monospace fonts stay protected regardless of emulated viewport.

### Fixes
- **Touch emulation**: In touch mode, `Input.dispatchMouseEvent` could miss. The pointer/touch bridge is corrected; synthesized taps and clicks land reliably, including inside iframe trees.
- **Brave parity**: When brand=Brave, the UA full version and selected Client Hints are now hidden the same way real Brave does it.
- **Edge on Android UA**: User-Agent construction for Edge on Android now carries accurate brand/version tokens and platform identifiers.

---


## [2025-11-10]
### Major
- **Chromium 142.0.7444.135 parity**: Synced core to the latest Chrome 142 stable build for up-to-date security patches, modern Web APIs, and version parity that keeps Web Platform behavior protected with upstream.

### New
- **Locked user data directory protection**: On startup, if the provided `--user-data-dir` is already held by a running Chromium/BotBrowser process, BotBrowser now **shows a clear message and exits** instead of silently attaching to the old process. This prevents cross-session contamination (cookies, storage, profile state) and hard-to-trace side-effects.
- **OS-specific AudioContext defaults**: Normalized **AudioContext** defaults per OS (e.g., base characteristics like sample rate/latency and related init parameters) so audio capability fingerprints line up with the target platform. This removes subtle OS drift that some risk engines use for anomaly scoring.

### Improvements
- **Emoji & font fallback stability across platforms**: Refined the font fallback chain and glyph selection so **emoji and CJK glyphs** render reliably on Windows/macOS/Linux. This reduces cross-platform text-metrics variance and avoids mixed-glyph fallbacks that can change hashes or layout in edge cases.
- **Touch events in OOPIF**: Improved routing of emulated touch gestures for **Out-Of-Process IFrames (OOPIF)**, ensuring CDP commands like `Input.synthesizeTapGesture` work reliably inside OOPIF trees. Mobile flows embedded in cross-origin iframes now respond as expected.

### Fixes
- **Ubuntu Bluetooth emulation leakage**: Fixed a Linux/Ubuntu-specific issue where emulated Bluetooth properties could leak protection-breaking state. Bluetooth emulation exposure is now unified so websites can't infer environment details from mismatched availability/signaling.
- **Media types (expand) default**: Resolved an issue where `--bot-config-media-types=expand` (and the default behavior) could be ignored in some scenarios. With this fix, local decoders are correctly surfaced so users can **select resolutions** on major video sites.
- **WebRTC SDP negotiation**: Corrected edge cases where SDP **audio codec selection or direction attributes** failed to negotiate. Reliable media negotiation prevents call/setup loops and reduces tracking surface from abnormal SDP.

---


## [2025-11-02]
### Major
- **Chromium Core Upgrade → 142.0.7444.60**  
  Synced with the latest Chrome 142 stable to keep rendering, networking, storage, and media behavior aligned with upstream, reduce version-based heuristics, and inherit current security/perf updates.

### New
- **`--bot-disable-console-message` (ENT Tier1, default: true)**
  Disables console message output to avoid CDP log noise leaking into the page context or logs in production environments and blocks Console.enable/Runtime.enable stack getter detections (e.g., redefining `Error.stack` before `console.log(err)`). Tracks: issue **#75**.
- **`--bot-config-fonts=expand` mode**  
  When a profile lacks specific fonts, `expand` will load additional system fonts to increase match rate and authenticity.

### Improvements
- **Scrollbar width fidelity across OSs**
  More accurate per-OS scrollbar metrics so `window.innerWidth` and `document.documentElement.clientWidth` remain protected and layout shifts are avoided.
- **Cross-platform font loading & caching**  
  Extracted common font sets across platforms, optimized render/cache logic, and **bundled Noto Sans** for broader coverage; improves paint time and UX while keeping fingerprint parity.
- **Auto-language by IP**  
  Smarter locale selection based on proxy IP and region signals to choose a more appropriate UI language by default.
- **Android simulation without xdg-open popups**  
  Suppresses spurious `xdg-open` invocations during Android emulation to prevent erroneous system dialogs.
- **CPU architecture realism (ARM vs x86)**  
  Tightened architecture-specific surfaces (timings/caps) for higher authenticity when switching between ARM and x86 profiles.

### Fixes
- **Locale leakage via `Intl.DateTimeFormat().resolvedOptions().locale`**
  Prevented host locale from surfacing unintentionally through `Intl` so locale now reflects the emulated/profiled environment.
- **WebGL stability under performance jitter**  
  Resolved a case where jitter modeling could destabilize WebGL metrics; GPU paths now remain stable with jitter enabled.
- **CJK font visibility**  
  Fixed scenarios where **Korean / Japanese / Chinese** glyphs could fail to render due to coverage/fallback mismatches.
- **Crash with `--bot-config-color-scheme`**  
  Corrected a crash that could occur when forcing color scheme overrides.
- **Headless window sizing with iframes**  
  Fixed an iframe handling bug that could mis-apply window size in headless runs.

---


## [2025-10-23]
### Major
- **Chromium Core Upgrade → 142 (Early Stable)**
  BotBrowser is now aligned with **Chromium 142** (Chrome Early Stable). This keeps Web Platform/DevTools semantics and browser surfaces protected with upstream Chrome, reduces version-based heuristics some detectors rely on, and includes the latest security and performance updates.

---

## [2025-10-20]
### Major
- **Chromium Core Upgrade → 141.0.7390.108**
  Synced to Chrome 141.0.7390.108 to stay aligned with the current stable engine for security patches, performance updates, and API parity. This reduces version-based heuristics and keeps rendering/network/media behavior protected with upstream Chrome.

### Improvements
- **Geo-IP caching**
  The resolved proxy public IP and derived geolocation are now cached and reused across page opens, cutting repeated lookups and speeding up initial navigation.

### Fixes
- **Window Controls Overlay attribute order**
  Dynamic toggling of WindowControlsOverlay could reorder certain DOM attributes. The update stabilizes attribute order during toggles so the DOM signature remains protected.

- **General stability**  
  Hardened several lifecycle and teardown paths that under specific edge conditions could lead to a crash.

- **Android Date/Time Picker**  
  Opening the native date/time picker while using Android profiles could crash in some environments. The initialization path has been corrected so the picker works reliably.

- **`--proxy-ip` with auto language/locale**  
  When a proxy IP was provided via `--proxy-ip`, proxy-derived language and locale did not always align with the supplied region. Mapping now follows the provided proxy IP so UI language updates correctly.

- **Performance jitter alignment**
  Modeling jitter could desynchronize timing between the main thread and Workers/SharedWorkers. Jitter seed and variance are now coordinated so threads remain time-aligned while keeping natural variability.

- **Android emoji rendering**  
  Some Android profiles showed missing or incorrect emoji due to fallback mismatches. The emoji font availability and fallback chain have been corrected so shaping matches real Android.

- **Extensions + `--bot-always-active`**
  Fixed a crash that could occur when loading extensions while the **always-active** mode was enabled. Extensions now load reliably with the window kept active.

---

## [2025-10-12]
### Major
- **Chromium Core Upgrade → 141.0.7390.77**
  - **What**: Sync to the latest stable Chrome 141 release.
  - **Why**: Keeps Rendering/Network/Storage/Media in parity with upstream, reduces version-based heuristics, and includes current security fixes.
  - **Impact**: More deterministic behavior on sites that gate features by major version; lower drift on fingerprint surfaces impacted by minor engine changes.

- **Experimental: CanvasLab (Canvas2D recorder)**
  - **What**: An opt-in tool that **records Canvas2D draw operations** and exports **replayable code snippets** (trace → code).
  - **Use cases**: Reverse-inspect how a site draws charts/captchas/signature pads; reproduce rendering flows; compare visual diffs across hosts/profiles.
  - **Enable**:
    ```bash
    chrome.exe --bot-canvas-record-file=/abs/path/trace.canvas.jsonl --bot-profile="C:\\absolute\\path\\to\\profile.enc"
    ```
  - **Notes**: Recording is **local** and grows with draw calls; recommended for analysis/debug, not for high-volume production.
  - **Docs**: https://github.com/botswin/BotBrowser/tree/main/tools/canvaslab

### New
- **CLI: `--bot-webrtc-ice` (custom ICE servers)**
  - **What**: Choose STUN/TURN presets or provide a custom list to **avoid TURN-level IP disclosure**.
  - **Examples**:
    - Google preset:
```bash
      --bot-webrtc-ice=google  # ENT Tier1 feature
      ```
    - Custom list (comma-separated):
      ```bash
      --bot-webrtc-ice=custom:stun:stun.l.google.com:19302,turn:turn.example.com  # ENT Tier1 feature
```
  - **Why**: Some probes (e.g., https://ipbinding.online/) try to infer the real network by observing TURN traffic; controlling ICE servers reduces unintended leakage.

- **CLI: `--bot-always-active` (true/false, default: true)**
  - **What**: Keep windows **active** even when unfocused.
  - **Behavior**: Suppresses `blur/visibilitychange`; forces `document.hidden=false`; caret keeps blinking; applies **per-window** (multi-window friendly).
  - **Why**: Certain sites degrade features or throttle actions when the tab isn’t considered active.

### Improved
- **Runtime features control (finer per-OS toggling)**
  - More precise reading/toggling of runtime flags at startup, including OS-conditioned switches → **more stable cross-OS fingerprints** when moving profiles between Windows/macOS/Android.

- **Chrome component plugin preload (ID: `ghbmnnjooekpmoecnnnilnnbdlolhkhi`)**
  - Hardened preload path and timing so this stock component extension reliably appears; improves **Chrome-authentic** signals that some scanners expect.

- **WebGL/WebGL2 parameter reads**
  - Reworked parameter access to avoid **application-settable states** and cross-driver quirks; prevents false values and improves compatibility across platforms reported by https://fv.pro/

- **Media types default → `expand`**
  - `--bot-config-media-types` now defaults to **`expand`** (previously `profile`) so BotBrowser leverages **local decoders** by default → more accurate `canPlayType`/MSE decisions.
  - To keep old behavior, pass `--bot-config-media-types=profile`.

- **AudioContext noise tuning**
  - Adjusted distribution/phase to better defend against **audio tracking** with minimal audible/timing side-effects.

### Fixed
- **Font sizes stable under `--bot-config-noise-text-rects`**
  - Fixed an interaction where text-rect noise perturbed computed font-size metrics; sizes now remain stable.

- **Geolocation reliability**
  - Fixed geolocation not working in some configurations. Tracks: https://github.com/botswin/BotBrowser/issues/69

- **Android window sizing**
  - Corrected window metrics when emulating Android so viewport matches profile expectations.

- **Proxy robustness & validation**
  - Avoid crashes on failing proxies; emit clear error messages for malformed proxy arguments to prevent misconfig loops.


---

## [2025-10-02]
### Major
- **Chromium Core Upgrade → 141.0.7390.55**  
  Aligned with the latest Chrome 141 for modern API parity, performance, and security fixes.

- **Built-in Widevine Component (ENT Tier2)**  
  Widevine CDM is now bundled. No more per-launch downloads via ComponentUpdater → faster, deterministic startup and fewer external requests.

### New
- **DRM Hardware Simulation (ENT Tier2)**  
  Adds platform-specific DRM capability emulation to satisfy advanced probes on certain sites/platforms.

- **RLZ Re-enabled**  
  Restores RLZ behavior to improve compatibility with Google services that expect it.

### Improved
- **Android Speech Voices**  
  More realistic `speechSynthesis.getVoices()` on Android profiles (language coverage, ordering, default selection) to better match real devices.

- **Cross-platform Feature Parity (outside `runtime_enabled_features.json5`)**
  Adapts a set of runtime capabilities not listed in the upstream JSON to keep platform-agnostic fingerprints protected across OS targets.

- **X-Browser Identification (Google, ENT Tier1)**  
  Rewritten per Google-recommended approach to increase Chrome authenticity signals.

- **Stability with Browser Brand Overrides**  
  Hardened brand-switching paths to prevent occasional crashes under specific brand settings.

### Fixed
- **Screen Metrics from Profile**
  `config.screen.width` / `config.screen.height` now reliably apply on startup and new windows.

- **Auto Language from Timezone**  
  Fixed a case where timezone-driven locale auto-detection could fail to update the UI language.

---

## [2025-09-27]
### Major
- **Chromium Core Upgrade → 141**  
  Stay in lock-step with the latest Chrome for modern API parity, performance, and security fixes.

### Compatibility / New
- **MediaCapabilities `decodingInfo` (DRM probing) hardening (ENT Tier2)**  
  Aligns responses with real-Chrome behavior when sites probe **DRM capability** via `MediaCapabilities.decodingInfo` (e.g., H.264/H.265 + Widevine flow). Prevents capability mismatches and reduces DRM-support tracking checks.

### Fixed
- **Chrome component plugin preload**
  Resolved an intermittent race where the default Chrome component plugin (**ID: ghbmnnjooekpmoecnnnilnnbdlolhkhi**) might fail to load. Ensures reliable presence across sessions for scanners that expect it.

- **Android profile stability**  
  Fixed a crash that could occur when initializing **Android fingerprints** under certain setups (ordering/initialization edge cases). Improves reliability for mobile emulation.

---


## [2025-09-22]
### Improved
- **Audio tracking on x86 (no-noise hardware modeling)**
  Refined DSP/stack paths so x86 architectures can produce **native-like audio fingerprints without noise variance**, improving pass rates on vendors that score audio stability.

- **Chrome brand fidelity & de-Chromiumization**
  Audited and tuned brand/feature switches to better emulate **Chrome** and suppress Chromium-specific traits, improving fingerprint protection across tracking probes.

### Privacy
- **First-run telemetry suppression**
  Removed non-essential Google statistics/metrics requests on initial launch to reduce network exhaust and improve privacy (and a small bandwidth win).

### Authenticity
- **Bundled Chrome component plugin**
  Preloads the stock Chrome component extension (**ID: ghbmnnjooekpmoecnnnilnnbdlolhkhi**) to mirror real-Chrome environments. Improves compatibility with tracking tools like **fingerprint-scan.com** that expect this presence.

### Fixed
- **Locale ↔ Speech voice alignment**
  When language auto-detection adjusts the UI/locale, the **default speechSynthesis voice language** is now updated accordingly. Resolves mismatch flags observed by some probes (e.g., creepjs timezone/voice protection checks).


---



## [2025-09-15]
### Major
- **Chromium Core Upgrade → 140.0.7339.128**
  Keeps BotBrowser in lock-step with the latest stable Chrome for improved performance, security patches, and parity across modern web/APIs.

- **Proxy Subsystem Rewrite (faster • more stable • unified config)**
  Re-architected proxy stack to reduce connection latency and flakiness. **Deprecated** `--proxy-username` / `--proxy-password`; now use a single **`--proxy-server`** (or profile) endpoint that supports **auth & multiple protocols** (e.g., `http(s)`, `socks5`). Example: `socks5://user:pass@host:port`.

- **Per-Context Proxy (createBrowserContext)**
  You can assign a **different `proxy-server` per BrowserContext**, including authenticated endpoints. Enables multi-proxy, high-concurrency tasks in one process.
  Resolves: https://github.com/botswin/BotBrowser/issues/61

### Improved / Fixed
- **DNS Leak Hardening for SOCKS5**
  Fixed a case where domain resolution might occur locally under SOCKS5, preventing DNS leaks and strengthening privacy.

### New
- **CLI: `--proxy-ip` (profile key: `configs.proxy.ip`)**
  Provide the proxy's public IP via CLI or profile so BotBrowser **skips per-page IP lookups**, speeding up page open. Combine with `--bot-config-timezone` to emulate regions/timezones reliably.

- **CLI: `--bot-mobile-force-touch` (profile key: `configs.mobileForceTouch`)**
  Force **on/off** touch emission when simulating mobile devices. Useful for sites that require touch events regardless of the detected environment.
  Resolves: https://github.com/botswin/BotBrowser/issues/65

### Migration Notes
- Replace `--proxy-username/--proxy-password` with **embedded credentials in `--proxy-server`** (or in the profile).
  Example: `http://user:pass@ip:port`, `socks5://user:pass@ip:port`.


---

## [2025-09-06]
### Major
- **Chromium Core Upgrade → 140**
  Upgraded engine to Chromium **140** to maintain Chrome-level parity and fingerprint protection across APIs and tracking surfaces.

### Improved
- **Slimmer Profiles (≈1.3 MB → ≈100 KB)**
  Refactored profile packaging **without reducing fingerprint coverage**. Results: faster startup, lower I/O, and lighter memory, which is better for high-QPS orchestration and containerized runs.

### Fixed
- **WebGL2 `DRAW_BUFFER*`**
  Corrected an override that could set **`DRAW_BUFFER*`** state incorrectly during WebGL2 context creation, an issue certain sites probed for tracking. The implementation now adheres to spec/real-device values, restoring pass rates.

---


## [2025-09-02]
### Major Feature
- **Framework-less Script Execution: `--bot-script`**
  - Execute a JavaScript file **right after BotBrowser starts** in a privileged, non-extension context where **`chrome.debugger`** is available.
  - Build scripts **without Playwright/Puppeteer** while still driving CDP via `chrome.debugger`: reducing framework/CDP leak surface and giving **pre-navigation control**.
  - **Docs:** Chrome `chrome.debugger`: <https://developer.chrome.com/docs/extensions/reference/api/debugger/>
  - **Usage:** `chromium --bot-profile=/absolute/path/to/profile.enc --bot-script=/path/boot.js`
  - **Examples:** [Bot Script](examples/bot-script) (includes Cloudflare Turnstile challenge handling)

### Improved
- **Embedded System Fonts (Cross-OS)**
  - Bundled **more accurate system fonts** into resources so BotBrowser can emulate Windows/macOS/Linux text rendering with higher fidelity (wider glyph coverage, more reliable shaping/kerning).

- **Font Fallback Robustness (incl. Emoji)**
  - Tuned fallback chains so missing glyphs (emoji, CJK, rare symbols) resolve to the **same fonts a real device would use**.
  - Stabilizes **TextMetrics/Canvas** values and line-breaking; strengthens resistance to **emoji/font-based checks (e.g., hCaptcha)**.
  - **Workers parity:** Worker/SharedWorker/ServiceWorker now mirror the main thread's fallback behavior to avoid cross-thread hash leaks.

---

## [2025-08-29]
### Major Update
- **Chromium 139.0.7258.156**
  Synced BotBrowser to the latest stable Chrome build for feature parity, current security patches, and minimized fingerprint drift.

### Added
- **Extended Media Types**
  Added broader `mediaTypes` coverage (e.g., `video/mp4;codecs="avc1.42C028"`) so capability checks reflect real browsers.
  *Improves MSE/EME and HTML5 playback compatibility.*

- **CLI: `--bot-config-media-types`**
  New override flag with modes: `profile`, `real`, and `expand` (allow expanding via local decoders). Fixes **#60**.
  *Lets you choose conservative profile-only behavior, native system reporting, or an expanded set when OS codecs are available.*

- **Performance Fingerprint Controls**
  Fine-grained tuning of performance surfaces (e.g., memory allocation timing, IndexedDB access latency, `requestAnimationFrame` delay).
  *Matches target host characteristics to resist high-sensitivity behavioral checks.*

- **Precise FPS Simulation**
  Emulate target refresh rate & input latency (e.g., simulate **120 FPS macOS** on Ubuntu).
  *Aligns rendering cadence and user input timing with the profiled device.*

- **GPUAdapter `textureHashes`**
  Enhanced texture hash authenticity to maintain GPU identity protection.
  *Reduces GPU-surface vulnerabilities across contexts.*

- **New Fingerprint APIs**
  Implemented `mediaCapabilities`, `videoDecoderSupport`, `audioDecoderSupport` and other WebCodecs-related capability signals.
  *Prevents easy capability-based bot tracking.*

- **Faster Proxy IP Detection (Endpoint Race)**
  Parallel fetch to:
  `https://api64.ipify.org`, `https://ifconfig.me/ip`, `https://ident.me`, `https://icanhazip.com`, `https://checkip.amazonaws.com`, `https://ipecho.net/plain`.
  *Returns the first successful response to speed up network initialization.*

### Changed
- **Caches Off by Default**
  Disabled **GPU program cache** and **disk cache** by default.
  *Reduces persistent artifacts and cross-session correlation risk.*

### Improved
- **Ubuntu Cross-Worker Font Protection**
  Workers (`Worker`/`SharedWorker`/`ServiceWorker`) now mirror the main thread's font defaults so emoji and special glyphs match.
  *Fixes CreepJS workers test (protected canvas hashes across threads).*
  Test: https://abrahamjuliot.github.io/creepjs/tests/workers.html

### Fixed
- **Profile-Induced Crash (Access Violation)**
  Resolved rare crashes caused by specific profiles.
  *Improves stability when loading edge-case profiles.*

- **Windows `--bot-title` Dock Label**
  The custom title now also applies to the Windows taskbar/dock icon.
  *Parses and displays the label reliably across OSes.*

- **HTTP Proxy with VPN (TUN Mode)**
  Fixed cases where HTTP proxying failed when a VPN in TUN mode was active.
  *Restores connectivity in mixed-network setups.*

---

## [2025-08-22]
### Major Update
- **Chromium 139.0.7258.139**
  Synced BotBrowser to the latest stable Chrome build for feature parity, security patches, and minimized fingerprint drift.

### Major Improvement: CLI Configuration Overrides
- **Configure fingerprints via startup flags (no profile edits required)**
  New `--bot-config-*` flags override corresponding `configs` fields at runtime, enabling per-instance tuning in CI/CD and scripts.

#### Available Configuration Override Flags
```bash
--bot-config-browser-brand="chrome" # ENT Tier2 feature: Browser brand: chrome, chromium, edge, brave
--bot-config-color-scheme="light" # Color scheme: light, dark
--bot-disable-debugger=true # Disable JavaScript debugger: true, false
--bot-config-disable-device-scale-factor=true # Disable device scale factor: true, false
--bot-config-fonts="profile" # Font settings: profile (use profile fonts), real (system fonts)
--bot-inject-random-history # PRO feature: Add synthetic history: true, false
--bot-config-keyboard="profile" # Keyboard settings: profile (emulated), real (system keyboard)
--bot-config-languages="auto" # Languages: "lang1,lang2" or "auto" (IP-based)
--bot-config-locale="auto" # Browser locale: e.g. en-US, fr-FR, de-DE, or "auto" (derived from IP/language)
--bot-config-location="40.7128,-74.0060" # Location: "lat,lon" or "auto" (IP-based)
--bot-config-media-devices="profile" # Media devices: profile (synthetic), real (system)
--bot-config-noise-audio-context=true # AudioContext noise: true, false
--bot-config-noise-canvas=true # Canvas fingerprint noise: true, false
--bot-config-noise-client-rects=false # Client rects noise: true, false
--bot-config-noise-text-rects=true # Text rects noise: true, false
--bot-config-noise-webgl-image=true # WebGL image noise: true, false
--bot-config-screen="profile" # Screen: profile (use profile), real (system screen)
--bot-config-speech-voices="profile" # Speech voices: profile (synthetic), real (system)
--bot-config-timezone="auto" # Timezone: auto (IP-based), real (system), or TZ name
--bot-config-ua-full-version="139.0.6778.85" # ENT Tier2 feature: UA full version string matching Chromium major
--bot-config-webgl="profile" # WebGL: profile, real, disabled
--bot-config-webgpu="profile" # WebGPU: profile, real, disabled
--bot-config-webrtc="profile" # WebRTC: profile, real, disabled
--bot-config-window="profile" # Window: profile (use profile), real (system window)
```

- **Benefits**: Highest priority (overrides profiles) · No JSON editing · Dynamic per-run configuration · Clean session isolation.
  See **`CLI_FLAGS.md`** for details.

### Added
- **Android touch simulation**
Automatically enables `setEmitTouchEventsForMouse` when using an Android profile to better emulate touch input.

### Improved
- **Cross-platform fidelity**
Refined per-OS rendering differences (fonts, CSS, anti-aliasing, text sizing) so profiles behave reliably across Windows/macOS/Android.
- **Locale auto-adapt**
`locale: "auto"` now lets BotBrowser derive `locale` from proxy IP and language settings for realistic regional behavior.

---

## [2025-08-17]
### Added
- **`configs.disableDebugger` (default: `true`)**
  Prevents JavaScript `debugger` statements from pausing execution, keeping scripts running smoothly in all contexts.

- **New Start Page (New Tab)**
  Replaced new-tab page to display live environment data: Proxy IP, Timezone, Latitude/Longitude, User-Agent, WebGL, etc., giving instant visibility into the BotBrowser context.

- **`configs.keyboard`**
  Choose keyboard fingerprint source: `profile` (emulated from profile) or `real` (use system keyboard).

### Optimized
- **Binary Size Reduction (Windows/macOS)**
  Removed unnecessary font assets; reduced binary size from ~**600 MB** to **< 300 MB**. Faster downloads and smaller disk footprint.

### Improved
- **TextMetrics Noise Stabilization**
  Switched from per-string noise to a unified, stable noise model and preserved floating-point precision after noise variance, which improves protection against **hCaptcha** text-metrics checks.

- **Dynamic Blink Feature Loading**
  Parses and applies Blink features at runtime based on the emulated environment (**Windows / macOS / Android**), improving realism and compatibility.

- **`--bot-title` UI Enhancement**
  Beyond window/icon labels, the custom title now also appears as a label to the right of the toolbar **Refresh** button, improving multi-window recognition.


---

## [2025-08-12]
### Added
- **Built-in H.264/H.265 (AVC/HEVC) Decoders**
  Enabled AVC/H.264 and HEVC/H.265 decoding out of the box (no external OS codecs required). Improves HTML5 video, MSE/EME playback compatibility, reduces codec-missing fallbacks, and keeps media behavior aligned with stock Chrome.

### Fixed
- **RFC 6381–Compliant MIME Codec Parsing**
  Reworked `mimeTypes` codec-string parser to follow RFC 6381 (e.g., `avc1.42E01E`, `mp4a.40.2`, `hvc1.1.6.L93.B0`), including case/spacing tolerance and multi-codec lists. Prevents inaccurate results in `canPlayType` and MSE SourceBuffer checks that could trigger antifraud heuristics.

---

## [2025-08-07]
### Major Update
- **Upgraded to Chromium 139**
  Synced BotBrowser to **Chromium 139**, bringing the newest web platform features, performance improvements, and security patches.
  Aligns rendering, networking, and fingerprint surfaces with upstream Chrome 139 for improved protection and site compatibility.

---

## [2025-07-31]
### Added
- **Browser Brand Config**: New `configs.browserBrand` option for `chromium`, `chrome`, `brave`, or `edge`, enabling high-fidelity brand emulation.
- **Brave Simulation**: Full Brave browser emulation including `userAgent`, `userAgentData`, and `navigator.brave.isBrave` properties.
- **Edge Simulation**: Full Microsoft Edge emulation covering `userAgent`, `userAgentData`, and Edge-specific APIs.
- **Random History Augmentation**: `configs.injectRandomHistory` adds realistic history entries (URLs, timestamps) on new page loads without an opener.

### Improved
- **CPU Core Count Simulation**: Enhanced profile-based CPU core authenticity for stronger privacy resilience.
- **WebGPU Limits Simulation**: Emulates `maxStorageBuffersInFragmentStage`, `maxStorageTexturesInFragmentStage`, `maxStorageBuffersInVertexStage`, and `maxStorageTexturesInVertexStage` parameters.
- **Android Window Defaults**: Android device simulation now defaults to `"window": "profile"`, using profile-defined screen and window dimensions for pixel-perfect accuracy.
- **Debugger Statement Blocking**: Blocks `debugger` statements by default to prevent DevTools exposure to scripted probes.

### Fixed
- **Android DevTools Window Mode**: Ensures DevTools open in a separate window (not docked) during Android simulation to avoid UI rendering issues.
- **Auto Language/Locale Sync**: Fixed issue where `configs.languages = "auto"` sometimes failed to update the browser's locale correctly.
- **Iframe WebRTC IP Leak**: Fixed a WebRTC local IP leak when running inside iframes.


---

## [2025-07-21]
### Major Update
- **Upgraded to Chromium 138**: BotBrowser now runs on **Chromium 138**, matching the latest Chrome release for up-to-date features and security patches. (Ensures continued compatibility testing accuracy.)

### Fixed
- **System UI Font Simulation Crash**: Resolved an issue where simulating system UI fonts would crash the rendering process. (Improves stability for authentic font rendering.)

---


## [2025-07-18]
### Improved
- **macOS Auto-Quit on Last Tab**
  When the final tab closes on macOS, BotBrowser now quits gracefully.
  *Ensures native macOS behavior and resource cleanup.*

### Fixed
- **WebRTC SDP IPv6 Compatibility**
  Resolved an issue where IPv6 addresses in SDP prevented compatibility testing. Now successfully supports Kasada and similar service environments.
  *Fixes SDP parsing to correctly simulate IPv6 candidate addresses.*

- **Locale Crash Fix**
  (https://github.com/botswin/BotBrowser/issues/52) Fixed a crash that occurred when `configs.locale` was set to `en-CA`.
  *Ensures valid locale strings load without causing rendering errors.*

### Added
- **Credentials in Proxy URLs**
  (https://github.com/botswin/BotBrowser/issues/50) `--proxy-server` and `configs.proxy.server` now accept URLs with embedded credentials (e.g., `http://user:pass@ip:port`, `socks5://user:pass@ip:port`).
  *Simplifies secure proxy configuration with standard URI formats, using embedded credentials in the proxy URL.*

- **Auto Language Detection**
  `configs.languages` now supports `auto` to set browser languages based on proxy IP's country and timezone.
  *Automatically syncs Accept-Language and navigator.languages with location.*

- **Google Header Simulation (ENT Tier2)**
  Automatically includes [X-Browser-Validation](https://news.ycombinator.com/item?id=44527739) and related headers for google domains, emulating Chrome's behavior for Google compatibility testing.
  *Mimics Chrome's network validation for seamless protected analysis.*

- **Bookmarks Loader**
  Introduced `--bot-bookmarks` flag to load bookmarks from a specified JSON file at startup.
  *Allows pre-populating bookmarks for testing and script control.*

- **Custom Browser Title**
  Added `--bot-title` flag to set the browser window title and display it on the dock/taskbar icon.
  *Enhances session identification and UI branding.*

---

## [2025-07-09]
### Added
1. **SOCKS5 Proxy Authentication**
   Support for SOCKS5 proxies with username/password to secure authentication.

2. **Enhanced Proxy Authentication**
   Enhanced `--proxy-server` flag now supports embedded credentials in the URL format, eliminating the need for separate credential parameters.

3. **Bot Cookies Flag**
   Added `--bot-cookies` startup parameter to load cookies from a file or inline specification at launch.

4. **Real/Noise Config Toggles**
   (https://github.com/botswin/BotBrowser/issues/44) Completed support for toggling fingerprint vectors between `real` and `noise` modes via profile configs.

### Improved
5. **Proxy IP & WebRTC Refactor**
   Overhauled the logic for retrieving and maintaining proxy exit IP authenticity across all contexts, ensuring reliable public-IP protection in WebRTC and preventing leaks.

6. **autoTimezone Protection**
   Fixed cases where timezone detection (`configs.autoTimezone`) did not apply, ensuring accurate time and locale behavior.

7. **WebGL Version Protection**
   Now renders both `shadingLanguageVersion` and `version` in WebGL and WebGL2 contexts to ensure fingerprint protection checks.

8. **Imperva Strict Mode Compatibility**
   Adjusted noise variance to satisfy Imperva's strict tracking checks without false positives.

9. **configs.languages Fix**
   Ensured `configs.languages` array applies correctly to HTTP `Accept-Language` headers and `navigator.languages`.

10. **Relative Path Support for --bot-profile**
    Fixed issue preventing relative file paths from working with `--bot-profile`, improving CLI flexibility.

11. **User-Data-Dir Mount Stability**
    Resolved intermittent failures mounting the specified `--user-data-dir` directory for profile persistence.

12. **WebGL Extension Parameter Refactor**
    Reorganized extraction and configuration logic for WebGL/WebGL2 extension parameters to improve compatibility with FingerprintJS Pro environments.

13. **Cross-Platform Feature Toggles**
    Added granular OS-specific toggles for features like audio latency on Windows, macOS, and Android, avoiding "browser tampering" flags in FPJS Pro.

14. **System Default Fonts Optimization**
    Updated default font families per OS (Windows: Times New Roman; macOS: Times; Android: Times New Roman), improving resilience against advanced font-based validation in Default Fonts, Emoji, and MathML tests.

### Fixed
15. **Screenshot Clip Respect**
    Fixed a bug where `Page.captureScreenshot` clip parameters were ignored when using profile-defined window and screen sizes.

---

### Example `configs` Snippet

```json5
{
  "configs": {
    // Browser locale (auto = derived from proxy IP and language settings)
    "locale": "auto",

    // Accept-Language header values (auto = IP-based detection)
    "languages": "auto",

    // Color scheme: 'light' or 'dark'
    "colorScheme": "light",

    // Proxy settings: hostname:port, with optional basic auth
    "proxy": {
      "server": "1.2.3.4:8080",
      "username": "",
      "password": ""
    },

    // Disable GUI scaling based on device scale factor (ignore DevicePixelRatio for UI scaling)
    "disableDeviceScaleFactorOnGUI": false,

    // timezone: 'auto' = based on IP; 'real' = system timezone; any other string = custom
    "timezone": "auto",

    // location: 'auto' = based on IP; 'real' = system (GPS) location;
    // object = custom coordinates
    "location": "auto", // or "real" or { latitude: 8.8566, longitude: 2.3522 }

    // window: 'profile' = use profile’s dimensions;
    // 'real' = use system window size;
    // object = custom dimensions
    "window": "profile", // or "real" or { innerWidth: 1280, innerHeight: 720, outerWidth: 1280, outerHeight: 760, screenX: 100, screenY: 50, devicePixelRatio: 1 }

    // screen: 'profile' = use profile’s screen metrics;
    // 'real' = use system screen metrics;
    // object = custom metrics
    "screen": "profile", // or "real" or { width: 1280, height: 720, colorDepth: 24, pixelDepth: 24 }

    // WebRTC: 'profile' = profile’s settings; 'real' = native; 'disabled' = no WebRTC
    "webrtc": "profile",

    // Fonts: 'profile' = profile’s embedded list; 'real' = system-installed fonts
    "fonts": "profile",

    // WebGL: 'profile' = profile’s parameters; 'real' = system implementation; 'disabled' = off
    "webgl": "profile",

    // WebGPU: same semantics as WebGL
    "webgpu": "profile",

    // Media devices: 'profile' = synthetic camera/mic devices; 'real' = actual system devices
    "mediaDevices": "profile",

    // Speech voices: 'profile' = profile’s synthetic voices; 'real' = system voices
    "speechVoices": "profile",

    // noiseCanvas: true adds subtle noise to Canvas fingerprint; false disables it
    "noiseCanvas": true,

    // noiseWebglImage: true adds noise to WebGL image fingerprint; false disables it
    "noiseWebglImage": true,

    // noiseAudioContext: true adds noise to AudioContext fingerprint; false disables it
    "noiseAudioContext": true,

    // noiseClientRects: true adds noise to clientRects fingerprint; false disables it
    "noiseClientRects": false,

    // noiseTextRects: true adds noise to TextRects fingerprint; false disables it
    "noiseTextRects": true
  }
}


```

---


## [2025-06-15]
### Improved
- **On-Demand Proxy Geo & Timezone Fetch**
  - Shifted proxy geolocation, timezone, and public IP retrieval from browser startup to page load via a request interceptor.
  - Eliminates startup delays while proxy is initializing and enables each `BrowserContext` to use a different proxy for testing tasks without restart.


---

## [2025-06-10]
### Major Update
- **Upgraded to Chromium 137**
  - Synced BotBrowser with the latest **Chromium 137** core, ensuring compatibility with new browser features, performance improvements, and security patches.

### Major Improvement
- **GPU Simulation Without Hardware or XDISPLAY**
  - Linux builds can now simulate GPU capabilities purely in software, without any physical GPU or X server.
  - Fully functional in headless mode with no `XDISPLAY` required, delivering accurate GPU fingerprints and hardware-accelerated rendering in CLI environments.

---

## [2025-05-25]
### Major Update
- **WebRTC Fingerprinting Refactor & Media Simulation**
  - Fully rewrote internal WebRTC logic to eliminate local IP leaks.
  - Now simulates `candidate` IPs using public IPv4 and IPv6 from proxy.
  - Reads all simulation data from profile and mimics realistic `audio/video` media capabilities.
  - Result: BotBrowser achieves high compatibility scores on CreepJS testing platform.
    ▶️ [View Demo](https://botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs)

### Added
- **IP GEO Auto Geolocation**
  - Automatically simulates geolocation using proxy IP's geo data: no need for manual location overrides.

- **Incognito Extension Support**
  - Extensions are now enabled by default even in incognito mode and inside Playwright/Puppeteer contexts.

- **Build Metadata in chrome://version**
  - Added "BotBrowser Build Date" display in internal `chrome://version` for easy version tracking.

### Fixed
- **Kasada Fingerprint Leak Patch**
  - Fixed a critical fingerprint vulnerability identified by the latest Kasada release.

- **Permissions Simulation Overhaul**
  - Refactored permission handling for more accurate simulation (e.g., notifications, geolocation, mic).

- **WebRTC Protection on New Tabs**
  - WebRTC + IP GEO now re-sync when opening new tabs, ensuring protected fingerprints.

### Improved
- **Google API Request Blocking**
  - Blocked several Google internal endpoints to prevent metadata or activity leakage.

---

## [Unreleased]
- Chromium Extension fingerprint authenticity assurance. [#3](https://github.com/botswin/BotBrowser/issues/3)

---

## [2025-05-13]
### Added
- **Auto Timezone via IP Lookup**
  - Introduced built-in IP geolocation detection based on proxy exit IP, enabling smart timezone and location alignment.
  - Controlled via the `configs.autoTimezone` flag (enabled by default). See [PROFILE_CONFIGS.md](https://github.com/botswin/BotBrowser/blob/main/profiles/PROFILE_CONFIGS.md) for details.

- **Theme Control via `configs.colorScheme`**
  - Users can now specify browser color scheme (`dark` or `light`) through profile configuration. If omitted, the profile's native scheme is used.

### Improved
- **Bot-Profile Validation**
  - Improved error handling when launching with a missing or invalid `--bot-profile` path. The browser will now exit with a clear message.

- **Relative Path Support**
  - `--bot-profile` now supports relative paths in addition to absolute paths, simplifying multi-environment usage.

- **Default Font Simulation**
  - Embedded Windows, macOS, and Android system font libraries.
  - Allows simulating native font environments across platforms (e.g. load macOS fonts on Ubuntu), preventing rendering mismatches and fingerprint leaks.

- **matchMedia Hardened in WebPreferences**
  - Improved integration of matchMedia parameters directly into WebPreferences for greater reliability and fingerprint protection.
  - Fixes occasional race conditions where matchMedia simulation failed to load.

- **System UI Font Emulation**
  - Enhanced simulation of OS-specific UI fonts like `kSmallCaption`, `kMenu`, and `kStatusBar` across Windows, macOS, and Linux for stronger OS fingerprint fidelity.

### Fixed
- **Stack Overflow Crash in Renderer**
  Fixed an issue where certain websites caused rendering process crashes due to JavaScript stack overflows.


---

## [2025-05-01]
### Improved
- **Upgraded to Chromium 136**
  - Synced BotBrowser to the latest **Chromium 136**, ensuring full compatibility with the most recent Chrome features, rendering behavior, and security updates.
  - Improves privacy protection and reduces fingerprint mismatches by staying aligned with upstream Chromium.

---

## [2025-04-26]
### Improved
- **Audio Fingerprint Noise Simulation**
  - Further optimized audio noise generation to better simulate realistic audio fingerprints, successfully supporting compatibility testing with **FunCaptcha** environments.

### Fixed
- **mimeTypes Fingerprint Handling**
  - Fixed an issue in MIME type processing to improve compatibility with systems relying on precise mimeTypes validation.

### Added
- **Custom Remote Debugging Address Support**
  - Enhanced the `--remote-debugging-address` flag to allow binding to custom IP addresses like `0.0.0.0`, making BotBrowser better suited for building compatibility testing APIs.

- **Profile-Based Window and Screen Size Control**
  - Added support for fully configuring **window size**, **screen size**, **device pixel ratio**, and related properties directly in the **Profile**, without needing to rely on CDP.
  - This new config overrides `--window-size`, `--window-position`, and similar flags.

Example:
```json
{
    "configs": {
        "locale": "auto",
        "timezone": "America/New_York",
        "proxy": {
            "server": "proxy.example.com:8080",
            "username": "user",
            "password": "pass"
        },
        "languages": "auto",
        "skipWindowAndScreenSizes": false, // =true, ignore this setting and you can use CDP to control the window size
        "window": {
            "innerWidth": 1203,
            "innerHeight": 743,
            "outerWidth": 1203,
            "outerHeight": 830,
            "screenX": 43,
            "screenY": 79,
            "devicePixelRatio": 2
        },
        "screen": {
            "availWidth": 1512,
            "availHeight": 944,
            "availLeft": 0,
            "availTop": 38,
            "width": 1512,
            "height": 982,
            "colorDepth": 30,
            "pixelDepth": 30
        }
    }
}
```


---

## [2025-04-15]
### Added
- **Android Fingerprint Emulation**
  - Introduced high-fidelity **Android fingerprint simulation** that successfully supports compatibility testing with advanced security systems.
  - Includes a fully prepared **Android profile** for testing and demonstration.

### Fixed
- **CSS vs Client Hint Mismatch**
  - Resolved discrepancies between **sec-ch headers** (like `viewport`, `device-memory`) and JavaScript-detected CSS features (e.g., `inverted-colors`, `prefers-reduced-motion`, `prefers-reduced-transparency`) when using `matchMedia()`.

- **Web Share API Support for Android**
  - Fixed Web Share API availability to correctly reflect **Android device behavior** in supported environments.

- **navigator.plugins OS-Specific Simulation**
  - Refined plugin emulation logic to more precisely match different OS fingerprint behaviors via `navigator.plugins`.

---

## [2025-04-13]
### Added
- **Proxy, Timezone, Locale Support via Profile**
  - You can now configure `proxy` (with embedded credentials), `timezone`, and `locale` directly through the **profile**, eliminating CDP-based configuration overhead.

- **JavaScript Stack Limit Control**
  - Fine-tuned the JS stack depth to closely match official Chrome's behavior.
  - Helps improve compatibility testing with systems that rely on deep recursive call stack validation.

### Improved
- **Advanced matchMedia CSS Fingerprint Handling**
  - Upgraded CSS-related matchMedia control to better simulate complex media conditions under real environments.
  - Improves privacy resilience against modern anti-scraping and antifraud strategies.

### Fixed
- **GPU Limits Mismatch on Ubuntu**
  - Resolved a mismatch where GPUAdapter and GPUDevice limits didn't align with the profile values on Ubuntu.

- **WebGL Extension and Parameter Bugs**
  - Fixed a bug where `getSupportedExtensions()` could fail or return incorrect parameters in edge cases, improving WebGL fingerprint integrity.


---

## [2025-04-06]
### Improved
- **Upgraded to Chromium 135**
  - Synchronized BotBrowser with the latest **Chromium 135**, ensuring full compatibility with the most recent Chrome version.
  - This upgrade improves compatibility testing accuracy, fingerprint protection, and long-term maintenance as Chrome evolves.


---

## [2025-03-31]
### Improved
- **Faster Profile Loading**
  - Optimized the profile loading logic to significantly reduce load time and improve overall performance.

- **JavaScript Stack Limit Alignment**
  - Adjusted JavaScript stack limit to match official Chrome behavior exactly, improving parity and privacy protection.

- **Unified NaN Conversion Logic Across Architectures**
  - Ensured protected `NaN` bit-level structure across both **x86** and **ARM**, avoiding architecture-specific fingerprint vulnerabilities.
  - Prevents compatibility issues when testing x86-based emulation of ARM devices.

### Added
- **Notification API Normalization Across Platforms**
  - Standardized the behavior of the `Notification` API on different operating systems, closing a tracking vector used by **DataDome**.

- **Chromium 134: `CustomizableSelect` Runtime Feature Support**
  - Added OS-specific behavior simulation for the experimental `CustomizableSelect` runtime feature, collected from profiles.

- **Advanced matchMedia Fingerprint Control (hCaptcha / DataDome Compatibility)**
  - Introduced fine-grained, profile-based control of `matchMedia()` output.
  - Successfully supports compatibility testing with **hCaptcha** and **DataDome** systems that rely on subtle media query validation.

- **New GPU Fingerprint Fields**
  - Added support for new `GPUAdapter` and `GPUDevice` fingerprint fields to strengthen GPU hardware authenticity.

### Removed
- **Scrollbar Width Simulation**
  - Removed static 17px scrollbar width simulation, which proved unnecessary after extensive testing.
  - Thanks to community feedback for identifying its low tracking value.

### Fixed
- **mimeTypes Fingerprint Handling**
  - Fixed a long-standing issue where important `mimeTypes` were missed during processing, improving fingerprint protection.


---


## [2025-03-20]
### Improved
- **Upgraded to Chromium 134.0.6998.95**
  - Synced to the latest **Chromium 134.0.6998.95**, improving compatibility testing accuracy with modern web environments.
  - Enhances testing reliability by aligning with the newest Chrome updates.

### Fixed
- **Stability Improvements & Bug Fixes**
  - Resolved several critical bugs to prevent unexpected browser crashes.
  - Improved overall performance and reliability.

---

## [2025-03-10]
### Improved
- **Kasada Compatibility Enhancement**
  - Updated core logic to successfully support the latest **Kasada** compatibility testing, ensuring uninterrupted testing workflows.

---

## [2025-03-04]
### Improved
- **GPU Emulation Performance Optimization**
  - Improved GPU simulation to run smoother in headless mode, reducing stutters and ensuring more stable performance.

- **Large Window Simulation on Small Screens**
  - Enabled simulation of larger browser windows on smaller screens, allowing mouse actions to interact with elements beyond the physical screen boundaries.

- **Removed CrashReporter**
  - Disabled Chromium's **CrashReporter** to prevent potential data leakage and improve performance.

### Fixed
- **Enhanced device_scale_factor Handling**
  - Fixed issues with incorrect `device_scale_factor` handling, preventing antifraud systems from detecting Retina screen anomalies through ultra-thin (0.5px) line rendering.


---

## [2025-02-23]
### Added
- **GPU Simulation Toggle for Headless Devices**
  - Introduced a new **toggle** that determines whether to simulate **GPU** based on the presence of a graphical interface, preventing failures on devices without GPU support.

- **CSS Fingerprint Enhancement**
  - Added fingerprint support for `CSSValueID::kSelecteditem` and `CSSValueID::kSelecteditemtext` to improve compatibility testing accuracy.

- **Blocked Local Port Scanning via WebSocket & Image Requests**
  - Prevented websites from scanning **local ports** using **WebSocket** or **Image requests** to detect script execution services.
  - Blocked common ports associated with debugging and remote access:
    - `7070, 7071` (Remote debugging)
    - `3389` (RDP)
    - `5938, 5939` (TeamViewer)
    - `9222` (Chrome DevTools)
    - `6139, 6239, 6339` (Remote access)
    - `9839, 9939` (Remote debugging)
    - `5900, 5901` (VNC)

### Fixed
- **Prevent Local Video File Leaks**
  - Modified **FileVideoCaptureDevice** to ensure that opening local video files does not expose distinguishing traces to websites.

- **Improved Accept-Language Header Compatibility with Frameworks**
  - Addressed a compatibility issue where frameworks like **Playwright** set a default **Accept-Language** header, which could cause vulnerabilities with **Adscore** testing.
  - **CDP-based fingerprint modification is now restricted** to ensure stable compatibility testing when using **BotBrowser** with **CDP**.

### Improved
- **Enhanced 2D Canvas Fingerprint Compatibility**
  - Implemented a **new Skia-based anti-aliasing technique**, modifying the rendering algorithm at the lowest level to improve compatibility testing accuracy.

- **Advanced Audio Fingerprinting Enhancement**
  - Redesigned **audio processing** for **RealtimeAnalyser** and **ChannelData**, using an improved approach for **browserscan** compatibility testing.


---

## [2025-02-04]
### Improved
- **Enhanced Fingerprint Protection in AnalyserNode**
  - Added **noise variance** to **AnalyserNode**, significantly strengthening **Web Audio API** privacy protection against tracking.
  - This improvement further enhances **Web Audio API** authenticity for privacy-protected behavior.


---

## [2025-02-02]
### Major Upgrade
- **Canvas Noise Algorithm Overhaul:**
  Completely reworked the **Canvas noise algorithm** by integrating privacy variance into **Skia's anti-aliasing process**, significantly strengthening resistance against tracking probes.

### Fixed
- **WebGL Context readPixels Bug Fix:**
  Optimized **readPixels** in **WebGL Context** to prevent incorrect noise variance on solid-color images, ensuring accurate rendering.

### Added
- **Chrome 132 Test Profiles for Windows & macOS:**
  Released **test profiles** for **Chrome 132** on **Windows** and **macOS**, improving compatibility with the latest browser updates.


---

## [2025-01-24]
### Major Update
- **GPU Emulation on Headless Servers:** Introduced full emulation of GPU-related fingerprints on devices without dedicated GPUs. This allows **VPS servers (Linux, Windows)** without GPUs to accurately simulate GPU information, including `navigator.gpu`, `GPUAdapter`, `GPUAdapterInfo`, `GPUDevice`, `WebGLRenderingContext`, and `WebGL2RenderingContext`. This significantly reduces GPU rental costs while supporting GPU-sensitive testing systems, such as the latest **hCaptcha** environments, which validate `navigator.gpu`.

*These GPU emulation capabilities are for authorized fingerprint protection and privacy research only, not intended for use against production services.*

### Added
- **GPUAdapterInfo and WGSLLanguageFeatures Tracking:** Added support for tracking **GPUAdapterInfo** and **WGSLLanguageFeatures**, ensuring comprehensive GPU-related data coverage.


---

## [2025-01-22]
### Improved
- **MimeTypes Tracking Resistance:** Optimized **mimeTypes** handling by converting them to **ContentType**, followed by parsing `type` and `codecs` separately. This enhancement improves fingerprint protection and accuracy across systems.
- **Font Matching Accuracy:** Improved font matching logic to avoid unnecessary matches, significantly enhancing font accuracy and reducing false positives.

### Major Update
- **Windows Binary Release:** Reintroduced public release of **Windows binaries** with support for **Windows 11** and **Windows 10**. Future updates will include support for **Windows 7** and **Windows 8**.


---

## [2025-01-17]
### Improved
- **System Colors Configuration:** Added support for configuring system colors with **RGBA**, enabling more flexible and realistic color rendering.

### Fixed
- **Stability Bug Fix:** Resolved a crash issue by enabling **MDNS** (`enable_mdns`), ensuring improved stability on certain websites.

### Major Update
- **Version Release - 132.0.6834.84:** Updated to align with the latest **Chrome version**, ensuring compatibility with the most recent features and security updates.


---

## [2025-01-12]
### Fixed
- **Mimetypes, MediaRecorder, and MediaSource Fingerprints:** Fixed issues where tracking data was not correctly recognized under certain conditions. Optimized handling to ignore spaces after `;` in mimetypes, addressing antifraud techniques that exploit this discrepancy.
  [Issue Reference: #8](https://github.com/botswin/BotBrowser/issues/8)

### Improved
- **Removed RLZ Support:** RLZ support has been removed as it is unnecessary for our product and caused issues in some scenarios.
- **AdInterest Group Support:** Enhanced support for **AdInterest**, specifically `getInterestGroupAdAuctionData` in Chrome, which now works correctly in **BotBrowser**, improving resilience against tracking checks.
- **Fingerprint Caching:** Introduced caching for specific fingerprints to improve overall performance.

### Added
- **Bluetooth Support:** Added support for **Bluetooth emulation**, enabling realistic behavior even on Linux data center servers.
- **HarfBuzz Modification:** Made significant modifications to Chromium's **HarfBuzz** text shaping library, introducing factors that make fingerprint measurements more challenging to detect. This enhancement ensures diversity and undetectability for **canvas text fingerprints**, **DOM rects**, **SVG rects**, **emojis**, and **text metrics** through a single configuration.
  [Issue Reference: #6](https://github.com/botswin/BotBrowser/issues/6)
  [Reference Documentation](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/ui/text_rendering/render_text_overview.md#text-shaping)


---

## [2025-01-03]
### Improved
- **SwiftShader Parameter Adjustment:** Enhanced **SwiftShader** parameters on **Linux**, providing broader support and improved **EGL compatibility**.
- **Background Networking Control:** Replaced the `disable-background-networking` flag with a custom `botbrowser-disable-background-networking` flag to prevent **CDP** from interfering with **CDM downloads**.
- **PDF Embedding Behavior:** Disabled **PdfOopif** to ensure PDF embedding behaves similarly to standard browsers, improving fingerprint protection.

### Fixed
- **Document Client Rects Noise:** Resolved an issue where unnecessary noise was added to **Document client rects**, reducing false positives in certain tracking pipelines.

### Added
- **TextMetrics Algorithm Enhancement:** Introduced a new **TextMetrics** algorithm that hashes text and the provided **factor** instead of relying on simple cumulative factors. This improvement enhances fingerprint protection and stability.


---

## [2024-12-29]
### Fixed
- **Pixelscan PDF Viewer Compatibility Fix:** Successfully resolved PDF viewer compatibility issues during **Pixelscan** testing.  [#11](https://github.com/botswin/BotBrowser/issues/11)

### Changed
- **WebPreferences Update:** Updated **WebPreferences** based on the `ostype` specified in the profile, replacing the previous `BUILDFLAG()` logic for improved flexibility and accuracy.

### Added
- **SelectionDirection Simulation:** Implemented **SelectionDirection** simulation to avoid leaking state to tracking systems.
 [#9](https://github.com/botswin/BotBrowser/issues/9)
- **GPU Optimization:** Updated compilation parameters for better **GPU** performance and enhanced compatibility.
- **BarcodeDetector Simulation:** Simulated **BarcodeDetector** behavior to mimic macOS characteristics, even when running on **Windows** or **Ubuntu**, as long as the profile specifies `macOS` as the `ostype`.  [#10](https://github.com/botswin/BotBrowser/issues/10)
- **Runtime Feature Simulation:** Added simulation support for the following **Runtime Features**, allowing their activation via profile configuration:
   - `CookieDeprecationFacilitatedTesting`
   - `AdInterestGroupAPI`
   - `FetchLaterAPI`


---

## [2024-12-26]
### Added
- **Enhanced GPU Fingerprinting:** Further improved support for **GPUSupportedLimits**, ensuring clear differentiation between **GPUDevice** and **GPUAdapter** data.

### Fixed
- **CDM Component Download:** Ensured CDM components are downloaded **independently of proxy settings**, guaranteeing successful downloads regardless of network configuration.
- **CDM Key System Handling:** Ensured **CDM Key system requests** complete loading before returning results to JavaScript, effectively preventing leakage exposure.


---

## [2024-12-25]
### Added
- **GPU Fingerprinting Simulation:** Implemented support for simulating **GPUAdapter**, **GPUSupportedFeatures**, and **GPULimits** fingerprints.
- **WebGL Extension Support:** Added fingerprint support for the **MaxDrawBuffers** WebGL extension.

### Changed
- **args.gn Adjustments:** Modified `args.gn` to allow access to `navigator.getInterestGroupAdAuctionData` and `navigator.cookieDeprecationLabel`, aligning behavior with standard browser environments.
  [Commit Reference](https://github.com/botswin/BotBrowser/commit/e17e1746439d6ddc3d07e621d90aaf78ea847a2d)

### Fixed
- **WebGL2 Renderer and Vendor Bug:** Fixed an issue where `renderer` and `vendor` could not be retrieved under **WebGL2** environments.

### Improved
- **WebGL Parameters Simulation:** Inspired by **FakeVision**, refined WebGL parameters simulation to enhance fingerprint fidelity through more cautious handling.
  [FakeVision Decompiled Source Code](https://github.com/botswin/FakeVision-Privacy-Research)


---

## [2024-12-24]
### Fixed
- Resolved **CDM issue**, enhancing browser environment security.

### Added
- Successfully resolved **[Fake Vision](https://fv.pro)** compatibility issues, enhancing fingerprint protection validation capabilities. [Test Code](tests/tests/antibots/fvpro.spec.ts), [▶️ Test Result (fv.pro)](https://botswin.github.io/BotBrowser/video_player/index.html?video=https://raw.githubusercontent.com/botswin/BotBrowser/main/tests/test-results/fvpro-test-fv-pro-BotBrowser-antibots/video.webm)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
