# Speech Synthesis Protection

> The SpeechSynthesis API exposes platform identity through voice enumeration. BotBrowser controls voice lists to maintain consistent identity across sessions.

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

## Overview

The speech synthesis voice list varies by operating system, browser build, and installed language packs, making it a privacy-relevant surface. BotBrowser controls voice enumeration at the browser engine level to ensure consistent platform identity.

---

<a id="configuration"></a>

## Configuration

### Speech Voices Mode

Control voice list behavior with `--bot-speech-voices`:

```bash
# Use profile-defined synthetic voice list (default)
--bot-speech-voices=profile

# Use real system voices (no protection)
--bot-speech-voices=real
```

When set to `profile`, BotBrowser returns a voice list based on the profile's declared platform and browser brand.

Voice selection and ordering remain consistent when a profile targets a different host platform. Locale-specific voices are selected from the profile policy before the browser exposes the list to page content.

For Android profiles, the short voice-load delay starts when page code first uses the speech API. The list does not wait for a host speech engine response, so pages that poll immediately after `getVoices()` still receive the complete profile list.

When the selected voice cannot be served directly, playback uses an available local voice for the same language. The page receives normal start and completion events.

On Windows, playback can also complete when no default audio output is available. The same utterance is synthesized to an in-memory stream and start, end, and progress events follow playback timing. Pause, resume, and cancellation preserve their normal event order. A machine with a working audio output keeps the standard host playback path.

---

<a id="how-botbrowser-controls"></a>

## How BotBrowser Provides Protection

BotBrowser generates the voice list at the browser engine level from the profile's declared platform and browser brand. Supported voice properties and ordering follow that profile policy. No JavaScript interception is used.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Voice list shows host system voices | Verify `--bot-speech-voices=profile` is set. |
| Google TTS voices missing in Chrome profile | Ensure `--bot-browser-brand=chrome` is active. Non-Chrome brands do not include Google voices. |
| Voice list empty | Some headless configurations may not initialize speech synthesis. Check profile compatibility. |
| Voice language doesn't match profile locale | Verify `--bot-languages` and `--bot-locale` are consistent with the profile. |

---

<a id="next-steps"></a>

## Next Steps

- [Navigator Properties](NAVIGATOR_PROPERTIES.md). Other browser API surfaces that reveal platform identity.
- [Browser Fingerprinting Explained](BROWSER_OVERVIEW.md). The full fingerprinting landscape.
- [CLI Flags Reference](../../../CLI_FLAGS.md). All speech and media configuration flags.

---

**Related documentation:** [Advanced Features: Complete Fingerprint Control](../../../ADVANCED_FEATURES.md#complete-fingerprint-control)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [Speech Synthesis Voice Lists: A Safe Troubleshooting Guide](https://botbrowser.io/en/blog/speech-synthesis-fingerprinting/)
