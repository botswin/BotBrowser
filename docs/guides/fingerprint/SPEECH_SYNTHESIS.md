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

Start with this launch to establish a clean baseline before adding extra overrides.

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

When set to `profile`, BotBrowser returns a voice list consistent with the profile's declared platform and browser brand. This ensures voice data aligns with all other identity surfaces.

---

<a id="how-botbrowser-controls"></a>

## How BotBrowser Provides Protection

BotBrowser generates a complete, platform-consistent voice list at the browser engine level. The voice list matches the profile's declared platform and browser brand. All voice properties and ordering are profile-appropriate. No JavaScript interception is used, so voice loading follows the standard browser pattern.

---

<a id="troubleshooting"></a>

## Common Scenarios

- Capture a baseline result using the Quick Start setup.
- Change one relevant setting at a time and compare the new output.
- Keep your final launch command documented so future checks are reproducible.

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
