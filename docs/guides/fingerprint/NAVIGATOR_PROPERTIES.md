# Navigator Properties Protection

> The `navigator` object is one of the most information-rich API surfaces in the browser. BotBrowser controls every property through its profile system to ensure internal consistency.

---

<a id="prerequisites"></a>

## Prerequisites

- Familiarity with [Browser Fingerprinting Explained](BROWSER_OVERVIEW.md).
- BotBrowser installed with a valid profile. See [Installation](../../../INSTALLATION.md).

---

<a id="overview"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

Start with this launch to establish a clean baseline before adding extra overrides.

## Overview

The `navigator` object is one of the most information-rich API surfaces in the browser. BotBrowser controls every `navigator` property through its profile system, ensuring internal consistency across JavaScript values, HTTP headers, and Worker contexts.

---

<a id="configuration"></a>

## Configuration

### Identity and Locale

```bash
# Browser brand (ENT Tier2)
--bot-config-browser-brand=chrome

# User-Agent version (ENT Tier2)
--bot-config-ua-full-version=146.0.7644.60

# Languages (ENT Tier1)
--bot-config-languages=en-US,en,de

# Locale (ENT Tier1)
--bot-config-locale=en-US

# Timezone (ENT Tier1)
--bot-config-timezone=America/New_York
```

### Custom User-Agent (ENT Tier3)

Build a complete, internally consistent browser identity:

```bash
--user-agent="Mozilla/5.0 (Linux; Android {platform-version}; {model}) ..."
--bot-config-platform=Android
--bot-config-platform-version=13
--bot-config-model=SM-G991B
--bot-config-architecture=arm
--bot-config-bitness=64
--bot-config-mobile=true
```

BotBrowser auto-generates matching Client Hints values (brands, fullVersionList with proper GREASE) and all corresponding HTTP headers. Values stay consistent across the main thread, workers, and HTTP requests.

### Media Devices

```bash
# Use profile-defined synthetic devices (default)
--bot-config-media-devices=profile

# Use real system devices
--bot-config-media-devices=real
```

<a id="network-information"></a>
### Network Information

Use one policy for JavaScript network information and corresponding Client Hints:

```bash
# Use all available profile values
--bot-network-info-override
--bot-network-info-override=profile

# Keep native Chromium values
--bot-network-info-override=false

# Override selected fields; omitted fields stay native
--bot-network-info-override='{"effectiveType":"3g","rtt":180,"downlink":1.8,"saveData":false}'

# Resolve each field from the profile, host, or an explicit value
--bot-network-info-override='{"type":"profile","effectiveType":"profile","rtt":"host","downlink":2.5,"downlinkMax":"host","saveData":"profile"}'
```

The bare flag, an empty value, `true`, and `profile` use every available value under the profile's network information. `false` keeps native Chromium behavior.

A JSON policy accepts these fields:

| Field | Custom value | Source selectors |
|-------|--------------|------------------|
| `type` | `wifi`, `cellular`, `ethernet`, `bluetooth`, `wimax`, `other`, `none`, `unknown` | `profile`, `host` |
| `effectiveType` | `slow-2g`, `2g`, `3g`, `4g` | `profile`, `host` |
| `rtt` | Non-negative integer in the supported range | `profile`, `host` |
| `downlink` | Non-negative number in the supported range | `profile`, `host` |
| `downlinkMax` | Non-negative number in the supported range | `profile`, `host` |
| `saveData` | `true`, `false` | `profile`, `host` |

Omitted fields remain native. Invalid JSON, unknown fields, invalid values, or a `profile` selector without the required profile field reject the complete policy. A custom or `host` policy can be used without a profile.

The CLI policy takes priority over `configs.networkInfoOverride`. The profile config remains a boolean setting: `true` selects profile values and `false` keeps native behavior.

The resolved policy is scoped to the active BrowserContext and remains consistent across pages, workers, navigation, and supported request headers. Set it before creating the first page in that context.

---

<a id="how-botbrowser-controls"></a>

## How BotBrowser Provides Protection

BotBrowser controls all navigator properties at the browser engine level. Identity, hardware, locale, network, and media device information are all defined by the profile. JavaScript values, HTTP headers, and Worker contexts return identical, internally consistent values.

---

<a id="troubleshooting"></a>

## Common Scenarios

- Capture a baseline result using the Quick Start setup.
- Change one relevant setting at a time and compare the new output.
- Keep your final launch command documented so future checks are reproducible.

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| navigator.webdriver returns true | Verify BotBrowser profile is loaded correctly. BotBrowser handles this automatically when a profile is active. |
| Language doesn't match proxy location | Use `--proxy-server` (not framework proxy) for auto-detection, or set `--bot-config-languages` manually. |
| UA-CH headers don't match JavaScript values | This should not happen with BotBrowser. Verify profile is loaded and no external extensions modify headers. |
| hardwareConcurrency shows host value | Ensure profile defines the CPU core count and is loaded correctly. |
| A custom network policy is rejected | Check the JSON syntax, field names, value types, and any `profile` selectors. The policy is applied atomically. |

---

<a id="next-steps"></a>

## Next Steps

- [Screen and Window Protection](SCREEN_WINDOW.md). Display properties as privacy surfaces.
- [Performance Fingerprinting](PERFORMANCE.md). Timing and connection data control.
- [Permission State Consistency](PERMISSIONS.md). Profile-backed permission behavior across launch and per-context workflows.
- [Speech Synthesis Protection](SPEECH_SYNTHESIS.md). Voice list consistency.
- [CLI Flags Reference](../../../CLI_FLAGS.md). All identity and locale configuration flags.

---

**Related documentation:** [Advanced Features: Browser & OS Fingerprinting](../../../ADVANCED_FEATURES.md#browser-os-fingerprinting) | [Advanced Features: Network Information Privacy](../../../ADVANCED_FEATURES.md#network-info-privacy)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
