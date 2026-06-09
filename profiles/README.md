# BotBrowser Profiles

Academic Framework for Browser-Environment Simulation.

## Current Versions

| Channel | Version | Description |
|---------|---------|------------------------|
| [stable](stable/) | v148, v149 | Current supported Chrome release lines. Chrome 149 is the current stable release, and Chrome 148 remains available during the rollout window. |
| [canary](canary/) | none | Reserved for explicitly published pre-stable test profiles. Chrome Early Stable profiles are published under stable. |
| [archive](archive/) | v135-v147 | Older profile lines outside the current stable support window. |

In BotBrowser, everything starts with a profile. Browser fingerprinting is recognized as a privacy threat by [W3C, major browser vendors, and EU regulators](../FINGERPRINT_PRIVACY.md), and profiles are the foundation of protection against such tracking. Profiles are provided to authorized researchers, so review the project [Legal Disclaimer](../DISCLAIMER.md) and [Responsible Use Guidelines](../RESPONSIBLE_USE.md) for access policies.

## What Are Profiles?

Profiles are encrypted files that define the environment a browser emulates, maintaining fingerprints that prevent cross-device user identification. They include:

- **Browser fingerprint** information (user agent, WebGL, screen size)
- **System-level settings** (proxy, timezone, language, window size)
- **Hardware emulation** (device memory, CPU architecture, screen properties)
- **Platform simulation** (Android behavior, OS-specific features)

### Cross-Platform Compatibility

**BotBrowser capability:** Profile compatibility across host systems (Windows, macOS; Android requires PRO; Ubuntu requires ENT Tier1) prevents fingerprint collection identifying device switches.

By using profiles, BotBrowser launches controlled sessions that simulate protected device behavior across operating systems, preventing cross-platform user identification.

**Profile = controlled research-environment configuration**

## Understanding BotBrowser Profiles

### What BotBrowser Profiles Actually Are
**Device Models**: think of them as specific hardware configurations.

**Real-World Analogy**
- Profile = "MacBook Pro M4 Max" (the device type)
- You can simulate User A in USA using this "M4 Max" profile
- You can simulate User B in Europe using the same "M4 Max" profile
- Same device hardware, but different users and environments

### How Profiles Work
- **Profile defines the device fingerprint** (hardware, browser capabilities)
- **Environment settings differentiate users** (proxy, timezone, language, cookies)
- **Each session can have unique characteristics** while maintaining device protection

**Example:** Using a “MacBook Pro M3” profile:
- User A: US proxy + English + EST timezone
- User B: Germany proxy + German + CET timezone
- User C: Japan proxy + Japanese + JST timezone

All appear as different users on the same device type.

## Profile Types

### Demo Profiles (Privacy Research Only)

