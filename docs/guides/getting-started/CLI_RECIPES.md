# CLI Recipes

> Use copy-paste BotBrowser CLI recipes for proxy, fingerprint, identity, and deployment scenarios.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed on your system. See [INSTALLATION.md](../../../INSTALLATION.md) for platform-specific setup.
- **A profile file** (`.enc` for production, `.json` for local development). Use a profile package that matches your BotBrowser major version. BotBrowser 150 and newer profiles are available through subscription or support at [support@botbrowser.io](mailto:support@botbrowser.io) or [@botbrowser_support](https://t.me/botbrowser_support); legacy demo profiles remain in [profiles/](../../../profiles/) for older evaluation lines.

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
  --bot-timezone=Europe/Berlin \
  --bot-locale=de-DE \
  --bot-languages=de-DE,de,en-US,en \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-system-timezone"></a>
### 10. Use the host system's real timezone

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-timezone=real \
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
  --bot-noise-canvas=false \
  --bot-noise-webgl-image=true \
  --bot-noise-audio-context=true \
  --user-data-dir="$(mktemp -d)"
```

---

<a id="storage-memory-controls"></a>

## Storage and Memory Controls

<a id="recipe-storage-memory-policy"></a>
### 13. Override memory and storage quota policy

Use profile values by default, or choose native Chromium behavior or explicit byte values for a controlled run:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-js-heap-size-limit=profile \
  --bot-storage-quota=10737418240 \
  --user-data-dir="$(mktemp -d)"
```

Use `real` for either flag when that surface should follow native Chromium behavior.

---

<a id="webrtc-control"></a>

## WebRTC Control

<a id="recipe-webrtc-disabled"></a>
### 14. Disable WebRTC entirely

Prevent all WebRTC activity, including ICE candidate gathering:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-webrtc=disabled \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-webrtc-ice"></a>
### 15. Custom WebRTC ICE servers (ENT Tier1)

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
### 16. Custom window and screen dimensions

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-window=1920x1080 \
  --bot-screen=2560x1440 \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-profile-window"></a>
### 17. Force profile-defined dimensions in headful mode

Desktop profiles default to using real system dimensions in headful mode. To use the profile's values instead:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-window=profile \
  --bot-screen=profile \
  --user-data-dir="$(mktemp -d)"
```

---

<a id="browser-brand-switching"></a>

## Browser Brand Alignment

<a id="recipe-edge-brand"></a>
### 18. Present as Microsoft Edge (ENT Tier2)

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-browser-brand=edge \
  --bot-brand-full-version=142.0.3595.65 \
  --user-data-dir="$(mktemp -d)"
```

<a id="recipe-webview-brand"></a>
### 19. Android WebView simulation (ENT Tier3)

```bash
chromium-browser \
  --bot-profile="/path/to/android-profile.enc" \
  --user-agent="Mozilla/5.0 (Linux; Android {platform-version}; {model} Build/TP1A.220624.021; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/{ua-full-version} Mobile Safari/537.36" \
  --bot-browser-brand=webview \
  --bot-platform=Android \
  --bot-platform-version=13 \
  --bot-model=SM-G991B \
  --bot-mobile=true \
  --bot-architecture=arm \
  --bot-bitness=64 \
  --user-data-dir="$(mktemp -d)"
```

---

<a id="session-data"></a>

## Cookie, Bookmark, and History Seeding

<a id="recipe-cookies"></a>
### 20. Pre-load cookies (PRO)

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
### 21. Pre-populate bookmarks and browsing history

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
### 22. Performance timing, frame rate, and video cadence control (ENT Tier2)

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-time-scale=0.92 \
  --bot-time-seed=42 \
  --bot-fps=60 \
  --bot-video-fps=1:30 \
  --bot-stack-seed=profile \
  --user-data-dir="$(mktemp -d)"
```

`--bot-fps` controls display/runtime timing. `--bot-video-fps=1:30` lowers actual video cadence while media reporting uses 30 FPS; use a higher actual value when frame-by-frame video pixels matter.

<a id="recipe-headless-server"></a>
### 23. Headless server with all protections

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
### 24. Random profile selection from a directory

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
| Flags have no effect | Ensure `--bot-*` flags use the correct format. Check for typos in flag names. |
| Proxy not working | Verify the full URL format: `scheme://user:pass@host:port`. Test the proxy independently first. |
| Timezone mismatch | Use `--bot-timezone` to override. Ensure the IANA timezone name is correct (e.g., `America/New_York`, not `EST`). |
| Window size ignored in headful | Desktop profiles default to `real` system dimensions. Set `--bot-window=profile` explicitly. |
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
