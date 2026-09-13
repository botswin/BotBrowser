# Permission State Consistency

> Keep browser permission results aligned with the active profile and BrowserContext.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser 150.0.7871.46 or newer** with a matching profile package.
- **A profile loaded before navigation** through `--bot-profile` or Per-Context Fingerprint.

---

<a id="quick-start"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --user-data-dir="$(mktemp -d)"
```

Permission state follows the loaded profile together with the browser's normal site permission decisions. No separate permission consistency flag is required.

---

<a id="profile-behavior"></a>

## Profile Behavior

Browser permission results are visible through web APIs, page capability checks, workers, and browser UI decisions. BotBrowser keeps these paths aligned with the selected browser and platform profile family.

BotBrowser 150 improves profile-backed permission mapping for launch profiles and per-context profiles. Permission queries and browser-side checks follow the active BrowserContext.

For Per-Context Fingerprint, set the profile before creating the first page:

```javascript
const client = await browser.target().createCDPSession();
const context = await browser.createBrowserContext();

await client.send("BotBrowser.setBrowserContextFlags", {
  browserContextId: context._contextId,
  botbrowserFlags: ["--bot-profile=/path/to/profile.enc"],
});

const page = await context.newPage();
```

Permission decisions made by the site or automation framework still apply normally. The profile controls browser-family consistency; it does not grant a site access that the user or automation policy has denied.

Profile-backed keyboard behavior follows the same rule. It is available only when the page and browser permission policy allow the relevant input capability; the profile does not override a denied Permissions Policy.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Permission results do not match the intended profile family | Confirm the profile package matches the BotBrowser major version and was loaded before the first page. |
| A per-context page inherits another context's behavior | Apply `BotBrowser.setBrowserContextFlags` before creating the context's first target. Do not change identity-bearing flags after the context starts. |
| A site remains denied after profile setup | Check browser or framework site-permission settings. Profile consistency does not override an explicit user denial. |
| Headless launch exits before navigation | Check terminal output for missing, invalid, expired, or version-mismatched profile guidance. Headless mode does not show visible startup windows. |

---

<a id="next-steps"></a>

## Next Steps

- [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md). Apply independent profiles before each context starts.
- [Profile Management](../getting-started/PROFILE_MANAGEMENT.md). Select a matching profile package and understand startup states.
- [Navigator Properties](NAVIGATOR_PROPERTIES.md). Keep browser identity surfaces aligned across pages and workers.

---

**Related documentation:** [CLI Flags Reference](../../../CLI_FLAGS.md) | [Profile Management](../getting-started/PROFILE_MANAGEMENT.md) | [Headless Server Setup](../deployment/HEADLESS_SERVER_SETUP.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) | [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
