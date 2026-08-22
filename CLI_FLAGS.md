# BotBrowser CLI Flags Reference

Use this reference to find flag syntax, availability, configuration timing, and the primary setup guide. For terms of use, see the [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md).

> Smart auto-configuration: BotBrowser derives timezone, locale, and languages from your IP/proxy. Override only when you need a specific setup.

> License tiers: Some flags show tier hints in parentheses (PRO, ENT Tier1/Tier2/Tier3/Tier4); those options are subscription-gated.

## Table of Contents

- [How to Use This Reference](#how-to-use-this-reference)
- [Flag Directory](#flag-directory)
- [Core BotBrowser Flags](#core-botbrowser-flags)
- [Enhanced Proxy Configuration](#enhanced-proxy-configuration)
- [BotBrowser Customization](#botbrowser-customization)
- [Profile Configuration Override Flags](#profile-configuration-override-flags)
- [Mirror: Distributed Privacy Consistency](#mirror-distributed-privacy-consistency)
- [Usage Examples](#usage-examples)

---

<a id="how-to-use-this-reference"></a>
## How to Use This Reference

Every flag has one primary guide. The detailed reference below provides syntax, accepted values, defaults where applicable, examples, and compatibility notes.

**Configuration timing and scope:**

| Label | Type | Meaning |
|-------|------|---------|
| `Startup` | Timing | Pass when launching the browser process. |
| `Context` | Timing | Supply through Per-Context Fingerprint before the first page or worker starts. This interface requires ENT Tier3. |
| `Live` | Timing | The primary guide documents a runtime update path and its required tier. |
| `Browser-wide` | Scope | Applies to the browser process rather than an individual BrowserContext. |

`Profile-dependent` means the active profile package must include that capability.

Identity-bearing settings must be applied before the first page or worker starts. See [Context Identity Lifecycle](PER_CONTEXT_FINGERPRINT.md#context-identity-lifecycle).

Configuration priority remains CLI flags, then profile `configs`, then profile defaults.

<a id="flag-directory"></a>
## Flag Directory

Jump to [Profiles](#flag-group-profiles), [Network](#flag-group-network), [Session](#flag-group-session), [Identity](#flag-group-identity), [Display](#flag-group-display), [Rendering](#flag-group-rendering), or [Mirror](#flag-group-mirror).

Each entry shows availability and the primary guide. The guide documents startup, BrowserContext, and runtime paths where supported.

<a id="flag-group-profiles"></a>
### Profiles and Startup

- [`--bot-profile`](#flag-bot-profile) (Core): [Profile Management](docs/guides/getting-started/PROFILE_MANAGEMENT.md)
- [`--bot-profile-dir`](#flag-bot-profile-dir) (Core): [Profile Management](docs/guides/getting-started/PROFILE_MANAGEMENT.md)
- [`--bot-title`](#flag-bot-title) (Core): [CLI Recipes](docs/guides/getting-started/CLI_RECIPES.md)

<a id="flag-group-network"></a>
### Proxy, PAC, DNS and WebRTC

- [`--proxy-server`](#flag-proxy-server) (Core; Context/Live ENT Tier3): [Proxy Configuration](docs/guides/network/PROXY_CONFIGURATION.md)
- [`--disable-quic`](#flag-disable-quic) (Standard Chromium): [UDP over SOCKS5](docs/guides/network/UDP_OVER_SOCKS5.md)
- [`--bot-udp-proxy`](#flag-bot-udp-proxy) (ENT Tier3): [UDP over SOCKS5](docs/guides/network/UDP_OVER_SOCKS5.md)
- [`--proxy-pac-url`](#flag-proxy-pac-url) (Core PAC; callback ENT Tier3): [PAC Request Policy](docs/guides/network/PAC_REQUEST_POLICY.md)
- [`--proxy-ip`](#flag-proxy-ip) (ENT Tier1): [Proxy and Geolocation](docs/guides/network/PROXY_GEOLOCATION_ALIGNMENT.md)
- [`--proxy-bypass-rgx`](#flag-proxy-bypass-rgx) (PRO): [Proxy Selective Routing](docs/guides/network/PROXY_SELECTIVE_ROUTING.md)
- [`--bot-port-protection`](#flag-bot-port-protection) (PRO): [Port Protection](docs/guides/network/PORT_PROTECTION.md)
- [`--bot-local-dns`](#flag-bot-local-dns) (ENT Tier1): [DNS Leak Prevention](docs/guides/network/DNS_LEAK_PREVENTION.md)
- [`--bot-ip-service`](#flag-bot-ip-service) (Core): [Proxy and Geolocation](docs/guides/network/PROXY_GEOLOCATION_ALIGNMENT.md)
- [`--bot-config-webrtc`](#flag-bot-config-webrtc) (Core): [WebRTC Leak Prevention](docs/guides/network/WEBRTC_LEAK_PREVENTION.md)
- [`--bot-webrtc-ice`](#flag-bot-webrtc-ice) (ENT Tier1): [WebRTC Leak Prevention](docs/guides/network/WEBRTC_LEAK_PREVENTION.md)

<a id="flag-group-session"></a>
### Session, Automation and Diagnostics

- [`--bot-cookies`](#flag-bot-cookies) (PRO): [Cookie Management](docs/guides/identity/COOKIE_MANAGEMENT.md)
- [`--bot-bookmarks`](#flag-bot-bookmarks) (Core): [Bookmark Seeding](docs/guides/identity/BOOKMARK_SEEDING.md)
- [`--bot-canvas-record-file`](#flag-bot-canvas-record-file) (Core): [CanvasLab](docs/guides/getting-started/CANVASLAB.md)
- [`--bot-audio-record-file`](#flag-bot-audio-record-file) (Core): [AudioLab](docs/guides/getting-started/AUDIOLAB.md)
- [`--bot-v8-log`](#flag-bot-v8-log) (Profile-dependent): [V8Log](docs/guides/getting-started/V8LOG.md)
- [`--bot-v8-log-dir`](#flag-bot-v8-log-dir) (Profile-dependent): [V8Log](docs/guides/getting-started/V8LOG.md)
- [`--bot-v8-log-exclude-api`](#flag-bot-v8-log-exclude-api) (Profile-dependent): [V8Log](docs/guides/getting-started/V8LOG.md#api-filters)
- [`--bot-cdp-coalesce`](#flag-bot-cdp-coalesce) (Core): [Automation Consistency](docs/guides/getting-started/AUTOMATION_CONSISTENCY.md#cdp-mouse-move-coalescing)
- [`--bot-script`](#flag-bot-script) (Core): [Bot Script](docs/guides/getting-started/BOT_SCRIPT.md)
- [`--bot-custom-headers`](#flag-bot-custom-headers) (PRO): [Custom HTTP Headers](docs/guides/network/CUSTOM_HTTP_HEADERS.md)
- [`--bot-disable-debugger`](#flag-bot-disable-debugger) (Core): [Automation Consistency](docs/guides/getting-started/AUTOMATION_CONSISTENCY.md)
- [`--bot-disable-console-message`](#flag-bot-disable-console-message) (ENT Tier1): [Console Suppression](docs/guides/fingerprint/CONSOLE_SUPPRESSION.md)
- [`--bot-inject-random-history`](#flag-bot-inject-random-history) (PRO): [History Seeding](docs/guides/identity/HISTORY_SEEDING.md)
- [`--bot-enable-variations-in-context`](#flag-bot-enable-variations-in-context) (ENT Tier2): [Incognito Fingerprinting](docs/guides/fingerprint/INCOGNITO.md)
- [`--bot-always-active`](#flag-bot-always-active) (PRO): [Active Window](docs/guides/fingerprint/ACTIVE_WINDOW.md)

<a id="flag-group-identity"></a>
### Identity, Locale and Platform

- [`--bot-config-browser-brand`](#flag-bot-config-browser-brand) (ENT Tier2 / WebView ENT Tier3): [Browser Brand Alignment](docs/guides/identity/BROWSER_BRAND_ALIGNMENT.md)
- [`--bot-config-brand-full-version`](#flag-bot-config-brand-full-version) (ENT Tier2): [Browser Brand Alignment](docs/guides/identity/BROWSER_BRAND_ALIGNMENT.md)
- [`--bot-config-ua-full-version`](#flag-bot-config-ua-full-version) (ENT Tier2): [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md)
- [`--bot-config-languages`](#flag-bot-config-languages) (ENT Tier1): [Timezone, Locale and Language](docs/guides/identity/TIMEZONE_LOCALE_LANGUAGE.md)
- [`--bot-config-locale`](#flag-bot-config-locale) (ENT Tier1): [Timezone, Locale and Language](docs/guides/identity/TIMEZONE_LOCALE_LANGUAGE.md)
- [`--bot-config-timezone`](#flag-bot-config-timezone) (ENT Tier1): [Timezone, Locale and Language](docs/guides/identity/TIMEZONE_LOCALE_LANGUAGE.md)
- [`--bot-config-location`](#flag-bot-config-location) (ENT Tier1): [Timezone, Locale and Language](docs/guides/identity/TIMEZONE_LOCALE_LANGUAGE.md)
- [`--bot-config-platform`](#flag-bot-config-platform) (ENT Tier3): [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md)
- [`--bot-config-platform-version`](#flag-bot-config-platform-version) (ENT Tier3): [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md)
- [`--bot-config-model`](#flag-bot-config-model) (ENT Tier3): [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md)
- [`--bot-config-architecture`](#flag-bot-config-architecture) (ENT Tier3): [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md)
- [`--bot-config-bitness`](#flag-bot-config-bitness) (ENT Tier3): [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md)
- [`--bot-config-mobile`](#flag-bot-config-mobile) (ENT Tier3): [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md)

<a id="flag-group-display"></a>
### Display, Input and Appearance

- [`--bot-config-window`](#flag-bot-config-window) (Core): [Screen and Window](docs/guides/fingerprint/SCREEN_WINDOW.md)
- [`--bot-config-screen`](#flag-bot-config-screen) (Core): [Screen and Window](docs/guides/fingerprint/SCREEN_WINDOW.md)
- [`--bot-config-keyboard`](#flag-bot-config-keyboard) (Core): [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md)
- [`--bot-config-fonts`](#flag-bot-config-fonts) (Core): [Font Fingerprinting](docs/guides/fingerprint/FONT.md)
- [`--bot-mobile-keyboard`](#flag-bot-mobile-keyboard) (Profile-dependent): [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md#mobile-keyboard-visual-viewport)
- [`--bot-config-orientation`](#flag-bot-config-orientation) (Core): [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md)
- [`--bot-config-color-scheme`](#flag-bot-config-color-scheme) (Core): [CSS Signal Consistency](docs/guides/fingerprint/CSS_SIGNAL_CONSISTENCY.md)
- [`--bot-config-disable-device-scale-factor`](#flag-bot-config-disable-device-scale-factor) (Core): [Screen and Window](docs/guides/fingerprint/SCREEN_WINDOW.md)
- [`--bot-mobile-force-touch`](#flag-bot-mobile-force-touch) (Core): [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md)

<a id="flag-group-rendering"></a>
### Rendering, Media and Protection

- [`--bot-config-webgl`](#flag-bot-config-webgl) (Core): [WebGL Fingerprinting](docs/guides/fingerprint/WEBGL.md)
- [`--bot-config-webgpu`](#flag-bot-config-webgpu) (Core): [WebGPU Fingerprint Protection](docs/guides/fingerprint/WEBGPU.md)
- [`--bot-config-noise-webgl-image`](#flag-bot-config-noise-webgl-image) (Core): [WebGL Fingerprinting](docs/guides/fingerprint/WEBGL.md)
- [`--bot-config-noise-canvas`](#flag-bot-config-noise-canvas) (Core): [Canvas Fingerprinting](docs/guides/fingerprint/CANVAS.md)
- [`--bot-config-noise-audio-context`](#flag-bot-config-noise-audio-context) (Core): [Audio Fingerprinting](docs/guides/fingerprint/AUDIO.md)
- [`--bot-config-noise-client-rects`](#flag-bot-config-noise-client-rects) (Core): [Font Fingerprinting](docs/guides/fingerprint/FONT.md)
- [`--bot-config-noise-text-rects`](#flag-bot-config-noise-text-rects) (Core): [Font Fingerprinting](docs/guides/fingerprint/FONT.md)
- [`--bot-config-speech-voices`](#flag-bot-config-speech-voices) (Core): [Speech Synthesis](docs/guides/fingerprint/SPEECH_SYNTHESIS.md)
- [`--bot-config-media-devices`](#flag-bot-config-media-devices) (Core): [Media Devices Privacy](docs/guides/fingerprint/MEDIA_DEVICES.md)
- [`--bot-config-media-types`](#flag-bot-config-media-types) (Core): [MIME and Codec](docs/guides/fingerprint/MIME_CODEC.md)
- [`--bot-noise-seed`](#flag-bot-noise-seed) (ENT Tier2): [Noise Seed Reproducibility](docs/guides/fingerprint/NOISE_SEED_REPRODUCIBILITY.md)
- [`--bot-fps`](#flag-bot-fps) (ENT Tier2): [FPS Control](docs/guides/fingerprint/FPS_CONTROL.md)
- [`--bot-video-fps`](#flag-bot-video-fps) (ENT Tier2): [FPS Control](docs/guides/fingerprint/FPS_CONTROL.md#video-fps-control)
- [`--bot-js-heap-size-limit`](#flag-bot-js-heap-size-limit) (Core): [Storage and Memory](docs/guides/fingerprint/STORAGE_QUOTA.md)
- [`--bot-storage-quota`](#flag-bot-storage-quota) (Core): [Storage and Memory](docs/guides/fingerprint/STORAGE_QUOTA.md)
- [`--bot-time-scale`](#flag-bot-time-scale) (ENT Tier2): [Performance Fingerprinting](docs/guides/fingerprint/PERFORMANCE.md)
- [`--bot-time-seed`](#flag-bot-time-seed) (ENT Tier2): [Performance Fingerprinting](docs/guides/fingerprint/PERFORMANCE.md)
- [`--bot-stack-seed`](#flag-bot-stack-seed) (ENT Tier2): [Stack Depth](docs/guides/fingerprint/STACK_DEPTH.md)
- [`--bot-network-info-override`](#flag-bot-network-info-override) (Core): [Navigator Properties](docs/guides/fingerprint/NAVIGATOR_PROPERTIES.md)
- [`--bot-gpu-emulation`](#flag-bot-gpu-emulation) (ENT Tier2): [Linux GPU Backend](docs/guides/deployment/LINUX_GPU_BACKEND.md#gpu-emulation-modes)

<a id="flag-group-mirror"></a>
### Mirror

- [`--bot-mirror-controller-endpoint`](#flag-bot-mirror-controller-endpoint) (ENT Tier3): [Mirror Distributed](docs/guides/deployment/MIRROR_DISTRIBUTED.md)
- [`--bot-mirror-client-endpoint`](#flag-bot-mirror-client-endpoint) (ENT Tier3): [Mirror Distributed](docs/guides/deployment/MIRROR_DISTRIBUTED.md)

---

## Core BotBrowser Flags

<a id="flag-bot-profile"></a>
### `--bot-profile`
The foundation of BotBrowser's privacy features.

Specifies the path to the BotBrowser profile file (.enc).

**Primary guide:** [Profile Management](docs/guides/getting-started/PROFILE_MANAGEMENT.md)

```bash
--bot-profile="/absolute/path/to/profile.enc"
```

**Notes:**
- The profile determines the fingerprint, OS emulation, and privacy controls
- A profile is reusable and can launch multiple browser processes or BrowserContexts; it is not a one-browser slot
- Use a unique `--user-data-dir` for every browser process to keep storage and session state independent
- Use a profile package that matches your BotBrowser major version. BotBrowser 150 and newer profile packages are available through subscription or support at [support@botbrowser.io](mailto:support@botbrowser.io) or [@botbrowser_support](https://t.me/botbrowser_support); legacy demo profiles remain in the [profiles directory](profiles/) for older evaluation lines.

<a id="flag-bot-profile-dir"></a>
### `--bot-profile-dir`
Random profile selection for fingerprint diversity.

**Primary guide:** [Profile Management](docs/guides/getting-started/PROFILE_MANAGEMENT.md)

Specify a directory containing multiple `.enc` profile files. BotBrowser will randomly select one profile on each startup for fingerprint diversity without manual configuration.

```bash
--bot-profile-dir="/absolute/path/to/profiles/directory"
```

**Notes:**
- Each startup randomly selects a different profile from the directory
- Useful for multi-instance deployments requiring fingerprint variation
- Cannot be used together with `--bot-profile` (directory takes precedence if both are specified)
- Can be used at BrowserContext creation time through Per-Context Fingerprint when a context should select its own profile from a directory

---

<a id="enhanced-proxy-configuration"></a>
## Enhanced Proxy Configuration

<a id="flag-proxy-server"></a>
### Enhanced `--proxy-server` with Embedded Credentials
BotBrowser extends the standard `--proxy-server` flag to accept embedded credentials in the URL.

**Primary guide:** [Proxy Configuration](docs/guides/network/PROXY_CONFIGURATION.md)

⚠️ **Important**: For authorized privacy research and fingerprint protection only. Do not use for unauthorized data collection.

```bash
# HTTP/HTTPS proxy with credentials
--proxy-server=http://username:password@proxy.example.com:8080
--proxy-server=https://username:password@proxy.example.com:8080

# SOCKS5 proxy with credentials
--proxy-server=socks5://username:password@proxy.example.com:1080
# SOCKS5H proxy with credentials (hostname resolution stays within tunnel)
--proxy-server=socks5h://username:password@proxy.example.com:1080
```

**Supported Protocols:** HTTP, HTTPS, SOCKS5, SOCKS5H.

**Proxy auth usernames:** Structured proxy usernames can include additional separators such as `,` and `|`. This is useful for providers that encode routing hints inside the username, for example:

```bash
--proxy-server=socks5://user_abc,type_mobile,country_GB,session_1234:11111@portal.proxy.example.com:1080
```

<a id="udp-over-socks5-ent-tier3"></a>
### UDP over SOCKS5 (ENT Tier3)
ENT Tier3 adds built-in SOCKS5 UDP ASSOCIATE support with no extra flag required. When the proxy supports UDP, BotBrowser tunnels QUIC traffic and STUN probes over the proxy to keep network identity consistent.

**Primary guide:** [UDP over SOCKS5](docs/guides/network/UDP_OVER_SOCKS5.md)

```bash
# UDP (QUIC/STUN) auto-tunneled when the SOCKS5 proxy supports UDP associate
--proxy-server=socks5://username:password@proxy.example.com:1080
```

<a id="flag-disable-quic"></a>

To keep SOCKS5 proxying but avoid QUIC/HTTP/3, add the standard `--disable-quic` flag. See [UDP over SOCKS5](docs/guides/network/UDP_OVER_SOCKS5.md).

```bash
--proxy-server=socks5://username:password@proxy.example.com:1080
--disable-quic
```

`--disable-quic` affects QUIC/HTTP/3 only. WebRTC/STUN behavior still follows the UDP-over-SOCKS5 and WebRTC settings.

<a id="--bot-udp-proxy-ent-tier3"></a>
<a id="flag-bot-udp-proxy"></a>
### `--bot-udp-proxy` (ENT Tier3)
Set the UDP proxy and HTTP/3 policy for a single browser context. Sibling contexts that share one profile can keep it on for one context and off for another, without taking the whole browser process off QUIC with `--disable-quic`.

```bash
# Bare flag means true
--bot-udp-proxy
--bot-udp-proxy=true
--bot-udp-proxy=false
```

Supply it on the main command line for a process-wide default, or through Per-Context Fingerprint when a context should override that default. A context inherits the main-process value when it does not set its own, and the policy can be switched after the context is created. This flag applies only to profiles that already carry the UDP entitlement and never grants the capability on its own. Process-level `--disable-quic` still takes priority. See [UDP over SOCKS5](docs/guides/network/UDP_OVER_SOCKS5.md).

<a id="pac-request-policy-ent-tier3"></a>
<a id="pac-like-request-callback-ent-tier3"></a>
### PAC-Like Request Callback (ENT Tier3)
ENT Tier3 profiles can use trusted PAC scripts for request callback workflows while preserving standard PAC routing. Configure PAC through the standard `--proxy-pac-url` flag and keep the PAC source explicit.

<a id="flag-proxy-pac-url"></a>

**Primary guide:** [PAC Request Policy](docs/guides/network/PAC_REQUEST_POLICY.md)

```bash
# Local PAC file
--proxy-pac-url=file:///absolute/path/to/proxy.pac

# Controlled loopback PAC server
--proxy-pac-url=http://127.0.0.1:8080/proxy.pac
```

Standard `FindProxyForURL(url, host)` behavior remains available for normal routing. Approved profiles and trusted PAC sources can also define BotBrowser's request callback:

```javascript
function BotBrowserFindProxyForRequest(url, host, method, headersB64, bodyB64, bodyState) {
  return "CONTINUE";
}
```

Supported callback results:

- Continue or stop: `CONTINUE`, `BLOCK`
- Capture: `CAPTURE`, `CAPTURE_TAG <tag>`, `CAPTURE_FILE <path>`
- Synthetic response: `RESPONSE <raw_http_response_b64>`, `RESPONSE_FILE <path>`
- Standard PAC route: `DIRECT`, `PROXY`, `HTTPS`, `SOCKS`, `SOCKS4`, `SOCKS5`

PAC and callback routes can include credentials, for example `SOCKS5 user:pass@proxy.example.com:1080`. Capture records are written only when `CAPTURE` and `CAPTURE_FILE <path>` are returned together. Synthetic responses are limited to approved `file:` and `data:` PAC sources and fail closed when response input is invalid. See [PAC Request Policy](docs/guides/network/PAC_REQUEST_POLICY.md).

Use this when request-aware policy should stay in PAC routing instead of CDP-level request interception, especially for workflows that need help preserving HTTP/2 connection and stream continuity while directing selected requests to different routes.

<a id="flag-proxy-ip"></a>
### `--proxy-ip` (ENT Tier1)
Specify the proxy's public IP to optimize performance.

**Primary guide:** [Proxy and Geolocation](docs/guides/network/PROXY_GEOLOCATION_ALIGNMENT.md)

This skips per-page IP lookups and speeds up navigation.

```bash
--proxy-ip="203.0.113.1"
```

**Benefits:**
- Eliminates IP detection overhead on each page load
- Faster browsing when using proxies
- Combine with `--bot-config-timezone` for protected region emulation


⚠️ Important:
- Browser-level proxy: use `--proxy-server` for protected geo-detection across contexts
- [Per-context proxy](PER_CONTEXT_FINGERPRINT.md) (ENT Tier1): set different proxies via `createBrowserContext({ proxyServer })` or `BotBrowser.setBrowserContextFlags` with `--proxy-server`; BotBrowser auto-derives geo info in both cases. Guide: [Per-Context Proxy](https://botbrowser.io/docs/network/per-context-proxy/)
- Avoid: framework-specific options like `page.authenticate()` that disable BotBrowser's geo-detection, which may leak location information

<a id="--proxy-bypass-rgx"></a>
<a id="flag-proxy-bypass-rgx"></a>
### `--proxy-bypass-rgx` (PRO)
Define URL patterns via regular expressions for proxy routing control. Uses RE2 regex syntax. Matches against both hostname and full URL path (including HTTPS).

```bash
--proxy-bypass-rgx="\.js(\?|$)"                      # Bypass .js files
--proxy-bypass-rgx="\.(js|css|png|svg)(\?|$)"        # Bypass static assets
--proxy-bypass-rgx="/api/public/|/static/"           # Bypass specific paths
--proxy-bypass-rgx="cdn\.|\.google\.com$"            # Bypass by domain pattern
```

**JavaScript Usage:**

Do NOT include quotes inside the value:

```javascript
// Wrong - quotes become part of regex
launchArgs.push('--proxy-bypass-rgx="\\.js$"');

// Correct
launchArgs.push('--proxy-bypass-rgx=\\.js($|\\?)');
launchArgs.push('--proxy-bypass-rgx=example\\.com.*\\.js($|\\?)');
```

In JavaScript strings: `\\.` becomes `\.`, `\\?` becomes `\?`

**Primary guide:** [Proxy Selective Routing](docs/guides/network/PROXY_SELECTIVE_ROUTING.md)

<a id="--bot-port-protection-pro"></a>
<a id="flag-bot-port-protection"></a>
### `--bot-port-protection` (PRO)
Protect local service ports (VNC, RDP, development servers, etc.) from being scanned. When enabled, BotBrowser prevents remote pages from detecting which services are running on localhost.

```bash
--bot-port-protection
```

Covers 30 commonly-probed ports across IPv4 (`127.0.0.0/8`), IPv6 (`::1`), and `localhost`. Can also be enabled via profile JSON (`configs.portProtection`).

**Primary guide:** [Port Protection](docs/guides/network/PORT_PROTECTION.md)

<a id="--bot-local-dns-ent-tier1"></a>
<a id="flag-bot-local-dns"></a>
### `--bot-local-dns` (ENT Tier1)
Enable the local DNS solver. This keeps DNS resolution local instead of relying on a proxy provider's DNS behavior, improving privacy and speed while avoiding common DNS poisoning paths. Part of [Network Fingerprint Control](ADVANCED_FEATURES.md#network-fingerprint-control).

```bash
--bot-local-dns
--bot-local-dns=true
--bot-local-dns=false
--bot-local-dns=8.8.8.8
--bot-local-dns=127.0.0.1:5353
```

Accepted values:
- bare flag or `true`: resolve proxy targets locally using the browser's built-in resolver
- `false`: disable LocalDNS and let the proxy resolve names
- `IP` or `IP:port`: resolve proxy targets through the specified DNS server only. Port defaults to `53`. Invalid values are treated as `false`.

When a custom DNS server is configured, BotBrowser does not use the system resolver if the chosen DNS returns no answer.

Practical notes:
- Helps when a proxy provider blocks or rewrites DNS lookups
- Useful when you want to avoid provider-side DNS policies and keep resolution behavior protected across runs
- `IP[:port]` is recommended for deterministic environments where the upstream DNS must be explicit

**Primary guide:** [DNS Leak Prevention](docs/guides/network/DNS_LEAK_PREVENTION.md)

<a id="flag-bot-ip-service"></a>
### `--bot-ip-service`
Customize the public IP service used to discover your egress IP (and derive geo settings when auto-detection is enabled).

**Primary guide:** [Proxy and Geolocation](docs/guides/network/PROXY_GEOLOCATION_ALIGNMENT.md)

```bash
--bot-ip-service="https://ip.example.com"
```

You can provide multiple endpoints as a comma-separated list. For each navigation, BotBrowser uses a single endpoint at a time and only moves to the next one when the previous one is unavailable, keeping the public-IP source stable across the request lifecycle.

```bash
--bot-ip-service="https://ip1.example.com,https://ip2.example.com"
```

---

## BotBrowser Customization

<a id="flag-bot-title"></a>
### `--bot-title`
Custom browser identification and session management.

**Primary guide:** [CLI Recipes](docs/guides/getting-started/CLI_RECIPES.md)

Sets custom browser window title and taskbar/dock icon label.

```bash
--bot-title="MyBot Session 1"
--bot-title="Research Session"
```

**Features:**
- Appears in the window title bar
- Shows on the taskbar/dock icon
- Displays as a label next to the Refresh button
- Useful for managing multiple instances

<a id="--bot-cookies"></a>
<a id="flag-bot-cookies"></a>
### `--bot-cookies` (PRO)
Session restoration and cookie management.

Accepts cookie data as either inline JSON or from a file. In Per-Context Fingerprint workflows, cookies can be imported at BrowserContext creation time so each context starts with its own session state.

**Inline JSON:**
```bash
--bot-cookies='[{"url":"https://example.com","name":"session","value":"abc123","domain":".example.com"}]'
```

**From JSON file:**
```bash
--bot-cookies="@/path/to/cookies.json"
```

Each cookie object must include a `url` field. Cookies without `url` are silently skipped.

**Primary guide:** [Cookie Management](docs/guides/identity/COOKIE_MANAGEMENT.md)

<a id="--bot-bookmarks"></a>
<a id="flag-bot-bookmarks"></a>
### `--bot-bookmarks`
Pre-populate bookmarks for session preservation.

Accepts a JSON string containing bookmark data for startup.

```bash
--bot-bookmarks='[{"title":"Example","type":"url","url":"https://example.com"},{"title":"Folder","type":"folder","children":[{"title":"Example","type":"url","url":"https://example.com"}]}]'
```

**Primary guide:** [Bookmark Seeding](docs/guides/identity/BOOKMARK_SEEDING.md)

<a id="--bot-canvas-record-file"></a>
<a id="flag-bot-canvas-record-file"></a>
### `--bot-canvas-record-file`
Canvas forensics and privacy validation.

Records all Canvas 2D, WebGL, WebGL2, and WebGPU API calls to a JSONL file for forensic analysis and replay.

CanvasLab recording is a diagnostic workflow. Profile-backed Canvas Replay is an ENT Tier4 capability for approved validation workflows that require deterministic graphics protection from embedded profile data.

```bash
--bot-canvas-record-file="/tmp/canvaslab.jsonl"
```

**Key Features:**
- Complete Canvas 2D, WebGL, WebGL2, and WebGPU API call recording with full parameter serialization
- Deterministic capture (noise variance disabled during recording)
- JSONL format for easy parsing and analysis
- HTML replay viewer with WebGL enum reverse-lookup and source location mapping

**Primary guide:** [CanvasLab](docs/guides/getting-started/CANVASLAB.md) | [Tool](tools/canvaslab/)

<a id="--bot-audio-record-file"></a>
<a id="flag-bot-audio-record-file"></a>
### `--bot-audio-record-file`
Web Audio forensics and tracking analysis.

Records all Web Audio API calls to a JSONL file for forensic analysis of audio fingerprint collection.

```bash
--bot-audio-record-file="/tmp/audiolab.jsonl"
```

**Key Features:**
- Complete Web Audio API recording: context creation, node creation, parameter setting, routing topology, data extraction
- Automatic detection of common audio fingerprinting patterns
- Sample previews (first/last 10 values, sums) for quick inspection
- Codec support queries (canPlayType, MediaSource.isTypeSupported)
- JSONL format for easy parsing with `jq` or the interactive Audio Viewer

**Primary guide:** [AudioLab](docs/guides/getting-started/AUDIOLAB.md) | [Tool](tools/audiolab/)

<a id="--bot-v8-log"></a>
<a id="flag-bot-v8-log"></a>
### `--bot-v8-log`
V8Log browser-runtime forensics for authorized privacy validation sessions.

```bash
--bot-v8-log=sample
--bot-v8-log=full
--bot-v8-log=none
```

Use `sample` for the normal validation trace, `full` only when requested, and pair it with `--bot-v8-log-dir`.

**Primary guide:** [V8Log](docs/guides/getting-started/V8LOG.md) | [Tool](tools/v8log/)

<a id="--bot-v8-log-dir"></a>
<a id="flag-bot-v8-log-dir"></a>
### `--bot-v8-log-dir`
Output directory for V8Log evidence files.

```bash
--bot-v8-log=sample
--bot-v8-log-dir="/tmp/botbrowser-v8log"
```

Use an absolute directory path that already exists and is writable by the browser process.

**Primary guide:** [V8Log](docs/guides/getting-started/V8LOG.md) | [Tool](tools/v8log/)

<a id="--bot-v8-log-exclude-api"></a>
<a id="flag-bot-v8-log-exclude-api"></a>
### `--bot-v8-log-exclude-api`
Exclude selected API names from a V8Log trace.

```bash
--bot-v8-log=full
--bot-v8-log-exclude-api=String.charCodeAt,Array.join
```

Names are comma-separated and matched exactly. Whitespace around each name is ignored. Excluded calls are not written and do not consume the trace event budget. This flag only applies when V8Log is enabled and available in the active profile.

**Primary guide:** [V8Log API Filters](docs/guides/getting-started/V8LOG.md#api-filters)

<a id="--bot-cdp-coalesce"></a>
<a id="flag-bot-cdp-coalesce"></a>
### `--bot-cdp-coalesce`
Enable BrowserContext-scoped coalescing for serial CDP mouse hover movement.

```bash
--bot-cdp-coalesce
# Equivalent:
--bot-cdp-coalesce=true
```

The default is off. Plain mouse hover moves are eligible; button, drag, wheel, keyboard, touch, pen, and relative-motion input keep their normal delivery paths. Set `--bot-cdp-coalesce=false` to disable it explicitly. Apply the flag before the first page is created in a BrowserContext.

**Primary guide:** [Automation Consistency](docs/guides/getting-started/AUTOMATION_CONSISTENCY.md#cdp-mouse-move-coalescing)

<a id="--bot-script"></a>
<a id="flag-bot-script"></a>
### `--bot-script`
Framework-less approach with a privileged JavaScript context.

Execute a JavaScript file right after BotBrowser starts in a privileged, non-extension context where `chrome.debugger` is available. In Per-Context Fingerprint workflows, bot scripts can also be attached at BrowserContext creation time.

```bash
--bot-script="/path/to/script.js"
```

At process launch, the script runs once for that browser process. Creating a BrowserContext does not replay it. Pass `--bot-script` explicitly in the context's `botbrowserFlags` when that context needs its own bootstrap.

**Key Features:**
- No framework dependencies: pure Chrome DevTools Protocol access
- Earlier intervention: runs before navigation
- Privileged context: full `chrome.debugger` API access
- Isolated execution: framework artifacts do not appear in page context

Documentation: Chrome `chrome.debugger` API - <https://developer.chrome.com/docs/extensions/reference/api/debugger/>

**Primary guide:** [Bot Script](docs/guides/getting-started/BOT_SCRIPT.md) | [Examples](examples/bot-script/)

<a id="--bot-custom-headers-pro"></a>
<a id="flag-bot-custom-headers"></a>
### `--bot-custom-headers` (PRO)
Inject custom HTTP request headers into all outgoing requests.

```bash
# JSON format with header name-value pairs
--bot-custom-headers='{"X-Custom-Header":"value","X-Another":"value2"}'
```

**JavaScript Usage:**

Do NOT wrap the JSON value in extra quotes; the shell-style single quotes shown above are for Bash only. In JavaScript they become literal characters inside the flag value:

```javascript
// Wrong - single quotes become part of the value
args.push(`--bot-custom-headers='${JSON.stringify(customHeaders)}'`);

// Correct
args.push("--bot-custom-headers=" + JSON.stringify(customHeaders));
```

**Configuration Methods:**
- CLI flag: `--bot-custom-headers='{"Header":"value"}'`
- Profile JSON: `configs.customHeaders`
- CDP: `BotBrowser.setCustomHeaders` (see below; also in [CDP Quick Reference](ADVANCED_FEATURES.md#cdp-quick-reference))

**CDP Usage:**

The `BotBrowser.setCustomHeaders` command must be sent to the **browser-level** CDP session, not a page-level session. Sending it to a page target will return `ProtocolError: 'BotBrowser.setCustomHeaders' wasn't found`.

Puppeteer:
```javascript
const cdpSession = await browser.target().createCDPSession();
await cdpSession.send('BotBrowser.setCustomHeaders', {
  headers: { 'x-requested-with': 'com.example.app' }
});
```

Playwright:
```javascript
const cdpSession = await browser.newBrowserCDPSession();
await cdpSession.send('BotBrowser.setCustomHeaders', {
  headers: { 'x-requested-with': 'com.example.app' }
});
```

**Notes:**
- Headers are added to all HTTP/HTTPS requests
- Useful for API authentication, session management, or request routing
- JSON format with string key-value pairs

**Primary guide:** [Custom HTTP Headers](docs/guides/network/CUSTOM_HTTP_HEADERS.md)

---

<a id="profile-configuration-override-flags"></a>
## Profile Configuration Override Flags

High-priority configuration overrides: these CLI flags supersede profile settings.

BotBrowser supports command-line flags that override profile configuration values with the highest priority. These flags start with `--bot-config-` and directly map to profile `configs` properties.

> Recommended: Use CLI flags instead of modifying profiles. They carry the highest priority and don’t require editing encrypted files. License tiers are indicated in parentheses where applicable.

### Bot Configuration Overrides (`--bot-config-*`)

Flags that directly map to profile `configs` and override them at runtime.

**Identity & Locale**

<a id="flag-bot-config-browser-brand"></a>
- `--bot-config-browser-brand=chrome` (ENT Tier2, webview requires ENT Tier3): Browser brand: chrome, chromium, edge, brave, opera, webview. WebKit-family identities are delivered through ENT Tier4 premium profiles. Guide: [Browser Brand Alignment](docs/guides/identity/BROWSER_BRAND_ALIGNMENT.md).
<a id="flag-bot-config-brand-full-version"></a>
- `--bot-config-brand-full-version=142.0.3595.65` (ENT Tier2): Brand-specific full version for UA-CH consistency. Guide: [Browser Brand Alignment](docs/guides/identity/BROWSER_BRAND_ALIGNMENT.md).
<a id="flag-bot-config-ua-full-version"></a>
- `--bot-config-ua-full-version=142.0.7444.60` (ENT Tier2): User agent version matching the Chromium major. Guide: [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md).
<a id="flag-bot-config-languages"></a>
- `--bot-config-languages=auto`: Languages: `auto` (IP-based, default) or a value such as `en-US,fr-FR` (ENT Tier1). Guide: [Timezone, Locale and Language](docs/guides/identity/TIMEZONE_LOCALE_LANGUAGE.md).
<a id="flag-bot-config-locale"></a>
- `--bot-config-locale=auto`: Browser locale: `auto` (derived from IP/language, default) or a value such as `en-US` or `fr-FR` (ENT Tier1). Guide: [Timezone, Locale and Language](docs/guides/identity/TIMEZONE_LOCALE_LANGUAGE.md).
<a id="flag-bot-config-timezone"></a>
- `--bot-config-timezone=auto`: Timezone: `auto` (IP-based, default), `real` (system), or an IANA timezone such as `America/New_York` (ENT Tier1). Guide: [Timezone, Locale and Language](docs/guides/identity/TIMEZONE_LOCALE_LANGUAGE.md).
<a id="flag-bot-config-location"></a>
- `--bot-config-location=auto`: Location: `auto` (IP-based, default), `real` (system GPS), or coordinates such as `40.7128,-74.0060` (ENT Tier1). Guide: [Timezone, Locale and Language](docs/guides/identity/TIMEZONE_LOCALE_LANGUAGE.md).

<a id="custom-user-agent-with-webview-ent-tier3"></a>
**Custom User-Agent (ENT Tier3)**

Build any browser identity with full userAgentData control. These flags work together with `--user-agent` to construct a complete, internally consistent browser identity.

<a id="flag-bot-config-platform"></a>
- `--bot-config-platform=Android`: Platform name: Windows, Android, macOS, Linux. Guide: [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md).
<a id="flag-bot-config-platform-version"></a>
- `--bot-config-platform-version=13`: OS version string. Guide: [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md).
<a id="flag-bot-config-model"></a>
- `--bot-config-model=SM-G991B`: Device model, primarily for mobile profiles. Guide: [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md).
<a id="flag-bot-config-architecture"></a>
- `--bot-config-architecture=arm`: CPU architecture: x86, arm, arm64. Guide: [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md).
<a id="flag-bot-config-bitness"></a>
- `--bot-config-bitness=64`: System bitness: 32, 64. Guide: [Custom User-Agent](docs/guides/identity/CUSTOM_USER_AGENT.md).
<a id="flag-bot-config-mobile"></a>
- `--bot-config-mobile=true`: Mobile device flag. Guide: [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md).

The `--user-agent` flag supports placeholders that get replaced at runtime:
- `{platform}`, `{platform-version}`, `{model}` for device info
- `{ua-full-version}`, `{ua-major-version}` for Chromium version
- `{brand-full-version}` for brand-specific version (Edge, Opera)
- `{architecture}`, `{bitness}` for CPU info

BotBrowser auto-generates matching `navigator.userAgentData` (brands, fullVersionList with proper GREASE) and all Sec-CH-UA-* headers. Values stay consistent across main thread, workers, and HTTP requests.

> **Note: UA/Engine Congruence:** Keep `--bot-config-ua-full-version` aligned with your Chromium major version, and use `--bot-config-brand-full-version` when a vendor's cadence (Edge, Opera, Brave) diverges so UA-CH metadata stays internally protected.

**Display & Input**

<a id="flag-bot-config-window"></a>
- `--bot-config-window=<value>`: Window dimensions with multiple formats. Guide: [Screen and Window](docs/guides/fingerprint/SCREEN_WINDOW.md).
  - `profile` - Use profile's window settings (default for headless and Android profiles)
  - `real` - Use actual system window dimensions (default for desktop headful)
  - `WxH` - Direct size specification (e.g., `1920x1080`), sets innerWidth/innerHeight with outerWidth/outerHeight auto-derived from profile borders
  - `JSON` - Full customization (e.g., `'{"innerWidth":1920,"innerHeight":1080,"devicePixelRatio":2}'`)
<a id="flag-bot-config-screen"></a>
- `--bot-config-screen=<value>`: Screen properties with multiple formats. Guide: [Screen and Window](docs/guides/fingerprint/SCREEN_WINDOW.md).
  - `profile` - Use profile's screen settings (default for headless and Android profiles)
  - `real` - Use actual system screen dimensions (default for desktop headful)
  - `WxH` - Direct size specification (e.g., `2560x1440`), sets width/height with availWidth/availHeight auto-derived from profile
  - `JSON` - Full customization (e.g., `'{"width":2560,"height":1440,"availWidth":2560,"availHeight":1400}'`)

> **Headful note:** Desktop profiles default to `real` in headful mode, meaning the browser uses the actual system window and screen dimensions. To apply profile-defined dimensions in headful, set both `--bot-config-window=profile` and `--bot-config-screen=profile` explicitly.

<a id="flag-bot-config-keyboard"></a>
- `--bot-config-keyboard=profile`: Keyboard settings: profile (emulated), real (system keyboard). Guide: [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md).
<a id="flag-bot-config-fonts"></a>
- `--bot-config-fonts=profile`: Font settings: profile (embedded), expand (profile + fallback), real (system fonts). Guide: [Font Fingerprinting](docs/guides/fingerprint/FONT.md).
<a id="flag-bot-mobile-keyboard"></a>
- `--bot-mobile-keyboard[=true|false]`: Opt-in mobile keyboard visual viewport behavior. When enabled for a mobile profile, trusted user focus on an editable field reduces `visualViewport.height` while leaving the layout viewport unchanged. Default: false. Guide: [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md#mobile-keyboard-visual-viewport).
<a id="flag-bot-config-orientation"></a>
- `--bot-config-orientation=<value>`: Screen orientation for mobile profiles. Desktop profiles ignore this flag. Guide: [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md).
  - `profile` - Auto-detect from profile dimensions (default)
  - `landscape` / `portrait` - Force orientation, automatically adjusting all related dimensions to match
  - `landscape-primary`, `landscape-secondary`, `portrait-primary`, `portrait-secondary` - Explicit orientation with specific angle
<a id="flag-bot-config-color-scheme"></a>
- `--bot-config-color-scheme=light`: Color scheme: light, dark. Guide: [CSS Signal Consistency](docs/guides/fingerprint/CSS_SIGNAL_CONSISTENCY.md).
<a id="flag-bot-config-disable-device-scale-factor"></a>
- `--bot-config-disable-device-scale-factor`: Disable device scale factor: true, false. Guide: [Screen and Window](docs/guides/fingerprint/SCREEN_WINDOW.md).

**Rendering, Noise & Media/RTC**

<a id="flag-bot-config-webgl"></a>
- `--bot-config-webgl=profile`: WebGL: profile (use profile), real (system), disabled (off). Guide: [WebGL Fingerprinting](docs/guides/fingerprint/WEBGL.md).
<a id="flag-bot-config-webgpu"></a>
- `--bot-config-webgpu=profile`: WebGPU: profile (use profile), real (system), disabled (off). Guide: [WebGPU Fingerprint Protection](docs/guides/fingerprint/WEBGPU.md).
<a id="flag-bot-config-noise-webgl-image"></a>
- `--bot-config-noise-webgl-image`: WebGL image noise: true, false. Guide: [WebGL Fingerprinting](docs/guides/fingerprint/WEBGL.md).
<a id="flag-bot-config-noise-canvas"></a>
- `--bot-config-noise-canvas`: Canvas fingerprint noise: true, false. Guide: [Canvas Fingerprinting](docs/guides/fingerprint/CANVAS.md).
<a id="flag-bot-config-noise-audio-context"></a>
- `--bot-config-noise-audio-context`: Audio context noise: true, false. Guide: [Audio Fingerprinting](docs/guides/fingerprint/AUDIO.md).
<a id="flag-bot-config-noise-client-rects"></a>
- `--bot-config-noise-client-rects`: Client rects noise: true, false. Guide: [Font Fingerprinting](docs/guides/fingerprint/FONT.md).
<a id="flag-bot-config-noise-text-rects"></a>
- `--bot-config-noise-text-rects`: Text rects noise: true, false. Guide: [Font Fingerprinting](docs/guides/fingerprint/FONT.md).
<a id="flag-bot-config-speech-voices"></a>
- `--bot-config-speech-voices=profile`: Speech voices: profile (profile-backed), real (system). Guide: [Speech Synthesis](docs/guides/fingerprint/SPEECH_SYNTHESIS.md).
<a id="flag-bot-config-media-devices"></a>
- `--bot-config-media-devices=profile`: Media devices: profile (profile-backed devices), real (system devices). Guide: [Media Devices Privacy](docs/guides/fingerprint/MEDIA_DEVICES.md).
<a id="flag-bot-config-media-types"></a>
- `--bot-config-media-types=expand`: Media types: expand (default), profile, real. Guide: [MIME and Codec](docs/guides/fingerprint/MIME_CODEC.md).
<a id="flag-bot-config-webrtc"></a>
- `--bot-config-webrtc=profile`: WebRTC: profile (use profile), real (native), disabled (off). Guide: [WebRTC Leak Prevention](docs/guides/network/WEBRTC_LEAK_PREVENTION.md).

<a id="behavior--protection-toggles"></a>
### Behavior & Protection Toggles

Runtime toggles that don’t rely on profile `configs` but still override behavior at launch.

<a id="flag-bot-disable-debugger"></a>
- `--bot-disable-debugger`: Ignore JavaScript `debugger` statements to avoid pauses. Guide: [Automation Consistency](docs/guides/getting-started/AUTOMATION_CONSISTENCY.md).
<a id="flag-bot-mobile-force-touch"></a>
- `--bot-mobile-force-touch`: Force touch events on/off for mobile device simulation. Guide: [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md).
<a id="flag-bot-disable-console-message"></a>
- `--bot-disable-console-message` (ENT Tier1): Suppress console output forwarded through automation protocols. Default: true. Guide: [Console Suppression](docs/guides/fingerprint/CONSOLE_SUPPRESSION.md).
<a id="flag-bot-inject-random-history"></a>
- `--bot-inject-random-history` (PRO): Add profile history. Accepts `true` (random 2-7 entries), a number for a precise count, or `false` to disable. Guide: [History Seeding](docs/guides/identity/HISTORY_SEEDING.md).
<a id="flag-bot-enable-variations-in-context"></a>
- `--bot-enable-variations-in-context` (ENT Tier2): Include `X-Client-Data` headers in incognito BrowserContexts. Disabled by default. Guide: [Incognito Fingerprinting](docs/guides/fingerprint/INCOGNITO.md).
<a id="flag-bot-always-active"></a>
- `--bot-always-active` (PRO, default true): Keep windows and tabs active when unfocused. Guide: [Active Window](docs/guides/fingerprint/ACTIVE_WINDOW.md).
<a id="flag-bot-webrtc-ice"></a>
- `--bot-webrtc-ice=google` (ENT Tier1): Configure ICE endpoints with a preset (`google`) or `custom:stun:...,turn:...`. Guide: [WebRTC Leak Prevention](docs/guides/network/WEBRTC_LEAK_PREVENTION.md).
<a id="--bot-noise-seed"></a>
<a id="flag-bot-noise-seed"></a>
- `--bot-noise-seed` (ENT Tier2): Integer seed (1-UINT32_MAX) for reproducible Canvas, WebGL, WebGPU, text, ClientRect, and audio protection. `0` keeps profile defaults. Guide: [Noise Seed Reproducibility](docs/guides/fingerprint/NOISE_SEED_REPRODUCIBILITY.md).
<a id="flag-bot-fps"></a>
- `--bot-fps` (ENT Tier2): Control frame rate behavior. Accepts `profile`, `real`, or a number such as `60`. Guide: [FPS Control](docs/guides/fingerprint/FPS_CONTROL.md).
<a id="--bot-video-fps"></a>
<a id="flag-bot-video-fps"></a>
- `--bot-video-fps=<actual>[:<reported>]` (ENT Tier2): Control video playback cadence separately from media FPS reporting on profiles with Video FPS Control enabled. Examples: `1`, `1:30`, `1:real`. Guide: [FPS Control](docs/guides/fingerprint/FPS_CONTROL.md#video-fps-control).
<a id="--bot-js-heap-size-limit"></a>
<a id="flag-bot-js-heap-size-limit"></a>
- `--bot-js-heap-size-limit=profile|real|<bytes>`: Control the JavaScript heap size limit policy. Guide: [Storage and Memory](docs/guides/fingerprint/STORAGE_QUOTA.md).
<a id="--bot-storage-quota"></a>
<a id="flag-bot-storage-quota"></a>
- `--bot-storage-quota=profile|real|<bytes>`: Control the storage quota policy. Guide: [Storage and Memory](docs/guides/fingerprint/STORAGE_QUOTA.md).
<a id="flag-bot-time-scale"></a>
- `--bot-time-scale` (ENT Tier2): Float below `1.0` for timing scale policy. Guide: [Performance Fingerprinting](docs/guides/fingerprint/PERFORMANCE.md).
<a id="flag-bot-time-seed"></a>
- `--bot-time-seed` (ENT Tier2): Integer seed (1-UINT32_MAX) for reproducible execution timing policy. `0` disables the feature. Guide: [Performance Fingerprinting](docs/guides/fingerprint/PERFORMANCE.md).
<a id="flag-bot-stack-seed"></a>
- `--bot-stack-seed` (ENT Tier2): Use `profile`, `real`, or a positive integer seed for stack depth policy across main thread, Worker, and WASM contexts. Guide: [Stack Depth](docs/guides/fingerprint/STACK_DEPTH.md).
<a id="--bot-network-info-override"></a>
<a id="flag-bot-network-info-override"></a>
### `--bot-network-info-override`
Control network information properties and corresponding Client Hints with one policy.

```bash
# Use every available network value from the profile
--bot-network-info-override
--bot-network-info-override=profile

# Keep native Chromium network values
--bot-network-info-override=false

# Set selected values and keep omitted fields native
--bot-network-info-override='{"effectiveType":"3g","rtt":180,"downlink":1.8,"saveData":false}'

# Mix profile, native, and custom values by field
--bot-network-info-override='{"type":"profile","rtt":"host","downlink":2.5,"saveData":"profile"}'
```

The bare flag, an empty value, `true`, and `profile` use all available profile network values. `false` keeps native Chromium behavior. A JSON object can configure `type`, `effectiveType`, `rtt`, `downlink`, `downlinkMax`, and `saveData` independently. Each JSON field accepts a supported value or the source selector `profile` or `host`; omitted fields remain native.

Invalid JSON, unknown fields, invalid values, and unavailable `profile` references reject the policy as a whole. Custom and `host` policies can be used without a profile. The CLI policy overrides `configs.networkInfoOverride`, whose profile configuration remains limited to `true` or `false`.

The resolved policy follows the active BrowserContext across pages, workers, navigation, and supported Client Hints paths. Apply identity-bearing changes before the first page is created.

**Primary guide:** [Navigator Properties](docs/guides/fingerprint/NAVIGATOR_PROPERTIES.md#network-information)
<a id="--bot-gpu-emulation"></a>
<a id="flag-bot-gpu-emulation"></a>
- `--bot-gpu-emulation` (ENT Tier2, default `true`): Accepts `false`, `true`, or `priority`. Guide: [Linux GPU Backend](docs/guides/deployment/LINUX_GPU_BACKEND.md#gpu-emulation-modes).

---

<a id="mirror-distributed-privacy-consistency"></a>
## Mirror: Distributed Privacy Consistency (ENT Tier3)

Run one controller and multiple clients for synchronized cross-platform validation.

**Key flags:**
<a id="flag-bot-mirror-controller-endpoint"></a>
- `--bot-mirror-controller-endpoint=host:port` - Launch as controller. Guide: [Mirror Distributed](docs/guides/deployment/MIRROR_DISTRIBUTED.md).
<a id="flag-bot-mirror-client-endpoint"></a>
- `--bot-mirror-client-endpoint=host:port` - Launch as client. Guide: [Mirror Distributed](docs/guides/deployment/MIRROR_DISTRIBUTED.md).

Setup: [Mirror Distributed](docs/guides/deployment/MIRROR_DISTRIBUTED.md) | [Mirror tool](tools/mirror/)

---

## Usage Examples

For multi-instance, proxy, identity, mobile, media, and deployment commands, use [CLI Recipes](docs/guides/getting-started/CLI_RECIPES.md). The reference keeps one minimal launch example:

### Minimal launch with proxy
```bash
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-title="My Session" \
  --proxy-server=http://myuser:mypass@proxy.example.com:8080 \
  --user-data-dir="/tmp/botbrowser-session" \
  --remote-debugging-port=9222
```

---

## Related Documentation

- [Guides Index](docs/guides/README.md) - Setup and troubleshooting by workflow
- [CLI Recipes](docs/guides/getting-started/CLI_RECIPES.md) - Scenario-based launch commands
- [Profile Configuration Guide](profiles/PROFILE_CONFIGS.md) - Configure browser behavior via profiles
- [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) - Independent fingerprint per BrowserContext
- [Main README](README.md) - General usage and standard Chromium flags
- [Examples](examples/) - Playwright and Puppeteer integration examples
- [Docker Deployment](docker/README.md) - Container deployment guides

---

> Standard Chromium flags are listed here only when they directly affect a BotBrowser workflow, such as `--disable-quic` and `--proxy-pac-url`. For the full Chromium switch catalog, see the [Chromium command line documentation](https://peter.sh/experiments/chromium-command-line-switches/).

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
