# MIME Type and Codec Fingerprinting

> Media format support varies by platform and configuration. BotBrowser normalizes codec responses to protect platform identity.

---

## Prerequisites

- **BotBrowser** installed. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).


<a id="overview"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

Start with this launch to establish a clean baseline before adding extra overrides.

## Overview

Every browser reports which media formats it can play. The combination of supported MIME types and codecs varies by operating system, installed libraries, hardware decoders, and browser build configuration. BotBrowser normalizes these responses at the browser engine level so that reported media capabilities match the loaded profile's platform identity.

---

<a id="botbrowser-solution"></a>

## How BotBrowser Normalizes Codec Responses

BotBrowser controls MIME type and codec responses at the browser engine level to ensure they match the target profile's platform identity.

Profile-backed media capability checks preserve codec spelling and support ordering across browser contexts. Use the profile policy when validating WebCodecs or HEVC capability behavior.

### Configuration

The default configuration uses `expand` mode, which prioritizes local decoders while extending the list with profile-defined types. This can be configured via the `--bot-media-types` flag:

```bash
# expand (default): profile types + local decoders
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-media-types=expand

# profile: use only profile-defined media types
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-media-types=profile

# real: use actual system media types
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-media-types=real
```

All media type and codec query APIs return platform-consistent results matching the profile. Responses remain identical across all execution contexts (main page, Workers, Service Workers, iframes).

For video-heavy workloads, media capability reporting and actual video playback cadence can be controlled separately with [`--bot-video-fps`](../../../CLI_FLAGS.md#flag-bot-video-fps). See [FPS Control](FPS_CONTROL.md#video-fps-control).

---

<a id="related-docs"></a>

## Common Scenarios

- Capture a baseline result using the Quick Start setup.
- Change one relevant setting at a time and compare the new output.
- Keep your final launch command documented so future checks are reproducible.

## Troubleshooting / FAQ

| Problem | Solution |
|---|---|
| Observed value does not match the profile expectation | Verify profile path, active overrides, and any framework-injected settings. |
| Same setup behaves differently on another machine | Compare BotBrowser build, profile version, host OS target, and full launch args. |
| Test results fluctuate between runs | Keep proxy, locale/timezone, and runtime load stable during comparison tests. |

## Next Steps

- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.
- [FPS Control](FPS_CONTROL.md#video-fps-control). Video playback cadence control for media-heavy sessions.
- [DRM Fingerprinting](DRM.md). How DRM capabilities interact with codec reporting.

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
