# CJK Font Rendering

> Chinese, Japanese, and Korean font rendering considerations for consistent cross-platform fingerprint protection.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md).
- **A profile file** (`.enc` or `.json`).

---

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

Use this as a minimal baseline, then apply the cjk font rendering configuration shown below.

<a id="overview"></a>

## Overview

CJK (Chinese, Japanese, Korean) characters present unique challenges for cross-platform consistency. These writing systems use thousands of distinct glyphs with complex shaping rules. Each operating system ships different CJK fonts with different metrics, different fallback chains, and different rendering behaviors. Text measurement results can vary significantly across platforms.

BotBrowser's cross-platform font engine addresses this by including embedded CJK font bundles and normalizing text shaping through a built-in shaping engine. The goal is consistent CJK glyph metrics and Canvas text output across Windows, macOS, and Linux hosts.

---

<a id="how-it-works"></a>

## How It Works

BotBrowser includes the correct CJK font families in its embedded font bundles for each target platform. When a profile specifies a Windows identity, the browser uses the matching Windows CJK fonts regardless of the host OS.

Built-in text shaping and rendering engines produce consistent CJK output across hosts. The embedded font bundles ensure that font fallback follows the same chain on every platform, covering all CJK text rendering surfaces including Canvas.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Japanese site with Windows profile on Linux

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/windows-profile.enc",
    "--proxy-server=socks5://user:pass@jp-proxy.example.com:1080",
    "--bot-timezone=Asia/Tokyo",
    "--bot-locale=ja-JP",
    "--bot-languages=ja-JP,en-US,en",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.jp");

// Verify on a fingerprint testing site that text metrics match
// the profile's target platform, not the host OS

await browser.close();
```

### Chinese site with macOS profile

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/macos-profile.enc",
    "--proxy-server=socks5://user:pass@cn-proxy.example.com:1080",
    "--bot-timezone=Asia/Shanghai",
    "--bot-locale=zh-CN",
    "--bot-languages=zh-CN,zh,en-US,en",
  ],
});
```

### Verifying CJK consistency across platforms

To verify CJK font consistency:

1. Launch BotBrowser with the same profile on different host operating systems (Windows, macOS, Linux).
2. Visit a CJK-heavy site or a fingerprint testing tool such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
3. Confirm that CJK text rendering metrics are identical across all hosts, matching the profile's target platform.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| CJK characters render as boxes | The profile may not include CJK font bundles. Use a profile version that includes CJK support. |
| Text width differs across platforms | Verify both hosts use the same BotBrowser version and profile. Font engine updates between versions can affect metrics. |
| Mixed CJK/Latin text inconsistency | This typically involves fallback chain differences. Ensure the profile's font configuration includes appropriate CJK and Latin fonts. |
| Rare Unicode characters render differently | Some rare CJK characters may fall through to system fonts on certain platforms. Report these cases for inclusion in future font bundle updates. |

---

<a id="next-steps"></a>

## Next Steps

- [Font Fingerprinting](../fingerprint/FONT.md). Font protection overview, CLI flags, and noise configuration.
- [Cross-Platform Profiles](CROSS_PLATFORM_PROFILES.md). Full details on profile portability across operating systems.
- [Windows on Mac/Linux](WINDOWS_ON_MAC_LINUX.md). Running Windows profiles on non-Windows hosts.
- [Advanced Features](../../../ADVANCED_FEATURES.md#cross-platform-font-engine). Technical details on the font engine.

---

**Related documentation:** [Advanced Features](../../../ADVANCED_FEATURES.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
