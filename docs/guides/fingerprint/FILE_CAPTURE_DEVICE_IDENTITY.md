# File-Backed Capture Device Identity

> Keep camera and microphone identity consistent with the active profile when capture devices are supplied by a file or a fake device backend.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser** installed. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).
- A video fixture in **Y4M** (`.y4m`, I420) or **MJPEG** (`.mjpeg`) format if you drive capture from a file.

---

<a id="overview"></a>

## Overview

Sites that request a camera or microphone can read more than the video frames. They also read how the device describes itself: the track label, the device and group identifiers, the enumerated device list, the advertised capabilities, and the facing direction. When capture is supplied by a file instead of physical hardware, all of those descriptors are normally produced by the capture backend, so they reflect the backing implementation rather than the identity the profile claims.

BotBrowser aligns that identity layer with the profile's target platform. The page still receives the real frames from the file; only the identity descriptors follow the profile, so a session does not announce a different platform through its camera and microphone names than through the rest of its signals.

This applies to the identity layer only. Frame content, frame rate, and resolution come from the fixture and the capture path.

---

<a id="quick-start"></a>

## Quick Start

```bash
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --user-data-dir="$(mktemp -d)" \
    --use-fake-device-for-media-stream \
    --use-fake-ui-for-media-stream \
    --use-file-for-fake-video-capture="/path/to/fixture.y4m"
```

With these flags, `getUserMedia({ video: true })` receives the frames from the fixture while the reported camera identity follows the profile.

---

<a id="configuration"></a>

## Configuration

### The three capture flags

| Flag | Effect | Identity gate |
|------|--------|---------------|
| `--use-fake-device-for-media-stream` | Replaces the capture device set with the built-in fake/file backend. Physical devices are not enumerated in that process. | **Yes.** This is the only switch that enables profile-based naming. |
| `--use-file-for-fake-video-capture=<file>` | Selects the fixture file the fake backend plays. It only picks a parser inside the fake backend. | No. On its own it does not replace real devices. |
| `--use-fake-ui-for-media-stream` | Skips the permission prompt. | No. It does not affect device descriptors. |

Use `--use-fake-device-for-media-stream` as the single gate. Adding `--use-file-for-fake-video-capture` without it will not rename devices, and it will not replace the capture set.

### Supported formats

| Format | Status | Notes |
|--------|--------|-------|
| Y4M (`.y4m`) | Supported | I420 pixel format. |
| MJPEG (`.mjpeg`) | Supported | Parsed at a fixed frame rate. |
| MP4 and other containers | Not supported | The capture path only selects a parser from the file extension. Convert to Y4M or MJPEG first. |

### What follows the profile

When the fake device backend is active, the profile target platform drives the reported identity:

- `MediaStreamTrack.label` for camera and microphone tracks.
- `deviceId` and `groupId` reported by the track and by enumeration.
- `enumerateDevices()` entries for audio and video inputs.
- Advertised capabilities, including the value ranges reported for video tracks.
- Facing direction for mobile profile targets.

The same descriptors stay stable between repeated calls inside one browser context, so a second sample of the same track returns the same values.

### Keeping real devices intact

If you launch without `--use-fake-device-for-media-stream`, the capture set stays native: real hardware labels, identifiers, and capabilities pass through unchanged. This is the correct configuration when you need genuine device access rather than a fixture.

### Combining with device enumeration control

`--bot-media-devices` decides which device list `enumerateDevices()` reports, and `--use-fake-device-for-media-stream` decides whether capture is file-backed. They are independent:

```bash
# File-backed capture, profile-defined device identity
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-media-devices=profile \
    --use-fake-device-for-media-stream \
    --use-file-for-fake-video-capture="/path/to/fixture.y4m"
```

See [Media Devices Privacy](MEDIA_DEVICES.md) for the enumeration side.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Repeatable camera sessions without real hardware

Servers rarely have a camera. Supply a fixture and keep the profile's device identity:

```bash
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --use-fake-device-for-media-stream \
    --use-file-for-fake-video-capture="/path/to/fixture.mjpeg"
```

### Microphone identity alongside file-backed video

Audio input identity follows the same profile when the fake device backend is active, so a video fixture session does not report an unnamed or generic microphone. Launch with the fake device flag and request audio in the page as usual.

### Mobile profile targets

Mobile profile targets report a mobile-facing capture identity, including facing direction, so a mobile profile does not present a desktop-style camera description.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Device still shows a file path or generic name | Confirm `--use-fake-device-for-media-stream` is present. Without it the capture set stays native. |
| Video does not play at all | Check the file extension. Only `.y4m` and `.mjpeg` are accepted; other containers return no usable descriptor. |
| Need to change the video mid-session | Not supported. The source is bound at startup; restart the browser with a different fixture. |
| Need genuinely real camera and microphone | Drop the fake device flag. Real hardware then passes through unchanged. |
| Device names differ from the expected platform | Verify the profile's target platform and that the fake device flag is the only capture gate in use. |

---

<a id="next-steps"></a>

## Next Steps

- [Media Devices Privacy](MEDIA_DEVICES.md). Control device enumeration and count.
- [Audio Fingerprinting](AUDIO.md). Control the audio surface mode and audio noise.
- [`--bot-media-devices`](../../../CLI_FLAGS.md#flag-bot-media-devices). CLI values and availability.

---

**Related documentation:** [CLI Flags](../../../CLI_FLAGS.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [Media Devices Virtual Camera Privacy](https://botbrowser.io/en/blog/media-devices-virtual-camera-privacy/)
