# Font Fingerprinting

> Installed fonts and font rendering differ across platforms. BotBrowser protects against font-based tracking with consistent metrics and cross-platform rendering.

---

<a id="prerequisites"></a>

## Prerequisites

- Familiarity with [Browser Fingerprinting Explained](BROWSER_OVERVIEW.md).
- BotBrowser installed with a valid profile. See [Installation](../../../INSTALLATION.md).

---

<a id="overview"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

Start with this launch to establish a clean baseline before adding extra overrides.

## Overview

Font availability and rendering behavior differ across operating systems, locales, and installations. Font metrics, glyph shapes, and sub-pixel positioning all vary across platforms. BotBrowser provides consistent font behavior through built-in font bundles and cross-platform rendering at the browser engine level.

---

<a id="configuration"></a>

## Configuration

### Font Mode

Control font behavior with the `--bot-fonts` flag:

```bash
# Use profile's embedded fonts (default)
--bot-fonts=profile

# Use profile fonts with system font fallback
--bot-fonts=expand

# Use real system fonts (no protection)
--bot-fonts=real
```

### ClientRects and Text Metrics Noise

BotBrowser applies deterministic noise to font measurement APIs:

```bash
# Enable ClientRects noise (disabled by default)
--bot-noise-client-rects=true

# Enable text rects noise (disabled by default)
--bot-noise-text-rects=true
```

### Noise Seed

Use `--bot-noise-seed` for reproducible font metrics:

```bash
--bot-noise-seed=42
```

---

<a id="cross-platform-consistency"></a>

## Cross-Platform Font Rendering

BotBrowser addresses cross-platform font consistency through built-in font libraries and rendering engine integration:

**Built-in font bundles:**
- Each profile includes the complete set of standard fonts for its target platform.
- Font availability and enumeration results match what the target OS would report.

**Rendering engine:**
- Built-in rendering produces consistent glyph rasterization regardless of the host operating system.
- Built-in text shaping ensures identical text layout, ligature handling, and complex script rendering across platforms.

**Result:** A Windows profile running on a Linux server produces identical font metrics, glyph rendering, and font enumeration results as it would on actual Windows hardware. DOM text renders exclusively from the embedded font bundles, so layouts never fall through to host fonts.

<a id="fontface-fallback"></a>

### FontFace and Fallback Behavior

BotBrowser 150 improves profile-backed font handling for `FontFace` local sources, request-by-name loading, and multilingual fallback. Windows-target profiles also keep their font renderer preferences with the active BrowserContext, including per-context sessions running on another host platform.

Keep `--bot-fonts=profile` when the profile font inventory and fallback policy should remain authoritative. Use `expand` only when the workflow intentionally allows host fallback beyond the profile bundle.

---

<a id="verification"></a>

## Effect Verification

To verify protection is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported font list and text metrics match the profile configuration, not the host machine.
3. To verify reproducibility, launch two sessions with the same `--bot-noise-seed` and confirm that the font measurement output is identical.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Font list shows host system fonts | Ensure `--bot-fonts=profile` is set. The `real` mode disables font protection. |
| CJK text renders with missing glyphs | Verify the profile includes appropriate CJK fonts. Windows and macOS profiles include CJK support by default. |
| A local FontFace name resolves differently across hosts | Use `--bot-fonts=profile` and a BotBrowser 150 profile package so local and request-by-name font handling follows the profile inventory. |
| Font metrics differ between headless and headful mode | Both modes should produce identical metrics with a profile loaded. Check that the same profile and flags are used. |
| ClientRects values vary between sessions | Use `--bot-noise-seed` for reproducible measurements. Without a fixed seed, noise varies per session. |

---

<a id="next-steps"></a>

## Next Steps

- [CJK Font Rendering](../platform/CJK_FONT_RENDERING.md). Chinese, Japanese, and Korean font rendering consistency across platforms.
- [CSS Signal Consistency](CSS_SIGNAL_CONSISTENCY.md). How CSS features reveal platform information through fonts and system colors.
- [Canvas Fingerprinting](CANVAS.md). Font rendering affects Canvas fingerprints.
- [Browser Fingerprinting Explained](BROWSER_OVERVIEW.md). The broader fingerprinting landscape.
- [CLI Flags Reference](../../../CLI_FLAGS.md). All font and noise configuration flags.

---

**Related documentation:** [Advanced Features: Cross-Platform Font Engine](../../../ADVANCED_FEATURES.md#cross-platform-font-engine) | [Advanced Features: Multi-Layer Fingerprint Noise](../../../ADVANCED_FEATURES.md#multi-layer-fingerprint-noise)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
