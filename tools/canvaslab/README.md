# CanvasLab: Canvas Forensics for Privacy Protection (Beta)

Record every Canvas 2D, WebGL, and WebGL2 API call to review which graphics signals a page reads. Study fingerprint collection patterns and verify that BotBrowser's privacy protections behave as expected.

---

## What Is CanvasLab?

CanvasLab records every Canvas 2D, WebGL, and WebGL2 API call so you can review which graphics signals a page reads. When you capture these recordings, you can study fingerprint collection patterns and make sure BotBrowser's privacy protections behave as expected.

- **Review graphics signals** - inspect every Canvas and WebGL API call a page makes
- **Validate protections** - verify that BotBrowser's protections produce the expected protected behavior
- **Check consistency** - make sure privacy defenses work the same across Windows, macOS, and Linux
- **Document privacy risk** - understand which graphics surfaces need protection

---

## Try It Now

> **[▶️ Launch Live Replay Viewer](https://botswin.github.io/BotBrowser/tools/canvaslab/canvas_replay_viewer.html?jsonl=https://botswin.github.io/BotBrowser/tools/canvaslab/canvas_2d_simple_test_record.jsonl)**: Interactive demo preloaded with sample JSONL. Scrub through events, view generated code with source locations, and watch canvas rendering in slow motion!

### Demo Resources

| Resource | Description |
|----------|-------------|
| **[Canvas 2D Test Scene](../../docs/tools/canvaslab/canvas_2d_simple_test.html)** | Canvas 2D drawing routines for recording |
| **[WebGL Simple Test](../../docs/tools/canvaslab/webgl_simple_test.html)** | Basic WebGL recording test (shaders, buffers, textures) |
| **[WebGL Complex Test](../../docs/tools/canvaslab/webgl_complex_test.html)** | Advanced WebGL/WebGL2 recording test |
| **[Sample JSONL](../../docs/tools/canvaslab/canvas_2d_simple_test_record.jsonl)** | Preloaded recording for the replay viewer |

---

## Current Development Status

| Component | Status |
|-----------|--------|
| **Canvas 2D Recording** | **Shipped** - full API coverage with call stack tracking |
| **WebGL / WebGL2 Recording** | **Shipped** - full API coverage including shaders, textures, buffers, uniforms |
| **WebGPU Recording** | **Shipped** - full API coverage including adapters, devices, pipelines, render/compute passes, and readback |
| **Replay Viewer** | **Shipped** - HTML-based event viewer with Canvas 2D and WebGL support |

---

## Quick Start: Recording Canvas Activity

**Step 1: Start recording** (see [`--bot-canvas-record-file`](../../CLI_FLAGS.md#--bot-canvas-record-file))
```bash
chromium \
  --bot-profile=/absolute/path/to/profile.enc \
  --bot-canvas-record-file=/tmp/canvaslab.jsonl \
  --user-data-dir="$(mktemp -d)"
```

**Step 2: Visit a site and let the page run**
Go to the website you want to study. Let it load normally. CanvasLab will record every Canvas 2D, WebGL, WebGL2, and WebGPU API call the page makes.

**Step 3: Look at what was recorded**
Close BotBrowser. Your recording is saved to `/tmp/canvaslab.jsonl`. You can now review the Canvas, WebGL, and WebGPU calls made during the session.

---

## Recording Format & Capabilities

### Event Types

| Event Type | Description | Example Methods |
|------------|-------------|-----------------|
| **`canvas_init`** | Canvas creation and initial sizing | Canvas element creation, dimensions |
| **`context_create`** | Context initialization with attributes | `getContext('2d')`, `getContext('webgl2')` |
| **`state`** | Property setters and style changes | `fillStyle`, `lineWidth`, `font`, `shadowBlur` |
| **`draw`** | Drawing and transformation operations | `fillRect`, `drawImage`, `drawArrays`, `drawElements` |
| **`read`** | Data extraction and measurements | `getImageData`, `toBlob`, `measureText`, `readPixels`, `getParameter` |
| **`resize`** | Canvas dimension changes | `canvas.width/height` modifications |

> **Note:** Every API call includes the source location (URL, line, column) so you can identify which script made each call.

### What Gets Recorded

**Complete parameter capture:**
- Primitive values (numbers, strings, booleans)
- Complex objects serialized by content:
  - `ImageData` → base64 pixels + dimensions
  - `Path2D` → command sequence arrays
  - `DOMMatrix` → 6-element transforms
  - `CanvasGradient` → ID + color stops
  - Image sources → type + metadata

**Full return values:**
- Synchronous returns (`getImageData`, `measureText`)
- Callback results (`toBlob`)
- Promise resolutions (`OffscreenCanvas.convertToBlob`)

**Execution context:**
- Sequence numbers, timestamps, thread IDs
- Canvas IDs for multi-canvas scenarios
- Worker/offscreen canvas support

**Source code information:**
- Where every Canvas API call came from (URL, line, column)
- What function names are involved
- Which scripts made which API calls
- Everything you need to understand the graphics activity recorded during the session

**Example event with caller:**
```json
{
  "type": "state",
  "property": "fillStyle",
  "value": "#ff0000",
  "caller": {
    "url": "https://example.com/fingerprint.js",
    "line": 42,
    "column": 16
  }
}
```

---

## Use Cases

| Scenario | How CanvasLab Helps |
|----------|---------------------|
| **Privacy Defense Development** | Review how pages use Canvas surfaces and build stronger protections |
| **Signal Review** | Document which Canvas API calls appear during a session so you know which surfaces need protection |
| **Source Code Attribution** | Find which scripts are calling which Canvas APIs by looking at source locations |
| **Privacy Protection Validation** | Make sure BotBrowser's defenses work the same way on all platforms: Windows, macOS, Linux |
| **Privacy Testing** | Verify that privacy protections keep working after BotBrowser updates |
| **Privacy Research** | Study real-world graphics signal collection with complete records and source information for fingerprint protection research |

---

## Canvas Fingerprint Replay (ENT Tier4)

BotBrowser supports profile-backed canvas fingerprint replay: when a profile contains canvas data for a specific site, BotBrowser returns deterministic, site-specific Canvas responses at runtime.

Canvas data is embedded in the profile, not controlled by a CLI flag. Canvas Replay is available with ENT Tier4 profiles for approved validation workflows. To get a profile with replay support for a specific site or privacy validation target, contact us at [support@botbrowser.io](mailto:support@botbrowser.io).

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
