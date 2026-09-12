# Profile Management

> Manage BotBrowser profile files, versions, and lifecycle for reproducible fingerprint protection.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed on your system. See [INSTALLATION.md](../../../INSTALLATION.md) for platform-specific setup.
- **Basic familiarity** with running BotBrowser from the command line or via a framework (Playwright, Puppeteer).

---

<a id="quick-start"></a>

## Quick Start

### 1. Get a profile

Use a profile package that matches the major version of your BotBrowser binary. BotBrowser 150 and newer profile packages are available through subscription or support at [support@botbrowser.io](mailto:support@botbrowser.io) or [@botbrowser_support](https://t.me/botbrowser_support). Legacy public demo profiles remain in [profiles/](../../../profiles/) for older evaluation lines.

### 2. Launch with a profile

```bash
chromium-browser \
  --bot-profile="/absolute/path/to/profile.enc" \
  --user-data-dir="$(mktemp -d)"
```

### 3. Verify it works

Visit [CreepJS](https://abrahamjuliot.github.io/creepjs/) or [BrowserLeaks](https://browserleaks.com/) to confirm the fingerprint is active. See [First Verification](FIRST_VERIFICATION.md) for a complete verification checklist.

---

<a id="how-it-works"></a>

## How It Works

A BotBrowser profile is an encrypted file that defines the complete browser environment. Think of it as a device model: it specifies the hardware, software, and rendering characteristics that make up a browser fingerprint.

**What a profile contains:**

| Category | Examples |
|----------|----------|
| Browser identity | User-Agent string, userAgentData brands, full version |
| Display properties | Screen resolution, device pixel ratio, color depth |
| Hardware signals | Device memory, CPU core count, GPU model and parameters |
| Graphics | WebGL vendor/renderer, supported extensions, shader precision |
| Fonts | Embedded font list for consistent cross-platform rendering |
| Media | Supported MIME types, codec capabilities, media device list |
| Audio | AudioContext properties for consistent audio fingerprinting |
| Platform | OS-specific behaviors, navigator properties, keyboard layout |

The base identity does not depend on proxy, timezone, locale, cookies, or browsing history. These session settings can be supplied through CLI flags. Configurable subscription packages may also carry persistent defaults in the `configs` block.

### The device model analogy

A profile is like a specific hardware configuration, for example an M5 Max-class Mac. It is not tied to one browser process or one account. The same profile can launch multiple browsers and can also be assigned to multiple BrowserContexts.

For separate browser processes, each launch uses its own `user-data-dir`, cookies, proxy, locale, and other session settings.

For BrowserContexts inside one process, storage, cookies, proxy, and context settings are isolated by the BrowserContext. BrowserContexts share the browser process and do not use separate `user-data-dir` values.

Both approaches reuse the same base hardware model. Use [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md) when multiple identities should share one browser process.

---

<a id="profile-types"></a>

## Profile Types

<a id="demo-profiles"></a>
### Legacy Demo Profiles

Public demo profiles are included in the [profiles/](../../../profiles/) directory for legacy evaluation lines through Chrome 149. BotBrowser 150 and newer profile packages are not published as public demo bundles.

**Limitations:**
- Limited-time privacy research use only
- Available only for public demo lines published before BotBrowser 150
- No headless mode support
- No automation framework support (Puppeteer, Playwright)
- No extension loading
- Not suitable for production use, as demo profiles are widely distributed

<a id="premium-profiles"></a>
### Premium Profiles

Premium profiles provide unique configurations designed for authorized fingerprint protection and privacy research.

**Features:**
- Unique configurations for controlled studies
- Privacy-compliant synthetic data based on aggregated device patterns
- Suitable for production research with automation frameworks
- Headless mode support
- Extension loading support

**To access premium profiles**, contact:
- Email: [support@botbrowser.io](mailto:support@botbrowser.io)
- Telegram: [@botbrowser_support](https://t.me/botbrowser_support)

---

<a id="profile-versions"></a>

## Profile Versions

Profiles are versioned to match BotBrowser binary versions. The binary and profile Chrome versions must match.

| Channel | Description |
|---------|-------------|
| **stable** | Current access notes and legacy public demo packages for pre-150 lines |
| **canary** | Pre-stable packages only when explicitly published; none are currently published |
| **archive** | Older public demo packages for compatibility testing |

**Version matching rule:** A BotBrowser v150 binary requires a v150 profile package. A missing, invalid, expired, or major-version-mismatched profile stops profile-backed startup and reports the corresponding profile state.

<a id="startup-profile-states"></a>

### Startup profile states

BotBrowser distinguishes the main profile startup conditions:

- **Missing profile**: no profile path was supplied or the file cannot be found.
- **Invalid profile**: the package cannot be read or validated.
- **Expired profile**: the subscription profile is outside its active period.
- **Legacy demo profile**: the package belongs to a published pre-150 evaluation line and keeps its documented limitations.
- **Version mismatch**: the profile major version does not match the BotBrowser release line.

Headful launches show user-facing guidance for these states. Headless BotBrowser 150 writes the guidance to terminal output without opening a visible window, then follows the startup failure path.

### Checking available versions

Browse the [profiles/](../../../profiles/) directory on GitHub:
- `profiles/stable/` contains current access notes and legacy public demo profiles for pre-150 lines
- `profiles/canary/` contains pre-stable profile notes when a package is explicitly published
- `profiles/archive/` contains previous public demo versions

---

<a id="profile-configuration"></a>

## Profile Configuration

You can customize profile behavior through two methods: the `configs` block in the profile JSON, or CLI flags that override profile settings at runtime.

### Configuration priority (highest to lowest)

1. **CLI `--bot-*` flags.** Highest priority. Always overrides profile settings.
2. **Profile `configs` block.** Medium priority. Overrides profile defaults.
3. **Profile default values.** Lowest priority. Built-in profile data.

### CLI overrides (recommended)

CLI flags are the preferred way to customize behavior because they do not require editing encrypted profile files:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-timezone=Europe/Berlin \
  --bot-locale=de-DE \
  --bot-languages=de-DE,de,en-US,en \
  --bot-webrtc=disabled \
  --user-data-dir="$(mktemp -d)"
```

### Profile `configs` block

Public legacy `.enc` files are read-only. If a subscription profile package is supplied for configuration, persistent settings can be stored in its `configs` block:

```json5
{
  "configs": {
    "locale": "auto",
    "languages": "auto",
    "timezone": "auto",
    "colorScheme": "light",
    "webrtc": "profile",
    "noiseCanvas": true,
    "noiseWebglImage": true,
    "noiseAudioContext": true
  },
  "key": { /* ... */ },
  "version": { /* ... */ },
  "profile": { /* ... */ }
}
```

Place the `configs` block before the `key` block in the JSON structure.

For the complete list of configurable fields, see [Profile Configuration Guide](../../../profiles/PROFILE_CONFIGS.md).

---

<a id="common-scenarios"></a>

## Common Scenarios

### Random profile selection from a directory

Place multiple `.enc` files in a directory and let BotBrowser pick one randomly on each startup:

```bash
chromium-browser \
  --bot-profile-dir="/path/to/profiles/" \
  --user-data-dir="$(mktemp -d)"
```

This is useful for multi-instance deployments where you want fingerprint diversity without manual profile assignment.

With [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md), `--bot-profile-dir` can also be passed through `botbrowserFlags` when creating a BrowserContext. That lets each context select a profile from the directory at creation time.

<a id="same-profile-multiple-browser-processes"></a>
### Same Profile, Multiple Browser Processes

Use one profile with different session settings to create distinct user sessions:

```bash
# Session 1: US user
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@us-proxy.example.com:1080 \
  --bot-cookies='[{"url":"https://example.com","name":"session","value":"us-user","domain":".example.com"}]' \
  --user-data-dir="$(mktemp -d)" &

# Session 2: German user
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --proxy-server=socks5://user:pass@de-proxy.example.com:1080 \
  --bot-timezone=Europe/Berlin \
  --bot-locale=de-DE \
  --bot-cookies='[{"url":"https://example.com","name":"session","value":"de-user","domain":".example.com"}]' \
  --user-data-dir="$(mktemp -d)" &
```

### Cross-platform compatibility

The same profile file works on Windows, macOS, and Linux. BotBrowser handles platform-specific differences at the engine level:

- **Windows host running a macOS profile:** BotBrowser renders fonts, graphics, and system properties as if running on macOS.
- **macOS host running a Windows profile:** Navigator properties, screen metrics, and platform strings match a Windows environment.
- **Linux host running an Android profile:** Touch events, mobile APIs, and device metrics match an Android device.

Platform compatibility tiers:
- Windows and macOS profiles work on all platforms.
- Android profiles require a PRO subscription.
- Ubuntu/Linux binaries require ENT Tier1.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| "Profile not found" error | Use an absolute path for `--bot-profile`. Relative paths resolve from the browser binary's directory. |
| Browser exits before navigation | Read the startup profile message and check for a missing, invalid, expired, or version-mismatched package. A v150 binary needs a v150 profile. |
| Cannot use `--bot-profile` and `--bot-profile-dir` together | `--bot-profile-dir` takes precedence. Use one or the other. |
| Profile changes have no effect | CLI `--bot-*` flags override profile `configs`. Check if a CLI flag is overriding your change. |
| "Profile is damaged" or parse errors | Re-download the profile. Ensure the file was not corrupted during transfer. |
| Demo profile limitations | Legacy demo profiles do not support headless mode or automation frameworks. BotBrowser 150 and newer profile packages are available through subscription or support at [support@botbrowser.io](mailto:support@botbrowser.io) or [@botbrowser_support](https://t.me/botbrowser_support). |

---

<a id="next-steps"></a>

## Next Steps

- [Profile Configuration Guide](../../../profiles/PROFILE_CONFIGS.md). Complete reference for all configurable fields.
- [CLI Flags Reference](../../../CLI_FLAGS.md). All available flags, including `--bot-*` overrides.
- [CLI Recipes](CLI_RECIPES.md). Common flag combinations for typical scenarios.
- [First Verification](FIRST_VERIFICATION.md). Verify your setup is working correctly.
- [Playwright Guide](PLAYWRIGHT.md). Use profiles with Playwright.
- [Puppeteer Guide](PUPPETEER.md). Use profiles with Puppeteer.

---

**Related documentation:** [Profiles Directory](../../../profiles/) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md) | [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
