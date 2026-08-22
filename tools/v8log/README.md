# V8Log Forensics

Record browser-runtime evidence for authorized fingerprint protection and privacy validation sessions.

---

## What Is V8Log?

V8Log is a privacy-focused browser-runtime forensics tool for short, controlled validation sessions. It records calls made by page scripts during fingerprint collection, even when source review is limited by packed JavaScript, VM-style bundles, or WebAssembly.

- **See runtime collection behavior**: review function calls, arguments, return previews, frame context, and event order
- **Work beyond source review**: inspect runtime evidence from packed JavaScript, VM-style bundles, and WebAssembly-driven flows
- **Support focused validation**: capture a short local trace for privacy validation without sharing a full browser session
- **Compare contexts**: confirm whether two profiles expose consistent behavior in the same browser process
- **Keep normal browsing unchanged**: V8Log is disabled unless the gated flag is enabled

Use V8Log only for authorized, controlled validation. Keep captures short and review files before sharing them outside your organization.

This positioning follows BotBrowser's privacy model. See [Fingerprint Privacy](../../FINGERPRINT_PRIVACY.md) for the broader reason browser signal collection needs defensive validation.

---

## Try It Now

> [Launch V8Log Viewer](https://botswin.github.io/BotBrowser/tools/v8log/v8log_viewer.html?jsonl=https://botswin.github.io/BotBrowser/tools/v8log/fonts_v8log_sample.jsonl): Interactive demo preloaded with a fonts-page V8Log capture. Filter by API group or top function, inspect call expressions, review arguments and return previews, and open raw JSONL records.

### Demo Resources

| Resource | Description |
|----------|-------------|
| [V8Log Viewer](https://botswin.github.io/BotBrowser/tools/v8log/v8log_viewer.html) | Static JSONL viewer for runtime fingerprint collection evidence with top functions, call expressions, arguments, returns, source, group filters, search, and raw event inspection |
| [Fonts Sample JSONL](https://botswin.github.io/BotBrowser/tools/v8log/fonts_v8log_sample.jsonl) | Original V8Log sample captured from a public fonts validation page |

---

## Quick Start

See the CLI reference for [`--bot-v8-log`](../../CLI_FLAGS.md#flag-bot-v8-log) and [`--bot-v8-log-dir`](../../CLI_FLAGS.md#flag-bot-v8-log-dir).

```bash
mkdir -p /tmp/botbrowser-v8log

chromium \
  --bot-profile=/absolute/path/to/profile.enc \
  --bot-v8-log=sample \
  --bot-v8-log-dir=/tmp/botbrowser-v8log \
  --user-data-dir="$(mktemp -d)" \
  "https://example.com"
```

Use `full` only for short guided validations:

```bash
--bot-v8-log=full
--bot-v8-log-dir=/tmp/botbrowser-v8log
```

### Filter APIs

Exclude selected API names when a high-volume call is outside the current review:

```bash
--bot-v8-log=full
--bot-v8-log-exclude-api=String.charCodeAt,Array.join
```

Names are matched exactly. Excluded calls do not appear in the JSONL output and do not consume the trace event budget. See the [V8Log guide](../../docs/guides/getting-started/V8LOG.md#api-filters) for BrowserContext usage.

---

## Sample JSONL

The sample below shows how V8Log turns runtime fingerprint collection into reviewable evidence.

| Resource | Description |
|----------|-------------|
| [Fonts Sample JSONL](https://botswin.github.io/BotBrowser/tools/v8log/fonts_v8log_sample.jsonl) | Original V8Log capture used by the online viewer |

Example event:

```json
{"seq":3,"type":"browser_signal","api_category":"profile_identity","kind":"attribute_get","frame_url":"https://example.test/account","script_url":"https://static.example.test/app.js","line":42,"column":17,"return_preview":"[profile-matched string]","world":"main","realm":"main-frame","truncated":false}
```

---

## Output Handling

- Use a dedicated output directory per run.
- Keep runs short. Start the browser, reproduce the target behavior, then close the browser.
- Redact URLs, account identifiers, tokens, cookies, and customer data before sharing logs outside your organization.
- Prefer `sample` mode first. Use `full` only when the reduced trace is not enough.

---

## Related Documentation

- [V8Log Guide](../../docs/guides/getting-started/V8LOG.md)
- [Automation Consistency Practices](../../docs/guides/getting-started/AUTOMATION_CONSISTENCY.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) - [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
