# BotBrowser Profile Configuration Guide

For Fingerprint Protection and Privacy Research.

This guide explains BotBrowser's fingerprint-customization system that prevents tracking system fingerprint collection. Configure synthetic profiles and use dynamic CLI overrides for authorized privacy testing.

⚠️ **Usage Policy:** This configuration system is designed for fingerprint protection, privacy research, and authorized analysis only. Use in compliance with institutional policies and applicable laws.

> **CLI-First Configuration:** Use [`--bot-config-*` flags](../CLI_FLAGS.md#profile-configuration-override-flags) for runtime fingerprint control without editing encrypted profiles. These carry the highest priority.

> **Smart Configuration:** BotBrowser intelligently derives timezone, locale, and languages from proxy IP. Override only when your scenario requires it.

> **Data Privacy:** Profiles use synthetic/aggregated configurations to prevent tracking. BotBrowser does not enable fingerprint collection or tracking system data linkage. Use CLI overrides to keep profiles intact while customizing behavior.

## Table of Contents

- [Configuration Priority System](#configuration-priority-system)
- [Important: Profile Data Integrity](#important-profile-data-integrity)
- [How to Apply Configuration](#how-to-apply-configuration)
- [Configurable Fields](#configurable-fields)
- [Example Profile `configs` Block](#example-profile-configs-block)
- [Important Notes](#important-notes)
- [Best Practices](#best-practices)

---

## Configuration Priority System

BotBrowser uses a three-tier priority system for configuration:

### Priority Order (Highest to Lowest)

1. **CLI `--bot-config-*` flags** - Highest priority, overrides everything
2. **Profile `configs` settings** - Medium priority, overrides profile defaults
3. **Profile default values** - Lowest priority, built-in profile data

### Why CLI Flags Are Recommended

- **Highest Priority:** Always takes precedence over profile settings
- **No Profile Editing:** Avoid modifying complex encrypted profile files
- **Dynamic Configuration:** Perfect for testing and different environments
- **Session Isolation:** Different settings per browser instance without conflicts

**Example:**
```bash
# Use CLI flags to override profile settings dynamically (timezone/locale auto-detected)
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --bot-config-browser-brand="edge" \  # ENT Tier2 feature
  --bot-config-brand-full-version="142.0.3595.65"  # ENT Tier2 feature
```

> **Complete CLI flags reference:** [CLI Flags Reference](../CLI_FLAGS.md#profile-configuration-override-flags)

---

## Important: Profile Data Integrity

Profile data uses synthetic/aggregated configurations. Unless you are certain about the impact, avoid overriding fingerprint properties because defaults provide the most protected behavior.

## How to Apply Configuration

All configurations are embedded in the `configs` field inside your profile JSON structure.

### File-Based Configuration Only

> Important: BotBrowser only accepts profile input as a file. Shell piping (e.g., `--bot-profile=<(echo '{"x": 1}')`) is not supported due to CLI argument length and file-descriptor limits.

**Best Practice:**

1. Build your profile JSON dynamically in your code
2. Write it to a temporary file (e.g., `/tmp/myprofile.json`)
3. Pass the path to `--bot-profile`
4. Delete the file afterward if needed


---

## Configurable Fields

### General Settings

| Field                           | Description                                                                               | Default     |
| ------------------------------- | ----------------------------------------------------------------------------------------- | ----------- |
| `languages`                     | HTTP `Accept-Language` header values and `navigator.languages`. `auto` = IP-based (default). Custom values (ENT Tier1). | `auto`    |
| `locale`                        | Browser locale (e.g., en-US, fr-FR, de-DE). `auto` = derived from IP/language (default). Custom values (ENT Tier1). | `auto`    |
| `uaFullVersion` (ENT Tier2)   | Overrides the full browser version returned by `navigator.userAgentData.fullVersion`; must match the Chromium major version (e.g. for major version 138, the full version must start with "138."). | `""`        |
| `colorScheme`                   | Preferred color scheme: light or dark.                                            | `light`   |
| `disableDeviceScaleFactorOnGUI` | If `true`, ignore device scale factor for GUI elements (disable DPI-based UI scaling).    | `false`     |
| `disableConsoleMessage` (ENT Tier1)        | Suppresses console message forwarding into page contexts and CDP logs to prevent CDP log noise from leaking. | `true`     |
| `timezone`                      | `auto` = IP-based (default); `real` = system timezone; custom timezone name (ENT Tier1). | `auto`    |
| `location`                      | `auto` = IP-based (default); `real` = system GPS; custom coordinates (ENT Tier1). | `auto`    |
| `browserBrand` (ENT Tier2, webview requires ENT Tier3)    | Override for browser identity fields. Supports chromium, chrome, edge, brave, opera, webview. WebKit-family identities are delivered through ENT Tier4 premium profiles. | `chrome`    |
| `brandFullVersion` (ENT Tier2)| Optional brand-specific full version string for UA-CH tuples (Edge/Opera cadences). | `""`    |
| `injectRandomHistory` (PRO feature) | Adds synthetic navigation history for session authenticity. Accepts `true` (random 2-7 entries), a number for precise control (e.g., `15` for `history.length` of 16), or `false` to disable. | `false`    |
| `enableVariationsInContext` (ENT Tier2) | Include `X-Client-Data` headers in incognito browser contexts for Google domains, same as regular browsing. | `false`    |
| `disableDebugger`               | Prevents unintended interruptions from JavaScript debugger statements during fingerprint protection workflows. | `true`     |
| `keyboard`                      | Choose keyboard fingerprint source: `profile` (emulated from profile) or `real` (use system keyboard). | `profile` |
| `mediaTypes`                    | Media types behavior: `expand` (prefer local decoders), `profile` (profile-defined list), `real` (native system). | `expand` |
| `alwaysActive` (PRO feature)    | Keep windows/tabs in an [active state](../ADVANCED_FEATURES.md#active-window-emulation) to suppress `blur`/`visibilitychange` events and `document.hidden=true`. | `true` |
| `webrtcICE` (ENT Tier1)       | ICE server preset (`google`) or custom list via `custom:stun:host:port,turn:host:port`. See [WebRTC Leak Protection](../ADVANCED_FEATURES.md#webrtc-leak-protection). | `google` |
| `mobileForceTouch`              | Force touch events on/off when simulating mobile devices (`true`, `false`).          | `false`    |
| `portProtection` (PRO)         | Protect local service ports (VNC, RDP, etc.) from being scanned. Prevents remote pages from detecting which services are running on localhost. See [Port Protection](../ADVANCED_FEATURES.md#port-protection). Also available via CLI [`--bot-port-protection`](../CLI_FLAGS.md#--bot-port-protection-pro). | `false`    |

### Custom User-Agent (ENT Tier3)

Full control over User-Agent string and userAgentData for building any browser identity.

| Field                           | Description                                                                               | Default     |
| ------------------------------- | ----------------------------------------------------------------------------------------- | ----------- |
| `platform`                      | Platform name for userAgentData: Windows, Android, macOS, Linux.                         | from profile |
| `platformVersion`               | OS version string for userAgentData (e.g., 13, 10.0, 14.0).                              | from profile |
| `model`                         | Device model for mobile userAgentData (e.g., RMX3471, SM-G991B).                         | from profile |
| `architecture`                  | CPU architecture for userAgentData: x86, arm, arm64.                                     | from profile |
| `bitness`                       | System bitness for userAgentData: 32, 64.                                                | from profile |
| `mobile`                        | Mobile device flag for userAgentData: true, false.                                       | from profile |

These fields work together with `--user-agent` CLI flag. BotBrowser auto-generates matching `navigator.userAgentData` (brands, fullVersionList with GREASE) and all Sec-CH-UA-* headers. Values stay consistent across main thread, workers, and HTTP requests.

### WebKit-Family Profile Consistency (ENT Tier4)

WebKit-family profile bundles are provided as premium `.enc` profiles. Use those profiles as the source of truth for browser-family identity consistency, including runtime behavior, CSS behavior, media capability behavior, navigation headers, TLS behavior, and HTTP/2 behavior.

Do not assemble WebKit-family behavior from standalone profile fields. Use the provided premium profile and reserve CLI overrides for session-specific values such as proxy, locale, user data directory, and operational routing.

### Proxy Settings

| Field            | Description                               | Default |
| ---------------- | ----------------------------------------- | ------- |
| `proxy.server`   | Proxy server address (`scheme://username:password@hostname:port`).   | `""`    |
| `proxy.ip`       | Proxy's public IP address (skips IP lookups for better performance). | `""`    |

> **Better Approach:** Use CLI flags for proxy configuration:
> ```bash
> # Embedded credentials (recommended)
> --proxy-server=http://username:password@proxy.example.com:8080
> # SOCKS5H for tunnel-based hostname resolution
> --proxy-server=socks5h://username:password@proxy.example.com:1080
> ```
>
> **For complete CLI flags documentation**, see [CLI Flags Reference](../CLI_FLAGS.md#profile-configuration-override-flags)

⚠️ **Important:** When using frameworks (Puppeteer/Playwright), always use CLI flags like `--proxy-server` instead of framework-specific proxy options (like `page.authenticate()` or `proxy` parameter in `launch()`). This ensures BotBrowser can retrieve geo information from proxy IP for accurate timezone/locale configuration.

⚠️ **Proxy configurations are intended for authorized networks only. They must not be used for unauthorized data collection or abuse.**

> **[UDP-over-SOCKS5](../CLI_FLAGS.md#udp-over-socks5-ent-tier3):** ENT Tier3 support detects when a SOCKS5 upstream offers UDP associate and natively tunnels QUIC/STUN through it. No additional flag is required; simply provide a SOCKS5 proxy that advertises UDP support.

### HTTP Request Settings

| Field            | Description                               | Default |
| ---------------- | ----------------------------------------- | ------- |
| `customHeaders` (PRO) | Inject custom HTTP request headers into all outgoing requests. Object with header name-value pairs (e.g., `{"X-Custom":"value"}`). See [`--bot-custom-headers`](../CLI_FLAGS.md#--bot-custom-headers-pro). | `{}`    |

### Window & Screen Settings

| Field    | Description                                                                                              | Default     |
| -------- | -------------------------------------------------------------------------------------------------------- | ----------- |
| `window` | `profile` = use profile's dimensions; `real` = use system window size; object = custom dims. Headless and Android profiles default to `profile`; desktop headful defaults to `real`. | `profile` / `real` |
| `screen` | `profile` = use profile's screen metrics; `real` = use system screen metrics; object = custom metrics. Headless and Android profiles default to `profile`; desktop headful defaults to `real`. | `profile` / `real` |

### Engine & Device Simulation

| Field          | Description                                                                              | Default     |
| -------------- | ---------------------------------------------------------------------------------------- | ----------- |
| `webrtc`       | `profile` = profile's WebRTC config;`real` = native WebRTC;`disabled` = no WebRTC. | `profile` |
| `fonts`        | `profile` = profile's embedded font list;`expand` = profile list plus supplemental system fonts;`real` = system-installed fonts. | `profile` |
| `webgl`        | `profile` = profile's WebGL parameters;`real` = system WebGL;`disabled` = off.     | `profile` |
| `webgpu`       | Same semantics as `webgl`.                                                               | `profile` |
| `mediaDevices` | `profile` = synthetic camera/mic devices;`real` = actual system devices.                  | `profile` |
| `speechVoices` | `profile` = profile's TTS voices;`real` = system voices.                             | `profile` |

### Noise Toggles

| Field               | Description                             | Default |
| ------------------- | --------------------------------------- | ------- |
| `noiseCanvas`       | Introduce controlled variance to Canvas for fingerprint protection. | `true`  |
| `noiseWebglImage`   | Introduce controlled variance to WebGL for fingerprint protection.   | `true`  |
| `noiseAudioContext` | Introduce controlled variance to AudioContext for fingerprint protection.  | `true`  |
| `noiseClientRects`  | Introduce controlled variance to client rects for fingerprint protection.  | `false` |
| `noiseTextRects`    | Introduce controlled variance to TextRects for fingerprint protection.     | `true`  |

### Timing & Deterministic Noise Controls

| Field | Description | Default |
| ----- | ----------- | ------- |
| `fps` (ENT Tier2 feature) | Control frame rate behavior: `profile` (use profile data, default when capable), `real` (use native frame rate), or a number (e.g., `60`). | `profile` |
| `timeScale` (ENT Tier2 feature) | Fractional scalar applied to `performance.now()` deltas to emulate lower CPU load and shorten observable intervals. Valid range `0 < value < 1`. | `1.0` |
| `noiseSeed` (ENT Tier2 feature) | Integer seed (1–UINT32_MAX) that deterministically shapes the noise applied to Canvas 2D/WebGL/WebGPU images, text metrics, HarfBuzz layout, ClientRects, and offline audio hashes so you can assign reproducible yet distinct fingerprints per tenant. `0` keeps noise active with profile defaults. | `auto` |
| `timeSeed` (ENT Tier2 feature) | Integer seed (1–UINT32_MAX) for deterministic execution timing diversity across 27 browser operations (Canvas, WebGL, Audio, Font, DOM, etc.). `0` disables the feature. Each seed produces a unique, stable performance profile that protects against timing-based tracking. See [Performance Timing Protection](../ADVANCED_FEATURES.md#performance-timing-protection). | `0` (disabled) |
| `stackSeed` (ENT Tier2 feature) | Controls JavaScript recursive call stack depth across main thread, Worker, and WASM contexts. Accepts `profile` (match profile's exact depth), `real` (use native depth), or a positive integer seed (1–UINT32_MAX) for per-session depth variation. See [Stack Depth Control](../ADVANCED_FEATURES.md#stack-depth-control). | `real` |
| `networkInfoOverride` | Enable profile-defined `navigator.connection` values (`rtt`, `downlink`, `effectiveType`, `saveData`) and corresponding Client Hints headers. | `false` |

---

## Example Profile `configs` Block

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
      "ip": "1.2.3.4"
    },

    // Disable GUI scaling based on device scale factor (ignore DevicePixelRatio for UI scaling)
    "disableDeviceScaleFactorOnGUI": false,

    // timezone: 'auto' = based on IP; 'real' = system timezone; any other string = custom
    "timezone": "auto",

    // location: 'auto' = based on IP; 'real' = system (GPS) location;
    // object = custom coordinates
    "location": "auto", // or "real" or { latitude: 48.8566, longitude: 2.3522 }

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

    // WebRTC ICE servers: 'google' preset or 'custom:stun:...,turn:...'
    "webrtcICE": "google",

    // Keep the window active even when unfocused (suppresses blur/visibilitychange)
    "alwaysActive": true,

    // Fonts: 'profile' = profile’s embedded list; 'expand' = fill gaps with system fonts; 'real' = system-installed fonts
    "fonts": "profile",

    // WebGL: 'profile' = profile’s parameters; 'real' = system implementation; 'disabled' = off
    "webgl": "profile",

    // WebGPU: same semantics as WebGL
    "webgpu": "profile",

    // Media devices: 'profile' = synthetic camera/mic devices; 'real' = actual system devices
    "mediaDevices": "profile",

    // Media types: 'expand' = prefer local decoders; switch to 'profile' for legacy behavior
    "mediaTypes": "expand",

    // Speech voices: 'profile' = profile’s synthetic voices; 'real' = system voices
    "speechVoices": "profile",

    // noiseCanvas: Introduce controlled variance to Canvas for fingerprint protection
    "noiseCanvas": true,

    // noiseWebglImage: Introduce controlled variance to WebGL for fingerprint protection
    "noiseWebglImage": true,

    // noiseAudioContext: Introduce controlled variance to AudioContext for fingerprint protection
    "noiseAudioContext": true,

    // noiseClientRects: Introduce controlled variance to client rects for fingerprint protection
    "noiseClientRects": false,

    // noiseTextRects: Introduce controlled variance to TextRects for fingerprint protection
    "noiseTextRects": true,

    // browserBrand: override for browser identity fields. Supports "chromium", "chrome", "edge", "brave", "opera", and "webview" (ENT Tier3). WebKit-family identities use ENT Tier4 premium profiles.
    "browserBrand": "chrome",

    // brandFullVersion: optional brand-specific full version string for UA-CH tuples when the vendor's cadence diverges
    "brandFullVersion": "142.0.3595.65",

    // injectRandomHistory: Adds synthetic navigation history for session authenticity
    // Accepts true (random 2-7 entries), a number (e.g. 15), or false
    "injectRandomHistory": false,

    // enableVariationsInContext (ENT Tier2): Include X-Client-Data headers in incognito contexts for Google domains
    "enableVariationsInContext": false,

    // disableDebugger: Prevents unintended interruptions from JavaScript debugger statements during fingerprint protection workflows
    "disableDebugger": true,

    // disableConsoleMessage: Suppress console.* output forwarded through CDP logging
    "disableConsoleMessage": true,

    // keyboard: choose keyboard fingerprint source: "profile" (emulated from profile) or "real" (use system keyboard)
    "keyboard": "profile",

    // mobileForceTouch: Force touch events on/off when simulating mobile devices
    "mobileForceTouch": false,

    // portProtection (PRO): Protect local service ports (VNC, RDP, etc.) from being scanned
    "portProtection": false,

    // customHeaders (PRO): inject custom HTTP headers into all outgoing requests
    "customHeaders": {
      "X-Custom-Header": "value"
    },

    // timeSeed (ENT Tier2): deterministic execution timing diversity
    "timeSeed": 42,

    // stackSeed (ENT Tier2): "profile", "real", or positive integer seed
    "stackSeed": "profile",

    // networkInfoOverride: use profile-defined navigator.connection values
    "networkInfoOverride": true,

    // fps (ENT Tier2): frame rate control: "profile", "real", or a number (e.g., 60)
    "fps": "profile"
  }
}


```

⚠️ Open the `.enc` file and place the `configs` block before the `key` block, keeping the entire file in JSON format:

<img width="758" alt="image" src="https://github.com/user-attachments/assets/e34b1557-d7cd-4257-b709-b76ec1b0409b" />

---

⚠️ Your modified `.enc` profile should have this structure:

```json5
{
  "configs": {
    // ...
  },
  "key": {
    // ...
  },
  "version": {
    // ...
  },
  "profile": {
    // ...
  }
}
```



---

## Important Notes

### Configuration Behavior
- Profile data uses synthetic/aggregated configurations; change only if necessary and you understand the impact.
- All string fields support multi-purpose values: string literal (`auto`, `real`, or custom), or object schema when more parameters are needed.
- If a field is omitted, BotBrowser uses profile defaults where appropriate.
- CLI `--bot-config-*` flags override profile `configs` with the highest priority
- **uaFullVersion Tip:** When JavaScript calls `navigator.userAgentData.fullVersion`, BotBrowser replaces the default value with this field. Ensure the full version matches the Chromium major version (e.g., Chromium 138 → full version starts with “138.”). See https://chromiumdash.appspot.com/releases.
- **brandFullVersion Tip:** Pair this with `browserBrand` when matching Edge/Opera/Brave cadences so UA-CH tuples expose the vendor's own full-version token instead of the Chromium one.

---

## Best Practices

Related guides: [Profile Management](https://botbrowser.io/docs/getting-started/profile-management/), [Browser Brand Alignment](https://botbrowser.io/docs/identity/browser-brand-alignment/), [Noise Seed Reproducibility](https://botbrowser.io/docs/fingerprint/noise-seed-reproducibility/), [Proxy Configuration](https://botbrowser.io/docs/network/proxy-configuration/)

### Fingerprint Protection
- **Screen coordination:** Always adjust **window size** and **screen size** together to avoid suspicious fingerprint gaps
- **Geographic alignment:** Match `timezone` and `location` to your proxy's region to avoid fingerprint vulnerabilities
- **Display accuracy:** Set a realistic **devicePixelRatio** based on the system being emulated:
  - `2` for macOS Retina displays
  - `1` for standard monitors
  - `1.5` for some high-DPI Windows displays

### Connection Security
- **Proxy authentication:** Always define proxy credentials if using authenticated proxies to avoid connection leaks
- **Protocol parity:** Ensure proxy protocol matches your network requirements

### File Management
- **Dynamic generation:** If you're generating a profile in code, **save it as a temporary file** (e.g., `/tmp/myprofile.json`) and pass the file path via `--bot-profile`
- **Avoid piping:** Never pipe large JSON blobs via `echo`, as this is unsupported and unstable

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
