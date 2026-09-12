# Device Pixel Ratio Policy

> Device pixel ratio is part of the browser display identity. Select one policy for the profile, host display, and per-context workflow you are running.

---

## Prerequisites

- BotBrowser installed with a valid profile. See [Installation](../../../INSTALLATION.md).
- A chosen display identity for the session: profile-backed, host-backed, or compatibility-focused.

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-dpr=profile
```

`profile` is the default policy. Set another mode only when the deployment needs it.

## Overview

Display scale affects how a browser presents its display identity across desktop, mobile, and per-context workflows. Use one policy that matches the session's intended display environment, then keep that policy stable for the life of the browser or context.

## Modes

| Mode | Use when | Result |
|------|----------|--------|
| `profile` | The profile should define the display identity. | Uses the profile-backed display scale. |
| `real` | The browser should follow the host display. | Uses the host display scale. |
| `advanced` | An existing workflow needs limited layout adjustments while retaining the profile DPR. | Experimental compatibility mode. Not enabled by default. |

Use one mode consistently for a browser session. Do not mix display policies between contexts that are intended to share the same identity.

## Choose a Policy

### Profile

Use `profile` when the selected profile should define the display identity. This is the default and the usual choice for a profile-backed browser session.

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-dpr=profile
```

### Real

Use `real` when the browser should follow the host display. This exposes the host display scale, which may differ from the selected profile. Choose it only when that host-backed identity is intentional.

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-dpr=real
```

### Advanced

`advanced` is experimental and is not enabled by default. It retains the profile DPR and applies limited layout adjustments for compatibility when the host and profile display scales cannot be aligned. It does not rescale the entire page or guarantee matching results across all layout measurements and screenshots.

Keep `profile` unless an existing workflow specifically needs these adjustments. Different host and profile DPR values alone are not a reason to enable `advanced`.

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-dpr=advanced
```

Check the affected page layout and screenshots on the intended host before adopting this mode. Return to `profile` if the adjustments introduce inconsistencies.

## Screen and Window Settings

Use `--bot-window` and `--bot-screen` when the session also needs an explicit window or screen policy. Configure those values together with `--bot-dpr`, rather than changing display inputs independently between runs.

Pair the policy with [Screen and Window](SCREEN_WINDOW.md) settings when you also need to set window or screen dimensions. For mobile profiles, see [Device Emulation](../platform/DEVICE_EMULATION.md).

Desktop headful sessions use host-backed window and screen dimensions by default. Set `--bot-window=profile` and `--bot-screen=profile` when a headful session must use profile-defined dimensions.

## Per-Context Use

Set `--bot-dpr` before the BrowserContext creates its first page or worker. The selected policy remains associated with that context's display and layout behavior.

Use the same mode for the main browser and a per-context profile when they represent the same device identity. Select a different mode only when the context intentionally represents a different display environment.

## Validation

1. Start a session with the selected profile and one DPR policy.
2. Keep window, screen, and DPR settings unchanged while validating the session.
3. Start a second session with the same profile and policy to confirm the display behavior remains stable.
4. When comparing policies, change only `--bot-dpr` and record the complete launch configuration for each result.

## Troubleshooting

| Situation | Action |
|-----------|--------|
| Profile-backed display behavior is expected | Use `--bot-dpr=profile`. |
| The session must follow the host display | Use `--bot-dpr=real`. |
| An existing workflow needs layout compatibility adjustments | Evaluate experimental `--bot-dpr=advanced` on the intended host; otherwise keep `profile`. |
| Display behavior differs between contexts | Set the intended mode before each context creates pages or workers. |
| Headful dimensions follow the host unexpectedly | Set `--bot-window=profile` and `--bot-screen=profile` when profile-backed dimensions are required. |

## Related Guides

- [Screen and Window](SCREEN_WINDOW.md)
- [Device Emulation](../platform/DEVICE_EMULATION.md)
- [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md)
- [CLI Flag Directory](../../../CLI_FLAGS.md#flag-bot-dpr)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
