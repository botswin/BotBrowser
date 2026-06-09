# CanvasLab: Canvas Forensics and Privacy Validation

> Record Canvas 2D, WebGL, WebGL2, and WebGPU API calls to study graphics signal collection and verify fingerprint protection.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser** installed and running. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).

---

<a id="quick-start"></a>

## Quick Start

Record all Canvas API calls to a JSONL file:

```bash
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-canvas-record-file=/tmp/canvaslab.jsonl \
    --user-data-dir="$(mktemp -d)" \
    "https://example.com"
```

After the session, `/tmp/canvaslab.jsonl` contains every Canvas 2D, WebGL, WebGL2, and WebGPU API call the page made. Open it in the [Replay Viewer](https://botswin.github.io/BotBrowser/tools/canvaslab/canvas_replay_viewer.html) to inspect calls interactively.

---

<a id="how-it-works"></a>

## How It Works

When `--bot-canvas-record-file` is set, BotBrowser intercepts every Canvas API call at the browser engine level and writes it to a JSONL file. This covers Canvas 2D, WebGL, WebGL2, and WebGPU. Each line is a JSON object representing one API call, including:

- **Event type**: `canvas_init`, `context_create`, `state`, `draw`, `read`, `resize`
- **Full parameters**: all arguments serialized (ImageData as base64, Path2D as command arrays, gradients as color stops)
- **Return values**: synchronous returns, callback results, and promise resolutions
- **Source location**: URL, line number, column number, and function name of the calling code
- **Execution context**: sequence number, timestamp, thread ID, canvas ID

Noise variance is disabled during recording so captured data reflects the raw API calls.

Canvas Replay is a separate ENT Tier4 profile-backed capability. When a premium profile includes replay data for an approved validation workflow, BotBrowser can return deterministic Canvas responses from profile data instead of live rendering.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Record and analyze with Playwright

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
    executablePath: process.env.BOTBROWSER_EXEC_PATH,
    headless: true,
    args: [
        `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
        "--bot-canvas-record-file=/tmp/canvaslab.jsonl",
    ],
});

const page = await browser.newPage();
await page.goto("https://example.com");
// Let the page run its Canvas operations
await page.waitForTimeout(5000);
await browser.close();

// Now inspect /tmp/canvaslab.jsonl
```

### View recordings in the Replay Viewer

Open the HTML-based replay viewer to inspect recordings interactively:

1. Navigate to the [Live Replay Viewer](https://botswin.github.io/BotBrowser/tools/canvaslab/canvas_replay_viewer.html)
2. Load your `.jsonl` file
3. Scrub through events, view generated code, and watch canvas rendering step by step

### Identify which script made each call

Every recorded event includes a `caller` field with the source location:

```json
{
  "type": "draw",
  "method": "fillRect",
  "args": [0, 0, 300, 150],
  "caller": {
    "url": "https://example.com/fingerprint.js",
    "line": 42,
    "column": 16
  }
}
```

Use this to trace which scripts are reading or writing Canvas surfaces during the session.

### Cross-platform protection validation

Record the same page on multiple platforms and compare the JSONL output to verify that BotBrowser's noise and rendering produce consistent protection:

```bash
# Record on Linux host
chromium-browser \
    --bot-profile="/path/to/win-profile.enc" \
    --bot-canvas-record-file=/tmp/canvaslab-linux.jsonl \
    --user-data-dir="$(mktemp -d)" \
    "https://example.com"

# Compare with recording from macOS host
diff /tmp/canvaslab-linux.jsonl /tmp/canvaslab-macos.jsonl
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| JSONL file is empty | Ensure the page actually uses Canvas APIs. Try a known fingerprint test site like [CreepJS](https://abrahamjuliot.github.io/creepjs/). |
| File path not writable | Use an absolute path and ensure the directory exists. BotBrowser does not create parent directories. |
| Noise is different during recording | Noise variance is intentionally disabled during recording to capture raw API calls. This is expected behavior. |
| Large JSONL file | Pages with heavy Canvas or WebGL usage (games, 3D visualizations) can generate large files. Filter by event type when analyzing. |

---

<a id="next-steps"></a>

## Next Steps

- [CanvasLab Documentation](../../../tools/canvaslab/). Complete reference including recording format, event types, replay viewer usage, and canvas fingerprint replay.
- [Canvas Fingerprinting](../fingerprint/CANVAS.md). Configure Canvas noise and rendering consistency.
- [WebGL Fingerprinting](../fingerprint/WEBGL.md). Manage WebGL parameter control.
- [CLI Flags Reference](../../../CLI_FLAGS.md#--bot-canvas-record-file). Flag documentation.

---

**Related documentation:** [CanvasLab Tool](../../../tools/canvaslab/) | [CLI Flags: --bot-canvas-record-file](../../../CLI_FLAGS.md#--bot-canvas-record-file)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
