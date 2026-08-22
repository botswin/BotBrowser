# Performance Fingerprinting

> Performance timing and execution speed create a hardware-level fingerprint. BotBrowser provides comprehensive protection against timing-based tracking.

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

Performance and timing data can serve as a hardware-level fingerprint. BotBrowser provides comprehensive protection across all timing-related surfaces.

---

<a id="configuration"></a>

## Configuration

### Performance Timing Protection

Use `--bot-time-seed` for deterministic execution timing diversity (ENT Tier2):

```bash
# Each seed produces a unique, stable performance profile
--bot-time-seed=42
```

This applies deterministic timing diversity across browser operations and navigation timing entries.

### Timing Scale

Use `--bot-time-scale` to compress high-resolution timing intervals (ENT Tier2):

```bash
# Scale down timing intervals (range 0.80-0.99)
--bot-time-scale=0.92
```

This emulates lower system load and reduces timing skew signals.

### Frame Rate Control

Control display/runtime frame rate behavior with `--bot-fps` (ENT Tier2):

```bash
# Use profile-defined frame rate
--bot-fps=profile

# Use native frame rate
--bot-fps=real

# Set specific frame rate
--bot-fps=60
```

Control video playback cadence with `--bot-video-fps` (ENT Tier2, requires a profile with Video FPS Control enabled):

```bash
# Actual video cadence 1 FPS, media reporting 30 FPS
--bot-video-fps=1:30
```

Use this for video-heavy workloads where lower visual video cadence is acceptable. Pixel output follows the actual video cadence, while media reporting follows the selected policy. See [FPS Control](FPS_CONTROL.md#video-fps-control) and the [Video FPS benchmark](../../../BENCHMARK.md#video-fps-control).

### Network Information Override

Use `--bot-network-info-override` for profile, native, or custom JSON network information policies:

```bash
# Use profile-defined network info values
--bot-network-info-override
```

The same policy applies to JavaScript and corresponding Client Hints in the active BrowserContext. See [Navigator Properties](NAVIGATOR_PROPERTIES.md#network-information) for custom JSON fields, source selectors, validation, and precedence.

### Stack Depth Control

Control JavaScript recursive call stack depth with `--bot-stack-seed` (ENT Tier2):

```bash
# Match profile's exact depth
--bot-stack-seed=profile

# Use native depth
--bot-stack-seed=real

# Per-session depth variation
--bot-stack-seed=42
```

---

<a id="how-botbrowser-protects"></a>

## How BotBrowser Provides Protection

BotBrowser provides protection across all performance and timing surfaces: operation timing, navigation timing, display frame rate, video playback cadence, network connection properties, stack depth, and CPU core scaling. The flags listed above can be combined for comprehensive coverage. `--bot-time-seed` and `--bot-time-scale` protect against different aspects of timing and can be used together.

---

<a id="troubleshooting"></a>

## Common Scenarios

- Capture a baseline result using the Quick Start setup.
- Change one relevant setting at a time and compare the new output.
- Keep your final launch command documented so future checks are reproducible.

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Timing profile identical across instances | Use different `--bot-time-seed` values for each instance. |
| Frame rate doesn't match profile | Set `--bot-fps=profile` or specify a target rate like `--bot-fps=60`. |
| Video workload uses too much CPU | Use `--bot-video-fps=<actual>[:<reported>]`, such as `--bot-video-fps=1:30`, with a profile that has Video FPS Control enabled when lower visual video cadence is acceptable. |
| Network connection info shows real values | Enable `--bot-network-info-override` to use profile-defined values. |
| Performance entries show real server timing | `--bot-time-seed` redistributes entry timing. Verify it is set. |

---

<a id="next-steps"></a>

## Next Steps

- [Navigator Properties](NAVIGATOR_PROPERTIES.md). Connection info and other navigator APIs.
- [FPS Control](FPS_CONTROL.md). Display FPS and video FPS controls.
- [Canvas Fingerprinting](CANVAS.md). Rendering-based tracking protection.
- [Audio Fingerprinting](AUDIO.md). Audio processing fingerprint protection.
- [CLI Flags Reference](../../../CLI_FLAGS.md). All timing and performance flags.

---

**Related documentation:** [Advanced Features: Performance Timing Protection](../../../ADVANCED_FEATURES.md#performance-timing-protection) | [Advanced Features: Stack Depth Control](../../../ADVANCED_FEATURES.md#stack-depth-control)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
