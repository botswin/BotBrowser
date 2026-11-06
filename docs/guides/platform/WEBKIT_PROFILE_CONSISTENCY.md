# WebKit-Family Profile Consistency

> Use WebKit-family `.enc` profiles when a workflow needs that browser-family identity on BotBrowser.

## Overview

WebKit-family Profile Consistency is profile-backed. The encrypted profile carries the browser-family data, and the browser loads it before the page starts.

The profile coordinates WebKit-family browser surfaces, Worker identity, runtime behavior, CSS and system UI values, font loading, canvas output, media capabilities, permission states, property ordering, mobile profile surfaces, TLS, and HTTP/2 behavior so the selected browser-family identity remains consistent across supported hosts. Profile-aware notification and accessibility preferences remain isolated from Chromium-family services.

Network behavior follows the platform behind the profile's WebKit-family version. Keep the profile and binary on the same release line when comparing HTTPS and HTTP/2 behavior.

Use this profile line for desktop and mobile WebKit-family bundles. Use Chromium-family profiles for Chrome, Chromium, Edge, Brave, Opera, Android, and Android WebView.

For the product page, see [WebKit-family Profile Consistency](../../../WEBKIT_PROFILE_CONSISTENCY.md).

## Which browser version string does the profile report?

The browser version a page sees comes from the profile, not from a hand-typed flag. The `.enc` package carries the browser-family version data, and BotBrowser derives the reported values from it at startup: `navigator.userAgent`, the structured `navigator.userAgentData` brands, and the Client Hints `fullVersionList` all resolve to the same profile-defined version. BotBrowser auto-generates matching Client Hints values with proper GREASE ordering, so the main thread, workers, and HTTP headers agree. See [Navigator Properties](../fingerprint/NAVIGATOR_PROPERTIES.md).

That is why the version string must match the binary. A `153.0.8010.x` string identifies the BotBrowser 153 release line, whose Chromium core started at `153.0.8010.12` and continues through later 153 minors such as `153.0.8010.53`. A profile whose major version differs from the BotBrowser release line fails startup profile validation as a version mismatch; see [Startup profile states](../getting-started/PROFILE_MANAGEMENT.md#startup-profile-states). Pair `153.x` profiles with a 153 binary, `154.x` with 154, and so on.

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

---

**Related BotBrowser blog:** [WebKit-Family Profile Consistency Across Browser Signals](https://botbrowser.io/en/blog/webkit-safari-family-profile-consistency/)
