# Media Devices Privacy

> Control how `navigator.mediaDevices.enumerateDevices()` reports audio and video devices with `--bot-media-devices`.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser** installed. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).

---

<a id="overview"></a>

## Overview

`navigator.mediaDevices.enumerateDevices()` returns a list of available audio and video input/output devices. The number, names, and IDs of these devices vary by system and can be used as a fingerprint signal. BotBrowser controls the device list to return consistent results regardless of the host machine's actual hardware.

---

<a id="quick-start"></a>

## Quick Start

```bash
# Default: use profile-defined device list (recommended)
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --user-data-dir="$(mktemp -d)"
```

By default, BotBrowser returns the profile's device list. No extra flags needed.

---

<a id="configuration"></a>

## Configuration

The `--bot-media-devices` flag controls device enumeration:

| Value | Behavior |
|-------|----------|
| `profile` (default) | Return profile-defined devices. The device list matches the target platform regardless of host hardware. |
| `real` | Use the host system's actual devices. Useful for development or when you need real audio/video capture. |

```bash
# Use profile devices (default)
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-media-devices=profile

# Use host system devices
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-media-devices=real
```

---

<a id="common-scenarios"></a>

## Common Scenarios

### Consistent device count across servers

Different servers have different audio hardware (or none). With `profile` mode, every instance reports the same device list:

```javascript
const browser = await chromium.launch({
    executablePath: process.env.BOTBROWSER_EXEC_PATH,
    headless: true,
    args: [
        "--bot-profile=/path/to/profile.enc",
    ],
});

const page = await browser.newPage();
const devices = await page.evaluate(async () => {
    const list = await navigator.mediaDevices.enumerateDevices();
    return list.map(d => ({ kind: d.kind, label: d.label }));
});
console.log(devices); // Same list on any host
await browser.close();
```

### Development with real devices

When testing audio/video capture locally, use `real` mode:

```bash
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-media-devices=real \
    --user-data-dir="$(mktemp -d)"
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Empty device list | Ensure the profile contains media device data. Most standard profiles include default device entries. |
| Need real microphone access | Set `--bot-media-devices=real` to expose host hardware. |
| Device IDs change between sessions | Device IDs are derived from the profile. Use the same profile for consistent IDs across sessions. |

---

<a id="next-steps"></a>

## Next Steps

- [Audio Fingerprint Protection](AUDIO.md). Control audio rendering and noise.
- [Navigator Properties](NAVIGATOR_PROPERTIES.md). Other navigator-level fingerprint surfaces.
- [`--bot-media-devices`](../../../CLI_FLAGS.md#flag-bot-media-devices). CLI values and availability.

---

**Related documentation:** [CLI Flags](../../../CLI_FLAGS.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
