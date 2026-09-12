# WebKit-Family Profile Consistency (ENT Tier4)

Profile-backed browser-family identity for desktop and mobile WebKit-family profiles.

> Distributed through the enterprise channel. Use profiles issued for this profile line.

## What It Is

Some workloads need a WebKit-family browser identity while keeping BotBrowser's profile, automation, and Per-Context Fingerprint model. This profile line carries that identity in an encrypted profile bundle.

When a WebKit-family profile is loaded, BotBrowser treats the profile as the authority for browser-family behavior. The profile coordinates selected WebKit-family browser surfaces, TLS ClientHello behavior, and HTTP/2 behavior so the selected browser-family identity stays consistent across supported hosts. BotBrowser 150.0.7871.46 expands coverage for desktop and mobile runtime, worker, CSS, font, canvas, permission, and property-order behavior. BotBrowser 152.0.7977.76 further aligns WebKit-family TLS and HTTP/2 behavior with current platform expectations.

The exact profile contents stay inside the `.enc` file. Customers choose the profile, proxy, user data directory, and normal launch options.

Usage stays simple: use the right profile, load it before navigation, and keep the session configuration consistent with that profile.

## When To Use It

Use this profile line when the workflow requires:

- Desktop or mobile WebKit-family profile bundles.
- Browser-family identity consistency across supported BotBrowser hosts.
- Alignment across selected WebKit-family browser API surfaces, TLS ClientHello behavior, and HTTP/2 behavior without hand-built overrides.
- Per-context runs that mix WebKit-family and Chromium-family profiles in one browser process.

Use standard Chromium-family profiles for Chrome, Chromium, Edge, Brave, Opera, Android, or Android WebView workflows.

## Launch

Launch it the same way as any other encrypted BotBrowser profile:

```bash
chromium-browser \
  --bot-profile="/absolute/path/to/webkit-family-profile.enc" \
  --user-data-dir="$(mktemp -d)"
```

For Per-Context Fingerprint, pass the profile when the BrowserContext is created. See [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) for the CDP workflow.

WebKit-family mobile profile workflows can opt into mobile keyboard visual viewport behavior with `--bot-mobile-keyboard`. See [Device Emulation](docs/guides/platform/DEVICE_EMULATION.md#mobile-keyboard-visual-viewport).

## Operating Notes

- Load the profile before creating pages or navigating.
- Keep each browser instance on a unique `--user-data-dir`.
- Keep proxy configuration with the launch or BrowserContext that uses the profile.
- Do not assemble WebKit-family behavior from standalone brand or platform overrides.
- Validate desktop and mobile profile bundles separately because they represent different device classes.

## Related Documentation

- [Platform guide](docs/guides/platform/WEBKIT_PROFILE_CONSISTENCY.md)
- [Profile configuration](profiles/PROFILE_CONFIGS.md#webkit-family-profile-consistency-ent-tier4)
- [Advanced Features](ADVANCED_FEATURES.md#webkit-family-profile-consistency)
- [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md)
- [Android WebView](docs/guides/platform/ANDROID_WEBVIEW.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) . [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
