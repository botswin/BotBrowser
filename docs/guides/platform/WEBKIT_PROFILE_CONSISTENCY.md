# WebKit-Family Profile Consistency

> Use WebKit-family `.enc` profiles when a workflow needs that browser-family identity on BotBrowser.

## Overview

WebKit-family Profile Consistency is profile-backed. The encrypted profile carries the browser-family data, and the browser loads it before the page starts.

The profile coordinates selected WebKit-family browser surfaces, TLS behavior, and HTTP/2 behavior so the selected browser-family identity remains consistent across supported hosts. BotBrowser 150.0.7871.46 expands this coverage across worker identity, runtime behavior, CSS and system UI values, font loading, canvas output, media capabilities, permission states, property ordering, and mobile profile surfaces. BotBrowser 153.0.8010.12 further aligns WebKit-family network behavior with current platform expectations.

Use this profile line for desktop and mobile WebKit-family bundles. Use Chromium-family profiles for Chrome, Chromium, Edge, Brave, Opera, Android, and Android WebView.

For the product page, see [WebKit-family Profile Consistency](../../../WEBKIT_PROFILE_CONSISTENCY.md).

## Requirements

- BotBrowser 150.0.7871.46 or newer with a matching WebKit-family profile package.
- ENT Tier4 access.
- A WebKit-family `.enc` profile issued through the enterprise channel.
- A separate `--user-data-dir` for each browser instance.

## Launch

Use the profile the same way as other encrypted BotBrowser profiles:

```bash
chromium-browser \
  --bot-profile="/absolute/path/to/webkit-family-profile.enc" \
  --user-data-dir="$(mktemp -d)"
```

For Per-Context Fingerprint, pass the profile when the BrowserContext is created. The profile should be present before the first page in that context starts. See [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md) for the CDP flow.

For WebKit-family mobile profile workflows, add `--bot-mobile-keyboard` when editable-field focus should reduce the visual viewport. The option is disabled by default and does not affect desktop profile bundles. See [Device Emulation](DEVICE_EMULATION.md#mobile-keyboard-visual-viewport).

## Notes

- Do not use `browserBrand` or User-Agent overrides to build this profile line by hand.
- Keep proxy settings with the browser instance or BrowserContext that uses the profile.
- Use BotBrowser 150.0.7871.46 or newer with a matching WebKit-family profile package.
- Validate desktop and mobile profile bundles separately.

**Related documentation:** [Feature Page](../../../WEBKIT_PROFILE_CONSISTENCY.md) | [Profile Management](../getting-started/PROFILE_MANAGEMENT.md) | [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md) | [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) | [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
