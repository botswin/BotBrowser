# DRM Fingerprint Consistency

> DRM capabilities expose platform identity. BotBrowser applies the profile's DRM policy to supported EME queries.

---

<a id="overview"></a>

## Overview

Digital Rights Management (DRM) capabilities vary by platform. The Encrypted Media Extensions (EME) API reports different configurations, robustness levels, and key systems by operating system. BotBrowser applies the profile's DRM policy to supported EME responses.

---

<a id="configuration"></a>

## Configuration

DRM behavior is controlled through the profile. The profile defines supported key systems, robustness levels, session types, and codec support in DRM contexts.

For Widevine CDM setup, playback configuration, and platform-specific details, see the [Widevine DRM Setup Guide](../platform/WIDEVINE_DRM_SETUP.md).

---

<a id="next-steps"></a>

## Next Steps

- [Widevine DRM Setup](../platform/WIDEVINE_DRM_SETUP.md). Complete guide to CDM installation and DRM playback.
- [MIME Codec Fingerprinting](MIME_CODEC.md). How codec support intersects with DRM capabilities.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [DRM fingerprinting and EME queries](https://botbrowser.io/en/blog/drm-fingerprinting/)
