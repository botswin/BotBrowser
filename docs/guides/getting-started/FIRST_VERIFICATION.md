# First Verification

> Verify BotBrowser fingerprint protection with CreepJS and BrowserLeaks after setup.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed and working. See [INSTALLATION.md](../../../INSTALLATION.md).
- **A profile file** loaded via `--bot-profile`. See [Profile Management](PROFILE_MANAGEMENT.md).
- **A proxy** (optional but recommended for testing geo-detection).

---

<a id="quick-start"></a>

## Quick Start

### 1. Launch BotBrowser

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@proxy.example.com:1080 \
  --user-data-dir="$(mktemp -d)"
```

### 2. Visit a verification site

Open one of the following URLs in the browser:

- **CreepJS:** `https://abrahamjuliot.github.io/creepjs/`
- **BrowserLeaks:** `https://browserleaks.com/`

### 3. Check for a passing result

Each tool reports either a trust score or detailed signal output. A properly configured BotBrowser instance should show consistent fingerprint data across all reported properties.

---

<a id="how-it-works"></a>

## How It Works

Fingerprint verification tools check browser properties for internal consistency.

BotBrowser profiles define all of these properties consistently at the browser engine level, so verification tools should see a unified, authentic browser environment.

---

## Common Scenarios

### Quick smoke test after profile updates

When you switch to a new profile version, run one fast pass first:

1. Launch with only `--bot-profile` and `--proxy-server`.
2. Open CreepJS and BrowserLeaks.
3. Confirm no obvious mismatch before adding advanced flags.

### Regression check before production rollout

Use the same machine, profile, and proxy to compare before/after results:

1. Capture screenshots from CreepJS and BrowserLeaks.
2. Save launch args used for each run.
3. Diff results and investigate any new mismatch signals.

### Framework vs. framework-less verification

If a framework-based run fails consistency checks:

1. Re-run with `--bot-script` using the same profile/proxy.
2. Compare outcomes to isolate whether the issue is framework artifacts.
3. Re-introduce framework options incrementally.

---

<a id="verification-sites"></a>

## Verification Sites

<a id="creepjs"></a>
### CreepJS

**URL:** `https://abrahamjuliot.github.io/creepjs/`

CreepJS is one of the most comprehensive fingerprint analysis tools. It displays a trust score and consistency status across many browser properties.

Look for a high trust score and zero inconsistencies. All sections should show consistent data without "undefined" or error values.

**Automation verification:**

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    `--bot-profile=${process.env.BOT_PROFILE_PATH}`,
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});

const page = await browser.newPage();
await page.addInitScript(() => {
  delete window.__playwright__binding__;
  delete window.__pwInitScripts;
});

await page.goto("https://abrahamjuliot.github.io/creepjs/");
// Wait for CreepJS to finish analysis
await page.waitForTimeout(15000);
await page.screenshot({ path: "creepjs-result.png", fullPage: true });
await browser.close();
```

<a id="iphey"></a>
<a id="browserleaks"></a>
### BrowserLeaks

**URL:** `https://browserleaks.com/`

BrowserLeaks is useful for drilling into individual fingerprint surfaces such as Canvas, WebGL, fonts, WebRTC, timezone, and headers.

Look for values that match your loaded profile and proxy configuration with no obvious contradictions between sections.

---

<a id="what-to-check"></a>

## What to Check

When reviewing verification tool results, confirm that all reported properties are internally consistent and match the loaded profile. BotBrowser handles this alignment automatically when a profile is loaded correctly. If you see any mismatch, check the troubleshooting table below.

---

<a id="common-failures"></a>

## Common Verification Failures and Fixes

| Failure | Cause | Fix |
|---------|-------|-----|
| Timezone mismatch | Using framework proxy options instead of `--proxy-server` | Pass the proxy via `--proxy-server` flag so BotBrowser can auto-detect geo info. |
| WebRTC IP leak | WebRTC is enabled and exposing the real local IP | Use `--bot-webrtc=disabled` or `--bot-webrtc-ice=google` to control ICE candidates. |
| navigator.webdriver is true | Profile not loaded correctly | Verify `--bot-profile` points to a valid profile file. BotBrowser handles `navigator.webdriver` automatically. |
| Playwright bindings detected | `__playwright__binding__` visible in page context | Add `page.addInitScript()` to remove Playwright bindings. Not needed for Puppeteer. |
| Viewport size mismatch | Playwright or Puppeteer is overriding viewport | Do not set `defaultViewport` in Puppeteer (use `null`). Do not set viewport options in Playwright. |
| OS mismatch in User-Agent | Profile Chrome version does not match binary version | Use profiles that match your BotBrowser binary version (e.g., v146 binary needs v146 profiles). |
| Fonts do not match profile | Font config set to `real` instead of `profile` | Use `--bot-fonts=profile` (default) to use the profile's embedded font list. |
| Language does not match location | Manual language override conflicts with proxy location | Either let BotBrowser auto-detect (`auto`) or align `--bot-languages` with `--bot-timezone`. |
| Canvas/WebGL shows "undefined" | Profile not loaded correctly | Verify `--bot-profile` points to a valid, non-corrupted profile file using an absolute path. |

---

<a id="automated-verification"></a>

## Automated Verification Script

Run a complete verification check from the command line:

```javascript
import { chromium } from "playwright-core";

const EXEC = process.env.BOTBROWSER_EXEC_PATH;
const PROFILE = process.env.BOT_PROFILE_PATH;

const sites = [
  { name: "CreepJS", url: "https://abrahamjuliot.github.io/creepjs/", wait: 15000 },
  { name: "BrowserLeaks", url: "https://browserleaks.com/", wait: 10000 },
];

const browser = await chromium.launch({
  executablePath: EXEC,
  headless: true,
  args: [
    "--disable-audio-output",
    `--bot-profile=${PROFILE}`,
  ],
});

for (const site of sites) {
  const page = await browser.newPage();
  await page.addInitScript(() => {
    delete window.__playwright__binding__;
    delete window.__pwInitScripts;
  });

  console.log(`Testing ${site.name}...`);
  await page.goto(site.url);
  await page.waitForTimeout(site.wait);
  await page.screenshot({
    path: `verification-${site.name.toLowerCase()}.png`,
    fullPage: true,
  });
  await page.close();
  console.log(`  Screenshot saved: verification-${site.name.toLowerCase()}.png`);
}

await browser.close();
console.log("Verification complete. Review the screenshots.");
```

---

## Troubleshooting / FAQ

| Problem | Solution |
|---|---|
| Quick Start works but advanced setup fails | Add one option at a time from this guide and verify after each change. |
| Same config behaves differently on another machine | Verify BotBrowser version, profile file, and full launch args are identical. |
| I need strict comparability between runs | Keep proxy/locale/timezone fixed and avoid changing profile or seed values mid-test. |

<a id="next-steps"></a>

## Next Steps

- [Validation Results](../../../VALIDATION.md). Full test matrix across platforms and fingerprinting checks.
- [CLI Recipes](CLI_RECIPES.md). Common flag combinations for different scenarios.
- [Profile Management](PROFILE_MANAGEMENT.md). Understand profile types, versions, and configuration.
- [Proxy & Geolocation](../network/PROXY_GEOLOCATION_ALIGNMENT.md). How auto-detection works and how to override it.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags.

---

**Related documentation:** [Installation](../../../INSTALLATION.md) | [Validation](../../../VALIDATION.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
