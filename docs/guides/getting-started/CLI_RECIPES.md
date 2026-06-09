# CLI Recipes

> Use copy-paste BotBrowser CLI recipes for proxy, fingerprint, identity, and deployment scenarios.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed on your system. See [INSTALLATION.md](../../../INSTALLATION.md) for platform-specific setup.
- **A profile file** (`.enc` for production, `.json` for local development). Download from [GitHub Releases](https://github.com/botswin/BotBrowser/releases) or use the profiles in [profiles/](../../../profiles/).

All recipes below use `chromium-browser` as the executable name. Replace with the correct path for your platform:
- **Windows:** `chrome.exe` or full path to the extracted binary
- **macOS:** `/Applications/Chromium.app/Contents/MacOS/Chromium`
- **Ubuntu:** `chromium-browser`

---

<a id="quick-start"></a>

## Quick Start

<a id="recipe-minimal"></a>
### 1. Minimal launch

The simplest way to start BotBrowser with a profile:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-headless"></a>
### 2. Headless mode

Run without a visible browser window:

```bash
chromium-browser \
  --headless \
  --bot-profile="/path/to/profile.enc" \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-remote-debugging"></a>
### 3. Remote debugging

Expose the DevTools protocol for external tools to connect:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --remote-debugging-port=9222 \
  --remote-debugging-address=0.0.0.0 \
  --user-data-dir="$(mktemp -d)"
```

---

## How It Works

This guide is a command cookbook. Pick the recipe that matches your scenario, then combine only the flags you need.

<a id="proxy-configurations"></a>

## Proxy Configurations

<a id="recipe-http-proxy"></a>
### 4. HTTP proxy with credentials

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=http://user:pass@proxy.example.com:8080 \
  --user-data-dir="$(mktemp -d)"
```

BotBrowser auto-detects timezone, locale, and language from the proxy exit IP.

<a id="recipe-socks5-proxy"></a>
### 5. SOCKS5 proxy

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080 \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-socks5h-proxy"></a>
### 6. SOCKS5H proxy (DNS through tunnel)

Keep DNS resolution within the proxy tunnel for consistent privacy:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5h://user:pass@proxy.example.com:1080 \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-proxy-ip"></a>
### 7. Skip IP detection for faster navigation (ENT Tier1)

If you already know the proxy's public IP, provide it to skip per-page IP lookups:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080 \
  --proxy-ip="203.0.113.1" \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-proxy-bypass"></a>
### 8. Route static assets directly, proxy everything else (PRO)

Use regex patterns to control which requests go through the proxy:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=http://user:pass@proxy.example.com:8080 \
  --proxy-bypass-rgx="\.(js|css|png|jpg|svg|woff2)(\?|$)" \
  --user-data-dir="$(mktemp -d)"
```

---

<a id="timezone-locale-language"></a>

## Timezone, Locale, and Language

<a id="recipe-geo-override"></a>
### 9. Override timezone, locale, and language

By default, BotBrowser auto-detects these from the proxy IP. Override when you need a specific configuration:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080 \
  --bot-config-timezone=Europe/Berlin \
  --bot-config-locale=de-DE \
  --bot-config-languages=de-DE,de,en-US,en \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-system-timezone"></a>
### 10. Use the host system's real timezone

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-config-timezone=real \
  --user-data-dir="$(mktemp -d)"
```

---

<a id="noise-configuration"></a>

## Noise Configuration

<a id="recipe-deterministic-noise"></a>
### 11. Deterministic noise with a fixed seed (ENT Tier2)

Produce identical fingerprint noise across runs using the same seed value:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-noise-seed=12345 \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-disable-canvas-noise"></a>
### 12. Disable specific noise channels

Turn off canvas noise while keeping other noise active:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-config-noise-canvas=false \
  --bot-config-noise-webgl-image=true \
  --bot-config-noise-audio-context=true \
  --user-data-dir="$(mktemp -d)"
```

---

<a id="webrtc-control"></a>

## WebRTC Control

<a id="recipe-webrtc-disabled"></a>
### 13. Disable WebRTC entirely

Prevent all WebRTC activity, including ICE candidate gathering:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-config-webrtc=disabled \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-webrtc-ice"></a>
### 14. Custom WebRTC ICE servers (ENT Tier1)

Control which STUN/TURN servers are visible to JavaScript:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-webrtc-ice="custom:stun:stun.l.google.com:19302,turn:turn.example.com" \
  --user-data-dir="$(mktemp -d)"
```

---

<a id="window-screen-size"></a>

## Window and Screen Size

<a id="recipe-custom-window"></a>
### 15. Custom window and screen dimensions

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-config-window=1920x1080 \
  --bot-config-screen=2560x1440 \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-profile-window"></a>
### 16. Force profile-defined dimensions in headful mode

Desktop profiles default to using real system dimensions in headful mode. To use the profile's values instead:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-config-window=profile \
  --bot-config-screen=profile \
  --user-data-dir="$(mktemp -d)"
```

---

<a id="browser-brand-switching"></a>

## Browser Brand Alignment

<a id="recipe-edge-brand"></a>
### 17. Present as Microsoft Edge (ENT Tier2)

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-config-browser-brand=edge \
  --bot-config-brand-full-version=142.0.3595.65 \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-webview-brand"></a>
### 18. Android WebView simulation (ENT Tier3)

```bash
chromium-browser \
  --bot-profile="/path/to/android-profile.enc" \
  --user-agent="Mozilla/5.0 (Linux; Android {platform-version}; {model} Build/TP1A.220624.021; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/{ua-full-version} Mobile Safari/537.36" \
  --bot-config-browser-brand=webview \
  --bot-config-platform=Android \
  --bot-config-platform-version=13 \
  --bot-config-model=SM-G991B \
  --bot-config-mobile=true \
  --bot-config-architecture=arm \
  --bot-config-bitness=64 \
  --user-data-dir="$(mktemp -d)"
```

---

<a id="session-data"></a>

## Cookie, Bookmark, and History Seeding

<a id="recipe-cookies"></a>
### 19. Pre-load cookies (PRO)

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-cookies='[{"url":"https://example.com","name":"session","value":"abc123","domain":".example.com"}]' \
  --user-data-dir="$(mktemp -d)"
```

Or load from a file:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-cookies="@/path/to/cookies.json" \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-bookmarks-history"></a>
### 20. Pre-populate bookmarks and browsing history

```bash
# Random history (2-7 entries)
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-bookmarks='[{"title":"Example","type":"url","url":"https://example.com"}]' \
  --bot-inject-random-history \
  --user-data-dir="$(mktemp -d)"

# Precise history count (15 entries, history.length = 16)
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-inject-random-history=15 \
  --user-data-dir="$(mktemp -d)"
```

---

<a id="performance-tuning"></a>

## Performance Tuning

<a id="recipe-timing-control"></a>
### 21. Performance timing and frame rate control (ENT Tier2)

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-time-scale=0.92 \
  --bot-time-seed=42 \
  --bot-fps=60 \
  --bot-stack-seed=profile \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-headless-server"></a>
### 22. Headless server with all protections

A production-ready configuration for server deployment:

```bash
chromium-browser \
  --headless \
  --no-sandbox \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080 \
  --bot-port-protection \
  --bot-always-active \
  --bot-disable-console-message \
  --remote-debugging-port=9222 \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-profile-directory"></a>
### 23. Random profile selection from a directory

Select a different profile on each startup for fingerprint diversity:

```bash
chromium-browser \
  --bot-profile-dir="/path/to/profiles/directory/" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080 \
  --user-data-dir="$(mktemp -d)"
```

For Per-Context Fingerprint, pass the same flag through `botbrowserFlags` when creating the BrowserContext so the context selects its own profile from the directory.

---

## Common Scenarios

- Start from the Quick Start command and add only the cli recipes settings shown in this guide.
- Re-run the same test page at least twice with the same profile to confirm stable output.
- Keep proxy, locale/timezone, and launch args documented so this setup is reproducible.

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Flags have no effect | Ensure `--bot-config-*` flags use the correct format. Check for typos in flag names. |
| Proxy not working | Verify the full URL format: `scheme://user:pass@host:port`. Test the proxy independently first. |
| Timezone mismatch | Use `--bot-config-timezone` to override. Ensure the IANA timezone name is correct (e.g., `America/New_York`, not `EST`). |
| Window size ignored in headful | Desktop profiles default to `real` system dimensions. Set `--bot-config-window=profile` explicitly. |
| JSON parse errors in cookies/bookmarks | Ensure JSON is valid. On Windows CMD, use double quotes for the outer string and escape inner quotes. |

---

<a id="next-steps"></a>

## Next Steps

- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete documentation for every available flag.
- [Profile Management](PROFILE_MANAGEMENT.md). Understand profile types, versions, and configuration options.
- [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md). Configure browser behavior via profile JSON.
- [Playwright Guide](PLAYWRIGHT.md). Framework integration with Playwright.
- [Puppeteer Guide](PUPPETEER.md). Framework integration with Puppeteer.
- [First Verification](FIRST_VERIFICATION.md). Verify your setup is working correctly.

---

**Related documentation:** [Installation](../../../INSTALLATION.md) | [CLI Flags Reference](../../../CLI_FLAGS.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
