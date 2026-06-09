# WebKit-Family Profile Consistency

> Use premium WebKit-family profiles for browser signal consistency across supported BotBrowser hosts.

---

<a id="overview"></a>

## Overview

WebKit-family Profile Consistency is an ENT Tier4 capability for authorized privacy validation. It lets teams run desktop and mobile WebKit-family profile bundles on the BotBrowser browser core while keeping browser signals aligned with the selected profile.

This capability goes beyond browser-brand text. BotBrowser aligns runtime engine behavior, CSS behavior, media capability behavior, navigation headers, TLS behavior, HTTP/2 behavior, and BrowserContext isolation so WebKit-family profiles remain consistent during validation and production runs.

For the full feature overview, see [WebKit-family Profile Consistency](../../../WEBKIT_PROFILE_CONSISTENCY.md).

---

<a id="requirements"></a>

## Requirements

- BotBrowser 149.0.7827.59 or newer.
- ENT Tier4 subscription.
- Premium WebKit-family profile files provided through the enterprise channel.
- A unique `--user-data-dir` per browser instance.

WebKit-family Profile Consistency is profile-backed. Use the provided `.enc` profiles instead of trying to assemble browser-family behavior from standalone flags.

---

<a id="launch"></a>

## Launch

Use a premium WebKit-family profile the same way you use other BotBrowser profiles:

```bash
chromium-browser \
  --bot-profile="/absolute/path/to/webkit-family-profile.enc" \
  --user-data-dir="$(mktemp -d)"
```

For multi-identity runs, WebKit-family profiles can be used with Per-Context Fingerprint:

```javascript
const client = await browser.newBrowserCDPSession();

const { browserContextId } = await client.send("Target.createBrowserContext", {
  botbrowserFlags: [
    "--bot-profile=/absolute/path/to/webkit-family-profile.enc",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    "--proxy-ip=203.0.113.1",
  ],
});
```

Create the context with the profile before opening pages. This keeps browser runtime, network, and rendering behavior aligned from the first navigation.

---

<a id="scope"></a>

## Scope

WebKit-family Profile Consistency covers the profile-visible surfaces that matter for browser-family identity consistency:

- Browser runtime and object shape consistency.
- CSS and media capability consistency.
- Navigation header consistency.
- TLS and HTTP/2 behavior consistency.
- Desktop and mobile WebKit-family profile bundles.
- Per-context isolation between WebKit-family and Chromium-family profiles.

The exact profile contents are managed through premium `.enc` files. Customers should treat the profile as the source of truth and use CLI flags only for session-specific values such as proxy, user data directory, and operational routing.

---

<a id="best-practices"></a>

## Best Practices

- Use WebKit-family profiles only with builds that explicitly support this profile line.
- Keep each browser instance on a unique `--user-data-dir`.
- Prefer `Target.createBrowserContext` with `botbrowserFlags` when combining WebKit-family profiles with Per-Context Fingerprint.
- Keep proxy configuration in BotBrowser flags so timezone, locale, and network identity remain aligned.
- Validate desktop and mobile WebKit-family profiles separately because they represent different device classes.

---

**Related documentation:** [Feature Page](../../../WEBKIT_PROFILE_CONSISTENCY.md) | [Profile Management](../getting-started/PROFILE_MANAGEMENT.md) | [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md) | [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) | [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