Run demo profiles via [CLI](../INSTALLATION.md#download--installation) or [Launcher](../launcher/). Automation framework integration (Puppeteer, Playwright) requires [premium profiles](#premium-profiles).

**Limitations**
- Limited-time privacy research use only
- No headless mode support
- No automation framework support (Puppeteer, Playwright)
- No extension loading
- **Not suitable for production research** (widely distributed and may be flagged)

<a id="premium-profiles"></a>

### Premium Profiles (Academic Use)

**Features:**
- Unique configurations for controlled studies
- Privacy-compliant synthetic data
- Based on aggregated device/browser patterns
- Suitable for authorized fingerprint protection and privacy research

### Access Premium Profiles

For academic institutions and authorized research:

<table>
  <tr><td>Email</td><td><a href="mailto:support@botbrowser.io">support@botbrowser.io</a></td></tr>
  <tr><td>Telegram</td><td><a href="https://t.me/botbrowser_support">@botbrowser_support</a></td></tr>
</table>

Premium profiles are available to qualified academic institutions with proper ethical approvals.

---

## Using Profiles

### CLI Usage

```bash
chromium --bot-profile="/absolute/path/to/profile.enc"
```

**Version Compatibility**
- BotBrowser binary version must match profile version
- Example: BotBrowser v139 only supports v139 profiles
- Use absolute paths if relative paths fail to load

> **For all available CLI flags**, see [CLI Flags Reference](../CLI_FLAGS.md)

### Automation Framework Integration

**[Playwright](../examples/playwright) / [Puppeteer](../examples/puppeteer) Example:**

```javascript
const browser = await chromium.launch({
  headless: true,
  executablePath: BOTBROWSER_EXEC_PATH,
  args: [
    `--bot-profile=${BOT_PROFILE_PATH}`,
    // ⚠️ PROXY CONFIGURATION:
    // Use --proxy-server flag instead of framework-specific proxy options
    // This ensures BotBrowser can retrieve geo information for accurate timezone/locale
    '--proxy-server=socks5://usr:pwd@127.0.0.1:8989',
  ],
});

const page = await browser.newPage();

// Remove Playwright's bindings for clean research environment.
await page.addInitScript(() => {
  delete window.__playwright__binding__;
  delete window.__pwInitScripts;
});

await page.goto("https://abrahamjuliot.github.io/creepjs/");
```

⚠️ Important: When using frameworks (Puppeteer/Playwright), use the `--proxy-server` flag instead of framework-specific proxy options (like `page.authenticate()` or a `proxy` parameter in `launch()`). This ensures BotBrowser can derive accurate timezone/locale from the proxy IP.


---

## Configuration Approaches

### Profile-Based Configuration
- **Purpose**: Stores authentic user fingerprints and base settings
- **When to use**: For core browser identity and fingerprint data
- **Limitation**: Encrypted files are difficult to modify

### CLI-Based Configuration
- **Purpose**: Runtime overrides without modifying profile files
- **When to use**: For session-specific settings like proxy, title, cookies
- **Advantage**: Preserves profile integrity while enabling flexibility

### Best Practice: Hybrid Approach
```bash
# Keep profile data in profile
# Override session-specific settings via CLI
chromium \
  --bot-profile="/absolute/path/to/profile.enc" \
  --proxy-server=session_specific_proxy \
  --bot-title="current_session_id"
```

## Why CLI Flags Matter
- **Preserve Integrity:** Don't modify profile data
- **Runtime Flexibility:** Adjust settings per session without file edits
- **Session Isolation:** Multiple instances with different settings
- **Security:** Keep sensitive data (like proxy credentials) out of profile files

For complete CLI flags documentation, see [CLI Flags Reference](../CLI_FLAGS.md)

**See [`PROFILE_CONFIGS.md`](https://github.com/botswin/BotBrowser/blob/main/profiles/PROFILE_CONFIGS.md) for complete configuration options.**

---

## Key Features

⚠️ **All features are intended for fingerprint protection and privacy research only, not for use in production against third-party services.**

### Unique Capabilities

- [x] **Provides compatibility in incognito-mode environments**
- [x] **CDP artifact minimization**: native CDP fingerprint protection
- [x] **Custom page history**: enhance browsing pattern realism
- [x] **Keep pages active** even when they lose focus
- [x] **Set proxy with embedded credentials directly via profile**
- [x] **Set language and timezone** based on proxy or manually
- [x] **WebRTC configuration control**
- [x] **Canvas / WebGL noise augmentation** for protection
- [x] **DOM text renders from embedded fonts** so cross-OS simulations never fall through to host font files
- [x] **Audio tracking variation**
- [x] **Control scroll bar width**
- [x] **Supports CDM compatibility** (no proprietary modules distributed)
- [x] **Customizable remote-debugging-address** (bind to 0.0.0.0)
- [x] **Full window/screen size control via profile**
- [x] **Advanced matchMedia simulation** for CSS feature compatibility
- [x] **Android behavior simulation** for mobile compatibility (PRO)
- [x] **Precision GPU and WebGL parameter configuration**

### Tiered capabilities (subscription-gated):

- **PRO**: Android profile support, augmented history (`injectRandomHistory`), always-active tabs (`alwaysActive`).
- **ENT Tier1**: Ubuntu/Linux binary, WebRTC ICE presets (`webrtcICE`), console message suppression (`disableConsoleMessage`), geo overrides (`locale`, `timezone`, `languages`, `location`), proxy IP (`--proxy-ip`), cookies (`--bot-cookies`), [plaintext storage access](../examples/storage-access/) for direct SQLite/LevelDB reading.
- **ENT Tier2**: Browser brand/UA overrides (`browserBrand`, `uaFullVersion`, `brandFullVersion`), deterministic noise seed (`--bot-noise-seed`), runtime timing scaler (`--bot-time-scale`).
- **ENT Tier3**: UDP-over-SOCKS5 tunneling for QUIC/STUN, custom User-Agent with full userAgentData control (`platform`, `platformVersion`, `model`, `architecture`, `bitness`, `mobile`), WebView brand support, Mirror for distributed fingerprint validation, [Per-Context Fingerprint](../PER_CONTEXT_FINGERPRINT.md) for independent fingerprint bundles per BrowserContext.
- **ENT Tier4**: [WebKit-family profile consistency](../WEBKIT_PROFILE_CONSISTENCY.md) for premium desktop and mobile profile bundles, plus profile-backed Canvas Replay for approved validation workflows.
- See [CLI_FLAGS](../CLI_FLAGS.md) and [PROFILE_CONFIGS](PROFILE_CONFIGS.md) for full flag coverage and usage examples.

---

## Fingerprint Coverage

| Category | Covered Elements |
|----------|------------------|
| **Browser** | Version, userAgentData, userAgent |
| **Operating System** | Windows, macOS, Ubuntu (ENT Tier1), Android simulation (PRO) |
| **Navigator** | Languages, plugins, permissions, battery, keyboard |
| **Graphics** | WebGL, WebGL2, GPUAdapter, GPUDevice |
| **Hardware** | Screen, CPU, system fonts, system colors |
| **Media** | MediaDevices, MimeTypes, AudioContext |
| **Advanced** | Emoji, Unicode, matchMedia control |

## Best Practices

- **Use Premium Profiles** for production traffic
- **Configure realistic settings** (screen size, devicePixelRatio, proxy)
- **Choose appropriate profiles** (Android for mobile operations requires PRO)
- **Keep profiles updated** with the latest Chrome versions
- **Test thoroughly** before production deployment

Related guides: [Profile Management](https://botbrowser.io/docs/getting-started/profile-management/), [Cross-Platform Profiles](https://botbrowser.io/docs/platform/cross-platform-profiles/), [Playwright](https://botbrowser.io/docs/getting-started/playwright/), [Puppeteer](https://botbrowser.io/docs/getting-started/puppeteer/)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
