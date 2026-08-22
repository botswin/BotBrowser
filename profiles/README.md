# BotBrowser Profiles

Profiles define the browser identity and protected environment used by BotBrowser. Use a profile package that matches the BotBrowser major version.

<a id="current-versions"></a>
## Current Access

| Channel | Release line | Access |
|---------|--------------|--------|
| [stable](stable/) | v150-v151 subscription profiles; v148-v149 legacy demos | BotBrowser 150 and newer packages are available through subscription or support. |
| [canary](canary/) | None published | Reserved for explicitly published pre-stable packages. |
| [archive](archive/) | v135-v147 | Older public demo packages outside the current support window. |

BotBrowser 150 and newer profile packages are not published as public demos. Contact [support@botbrowser.io](mailto:support@botbrowser.io) or [@botbrowser_support](https://t.me/botbrowser_support) for access.

The BotBrowser binary and profile package must use the same major version. A v151 binary requires a v151 profile package.

<a id="what-are-profiles"></a>
<a id="understanding-botbrowser-profiles"></a>
## Understanding Profiles

A profile represents a reusable hardware and browser model. It is not a browser process, account, `user-data-dir`, or one-time slot. For example, an M5 Max-class profile describes one hardware model and its browser-visible characteristics. Multiple real machines can share the same model characteristics, and using the profile does not bind it to the first launch.

### Base Model

The profile supplies:

| Area | Examples |
|------|----------|
| Browser | Browser family, version, Client Hints |
| Display | Screen, window, pixel ratio, color depth |
| Hardware | CPU, memory, graphics properties |
| Rendering | Fonts, Canvas, WebGL, WebGPU, audio |
| Platform | OS and device behavior |
| Media | Codecs, media devices, speech voices |

The same `.enc` file can be used by multiple browser processes and BrowserContexts. Use another profile only when a different base hardware or browser model is required.

### Multiple Browser Processes

The same profile can be passed to multiple launches. Each browser process uses a different `user-data-dir`. See [Same Profile, Multiple Browser Processes](../docs/guides/getting-started/PROFILE_MANAGEMENT.md#same-profile-multiple-browser-processes) for commands and session configuration.

### Session Isolation

Both browsers expose the same base hardware model. Their storage and session state remain independent because they use different data directories. Proxy, timezone, locale, cookies, history, and other session settings can also differ per browser.

Use the profile for the base model and CLI flags for session-specific settings. For multiple identities inside one browser process, see [Per-Context Fingerprint](../PER_CONTEXT_FINGERPRINT.md).

<a id="profile-types"></a>
<a id="public-demo-profiles-v149-and-earlier"></a>
<a id="premium-profiles"></a>
## Profile Types

| Profile type | Use |
|--------------|-----|
| Legacy demo | Evaluation on published Chrome 149 and earlier lines. No headless, automation framework, or extension support. |
| Subscription | Current release lines, headless workflows, automation frameworks, extensions, and licensed capabilities. |

<a id="configuration-approaches"></a>
<a id="using-profiles"></a>
<a id="cli-usage"></a>
## Next Steps

- [Profile Management](../docs/guides/getting-started/PROFILE_MANAGEMENT.md): launch, version matching, profile types, and troubleshooting
- [CLI Flag Directory](../CLI_FLAGS.md#flag-directory): per-session configuration
- [Profile Configuration](PROFILE_CONFIGS.md): fields for configurable subscription packages
- [Per-Context Fingerprint](../PER_CONTEXT_FINGERPRINT.md): multiple isolated identities in one browser process
- [Playwright](../docs/guides/getting-started/PLAYWRIGHT.md) and [Puppeteer](../docs/guides/getting-started/PUPPETEER.md): framework setup

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
