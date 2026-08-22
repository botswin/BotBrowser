# Screenshot Best Practices

> Capture stable, reproducible browser screenshots across headless and headful environments.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser** installed and running. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).
- **Playwright or Puppeteer** installed for programmatic screenshots.
- **On Linux:** A virtual display (Xvfb) must be running. See [Headless Server Setup](HEADLESS_SERVER_SETUP.md).

---

<a id="quick-start"></a>

## Quick Start

### Playwright

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
    executablePath: process.env.BOTBROWSER_EXEC_PATH,
    headless: true,
    args: [
        `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    ],
});

const page = await browser.newPage();
await page.goto("https://example.com");

// Viewport screenshot
await page.screenshot({ path: "viewport.png" });

// Full page screenshot
await page.screenshot({ path: "fullpage.png", fullPage: true });

await browser.close();
```

### Puppeteer

```javascript
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
    executablePath: process.env.BOTBROWSER_EXEC_PATH,
    headless: true,
    defaultViewport: null,
    args: [
        `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    ],
});

const page = await browser.newPage();
await page.goto("https://example.com");

// Viewport screenshot
await page.screenshot({ path: "viewport.png" });

// Full page screenshot
await page.screenshot({ path: "fullpage.png", fullPage: true });

await browser.close();
```

---

<a id="how-it-works"></a>

## How It Works

Screenshots in BotBrowser use the same rendering pipeline as a regular Chrome installation, with fingerprint properties applied from the profile:

1. **Resolution and DPI.** The profile defines screen dimensions and device pixel ratio (DPR). A profile with DPR 2 produces screenshots at 2x the viewport pixel dimensions. In Puppeteer, always set `defaultViewport: null` so Puppeteer does not override the profile's display settings. In Playwright, do not set explicit viewport dimensions in context options.

2. **Viewport vs. full page.** A viewport screenshot captures only the visible area. A full page screenshot scrolls the entire page and stitches the result. The viewport dimensions come from the profile.

3. **Rendering consistency.** Canvas noise, font rendering, and WebGL output are all determined by the profile. Screenshots taken with the same profile produce identical visual output across different host systems.

4. **Headless Linux.** On servers without a monitor, Xvfb provides the virtual display that Chrome's compositor needs. Without it, screenshots time out or produce blank images.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Correct screenshot order

When taking both viewport and full page screenshots, capture the full page screenshot first or wait between captures. Taking a viewport screenshot immediately followed by a full page screenshot in rapid succession can cause rendering issues:

```javascript
// Recommended: wait for the page to stabilize
await page.goto("https://example.com", { waitUntil: "networkidle" });

// Take viewport screenshot
await page.screenshot({ path: "viewport.png" });

// Wait briefly before full page capture
await page.waitForTimeout(500);
await page.screenshot({ path: "fullpage.png", fullPage: true });
```

### Full-page captures and responsive layout

Let the full-page capture API work from the profile's existing viewport. Do not resize the
viewport to the document's full height before calling `fullPage` or CDP
`Page.captureScreenshot({captureBeyondViewport: true})`. A temporary full-height viewport can
change `vh` units, media queries, resize handlers, sticky elements, and lazy layout, producing
an image with the right dimensions but missing or displaced content.

For very tall pages, validate the bottom of the image and a known content marker, rather than
checking only the PNG/JPEG dimensions. In containers, increase `/dev/shm` when capture hangs or
returns a protocol error. Shared memory helps the capture complete, but it does not correct
content that was laid out against the wrong viewport.

### PNG vs. JPEG format

```javascript
// PNG: lossless, larger files, better for text-heavy pages
await page.screenshot({ path: "output.png", type: "png" });

// JPEG: lossy, smaller files, configurable quality
await page.screenshot({ path: "output.jpg", type: "jpeg", quality: 80 });
```

Use PNG when pixel accuracy matters (fingerprint verification, visual regression testing). Use JPEG for general-purpose captures where file size is a concern.

### High-DPI screenshots

The screenshot resolution is determined by the profile's device pixel ratio. A profile with `devicePixelRatio: 2` on a 1920x1080 viewport produces a 3840x2160 screenshot:

```javascript
// The profile controls DPI. No additional configuration needed.
await page.screenshot({ path: "hidpi.png" });
```

To override the profile's DPI for a specific use case:

```bash
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-config-disable-device-scale-factor=true
```

### Screenshots on headless Linux

Ensure Xvfb is running with a resolution at least as large as the profile's screen dimensions:

```bash
# Start Xvfb with sufficient resolution
Xvfb :10 -screen 0 2560x1440x24 -ac &
export DISPLAY=:10.0

# Launch BotBrowser
chromium-browser \
    --headless \
    --no-sandbox \
    --bot-profile="/path/to/profile.enc" \
    --remote-debugging-port=9222
```

If the Xvfb resolution is smaller than the profile's screen size, screenshots may be clipped or produce unexpected results.

### Element-specific screenshots

```javascript
// Playwright
const element = await page.locator("#target-element");
await element.screenshot({ path: "element.png" });

// Puppeteer
const element = await page.$("#target-element");
await element.screenshot({ path: "element.png" });
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Screenshot times out on Linux | Ensure Xvfb is running and `DISPLAY=:10.0` is set. See [Headless Server Setup](HEADLESS_SERVER_SETUP.md). |
| Blank or all-white screenshot | The page may not have finished loading. Use `waitUntil: "networkidle"` or wait for a specific element. |
| Screenshot resolution is wrong | In Puppeteer, set `defaultViewport: null` to let the profile control dimensions. In Playwright, do not set explicit viewport options. |
| Full page screenshot crashes | Avoid capturing viewport and full page screenshots in rapid succession. Add a brief wait between them. |
| Full page image has blank or displaced sections | Keep the original profile viewport and use the full-page API directly. Do not set the viewport to the document height before capture. |
| A very tall capture hangs in Docker | Increase the container's `/dev/shm` allocation and verify the returned image contains a bottom marker. Shared memory alone does not fix layout changes. |
| Fonts look different than expected | BotBrowser uses the profile's embedded font bundle. Verify the profile matches your expected platform (Windows, macOS, etc.). |
| Colors appear different across runs | This is expected. Canvas noise produces deterministic but session-unique visual output. Use the same profile and noise seed for identical results. |

---

<a id="next-steps"></a>

## Next Steps

- [Headless Server Setup](HEADLESS_SERVER_SETUP.md). Configure Xvfb and system libraries for Linux.
- [Performance Optimization](PERFORMANCE_OPTIMIZATION.md). Optimize rendering speed for screenshot workloads.
- [Playwright Guide](../getting-started/PLAYWRIGHT.md). Full Playwright integration reference.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Display and rendering override flags.

---

**Related documentation:** [Advanced Features](../../../ADVANCED_FEATURES.md) | [Installation Guide](../../../INSTALLATION.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
