# WebGL Fingerprinting

> WebGL is a privacy-relevant surface. BotBrowser provides profile-driven protection across supported WebGL capability and rendering paths.

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

## Overview

WebGL is a privacy-relevant API surface. BotBrowser applies profile-driven capability and noise policies to supported WebGL output. Pixel-level results can still depend on the rendering backend selected on the host.

---

<a id="configuration"></a>

## Configuration

### WebGL Mode

Control WebGL behavior with the `--bot-webgl` flag:

```bash
# Use profile-defined WebGL settings (default)
--bot-webgl=profile

# Keep reported limits within what the host can actually deliver
--bot-webgl=min

# Use real system WebGL (no protection)
--bot-webgl=real

# Disable WebGL entirely
--bot-webgl=disabled
```

`min` serves the lower of the profile's claim and what the host can really allocate, while `profile` serves the profile's numbers as-is.

WebGL capability claims are scoped to the BrowserContext that created the context. Limits and shader precision values follow that context's profile, including contexts that share one browser process. Use `profile` when the profile claim should be authoritative, and `min` when reported values must stay within what the host can allocate. A claim outside the range the host graphics stack can represent is discarded so the page receives a usable value.

When BotBrowser starts in `profile` WebGL mode on a software-rendered host, it compiles and links shaders in parallel. Shader-heavy pages reach a usable state sooner, and tight completion checks do not monopolize the renderer while compilation is pending. This is a launch-level setting. In a mixed launch, sibling contexts use the compile model selected at browser startup.

### WebGL Image Noise

Enable deterministic noise on WebGL image readback:

```bash
# Enable WebGL image noise (default)
--bot-noise-webgl-image=true

# Disable WebGL image noise
--bot-noise-webgl-image=false
```

### Noise Seed

Use `--bot-noise-seed` for reproducible WebGL image output:

```bash
--bot-noise-seed=42
```

### GPU Simulation for Headless Servers

On headless Linux servers without a physical GPU, BotBrowser provides full GPU context simulation (ENT Tier2). The profile's GPU information is presented to WebGL regardless of the host's actual hardware.

### Translated shader source

When the `WEBGL_debug_shaders` extension is available, the translated shader source follows the
target platform represented by the active profile. This keeps shader-language output consistent
with the profile instead of exposing the host operating system or graphics backend. The same
profile policy applies when the page runs in a separate BrowserContext.

WebGL and WebGL2 capability checks also follow the active profile across supported rendering paths. Compressed texture operations use the same profile-backed capability policy as the corresponding WebGL format queries.

WebGL2 multisample support also follows the profile. Per-format sample counts, `MAX_SAMPLES`, renderbuffer allocation, and context-loss recovery use the same default or high-performance capability tier. If a profile does not record a format's sample counts, that format keeps the host behavior.

---

<a id="how-botbrowser-protects"></a>

## How BotBrowser Provides Protection

BotBrowser applies its profile policy to supported WebGL capability and output surfaces, including GPU identity strings, parameter values, shader language, image readback, extension availability, and precision formats. WebGL2 uses the same profile-backed capability model. Supported values are returned through browser paths rather than JavaScript interception.

---

<a id="verification"></a>

## Effect Verification

To verify protection is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported WebGL vendor, renderer, and parameter values match the profile configuration, not the host GPU.
3. To verify reproducibility, launch two sessions with the same profile and `--bot-noise-seed` on the same graphics backend, then compare the WebGL image fingerprint output.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| WebGL renderer shows host GPU instead of profile GPU | Verify profile is loaded with `--bot-profile`. Check startup logs for profile loading errors. |
| WebGL not available on headless server | GPU simulation requires ENT Tier2. Verify your license tier supports headless GPU simulation. |
| WebGL image fingerprint varies between runs | Use `--bot-noise-seed` with a fixed value for reproducible output. |
| Shader output reveals host OS | Ensure `--bot-webgl=profile` is active. The profile normalizes shader translation output. |
| `WEBGL_debug_shaders` returns an unexpected shader language | Confirm that the intended profile is loaded in the current BrowserContext and that WebGL is using `profile` mode. Check the returned source for the profile's target language, not the host machine's native backend. |

---

<a id="next-steps"></a>

## Next Steps

- [Canvas Fingerprinting](CANVAS.md). 2D Canvas as a fingerprint surface.
- [Performance Fingerprinting](PERFORMANCE.md). GPU timing as a tracking vector.
- [CLI Flags Reference](../../../CLI_FLAGS.md). WebGL and noise configuration flags.

---

**Related documentation:** [Advanced Features: Multi-Layer Fingerprint Noise](../../../ADVANCED_FEATURES.md#multi-layer-fingerprint-noise) | [Advanced Features: Graphics & Rendering Engine](../../../ADVANCED_FEATURES.md#graphics-rendering-engine)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [WebGL fingerprinting and `WEBGL_debug_renderer_info`](https://botbrowser.io/en/blog/webgl-fingerprinting/)
