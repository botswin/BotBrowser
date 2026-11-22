# Storage and Memory Consistency

> BotBrowser provides profile-consistent storage quota and memory values, preventing hardware-based tracking through these APIs.

---

## Prerequisites

- **BotBrowser** installed. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).


<a id="overview"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

## Overview

Storage and memory APIs can expose hardware characteristics that vary per machine, creating a privacy risk. BotBrowser controls these values at the browser engine level, returning profile-consistent responses that match the target device rather than the host machine.

---

<a id="runtime-overrides"></a>

## Runtime Overrides

The default policy is `profile`: BotBrowser uses the active profile for storage quota and memory values. Use these flags when a workflow needs an explicit policy without modifying the profile file:

```bash
# Use profile values, the default behavior
--bot-js-heap-size-limit=profile
--bot-storage-quota=profile

# Use native Chromium behavior for one surface
--bot-js-heap-size-limit=real
--bot-storage-quota=real

# Set explicit byte values
--bot-js-heap-size-limit=4294967296
--bot-storage-quota=10737418240
```

`--bot-js-heap-size-limit` is applied to newly started sessions or contexts. Start a new browser session or create a fresh context when changing this value. `--bot-storage-quota` can be used at launch and in per-context flag workflows.

---

<a id="what-botbrowser-controls"></a>

## What BotBrowser Controls

### Storage Quota

Storage quota values are consistent with the profile's target hardware, not the actual host disk size.

### Heap Memory

Memory-related properties are controlled to return values appropriate for the profile's target device, with internally consistent relationships between reported values.

### Device Memory

Device memory reporting (approximate RAM in gigabytes) is also controlled by the profile, ensuring all memory-related signals are consistent with each other and with the declared hardware.

---

<a id="example"></a>

## Example

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

// ... use the page as needed ...

await browser.close();
```

To verify storage and memory protection is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported storage quota and device memory values match the profile configuration, not the host machine.
3. Launch a second session with the same profile and launch flags, then compare quota and memory values.

---

<a id="related-docs"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---|---|
| Observed value does not match the profile expectation | Verify profile path, active overrides such as `--bot-js-heap-size-limit` or `--bot-storage-quota`, and any framework-injected settings. |
| Same setup behaves differently on another machine | Compare BotBrowser build, profile version, host OS target, and full launch args. |
| Test results fluctuate between runs | Keep proxy, locale/timezone, and runtime load stable during comparison tests. |

<a id="next-steps"></a>

## Next Steps

- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.
- [Advanced Features](../../../ADVANCED_FEATURES.md). Technical architecture and implementation details.

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [Memory and Storage Signals in Browser Profiles](https://botbrowser.io/en/blog/storage-quota-fingerprinting/)
