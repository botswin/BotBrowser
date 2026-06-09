# WebKit-Family Profile Consistency (ENT Tier4)

WebKit-family Profile Consistency is a premium profile-backed capability for teams that need browser-family signal consistency across supported BotBrowser hosts. It extends profile consistency beyond browser-brand text into runtime behavior, rendering behavior, media capability behavior, navigation headers, TLS behavior, HTTP/2 behavior, and per-context isolation.

This capability is built for authorized privacy validation and production workflows where the browser identity must stay internally consistent from startup through navigation, script execution, rendering, and network negotiation.

> Distribution: WebKit-family profile bundles ship through the enterprise channel for ENT Tier4 customers.

<a id="why-it-exists"></a>
## Why It Exists

Browser identity is not one field. A page can observe many signals that need to agree with each other:

- Runtime engine behavior and object shape.
- CSS parsing, layout, and media capability behavior.
- Navigation headers and browser-family request metadata.
- TLS and HTTP/2 behavior on the network path.
- Rendering and media surfaces governed by the active profile.
- BrowserContext isolation when several identities run in one process.

For privacy teams, the goal is not to expose more controls. The goal is to make the selected profile the source of truth, so the browser presents a coherent browser-family identity without requiring customers to assemble that behavior from standalone flags.

<a id="profile-backed-model"></a>
## Profile-Backed Model

WebKit-family Profile Consistency is controlled by premium `.enc` profiles. Customers should treat the profile as the authoritative bundle for browser-family behavior.

| Layer | What the profile coordinates |
|---|---|
| Runtime | Browser-family runtime behavior and object consistency |
| Rendering | CSS behavior, media capability behavior, and profile-visible rendering signals |
| Network | Navigation headers, TLS behavior, and HTTP/2 behavior |
| Identity | Desktop and mobile WebKit-family profile bundles |
| Isolation | Per-context separation between WebKit-family and Chromium-family profiles |

Use CLI flags for session-specific values such as profile path, user data directory, proxy routing, and operational launch settings. Do not use standalone overrides to assemble browser-family behavior.

<a id="when-to-use-it"></a>
## When To Use It

Use this capability when a workflow needs one or more of the following:

- Desktop or mobile WebKit-family profile bundles.
- Browser-family consistency across runtime, rendering, and network surfaces.
- Per-context validation where WebKit-family and Chromium-family profiles run in the same browser process.
- Release validation that needs the selected profile to remain stable from first navigation.

Stay with standard Chromium-family profiles when the workload only needs Chrome, Chromium, Edge, Brave, Opera, Android, or Android WebView identity.

<a id="launch"></a>
## Launch

Launch with a premium WebKit-family profile the same way you launch other encrypted BotBrowser profiles:

```bash
chromium-browser \
  --bot-profile="/absolute/path/to/webkit-family-profile.enc" \
  --user-data-dir="$(mktemp -d)"
```

For Per-Context Fingerprint workflows, create the BrowserContext with the profile before opening pages:

```javascript
const client = await browser.newBrowserCDPSession();

const { browserContextId } = await client.send("Target.createBrowserContext", {
  botbrowserFlags: [
    "--bot-profile=/absolute/path/to/webkit-family-profile.enc",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    "--proxy-ip=203.0.113.1",
  ],
});
```

The profile should be loaded before the first navigation so runtime, rendering, and network behavior are aligned from the beginning of the session.

<a id="validation-workflow"></a>
## Validation Workflow

A practical validation run should stay at the capability level:

1. Launch BotBrowser with the premium profile and a unique `--user-data-dir`.
2. Keep proxy configuration in BotBrowser flags so locale, timezone, and network identity stay aligned.
3. Open the target workflow from a fresh page or freshly created BrowserContext.
4. Validate broad browser signal consistency with your approved internal checks.
5. Use V8Log, CanvasLab, AudioLab, or release testing evidence only when the workflow requires deeper review.

Do not publish raw validation captures, internal checklists, sensitive URLs, or profile internals in public documentation.

<a id="relationship-to-other-capabilities"></a>
## Relationship To Other Capabilities

| Capability | Relationship |
|---|---|
| [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) | Runs multiple profile-backed identities in one browser process with isolated BrowserContexts |
| [Canvas Replay](tools/canvaslab/) | ENT Tier4 profile-backed graphics behavior for approved validation workflows |
| [V8Log Forensics](tools/v8log/) | Runtime evidence for authorized privacy validation sessions |
| [Cross-Platform Profiles](docs/guides/platform/CROSS_PLATFORM_PROFILES.md) | Baseline model for using one profile across supported host operating systems |
| [Android WebView](docs/guides/platform/ANDROID_WEBVIEW.md) | Separate ENT Tier3 browser identity path for embedded Android browser workflows |

<a id="best-practices"></a>
## Best Practices

- Use only premium profiles that explicitly support this profile line.
- Keep each browser instance on a unique `--user-data-dir`.
- Load the profile before creating pages or navigating.
- Prefer `Target.createBrowserContext` with `botbrowserFlags` for per-context workflows.
- Keep proxy configuration inside BotBrowser flags.
- Validate desktop and mobile profile bundles separately.

<a id="related-documentation"></a>
## Related Documentation

- [Platform guide](docs/guides/platform/WEBKIT_PROFILE_CONSISTENCY.md)
- [Profile configuration](profiles/PROFILE_CONFIGS.md#webkit-family-profile-consistency-ent-tier4)
- [CLI flags](CLI_FLAGS.md#profile-configuration-override-flags)
- [Advanced Features](ADVANCED_FEATURES.md#webkit-family-profile-consistency)
- [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) . [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
