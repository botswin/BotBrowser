# Browser Fingerprinting Overview

> What browser fingerprinting is, why it matters for privacy, and how BotBrowser applies profile-backed protection.

---

<a id="prerequisites"></a>

## Prerequisites

No technical prerequisites. This guide provides an overview of fingerprint-based tracking and how BotBrowser addresses it.

---

<a id="overview"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

## Overview

Browser fingerprinting is a tracking technique that identifies users by collecting attributes from their browser and device. Unlike cookies, which store explicit identifiers that users can clear, fingerprinting assembles a composite identifier from dozens of properties that the browser exposes during normal operation. Users have no visibility into when this collection occurs and no standard mechanism to reset or opt out.

This guide covers what BotBrowser protects, why the technique is classified as a privacy violation by standards bodies and regulators, and how BotBrowser's approach works.

---

<a id="why-fingerprinting-is-a-privacy-violation"></a>

## Why Fingerprinting Is a Privacy Violation

Major standards bodies, browser vendors, and regulatory authorities have classified browser fingerprinting as a privacy threat:

- **W3C** published [mitigation guidance](https://www.w3.org/TR/fingerprinting-guidance/) stating that fingerprinting "allows for tracking of activity without clear or effective user controls."
- **WebKit-based browsers** classify fingerprinting as [covert tracking](https://webkit.org/tracking-prevention-policy/) and actively work to prevent cross-site tracking.
- **Mozilla** treats fingerprinting scripts as tracking and [blocks them by default](https://wiki.mozilla.org/Security/Anti_tracking_policy) in Firefox.
- **Google Chrome** acknowledges fingerprinting as a passive tracking risk and has been [reducing fingerprint surface area](https://privacysandbox.google.com/protections/user-agent) through User-Agent Reduction and Privacy Sandbox.
- **UK ICO** called fingerprinting "[not a fair means of tracking](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/12/our-response-to-google-s-policy-change-on-fingerprinting/)" and described Google's decision to permit it as "irresponsible."
- **EU Article 29 Working Party** ruled that fingerprinting requires the same consent as cookies under the e-Privacy Directive.
- **CNIL (France)** has fined companies for fingerprinting without consent.

For the full list of references and citations, see [Browser Fingerprinting: A Recognized Privacy Threat](../../../FINGERPRINT_PRIVACY.md).

---

<a id="what-botbrowser-protects"></a>

## What BotBrowser Protects

BotBrowser applies the active profile at the browser engine level across the fingerprint surfaces listed below. Coverage depends on the profile and platform.

| Surface | Description | Guide |
|---------|-------------|-------|
| Canvas 2D | Rendering output from the HTML5 Canvas element | [Canvas](CANVAS.md) |
| WebGL / WebGPU | GPU information and rendered image output | [WebGL](WEBGL.md) |
| AudioContext | Web Audio API processing output | [Audio](AUDIO.md) |
| Fonts | Font availability and text measurement metrics | [Fonts](FONT.md) |
| Navigator Properties | User-Agent, platform, hardware concurrency, device memory, Client Hints | [Navigator](NAVIGATOR_PROPERTIES.md) |
| Screen and Window | Resolution, device pixel ratio, color depth, window dimensions | [Screen/Window](SCREEN_WINDOW.md) |
| Performance and Timing | Timer precision and execution characteristics | [Performance](PERFORMANCE.md) |
| CSS Features | Media queries, feature support, and system preferences | [CSS](CSS_SIGNAL_CONSISTENCY.md) |
| Speech Synthesis | Available text-to-speech voices | [Speech](SPEECH_SYNTHESIS.md) |
| WebAuthn | Authenticator capabilities and platform credential support | - |
| Storage and Memory | Storage quota, heap size values, and runtime policy overrides | [Storage Quota](STORAGE_QUOTA.md) |
| Console Behavior | CDP domain activation consistency | [Console Suppression](CONSOLE_SUPPRESSION.md) |

---

<a id="botbrowser-approach"></a>

## BotBrowser's Approach

BotBrowser addresses fingerprint tracking through browser engine level protection rather than JavaScript injection:

- **Deterministic noise.** Canvas, WebGL, AudioContext, and other rendering surfaces receive controlled noise that remains consistent within a session while varying across sessions.
- **Cross-platform consistency.** Built-in font libraries and text shaping align profile-backed signals across supported hosts. Text layout and glyph rendering can retain platform-specific differences; see [Font Fingerprinting](FONT.md).
- **Profile-controlled surfaces.** Supported navigator properties, screen dimensions, speech synthesis voices, and WebAuthn capabilities follow the active profile.
- **Privacy-first design.** All protection operates at the browser engine level, through native API paths, not JavaScript injection or page-context modifications.

For configuration details, see the [CLI Flags Reference](../../../CLI_FLAGS.md) and [Advanced Features](../../../ADVANCED_FEATURES.md).

---

<a id="common-scenarios"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---|---|
| Observed value does not match the profile expectation | Verify profile path, active overrides, and any framework-injected settings. |
| Same setup behaves differently on another machine | Compare BotBrowser build, profile version, host OS target, and full launch args. |
| Test results fluctuate between runs | Keep proxy, locale/timezone, and runtime load stable during comparison tests. |

<a id="next-steps"></a>

## Next Steps

- [Canvas Protection](CANVAS.md). How BotBrowser protects Canvas rendering output.
- [WebGL Protection](WEBGL.md). GPU-related fingerprint surface protection.
- [Audio Protection](AUDIO.md). Web Audio API fingerprint protection.
- [Font Protection](FONT.md). Font availability and metric protection.
- [Navigator Properties](NAVIGATOR_PROPERTIES.md). Controlling browser API properties.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of configuration flags.

---

**Related documentation:** [Fingerprint Privacy References](../../../FINGERPRINT_PRIVACY.md) | [Advanced Features](../../../ADVANCED_FEATURES.md) | [Getting Started with Playwright](../getting-started/PLAYWRIGHT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [What Is Browser Fingerprinting](https://botbrowser.io/en/blog/what-is-browser-fingerprinting/)
