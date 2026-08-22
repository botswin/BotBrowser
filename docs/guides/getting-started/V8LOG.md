# V8Log Forensics

> Use V8Log only for authorized privacy validation sessions.

---

<a id="overview"></a>
## Overview

V8Log is a gated, privacy-focused browser-runtime forensics mode that records calls into local JSONL files. It is intended for short, controlled validation sessions where teams need evidence of how page scripts collect browser signals.

This is useful when source review is incomplete because a page uses packed JavaScript, VM-style bundles, or WebAssembly. V8Log records the runtime call sequence, arguments, return previews, frame context, and event order so the collection behavior can be reviewed directly.

V8Log does not change normal browsing behavior when disabled. Release use is gated by profile entitlement and build policy.

For background on browser fingerprinting as a privacy issue, see [Fingerprint Privacy](../../../FINGERPRINT_PRIVACY.md).

---

<a id="quick-start"></a>
## Quick Start

Create a writable directory and launch BotBrowser with V8Log enabled:

```bash
mkdir -p /tmp/botbrowser-v8log

chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-v8-log=sample \
    --bot-v8-log-dir=/tmp/botbrowser-v8log \
    --user-data-dir="$(mktemp -d)" \
    "https://example.com"
```

For deeper validation review, use `full` only when requested:

```bash
--bot-v8-log=full
--bot-v8-log-dir=/tmp/botbrowser-v8log
```

Disable V8Log explicitly with:

```bash
--bot-v8-log=none
```

---

<a id="modes"></a>
## Modes

| Mode | Use |
|------|-----|
| `none` | V8Log disabled. This is the normal default. |
| `sample` | Reduced evidence trace for most validation reproductions. |
| `full` | Fuller evidence trace for short, guided reproductions. |

Use the shortest page flow that reproduces the behavior. Evidence files can grow quickly on complex pages.

---

<a id="api-filters"></a>
## API Filters

Use [`--bot-v8-log-exclude-api`](../../../CLI_FLAGS.md#flag-bot-v8-log-exclude-api) to omit high-volume APIs that are outside the current review:

```bash
--bot-v8-log=full
--bot-v8-log-exclude-api=String.charCodeAt,Array.join
```

The value is a comma-separated list of exact API names. Whitespace around names is ignored. Excluded calls are not written and do not consume the trace event budget. Other APIs and events without an API name remain in the trace.

Apply a separate list to each BrowserContext when concurrent validation sessions need different evidence scopes.

---

<a id="sample-jsonl"></a>
## Sample JSONL

An interactive sample is available in the [V8Log Viewer](https://botswin.github.io/BotBrowser/tools/v8log/v8log_viewer.html?jsonl=https://botswin.github.io/BotBrowser/tools/v8log/fonts_v8log_sample.jsonl).

The viewer is preloaded with a short public-page capture. It shows how V8Log connects call expressions, arguments, return previews, frame context, API group, and event order.

---

<a id="playwright"></a>
## Playwright Example

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
    executablePath: process.env.BOTBROWSER_EXEC_PATH,
    headless: true,
    args: [
        `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
        "--bot-v8-log=sample",
        "--bot-v8-log-dir=/tmp/botbrowser-v8log",
    ],
});

const page = await browser.newPage();
await page.goto("https://example.com");
await page.waitForTimeout(5000);
await browser.close();
```

---

<a id="troubleshooting"></a>
## Troubleshooting

| Problem | Solution |
|---------|----------|
| No files are written | Confirm `--bot-v8-log` is not `none`, the directory exists, and the browser process can write to it. |
| Files are too large | Use `sample`, shorten the reproduction, and close the browser immediately after the target behavior appears. |
| A high-volume API obscures later evidence | Add its exact API name to `--bot-v8-log-exclude-api`. |
| V8Log does not start in release | Confirm the profile and subscription include V8Log support. |

---

## Related Documentation


- [V8Log Tool](../../../tools/v8log/)
- [Automation Consistency Practices](AUTOMATION_CONSISTENCY.md)
- [Profile Management](PROFILE_MANAGEMENT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
