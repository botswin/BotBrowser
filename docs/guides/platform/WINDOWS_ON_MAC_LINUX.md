# Running Windows Profiles on macOS and Linux

> Deploy Windows-target browser identity on non-Windows hosts with profile-consistent behavior.

---

<a id="prerequisites"></a>

## Prerequisites

- BotBrowser on macOS or Linux.
- Windows profile file (`.enc` or `.json`).
- ENT Tier1 for Linux/Ubuntu hosts.

---

<a id="quick-start"></a>

## Quick Start

```bash
# macOS
/Applications/Chromium.app/Contents/MacOS/Chromium \
  --bot-profile="/path/to/windows-profile.enc" \
  --headless

# Linux
chromium-browser \
  --bot-profile="/path/to/windows-profile.enc" \
  --headless
```

Optional geo alignment:

```bash
--proxy-server=socks5://user:pass@proxy.example.com:1080
```

---

<a id="how-it-works"></a>

## How It Works

This guide is the Windows-profile specialization of [Cross-Platform Profiles](CROSS_PLATFORM_PROFILES.md).

For a Windows-target profile, BotBrowser keeps Windows-facing signals aligned (platform metadata, Windows-oriented font behavior, screen/device surfaces, and related headers) even when host OS is macOS or Linux.

---

<a id="common-scenarios"></a>

## Common Scenarios

### macOS development, Linux production

Use one Windows profile in both environments to keep deployment identity stable.

### Regional Windows identity

```bash
--bot-profile="/path/to/windows-profile.enc" \
--proxy-server=socks5://user:pass@de-proxy.example.com:1080 \
--bot-timezone=Europe/Berlin \
--bot-locale=de-DE \
--bot-languages=de-DE,de,en-US,en
```

### Multiple Windows identities per browser (ENT Tier3)

```javascript
// Puppeteer
const client = await browser.target().createCDPSession();
const context = await browser.createBrowserContext();

await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: context._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/windows-profile.enc",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---|---|
| `navigator.platform` does not match expected Windows value | Confirm BotBrowser binary and correct `--bot-profile` are used. |
| Rendering/hash mismatch between hosts | Ensure BotBrowser version and profile file are identical across hosts. |
| Linux instance not available | ENT Tier1 is required on Linux/Ubuntu. |
| CJK text differences | See [CJK Font Rendering](CJK_FONT_RENDERING.md). |

---

<a id="next-steps"></a>

## Next Steps

- [Cross-Platform Profiles](CROSS_PLATFORM_PROFILES.md). General portability model.
- [CJK Font Rendering](CJK_FONT_RENDERING.md). Font and glyph consistency details.
- [Device Emulation](DEVICE_EMULATION.md). Device/screen tuning.
- [Headless Server Setup](../deployment/HEADLESS_SERVER_SETUP.md). Linux deployment baseline.

---

**Related documentation:** [Profiles README](../../../profiles/README.md) | [Advanced Features](../../../ADVANCED_FEATURES.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
