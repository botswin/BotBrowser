# GeoIP Database

> Understand BotBrowser's GeoIP lookup behavior, data boundaries, and performance characteristics.

---

<a id="prerequisites"></a>

## Prerequisites

- BotBrowser with `--bot-profile`.
- Proxy routing configured (recommended).

---

<a id="quick-start"></a>

## Quick Start

Geo lookup is automatic when proxy routing is active:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080
```

Use `--proxy-ip` if you already know the exit IP:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080 \
  --proxy-ip=203.0.113.1
```

For a single-family proxy, include `ipv4_none` or `ipv6_none` in the comma-separated value to declare the unavailable family and avoid an unnecessary lookup. See [Proxy and Geolocation Alignment](PROXY_GEOLOCATION_ALIGNMENT.md) for the supported formats.

---

<a id="how-it-works"></a>

## How It Works

BotBrowser uses a local GeoIP database to translate proxy exit IP into geographic defaults.

1. **IP resolution**
- Source: proxy exit IP.
- Input path: automatic IP service lookup or explicit `--proxy-ip`.

2. **Local lookup**
- Lookup runs against bundled local GeoIP data.
- No external geolocation API call is required for the mapping step.

3. **Derived defaults**
- Timezone
- Locale
- Languages
- Approximate coordinates

4. **Override priority**
- Manual flags (`--bot-timezone`, `--bot-locale`, `--bot-languages`, `--bot-location`) override lookup-derived values.

For end-to-end usage strategy and practical configuration recipes, see [Proxy and Geolocation](PROXY_GEOLOCATION_ALIGNMENT.md).

---

<a id="common-scenarios"></a>

## Common Scenarios

### Custom IP service list

```bash
--bot-ip-service="https://ip1.example.com,https://ip2.example.com"
```

### Known exit IP from provider API

```bash
--proxy-ip=203.0.113.1
```

### Strict manual geographic control

```bash
--proxy-ip=203.0.113.1 \
--bot-timezone=Asia/Tokyo \
--bot-locale=ja-JP \
--bot-languages=ja-JP,ja,en-US,en \
--bot-location=35.6762,139.6503
```

### Accuracy boundary handling

If city-level mapping is not precise enough for your use case, keep GeoIP for baseline and set exact values via manual overrides.

---

<a id="accuracy"></a>

## Accuracy and Limits

- Country-level mapping is generally strong.
- City-level mapping can be approximate (nearby city/region).
- Coordinate output is approximate and should not be treated as GPS-grade precision.

---

<a id="performance"></a>

## Performance Notes

- Automatic IP resolution can add context activation latency.
- `--proxy-ip` removes that external IP resolution roundtrip.
- Lookup results are reused during session flow after initialization.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Wrong timezone/locale after startup | Set explicit `--bot-timezone` / `--bot-locale`. |
| IP resolution fails | Provide `--proxy-ip` directly or replace IP services via `--bot-ip-service`. |
| City/coordinates look off | Expected for some IP ranges. Use `--bot-location` for exact coordinates. |
| Slow context activation | Use `--proxy-ip` to skip the initial IP-resolution request. |

---

<a id="next-steps"></a>

## Next Steps

- [Proxy and Geolocation](PROXY_GEOLOCATION_ALIGNMENT.md). User-facing configuration playbook.
- [Performance Optimization](../deployment/PERFORMANCE_OPTIMIZATION.md). Startup tuning.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Full list of geo and proxy flags.

---

**Related documentation:** [Advanced Features](../../../ADVANCED_FEATURES.md) | [Playwright Guide](../getting-started/PLAYWRIGHT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
