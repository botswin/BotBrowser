# FPS Control

> Frame rate is a trackable signal tied to display hardware and media playback. BotBrowser controls display frame timing through `--bot-fps` and video playback cadence through `--bot-video-fps`.

---

## Prerequisites

- **BotBrowser** installed. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).
- **ENT Tier2 profile enablement** for `--bot-fps` and Video FPS Control.


<a id="overview"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

## Overview

Frame rate is a privacy-relevant signal tied to display hardware, compositor timing, and media playback. BotBrowser provides two ENT Tier2 controls:

- `--bot-fps` controls display/runtime frame-rate behavior such as `requestAnimationFrame` timing.
- `--bot-video-fps` controls video playback cadence and media FPS reporting for video-heavy workloads on profiles with Video FPS Control enabled.

---

<a id="botbrowser-solution"></a>

## How BotBrowser Controls FPS

The `--bot-fps` flag provides three modes:

### Profile Mode (Default)

Use the frame rate defined in the profile:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-fps=profile
```

The profile contains the target device's refresh rate, and BotBrowser matches `requestAnimationFrame` timing to that rate.

### Real Mode

Use the native frame rate of the host system:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-fps=real
```

Useful when the host hardware matches the profile target.

### Fixed FPS

Specify an exact frame rate as a number:

```bash
# Standard 60Hz display
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-fps=60

# High refresh rate display
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-fps=120
```

Frame timing and rendering intervals match the target FPS on any host hardware.

---

<a id="video-fps-control"></a>

## Video FPS Control

Use `--bot-video-fps=<actual>[:<reported>]` when video playback is the main CPU cost and the workload does not require full visual frame cadence.

| Form | Meaning |
|------|---------|
| `--bot-video-fps=1` | Decode/render video near 1 FPS and report 1 FPS. |
| `--bot-video-fps=1:30` | Decode/render video near 1 FPS while media reporting uses 30 FPS. |
| `--bot-video-fps=1:real` | Decode/render video near 1 FPS while reporting the media's reported cadence where available. |

Examples:

```bash
# Lower actual video cadence and report the same cadence
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-video-fps=1

# Lower actual video cadence while keeping media reporting at 30 FPS
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-video-fps=1:30
```

Important behavior:

- The first value is the actual visual cadence. It controls how often video frames update.
- The second value is the media reporting policy. Omit it to report the actual value.
- `real` keeps reported values aligned with the media's reported cadence where available. It does not report the throttled actual cadence.
- Pixel output follows the actual cadence. Pages or tests that sample video pixels frame by frame will observe the lowered visual cadence.
- Media-facing reporting follows the reported policy. Visual pixels still follow the actual cadence.
- This flag is independent from `--bot-fps`; use `--bot-fps` for display/runtime timing and `--bot-video-fps` for media playback cadence.
- Profiles without Video FPS Control enabled ignore `--bot-video-fps`.

The benchmark page includes a video-heavy CPU comparison: [Video FPS Control Benchmark](../../../BENCHMARK.md#video-fps-control).

<a id="example"></a>

## Common Scenarios

### Reproducing a 60Hz profile on mixed hardware

Use `--bot-fps=60` when your deployment fleet includes high-refresh displays or headless hosts with inconsistent native timing.

### Matching high-refresh profiles

If the target profile is based on 120Hz/144Hz hardware, keep `--bot-fps=profile` (or set an explicit value) to maintain consistency with profile-declared display traits.

### Debugging host-driven frame jitter

Temporarily compare `--bot-fps=real` vs `--bot-fps=profile` to isolate whether instability comes from host rendering load or from profile settings.

### Reducing CPU in video-heavy sessions

Use `--bot-video-fps=1:30` when many tabs or contexts keep video elements active but the workflow only needs occasional visual updates.

### Keeping display FPS and video FPS separate

Combine both flags when the page should keep a 60Hz runtime cadence but video elements should update less often:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-fps=60 \
  --bot-video-fps=1:30
```

## Playwright Example

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--bot-fps=60",
    "--bot-video-fps=1:30",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");

// ... use the page as needed ...

await browser.close();
```

## Per-Context Example

For Per-Context Fingerprint, pass `--bot-video-fps` in `botbrowserFlags` before creating the first page in that context. Sibling contexts can use different video policies when their profiles allow it.

```javascript
const client = await browser.newBrowserCDPSession();
const { browserContextIds: before } = await client.send("Target.getBrowserContexts");
const context = await browser.newContext();
const { browserContextIds: after } = await client.send("Target.getBrowserContexts");
const contextId = after.filter((id) => !before.includes(id))[0];

await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: contextId,
  botbrowserFlags: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--bot-video-fps=1:30",
  ],
});

const page = await context.newPage();
await page.goto("https://example.com");
```

To verify FPS control is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported frame rate matches the `--bot-fps` value, not the host display's native refresh rate.
3. Compare results between `--bot-fps=60` and `--bot-fps=120` to confirm the display/runtime flag takes effect.
4. For video workloads, compare CPU usage and visible video cadence with and without `--bot-video-fps`.

---

<a id="related-docs"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---|---|
| Measured FPS drifts from configured value | Check CPU/GPU saturation on the host. Heavy rendering load can still introduce jitter around the target rate. |
| Profile says 120Hz but measured near 60Hz | Ensure `--bot-fps` is not pinned to `60` and confirm the active launch args in the running process. |
| Video reports 30 FPS but visually updates slowly | This is expected for settings like `--bot-video-fps=1:30`; reported FPS and visual cadence are intentionally separate. |
| Pixel sampling sees the lower video cadence | Pixel output follows the actual FPS. Use a higher actual value if frame-by-frame video pixels are part of the workflow. |
| Flag has no effect | Confirm the active profile has Video FPS Control enabled. Unsupported profiles ignore the flag. |
| Results differ between headless and headful | Validate both modes with the same profile and flags; headless composition path can differ under load. |

## Next Steps

- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags, including `--bot-fps` and `--bot-video-fps`.
- [Advanced Features](../../../ADVANCED_FEATURES.md). Precise FPS simulation architecture.
- [Benchmark](../../../BENCHMARK.md#video-fps-control). Video FPS CPU benchmark.

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [Frame Rate Fingerprinting: Refresh Rate and Video Timing](https://botbrowser.io/en/blog/fps-control/)
