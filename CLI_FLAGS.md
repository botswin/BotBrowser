# BotBrowser CLI Flags Reference

For Fingerprint Protection and Privacy Research.

This document explains BotBrowser's CLI configuration system. These flags extend Chromium and provide runtime control over fingerprints to prevent tracking system collection without modifying profile files. For terms of use, see the [Legal Disclaimer](DISCLAIMER.md) and [Responsible Use Guidelines](RESPONSIBLE_USE.md).

> Smart auto-configuration: BotBrowser derives timezone, locale, and languages from your IP/proxy. Override only when you need a specific setup.

> Dynamic configuration: `--bot-*` flags (config overrides + behavior toggles) enable runtime fingerprint control, which is ideal for CI/CD and multi-instance scenarios.

> License tiers: Some flags show tier hints in parentheses (PRO, ENT Tier1/Tier2/Tier3/Tier4); those options are subscription-gated.

## Table of Contents

- [Core BotBrowser Flags](#core-botbrowser-flags)
- [Enhanced Proxy Configuration](#enhanced-proxy-configuration)
- [BotBrowser Customization](#botbrowser-customization)
- [Profile Configuration Override Flags](#profile-configuration-override-flags)
- [Mirror: Distributed Privacy Consistency](#mirror-distributed-privacy-consistency)
- [Usage Examples](#usage-examples)

---

## Core BotBrowser Flags

### `--bot-profile`
The foundation of BotBrowser's privacy features.

Specifies the path to the BotBrowser profile file (.enc).

```bash
--bot-profile="/absolute/path/to/profile.enc"
```

**Notes:**
- The profile determines the fingerprint, OS emulation, and privacy controls
- Use profiles from the [profiles directory](profiles/) or contact support for custom profiles
- This is the core difference from stock Chromium

### `--bot-profile-dir`
Random profile selection for fingerprint diversity.

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

### Enhanced `--proxy-server` with Embedded Credentials
BotBrowser extends the standard `--proxy-server` flag to accept embedded credentials in the URL.

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

**Supported Protocols:** HTTP, HTTPS, SOCKS5, SOCKS5H. Guide: [Proxy Configuration](https://botbrowser.io/docs/network/proxy-configuration/)

**Proxy auth usernames:** Structured proxy usernames can include additional separators such as `,` and `|`. This is useful for providers that encode routing hints inside the username, for example:

```bash
--proxy-server=socks5://user_abc,type_mobile,country_GB,session_1234:11111@portal.proxy.example.com:1080
```

<a id="udp-over-socks5-ent-tier3"></a>
### UDP over SOCKS5 (ENT Tier3)
ENT Tier3 adds built-in SOCKS5 UDP ASSOCIATE support with no extra flag required. When the proxy supports UDP, BotBrowser will tunnel QUIC traffic and STUN probes over the proxy to harden proxy checks. Guide: [UDP over SOCKS5](https://botbrowser.io/docs/network/udp-over-socks5/)

```bash
# UDP (QUIC/STUN) auto-tunneled when the SOCKS5 proxy supports UDP associate
--proxy-server=socks5://username:password@proxy.example.com:1080
```

### `--proxy-ip` (ENT Tier1)
Specify the proxy's public IP to optimize performance.

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

Guide: [Proxy Selective Routing](https://botbrowser.io/docs/network/proxy-selective-routing/)

<a id="--bot-port-protection-pro"></a>
### `--bot-port-protection` (PRO)
Protect local service ports (VNC, RDP, development servers, etc.) from being scanned. When enabled, BotBrowser prevents remote pages from detecting which services are running on localhost.

```bash
--bot-port-protection
```

Covers 30 commonly-probed ports across IPv4 (`127.0.0.0/8`), IPv6 (`::1`), and `localhost`. Can also be enabled via profile JSON (`configs.portProtection`). See [Port Protection](ADVANCED_FEATURES.md#port-protection) for details. Guide: [Port Protection](https://botbrowser.io/docs/network/port-protection/)

<a id="--bot-local-dns-ent-tier1"></a>
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

Guide: [DNS Leak Prevention](https://botbrowser.io/docs/network/dns-leak-prevention/)

### `--bot-ip-service`
Customize the public IP service used to discover your egress IP (and derive geo settings when auto-detection is enabled).

```bash
--bot-ip-service="https://ip.example.com"
```

You can provide multiple endpoints as a comma-separated list. For each navigation, BotBrowser uses a single endpoint at a time and only moves to the next one when the previous one is unavailable, keeping the public-IP source stable across the request lifecycle.

```bash
--bot-ip-service="https://ip1.example.com,https://ip2.example.com"
```

---

## BotBrowser Customization

### `--bot-title`
Custom browser identification and session management.

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

Each cookie object must include a `url` field. Cookies without `url` are silently skipped. Guide: [Cookie Management](https://botbrowser.io/docs/identity/cookie-management/)

<a id="--bot-bookmarks"></a>
### `--bot-bookmarks`
Pre-populate bookmarks for session preservation.

Accepts a JSON string containing bookmark data for startup.

```bash
--bot-bookmarks='[{"title":"Example","type":"url","url":"https://example.com"},{"title":"Folder","type":"folder","children":[{"title":"Example","type":"url","url":"https://example.com"}]}]'
```

Guide: [Bookmark Seeding](https://botbrowser.io/docs/identity/bookmark-seeding/)

<a id="--bot-canvas-record-file"></a>
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

Learn more: [CanvasLab Documentation](tools/canvaslab/)

<a id="--bot-audio-record-file"></a>
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

Learn more: [AudioLab Documentation](tools/audiolab/)

<a id="--bot-v8-log"></a>
### `--bot-v8-log`
V8Log browser-runtime forensics for authorized privacy validation sessions.

```bash
--bot-v8-log=sample
--bot-v8-log=full
--bot-v8-log=none
```

Use `sample` for the normal validation trace, `full` only when requested, and pair it with `--bot-v8-log-dir`.

Learn more: [V8Log Guide](docs/guides/getting-started/V8LOG.md) | [V8Log Tool](tools/v8log/)

<a id="--bot-v8-log-dir"></a>
### `--bot-v8-log-dir`
Output directory for V8Log evidence files.

```bash
--bot-v8-log=sample
--bot-v8-log-dir="/tmp/botbrowser-v8log"
```

Use an absolute directory path that already exists and is writable by the browser process.

Learn more: [V8Log Guide](docs/guides/getting-started/V8LOG.md) | [V8Log Tool](tools/v8log/)

<a id="--bot-script"></a>
### `--bot-script`
Framework-less approach with a privileged JavaScript context.

Execute a JavaScript file right after BotBrowser starts in a privileged, non-extension context where `chrome.debugger` is available. In Per-Context Fingerprint workflows, bot scripts can also be attached at BrowserContext creation time.

```bash
--bot-script="/path/to/script.js"
```

**Key Features:**
- No framework dependencies: pure Chrome DevTools Protocol access
- Earlier intervention: runs before navigation
- Privileged context: full `chrome.debugger` API access
- Isolated execution: framework artifacts do not appear in page context

Documentation: Chrome `chrome.debugger` API - <https://developer.chrome.com/docs/extensions/reference/api/debugger/>

Examples: [Bot Script](examples/bot-script). Guide: [Bot Script](https://botbrowser.io/docs/getting-started/bot-script/)

<a id="--bot-custom-headers-pro"></a>
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

Guide: [Custom HTTP Headers](https://botbrowser.io/docs/network/custom-http-headers/)

---

<a id="profile-configuration-override-flags"></a>
## Profile Configuration Override Flags

High-priority configuration overrides: these CLI flags supersede profile settings.

BotBrowser supports command-line flags that override profile configuration values with the highest priority. These flags start with `--bot-config-` and directly map to profile `configs` properties.

> Recommended: Use CLI flags instead of modifying profiles. They carry the highest priority and don’t require editing encrypted files. License tiers are indicated in parentheses where applicable.

### Bot Configuration Overrides (`--bot-config-*`)

Flags that directly map to profile `configs` and override them at runtime.

**Identity & Locale** - Guides: [Browser Brand Alignment](https://botbrowser.io/docs/identity/browser-brand-alignment/), [Custom User-Agent](https://botbrowser.io/docs/identity/custom-user-agent/), [Timezone, Locale, and Language](https://botbrowser.io/docs/identity/timezone-locale-language/)
- `--bot-config-browser-brand=chrome` (ENT Tier2, webview requires ENT Tier3): Browser brand: chrome, chromium, edge, brave, opera, webview. WebKit-family identities are delivered through ENT Tier4 premium profiles.
- `--bot-config-brand-full-version=142.0.3595.65` (ENT Tier2): Brand-specific full version (Edge/Opera cadence) for UA-CH congruence
- `--bot-config-ua-full-version=142.0.7444.60` (ENT Tier2): User agent version: full version string matching Chromium major
- `--bot-config-languages=auto`: Languages: `auto` (IP-based, default) or custom value like `en-US,fr-FR` (ENT Tier1)
- `--bot-config-locale=auto`: Browser locale: `auto` (derived from IP/language, default) or custom value like `en-US`, `fr-FR` (ENT Tier1)
- `--bot-config-timezone=auto`: Timezone: `auto` (IP-based, default), `real` (system), or IANA timezone name like `America/New_York`, `Europe/Berlin` (ENT Tier1)
- `--bot-config-location=auto`: Location: `auto` (IP-based, default), `real` (system GPS), or custom coordinates like `40.7128,-74.0060` (ENT Tier1)

**Custom User-Agent (ENT Tier3)** - Guide: [Custom User-Agent](https://botbrowser.io/docs/identity/custom-user-agent/)

Build any browser identity with full userAgentData control. These flags work together with `--user-agent` to construct a complete, internally consistent browser identity.

- `--bot-config-platform=Android`: Platform name: Windows, Android, macOS, Linux
- `--bot-config-platform-version=13`: OS version string
- `--bot-config-model=SM-G991B`: Device model (primarily for mobile)
- `--bot-config-architecture=arm`: CPU architecture: x86, arm, arm64
- `--bot-config-bitness=64`: System bitness: 32, 64
- `--bot-config-mobile=true`: Mobile device flag

The `--user-agent` flag supports placeholders that get replaced at runtime:
- `{platform}`, `{platform-version}`, `{model}` for device info
- `{ua-full-version}`, `{ua-major-version}` for Chromium version
- `{brand-full-version}` for brand-specific version (Edge, Opera)
- `{architecture}`, `{bitness}` for CPU info

BotBrowser auto-generates matching `navigator.userAgentData` (brands, fullVersionList with proper GREASE) and all Sec-CH-UA-* headers. Values stay consistent across main thread, workers, and HTTP requests.

> **Note: UA/Engine Congruence:** Keep `--bot-config-ua-full-version` aligned with your Chromium major version, and use `--bot-config-brand-full-version` when a vendor's cadence (Edge, Opera, Brave) diverges so UA-CH metadata stays internally protected.

**Display & Input** - Guides: [Screen and Window](https://botbrowser.io/docs/fingerprint/screen-window/), [Font Fingerprinting](https://botbrowser.io/docs/fingerprint/font/), [Device Emulation](https://botbrowser.io/docs/platform/device-emulation/)
- `--bot-config-window=<value>`: Window dimensions with multiple formats:
  - `profile` - Use profile's window settings (default for headless and Android profiles)
  - `real` - Use actual system window dimensions (default for desktop headful)
  - `WxH` - Direct size specification (e.g., `1920x1080`), sets innerWidth/innerHeight with outerWidth/outerHeight auto-derived from profile borders
  - `JSON` - Full customization (e.g., `'{"innerWidth":1920,"innerHeight":1080,"devicePixelRatio":2}'`)
- `--bot-config-screen=<value>`: Screen properties with multiple formats:
  - `profile` - Use profile's screen settings (default for headless and Android profiles)
  - `real` - Use actual system screen dimensions (default for desktop headful)
  - `WxH` - Direct size specification (e.g., `2560x1440`), sets width/height with availWidth/availHeight auto-derived from profile
  - `JSON` - Full customization (e.g., `'{"width":2560,"height":1440,"availWidth":2560,"availHeight":1400}'`)

> **Headful note:** Desktop profiles default to `real` in headful mode, meaning the browser uses the actual system window and screen dimensions. To apply profile-defined dimensions in headful, set both `--bot-config-window=profile` and `--bot-config-screen=profile` explicitly.

- `--bot-config-keyboard=profile`: Keyboard settings: profile (emulated), real (system keyboard)
- `--bot-config-fonts=profile`: Font settings: profile (embedded), expand (profile + fallback), real (system fonts)
- `--bot-config-orientation=<value>`: Screen orientation for mobile profiles. Desktop profiles ignore this flag.
  - `profile` - Auto-detect from profile dimensions (default)
  - `landscape` / `portrait` - Force orientation, automatically adjusting all related dimensions to match
  - `landscape-primary`, `landscape-secondary`, `portrait-primary`, `portrait-secondary` - Explicit orientation with specific angle
- `--bot-config-color-scheme=light`: Color scheme: light, dark
- `--bot-config-disable-device-scale-factor`: Disable device scale factor: true, false

**Rendering, Noise & Media/RTC** - Guides: [Canvas](https://botbrowser.io/docs/fingerprint/canvas/), [WebGL](https://botbrowser.io/docs/fingerprint/webgl/), [Audio](https://botbrowser.io/docs/fingerprint/audio/), [Speech Synthesis](https://botbrowser.io/docs/fingerprint/speech-synthesis/), [Noise Seed](https://botbrowser.io/docs/fingerprint/noise-seed-reproducibility/)
- `--bot-config-webgl=profile`: WebGL: profile (use profile), real (system), disabled (off)
- `--bot-config-webgpu=profile`: WebGPU: profile (use profile), real (system), disabled (off)
- `--bot-config-noise-webgl-image`: WebGL image noise: true, false
- `--bot-config-noise-canvas`: Canvas fingerprint noise: true, false
- `--bot-config-noise-audio-context`: Audio context noise: true, false
- `--bot-config-noise-client-rects`: Client rects noise: true, false
- `--bot-config-noise-text-rects`: Text rects noise: true, false
- `--bot-config-speech-voices=profile`: Speech voices: profile (synthetic), real (system)
- `--bot-config-media-devices=profile`: Media devices: profile (synthetic devices), real (system devices)
- `--bot-config-media-types=expand`: Media types: expand (default), profile, real
- `--bot-config-webrtc=profile`: WebRTC: profile (use profile), real (native), disabled (off)

<a id="behavior--protection-toggles"></a>
### Behavior & Protection Toggles

Runtime toggles that don’t rely on profile `configs` but still override behavior at launch.

- `--bot-disable-debugger`: Ignore JavaScript `debugger` statements to avoid pauses
- `--bot-mobile-force-touch`: Force touch events on/off for mobile device simulation
- `--bot-disable-console-message` (ENT Tier1): Suppress console.* output from CDP logs (default true); prevents framework hooks from enabling `Console.enable`/`Runtime.enable`, which blocks fingerprint signals. Guide: [Console Suppression](https://botbrowser.io/docs/fingerprint/console-suppression/)
- `--bot-inject-random-history` (PRO): Add synthetic browsing history for session authenticity. Accepts `true` (random 2-7 entries), a number for precise control (e.g., `=15` for `history.length` of 16), or `false` to disable. Guide: [History Seeding](https://botbrowser.io/docs/identity/history-seeding/)
- `--bot-enable-variations-in-context` (ENT Tier2): Include `X-Client-Data` headers in incognito browser contexts for Google domains, same as regular browsing. Disabled by default.
- `--bot-always-active` (PRO, default true): Keep windows/tabs active even when unfocused. See [Active Window Emulation](ADVANCED_FEATURES.md#active-window-emulation)
- `--bot-webrtc-ice=google` (ENT Tier1): Override STUN/TURN endpoints observed by JavaScript/WebRTC to control ICE signaling; accepts presets (`google`) or `custom:stun:...,turn:...`. See [WebRTC Leak Protection](ADVANCED_FEATURES.md#webrtc-leak-protection). Guide: [WebRTC Leak Prevention](https://botbrowser.io/docs/network/webrtc-leak-prevention/)
<a id="--bot-noise-seed"></a>
- `--bot-noise-seed` (ENT Tier2): Integer seed (1-UINT32_MAX) for the deterministic noise RNG; each seed augments privacy variance across Canvas 2D/WebGL/WebGPU images, text metrics, text layout, ClientRect measurements, and offline audio hashes so you can treat a seed as a reproducible fingerprint ID per tenant while keeping runs stable. `0` keeps noise active with profile defaults. Guide: [Noise Seed Reproducibility](https://botbrowser.io/docs/fingerprint/noise-seed-reproducibility/)
- `--bot-fps` (ENT Tier2): Control frame rate behavior at runtime. Accepts `profile` (use profile data, default when capable), `real` (use native frame rate), or a number (e.g., `60`). Guide: [FPS Control](https://botbrowser.io/docs/fingerprint/fps-control/)
- `--bot-time-scale` (ENT Tier2): Float < 1.0; scales down `performance.now()` intervals to emulate lower load and reduce timing skew signals (typical range 0.80-0.99). Guide: [Performance Fingerprinting](https://botbrowser.io/docs/fingerprint/performance/)
- `--bot-time-seed` (ENT Tier2): Integer seed (1-UINT32_MAX) for deterministic execution timing diversity across 27 browser operations (Canvas, WebGL, Audio, Font, DOM, and more). `0` disables the feature (default). Each seed produces a unique, stable performance profile that protects against timing-based tracking. Also covers `performance.getEntries()`, `performance.getEntriesByType("navigation")`, and `performance.timing` with authentic per-session redistribution.
- `--bot-stack-seed` (ENT Tier2): Controls JavaScript recursive call stack depth across main thread, Worker, and WASM contexts. Accepts `profile` (match profile’s exact depth), `real` (use native depth), or a positive integer seed (1-UINT32_MAX) for per-session depth variation. Guide: [Stack Depth Fingerprinting](https://botbrowser.io/docs/fingerprint/stack-depth/)
- `--bot-network-info-override`: Enable profile-defined `navigator.connection` values (`rtt`, `downlink`, `effectiveType`, `saveData`) and corresponding Client Hints headers (`RTT`, `Downlink`, `ECT`, `Save-Data`). Disabled by default. Guide: [Navigator Properties](https://botbrowser.io/docs/fingerprint/navigator-properties/)
<a id="--bot-gpu-emulation"></a>
- `--bot-gpu-emulation` (ENT Tier2, default `true`): Controls GPU emulation mode. Accepts `false` (disabled), `true` (standard mode, historical default), or `priority` (opt-in mode that adds prioritized GPU/WebGPU scheduling for high-concurrency workloads). Set `--bot-gpu-emulation=false` to use your own GPU or GL driver directly. Guide: [Linux GPU Backend Selection](https://botbrowser.io/docs/deployment/linux-gpu-backend/)

Example tracking probe BotBrowser avoids when console forwarding stays disabled:

```javascript
let detected = false;
const err = new Error();
Object.defineProperty(err, 'stack', {
  get() { detected = true; }
});
console.log(err);  // stack getter fires if Console.enable/Runtime.enable are active
```

### Key Benefits of CLI Configuration Flags

- **Highest Priority:** Overrides profile settings
- **No Profile Editing:** Avoid changing encrypted JSON
- **Dynamic Configuration:** Perfect for testing and CI/CD
- **Session Isolation:** Different settings per instance

### Configuration Priority

1. CLI `--bot-config-*` flags (Highest priority)
2. Profile `configs` settings (Medium priority)
3. Profile default values (Lowest priority)

Behavior & privacy toggles apply at launch and override profile data entirely.

---

<a id="mirror-distributed-privacy-consistency"></a>
## Mirror: Distributed Privacy Consistency (ENT Tier3)

Verify that your privacy protection works effectively across platforms and networks. Run a controller instance and multiple clients to ensure all instances maintain identical privacy defenses, protecting you from tracking across Windows, macOS, Linux, and remote deployment environments.

**Key flags:**
- `--bot-mirror-controller-endpoint=host:port` - Launch as controller (captures your actions)
- `--bot-mirror-client-endpoint=host:port` - Launch as client (receives controller actions)

**For complete setup instructions, examples, and troubleshooting, see the [Mirror documentation](tools/mirror/).** Guide: [Mirror Distributed](https://botbrowser.io/docs/deployment/mirror-distributed/)

---

## Usage Examples

### Minimal launch with proxy
```bash
# Essential flags with proxy and remote debugging
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-title="My Session" \
  --proxy-server=http://myuser:mypass@proxy.example.com:8080 \
  --remote-debugging-port=9222
```

### Single-instance overrides
```bash
# Override only what you need (timezone/locale auto-detected)
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="edge" \  # ENT Tier2 feature
  --bot-title="Custom Session"

# Active window + custom ICE servers
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-always-active \  # PRO feature
  --bot-webrtc-ice="custom:stun:stun.l.google.com:19302,turn:turn.example.com"   # ENT Tier1 feature
```

### Multi-instance setup
```bash
# Instance 1 - Chrome brand with profile window settings
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="chrome" \  # ENT Tier2 feature
  --bot-config-window="profile" \
  --bot-cookies='[{"url":"https://example.com","name":"sessionid","value":"abc123","domain":".example.com"}]' \
  --bot-bookmarks='[{"title":"Work Site","url":"https://work.example.com","type":"url"}]' \
  --user-data-dir="/tmp/instance1" &

# Instance 2 - Edge brand with real window settings
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="edge" \  # ENT Tier2 feature
  --bot-config-window="real" \
  --user-data-dir="/tmp/instance2" &

# Instance 3 - Custom window/screen size for OCR or specific viewport testing
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-window="1920x1080" \
  --bot-config-screen="2560x1440" \
  --user-data-dir="/tmp/instance3" &
```

### Performance timing & noise control (ENT Tier2)
```bash
# Stabilize performance timing and noise determinism under load
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-time-scale=0.92 \  # ENT Tier2 feature
  --bot-time-seed=42 \     # ENT Tier2 feature, deterministic timing diversity
  --bot-stack-seed=profile \  # ENT Tier2 feature: "profile", "real", or integer seed
  --bot-noise-seed=42      # ENT Tier2 feature, deterministic canvas/audio noise
```

### Custom User-Agent with WebView (ENT Tier3)
```bash
# Android WebView simulation with placeholders
chromium-browser \
  --bot-profile="/absolute/path/to/android-profile.enc" \
  --user-agent="Mozilla/5.0 (Linux; Android {platform-version}; {model} Build/TP1A.220624.021; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/{ua-full-version} Mobile Safari/537.36" \
  --bot-config-browser-brand=webview \
  --bot-config-platform=Android \
  --bot-config-platform-version=13 \
  --bot-config-model=SM-G991B \
  --bot-config-mobile=true \
  --bot-config-architecture=arm \
  --bot-config-bitness=64
```

Placeholders like `{platform-version}` and `{model}` get replaced from flags or fingerprint config. BotBrowser generates matching userAgentData and Client Hints automatically.

**Android 16+ UA Reduction:** When `platform-version` is 16 or higher, BotBrowser automatically applies Google's [WebView UA reduction policy](https://developer.chrome.com/docs/privacy-security/user-agent-reduction). The UA string placeholders `{platform-version}`, `{model}`, and `{ua-full-version}` are frozen to reduced values (`10`, `K`, `Major.0.0.0`), while Client Hints continue to report the real values. The same `--user-agent` template works for both old and new Android versions without modification.

Guide: [Android WebView](https://botbrowser.io/docs/platform/android-webview/)

---

## Related Documentation
Quick links to supporting materials.

- [Guides](https://botbrowser.io/docs/) - Comprehensive guides for all BotBrowser features
- [Profile Configuration Guide](profiles/PROFILE_CONFIGS.md) - Configure browser behavior via profiles
- [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) - Independent fingerprint per BrowserContext
- [Main README](README.md) - General usage and standard Chromium flags
- [Examples](examples/) - Playwright and Puppeteer integration examples
- [Docker Deployment](docker/README.md) - Container deployment guides

---

## Tips & Best Practices
Practical pointers for stable runs.

### BotBrowser-Specific Considerations

Configuration priority: CLI `--bot-config-*` flags override profile `configs`.

Session management: use `--bot-title` to identify instances.

Cookie persistence: `--bot-cookies` helps maintain state across restarts.

Realistic browsing: `--bot-bookmarks` adds authenticity.

Proxy authentication: embed credentials directly in the proxy URL.

---

> Note: This document covers BotBrowser-specific flags only. For standard Chromium flags (like `--headless`, `--no-sandbox`, `--user-data-dir`, etc.), refer to the [Chromium command line documentation](https://peter.sh/experiments/chromium-command-line-switches/).

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
