# CPU Core Scaling Protection

> BotBrowser constrains Worker thread parallelism to match the profile's `navigator.hardwareConcurrency`, keeping computation scaling consistent with the claimed core count.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser** installed. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).

---

<a id="overview"></a>

## Overview

`navigator.hardwareConcurrency` tells JavaScript how many CPU cores are available. Tracking systems can verify this value by measuring actual parallel computation speed. If a profile claims 4 cores but the host has 16, Worker-based benchmarks will complete faster than expected for a 4-core machine.

BotBrowser solves this by constraining Worker threads to match the profile's claimed core count via CPU affinity on Linux and Windows. The computation scaling curve aligns with the reported value.

---

<a id="quick-start"></a>

## Quick Start

```bash
# Profile defines hardwareConcurrency. Workers are automatically constrained.
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --user-data-dir="$(mktemp -d)"
```

No extra flags needed. When the profile sets `navigator.hardwareConcurrency`, BotBrowser automatically applies CPU affinity to Worker threads.

### Choosing the reported core count

`--bot-cores` selects which core count `navigator.hardwareConcurrency` reports. The default keeps the profile's claim.

| Value | Reported count |
|-------|----------------|
| `profile` (default) | The profile's claimed count. |
| `real` | The host's actual core count. |
| `min` | The lower of the profile claim and the host count. |
| A number | That number exactly, as given. |

```bash
# Report the profile claim (default)
--bot-cores=profile

# Report the host's real core count
--bot-cores=real

# Never claim more cores than the host actually has
--bot-cores=min

# Report an explicit count
--bot-cores=8
```

Thread pools size themselves from the same resolved value, so the parallelism a page can observe stays consistent with the count it was told. An unparsable value falls back to the profile behavior rather than reporting a bogus count.

---

<a id="how-it-works"></a>

## How It Works

1. **Profile sets the value.** The profile defines `navigator.hardwareConcurrency` (e.g., 4 cores).

2. **Workers are constrained.** When a Worker, SharedWorker, or ServiceWorker is created, BotBrowser pins it to a subset of physical cores matching the claimed count.

3. **Computation scales correctly.** A parallel benchmark using 4 Workers on a "4-core" profile will show the same scaling behavior as a real 4-core machine, even if the host has more cores.

---

<a id="common-scenarios"></a>

## Common Scenarios

### High-core server running low-core profiles

A 32-core server running a mobile profile (4 cores) will constrain all Workers to 4 physical cores:

```javascript
const browser = await chromium.launch({
    executablePath: process.env.BOTBROWSER_EXEC_PATH,
    headless: true,
    args: [
        "--bot-profile=/path/to/mobile-profile.enc",
    ],
});

const page = await browser.newPage();
const cores = await page.evaluate(() => navigator.hardwareConcurrency);
console.log(cores); // 4 (from profile)
// Worker-based parallel benchmarks will show 4-core scaling behavior
await browser.close();
```

### Multiple profiles on same host

Each browser instance is constrained independently based on its profile. A 4-core profile and an 8-core profile on the same 32-core server show different computation scaling curves matching their respective claims.

---

<a id="platform-support"></a>

## Platform Support

| Platform | CPU Affinity | Notes |
|----------|-------------|-------|
| **Linux** | Supported | Uses CPU affinity to pin Worker threads |
| **Windows** | Supported | Uses CPU affinity to pin Worker threads |
| **macOS** | Not supported | macOS does not expose CPU affinity APIs. Workers run on all cores. `navigator.hardwareConcurrency` is still set from the profile, but parallel timing may not match. |

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| `hardwareConcurrency` shows wrong value | Check `--bot-cores` first. With the default `profile` value the count comes from the profile, so also verify the profile contains the intended core count. |
| Parallel benchmark still fast on macOS | macOS does not support CPU affinity. Consider running on Linux for full protection. |
| Workers seem slow | Expected when the profile claims fewer cores than the host. Workers are intentionally constrained. |

---

<a id="next-steps"></a>

## Next Steps

- [Performance Optimization](../deployment/PERFORMANCE_OPTIMIZATION.md). Tune throughput on multi-core servers.
- [Navigator Properties](NAVIGATOR_PROPERTIES.md). Other navigator-level fingerprint surfaces.
- [Stack Depth Protection](STACK_DEPTH.md). Control JavaScript recursive stack depth.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete flag documentation.

---

**Related documentation:** [Advanced Features: CPU Core Scaling](../../../ADVANCED_FEATURES.md#cpu-core-scaling) | [CLI Flags](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [How navigator.hardwareConcurrency Exposes Your Real CPU Core Count](https://botbrowser.io/en/blog/cpu-core-scaling/)
