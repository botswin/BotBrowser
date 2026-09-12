# BotBrowser Profile Configuration

This is the field reference for configurable subscription profile packages. Profile package authoring requires ENT Tier1; individual fields keep the availability listed below. Public legacy `.enc` files are read-only. For per-session changes, use the [CLI Flag Directory](../CLI_FLAGS.md#flag-directory).

## Table of Contents

- [Configuration Priority](#configuration-priority-system)
- [Apply Configuration](#how-to-apply-configuration)
- [Configurable Fields](#configurable-fields)
- [Example](#example-profile-configs-block)
- [Notes](#important-notes)

---

<a id="configuration-priority-system"></a>
## Configuration Priority

1. CLI flags
2. Profile `configs`
3. Profile defaults

CLI flags have the highest priority. Keep profile defaults unless a persistent override is required.

<a id="important-profile-data-integrity"></a>
<a id="how-to-apply-configuration"></a>
<a id="file-based-configuration-only"></a>
## Apply Configuration

When a supplied profile package permits configuration, place `configs` before the `key` block:

```json5
{
  "configs": {
    "locale": "auto"
  },
  "key": { /* ... */ },
  "version": { /* ... */ },
  "profile": { /* ... */ }
}
```

Do not modify public legacy `.enc` files. BotBrowser accepts profile input from a file; shell process substitution and piped JSON are not supported. Use an absolute path when launching with `--bot-profile`.

---

<a id="configurable-fields"></a>
## Configurable Fields

Availability applies to custom values or behavior where noted. `Core` fields are available with the base profile capability.

<a id="general-settings"></a>
### Identity and Locale

| Field | Values | Default |
|-------|--------|---------|
| [`languages`](../CLI_FLAGS.md#flag-bot-languages) | `auto`, or a language list such as `en-US,en` (ENT Tier1 custom) | `auto` |
| [`locale`](../CLI_FLAGS.md#flag-bot-locale) | `auto`, or a locale such as `en-US` (ENT Tier1 custom) | `auto` |
| [`timezone`](../CLI_FLAGS.md#flag-bot-timezone) | `auto`, `real`, or an IANA timezone (ENT Tier1 custom) | `auto` |
| [`location`](../CLI_FLAGS.md#flag-bot-location) | `auto`, `real`, or coordinates (ENT Tier1 custom) | `auto` |
| [`browserBrand`](../CLI_FLAGS.md#flag-bot-browser-brand) | `chromium`, `chrome`, `edge`, `brave`, `opera` (ENT Tier2); `webview` (ENT Tier3) | `chrome` |
| [`brandFullVersion`](../CLI_FLAGS.md#flag-bot-brand-full-version) | Browser-family full version (ENT Tier2) | Empty |
| [`uaFullVersion`](../CLI_FLAGS.md#flag-bot-ua-full-version) | Chromium full version matching the active major (ENT Tier2) | Empty |
| [`colorScheme`](../CLI_FLAGS.md#flag-bot-color-scheme) | `light`, `dark` | `light` |
| [`disableDeviceScaleFactorOnGUI`](../CLI_FLAGS.md#flag-bot-disable-device-scale-factor) | `true`, `false` | `false` |

Timezone, locale, and languages derive from the proxy IP when set to `auto`.

### Session and Behavior

| Field | Values | Default |
|-------|--------|---------|
| [`disableConsoleMessage`](../CLI_FLAGS.md#flag-bot-disable-console-message) | `true`, `false` (ENT Tier1) | `true` |
| [`injectRandomHistory`](../CLI_FLAGS.md#flag-bot-inject-random-history) | `true`, `false`, or a history count (PRO) | `false` |
| [`enableVariationsInContext`](../CLI_FLAGS.md#flag-bot-enable-variations-in-context) | `true`, `false` (ENT Tier2) | `false` |
| [`disableDebugger`](../CLI_FLAGS.md#flag-bot-disable-debugger) | `true`, `false` | `true` |
| [`keyboard`](../CLI_FLAGS.md#flag-bot-keyboard) | `profile`, `real` | `profile` |
| [`alwaysActive`](../CLI_FLAGS.md#flag-bot-always-active) | `true`, `false` (PRO) | `true` |
| [`mobileForceTouch`](../CLI_FLAGS.md#flag-bot-mobile-force-touch) | `true`, `false` | `false` |
| [`portProtection`](../CLI_FLAGS.md#flag-bot-port-protection) | `true`, `false` (PRO) | `false` |

<a id="proxy-settings"></a>
<a id="http-request-settings"></a>
### Proxy and Requests

| Field | Values | Default |
|-------|--------|---------|
| [`proxy.server`](../CLI_FLAGS.md#flag-proxy-server) | `scheme://username:password@hostname:port` | Empty |
| [`proxy.ip`](../CLI_FLAGS.md#flag-proxy-ip) | Proxy public IP (ENT Tier1) | Empty |
| [`webrtcICE`](../CLI_FLAGS.md#flag-bot-webrtc-ice) | `google`, or `custom:stun:...,turn:...` (ENT Tier1) | `google` |
| [`customHeaders`](../CLI_FLAGS.md#flag-bot-custom-headers) | Header object (PRO) | `{}` |

Use `--proxy-server` for per-session proxy credentials. For SOCKS5 UDP and QUIC behavior, see [UDP over SOCKS5](../docs/guides/network/UDP_OVER_SOCKS5.md).

<a id="window--screen-settings"></a>
### Window and Screen

| Field | Values | Default |
|-------|--------|---------|
| [`window`](../CLI_FLAGS.md#flag-bot-window) | `profile`, `real`, `WxH`, or a window object | Mode-dependent |
| [`screen`](../CLI_FLAGS.md#flag-bot-screen) | `profile`, `real`, `WxH`, or a screen object | Mode-dependent |

Headless and mobile profiles default to profile-backed dimensions. Desktop headful sessions default to real dimensions. Configure `window` and `screen` together when overriding either value.

For display-scale policy, use [`--bot-dpr`](../CLI_FLAGS.md#flag-bot-dpr) at launch or when creating a browser context. It overrides the profile's DPR policy; do not add a `dpr` field to `configs`. See [Device Pixel Ratio Policy](../docs/guides/fingerprint/DEVICE_PIXEL_RATIO.md).

<a id="engine--device-simulation"></a>
### Rendering and Media

| Field | Values | Default |
|-------|--------|---------|
| [`webrtc`](../CLI_FLAGS.md#flag-bot-webrtc) | `profile`, `real`, `disabled` | `profile` |
| [`fonts`](../CLI_FLAGS.md#flag-bot-fonts) | `profile`, `expand`, `real` | `profile` |
| [`webgl`](../CLI_FLAGS.md#flag-bot-webgl) | `profile`, `real`, `disabled` | `profile` |
| [`webgpu`](../CLI_FLAGS.md#flag-bot-webgpu) | `profile`, `real`, `disabled` | `profile` |
| [`mediaDevices`](../CLI_FLAGS.md#flag-bot-media-devices) | `profile`, `real` | `profile` |
| [`speechVoices`](../CLI_FLAGS.md#flag-bot-speech-voices) | `profile`, `real` | `profile` |
| [`mediaTypes`](../CLI_FLAGS.md#flag-bot-media-types) | `expand`, `profile`, `real` | `expand` |

<a id="noise-toggles"></a>
<a id="timing--deterministic-noise-controls"></a>
### Noise and Performance

| Field | Values | Default |
|-------|--------|---------|
| [`noiseCanvas`](../CLI_FLAGS.md#flag-bot-noise-canvas) | `true`, `false` | `true` |
| [`noiseWebglImage`](../CLI_FLAGS.md#flag-bot-noise-webgl-image) | `true`, `false` | `true` |
| [`noiseAudioContext`](../CLI_FLAGS.md#flag-bot-noise-audio-context) | `true`, `false` | `true` |
| [`noiseClientRects`](../CLI_FLAGS.md#flag-bot-noise-client-rects) | `true`, `false` | `false` |
| [`noiseTextRects`](../CLI_FLAGS.md#flag-bot-noise-text-rects) | `true`, `false` | `false` |
| [`fps`](../CLI_FLAGS.md#flag-bot-fps) | `profile`, `real`, or a number (ENT Tier2) | `profile` |
| [`timeScale`](../CLI_FLAGS.md#flag-bot-time-scale) | `1.0`, or a number greater than `0` and below `1` (ENT Tier2) | `1.0` |
| [`noiseSeed`](../CLI_FLAGS.md#flag-bot-noise-seed) | `0`, or an integer from 1 to UINT32_MAX (ENT Tier2) | Profile default |
| [`timeSeed`](../CLI_FLAGS.md#flag-bot-time-seed) | `0`, or an integer from 1 to UINT32_MAX (ENT Tier2) | `0` |
| [`stackSeed`](../CLI_FLAGS.md#flag-bot-stack-seed) | `profile`, `real`, or a positive integer (ENT Tier2) | `real` |
| [`networkInfoOverride`](../CLI_FLAGS.md#flag-bot-network-info-override) | `true`, `false`, `profile`, or JSON policy | `false` |

For a custom policy, use a JSON string so the profile remains valid JSON:

```json
{
  "configs": {
    "networkInfoOverride": "{\"type\":\"profile\",\"rtt\":\"host\",\"downlink\":2.5}"
  }
}
```

Video playback cadence is a CLI-only policy. See [`--bot-video-fps`](../CLI_FLAGS.md#flag-bot-video-fps). JavaScript heap and storage quota policies are also configured at runtime through [`--bot-js-heap-size-limit`](../CLI_FLAGS.md#flag-bot-js-heap-size-limit) and [`--bot-storage-quota`](../CLI_FLAGS.md#flag-bot-storage-quota).

<a id="custom-user-agent-ent-tier3"></a>
### Custom User-Agent (ENT Tier3)

Use these fields together with a `--user-agent` template:

| Field | Values | Default |
|-------|--------|---------|
| [`platform`](../CLI_FLAGS.md#flag-bot-platform) | `Windows`, `Android`, `macOS`, `Linux` | Profile value |
| [`platformVersion`](../CLI_FLAGS.md#flag-bot-platform-version) | OS version | Profile value |
| [`model`](../CLI_FLAGS.md#flag-bot-model) | Device model | Profile value |
| [`architecture`](../CLI_FLAGS.md#flag-bot-architecture) | `x86`, `arm`, `arm64` | Profile value |
| [`bitness`](../CLI_FLAGS.md#flag-bot-bitness) | `32`, `64` | Profile value |
| [`mobile`](../CLI_FLAGS.md#flag-bot-mobile) | `true`, `false` | Profile value |

The browser keeps the User-Agent string, Client Hints, main thread, workers, and request headers aligned with these values.

<a id="webkit-family-profile-consistency-ent-tier4"></a>
### WebKit-Family Profiles (ENT Tier4)

Use the supplied premium profile as the source of browser-family identity. Do not assemble WebKit-family behavior from standalone `configs` fields. Limit overrides to session-specific values such as proxy, locale, and routing. See [WebKit-Family Profile Consistency](../WEBKIT_PROFILE_CONSISTENCY.md).

---

<a id="example-profile-configs-block"></a>
## Example Profile `configs` Block

```json5
{
  "configs": {
    "languages": "auto",
    "locale": "auto",
    "timezone": "auto",
    "location": "auto",
    "colorScheme": "light",
    "proxy": {
      "server": "socks5://username:password@proxy.example.com:1080",
      "ip": "203.0.113.1"
    },
    "window": "profile",
    "screen": "profile",
    "webrtc": "profile",
    "fonts": "profile",
    "webgl": "profile",
    "webgpu": "profile",
    "mediaTypes": "expand",
    "noiseCanvas": true,
    "noiseWebglImage": true,
    "noiseAudioContext": true
  },
  "key": { /* ... */ },
  "version": { /* ... */ },
  "profile": { /* ... */ }
}
```

<a id="important-notes"></a>
<a id="best-practices"></a>
## Notes

- The profile package and BotBrowser binary must use the same major version.
- CLI flags override profile `configs`.
- Omitted fields keep the profile default.
- Keep browser-family and version values aligned with the active profile and Chromium major.
- Use `auto` for geographic fields unless the session requires an explicit value.
- Keep proxy credentials outside shared profile packages when they vary by session.

## Related Documentation

- [CLI Flag Directory](../CLI_FLAGS.md#flag-directory)
- [Profile Management](../docs/guides/getting-started/PROFILE_MANAGEMENT.md)
- [Proxy Configuration](../docs/guides/network/PROXY_CONFIGURATION.md)
- [Timezone, Locale, and Language](../docs/guides/identity/TIMEZONE_LOCALE_LANGUAGE.md)
- [Screen and Window](../docs/guides/fingerprint/SCREEN_WINDOW.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
