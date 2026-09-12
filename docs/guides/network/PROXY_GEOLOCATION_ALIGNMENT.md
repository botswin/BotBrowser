# Proxy and Geolocation

> Align proxy routing and geographic signals (timezone, locale, languages) for stable location identity.

---

<a id="prerequisites"></a>

## Prerequisites

- BotBrowser with `--bot-profile`.
- Proxy configured with `--proxy-server`. See [Proxy Configuration](PROXY_CONFIGURATION.md).

---

<a id="quick-start"></a>

## Quick Start

Default behavior (recommended):

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080
```

If you already know the proxy exit IP:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080 \
  --proxy-ip=203.0.113.1
```

`--proxy-ip` accepts IPv4, IPv6, or a comma-separated pair containing one address from each family. Use `ipv4_none` or `ipv6_none` when the proxy has no exit address in that family. This declares the family unavailable and prevents a lookup for it. Use a pair when the proxy has distinct IPv4 and IPv6 exit identities.

---

<a id="how-it-works"></a>

## How It Works

This guide focuses on **configuration strategy**:

1. Launch with proxy (`--proxy-server`).
2. BotBrowser derives geographic signals from the proxy exit IP.
3. Explicit CLI or profile `configs` values take priority for the settings they define.

Values set to `auto` keep proxy-based alignment enabled. For example, an explicit locale can remain fixed while timezone and languages continue to follow the proxy.

For internals (lookup pipeline, data source behavior, accuracy boundaries), see [GeoIP Database](GEOIP_DATABASE.md).

---

<a id="common-scenarios"></a>

## Common Scenarios

### Scenario 1: Fully automatic alignment

```bash
--proxy-server=http://user:pass@proxy.example.com:8080
```

### Scenario 2: Manual timezone override, keep language auto

```bash
--proxy-server=http://user:pass@proxy.example.com:8080 \
--bot-timezone=Europe/Berlin
```

### Scenario 3: Manual language override, keep timezone auto

```bash
--proxy-server=http://user:pass@proxy.example.com:8080 \
--bot-languages=de-DE,de,en-US,en
```

### Scenario 4: Full manual geographic identity

```bash
--proxy-server=http://user:pass@proxy.example.com:8080 \
--proxy-ip=203.0.113.1 \
--bot-timezone=Europe/Berlin \
--bot-locale=de-DE \
--bot-languages=de-DE,de,en-US,en
```

### Scenario 5: Different geo per BrowserContext

Use per-context proxy assignment. See [Per-Context Proxy](PER_CONTEXT_PROXY.md).

### Scenario 6: IPv4-only proxy

```bash
--proxy-server=socks5://user:pass@proxy.example.com:1080 \\
--proxy-ip=203.0.113.1,ipv6_none
```

### Scenario 7: IPv6-only proxy

```bash
--proxy-server=socks5://user:pass@proxy.example.com:1080 \\
--proxy-ip=ipv4_none,2001:db8::1009
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Timezone does not match proxy region | Ensure proxy is set via `--proxy-server` (or per-context proxy), not framework-only proxy options. |
| Unexpected language list | Check whether `--bot-languages` is explicitly set. Manual value overrides auto mapping. |
| First page load is slow | Provide `--proxy-ip` or set custom IP services via `--bot-ip-service`. |
| Different contexts show different geo values | Expected when contexts use different proxies. |

---

<a id="next-steps"></a>

## Next Steps

- [GeoIP Database](GEOIP_DATABASE.md). Engine behavior, lookup boundaries, and accuracy details.
- [Proxy Configuration](PROXY_CONFIGURATION.md). Proxy syntax and credential formats.
- [Per-Context Proxy](PER_CONTEXT_PROXY.md). Multiple proxies in one browser.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Full proxy and geo flags.

---

**Related documentation:** [Advanced Features](../../../ADVANCED_FEATURES.md#network-fingerprint-control) | [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
