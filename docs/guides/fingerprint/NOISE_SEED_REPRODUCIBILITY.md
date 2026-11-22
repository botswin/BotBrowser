# Noise Seed Reproducibility

> Deterministic noise generation with seed control for reproducible fingerprint protection across sessions.

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

## How It Works

BotBrowser applies controlled noise to supported Canvas, WebGL, WebGPU, AudioContext, and text measurement surfaces. The `--bot-noise-seed` flag (ENT Tier2) makes that noise deterministic for the same profile and implementation. Different seeds produce different noise fields.

---

<a id="what-is-noise-seed"></a>

## What Is a Noise Seed?

A noise seed is an integer value that initializes BotBrowser's deterministic random number generator. This generator controls the variance applied to fingerprint-sensitive APIs. With the same profile, seed, host, rendering path, and inputs, the affected outputs are reproducible.

```bash
# Set a noise seed for deterministic fingerprinting
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-noise-seed=42
```

**Key properties:**

- **Same seed, same protected output.** On the same implementation and rendering path, a session launched with `--bot-noise-seed=42` reproduces its affected Canvas hashes, WebGL readbacks, and audio fingerprints.
- **Different seed, different noise field.** Changing the seed to `43` selects a different deterministic field. Some values can collide in edge cases.
- **Seed value `0`** keeps noise active using profile defaults (no deterministic seeding).

---

<a id="seed-range"></a>

## Seed Range

The `--bot-noise-seed` flag accepts integer values from `1` to `UINT32_MAX` (4,294,967,295). Each value selects a stable noise field for the same profile, implementation, and rendering path. Distinct fields can still produce the same final value for a particular API and input.

---

<a id="affected-surfaces"></a>

## Affected Fingerprint Surfaces

The noise seed controls variance across all major fingerprint surfaces:

The seed controls noise across Canvas 2D, WebGL, WebGPU, AudioContext, ClientRects, and TextRects. The affected output is reproducible per seed when the profile, BotBrowser implementation, host rendering path, and measurement inputs stay the same.

---

<a id="per-context-noise"></a>

## Per-Context Noise Seed

With Per-Context Fingerprint (ENT Tier3), each `BrowserContext` can use its own noise seed.

```javascript
// Puppeteer
// Browser-level CDP session (required for BotBrowser.* commands)
const client = await browser.target().createCDPSession();

// Create a new browser context BEFORE setting flags
const context = await browser.createBrowserContext();

// Set per-context flags BEFORE creating any page
await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: context._contextId,
  botbrowserFlags: [
    "--bot-profile=/path/to/profile-a.enc",
    "--bot-noise-seed=100",
  ],
});

// NOW create a page. The renderer will start with the correct flags.
const page = await context.newPage();
```

A second context with `--bot-noise-seed=200` selects a different noise field. Compare the affected outputs rather than assuming that every reported fingerprint value must differ.

---

<a id="use-cases"></a>

## Use Cases

### Multi-Tenant Isolation

Assign a separate seed per tenant or account. On the same implementation and rendering path, each seed gives a stable protected profile that can be reproduced across restarts.

### Reproducible Testing

Use a fixed seed during development and testing to get consistent fingerprint hashes. This simplifies debugging and regression testing.

### Session Persistence

Relaunch sessions with the same seed to maintain fingerprint continuity across restarts, without needing to preserve browser state.

---

<a id="example"></a>

## Complete Example

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--bot-noise-seed=42",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});

const page = await browser.newPage();
await page.goto("https://example.com");

// ... use the page as needed ...

await browser.close();
```

To verify noise seed reproducibility:

1. Launch BotBrowser with a profile and `--bot-noise-seed=42`, then visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Record the reported Canvas, WebGL, and AudioContext fingerprint values.
3. Launch a second session with the same profile, seed, host, and rendering path, then compare the recorded values.
4. Change the seed to a different value (e.g., `--bot-noise-seed=43`) and check which affected outputs change.

---

<a id="common-scenarios"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---|---|
| Observed value does not match the profile expectation | Verify profile path, active overrides, and any framework-injected settings. |
| Same setup behaves differently on another machine | Compare BotBrowser build, profile version, host OS target, and full launch args. |
| Test results fluctuate between runs | Keep proxy, locale/timezone, and runtime load stable during comparison tests. |

<a id="next-steps"></a>

## Next Steps

- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags, including `--bot-noise-seed`.
- [Advanced Features](../../../ADVANCED_FEATURES.md). Multi-layer fingerprint noise architecture.

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [Noise Seed Reproducibility for Repeatable Fingerprint Runs](https://botbrowser.io/en/blog/noise-seed-reproducibility/)
