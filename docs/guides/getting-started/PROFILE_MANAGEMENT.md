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

### 1. Download a profile

Download profile files from [GitHub Releases](https://github.com/botswin/BotBrowser/releases). Each release includes `.enc` profile files matching the Chrome version of the binary.

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

**What a profile does not contain:** Proxy settings, timezone, locale, cookies, or browsing history. These are session-specific and configured separately through CLI flags or the `configs` block.

### The device model analogy

A profile is like a specific hardware configuration, for example "MacBook Pro M4 Max":

- **User A** uses the same profile with a US proxy, English locale, and EST timezone.
- **User B** uses the same profile with a German proxy, German locale, and CET timezone.
- **User C** uses the same profile with a Japanese proxy, Japanese locale, and JST timezone.

All three appear to use the same device type, but each has a distinct identity defined by their session settings.

---

<a id="profile-types"></a>

## Profile Types

<a id="demo-profiles"></a>
### Demo Profiles

Demo profiles are included in the [profiles/](../../../profiles/) directory for evaluation and testing.

**Limitations:**
- Limited-time privacy research use only
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
| **stable** | Current stable release, recommended for production |
| **canary** | Early development release for testing upcoming features |
| **archive** | Previous versions for compatibility testing |

**Version matching rule:** A BotBrowser v146 binary requires v146 profiles. Using mismatched versions will result in a silent failure where the browser runs without fingerprint protection.

### Checking available versions

Browse the [profiles/](../../../profiles/) directory on GitHub:
- `profiles/stable/` contains current stable profiles
- `profiles/canary/` contains early development profiles
- `profiles/archive/` contains previous versions

---

<a id="profile-configuration"></a>

## Profile Configuration

You can customize profile behavior through two methods: the `configs` block in the profile JSON, or CLI flags that override profile settings at runtime.

### Configuration priority (highest to lowest)

1. **CLI `--bot-config-*` flags.** Highest priority. Always overrides profile settings.
2. **Profile `configs` block.** Medium priority. Overrides profile defaults.
3. **Profile default values.** Lowest priority. Built-in profile data.

### CLI overrides (recommended)

CLI flags are the preferred way to customize behavior because they do not require editing encrypted profile files:

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-config-timezone=Europe/Berlin \
  --bot-config-locale=de-DE \
  --bot-config-languages=de-DE,de,en-US,en \
  --bot-config-webrtc=disabled \
  --user-data-dir="$(mktemp -d)"
```

### Profile `configs` block

For settings that should persist across sessions, add a `configs` block to the profile JSON:

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

### Same profile, different identities

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
  --bot-config-timezone=Europe/Berlin \
  --bot-config-locale=de-DE \
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
| Browser runs without fingerprint protection | Verify the profile version matches the binary version. A v146 binary needs v146 profiles. |
| Cannot use `--bot-profile` and `--bot-profile-dir` together | `--bot-profile-dir` takes precedence. Use one or the other. |
| Profile changes have no effect | CLI `--bot-config-*` flags override profile `configs`. Check if a CLI flag is overriding your change. |
| "Profile is damaged" or parse errors | Re-download the profile. Ensure the file was not corrupted during transfer. |
| Demo profile limitations | Demo profiles do not support headless mode or automation frameworks. Use premium profiles for these features. |

---

<a id="next-steps"></a>

## Next Steps

- [Profile Configuration Guide](../../../profiles/PROFILE_CONFIGS.md). Complete reference for all configurable fields.
- [CLI Flags Reference](../../../CLI_FLAGS.md). All available flags, including `--bot-config-*` overrides.
- [CLI Recipes](CLI_RECIPES.md). Common flag combinations for typical scenarios.
- [First Verification](FIRST_VERIFICATION.md). Verify your setup is working correctly.
- [Playwright Guide](PLAYWRIGHT.md). Use profiles with Playwright.
- [Puppeteer Guide](PUPPETEER.md). Use profiles with Puppeteer.

---

**Related documentation:** [Profiles Directory](../../../profiles/) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md) | [CLI Flags Reference](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
