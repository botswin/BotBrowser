# Widevine DRM Setup

> Configure DRM content playback with Widevine CDM and keep DRM capability signals consistent with the profile's platform identity.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md).
- **A profile file** (`.enc` or `.json`).
- **Widevine CDM** obtained through official channels. BotBrowser does not distribute proprietary modules.
- **ENT Tier2 license** for Widevine CDM integration.

---

<a id="overview"></a>

## Overview

Widevine is Google's Digital Rights Management (DRM) system used by streaming services and other sites to protect video content. When a site requires DRM playback, the browser must have a Widevine Content Decryption Module (CDM) installed. Without it, the site may show errors, refuse to play content, or detect that DRM is unavailable.

DRM capability reporting varies across platforms. The order of `MediaKeySystemAccess` results and the supported configurations differ by OS. BotBrowser applies the profile's platform policy to supported DRM queries.

### License-challenge policy

Use `--bot-widevine` when a BrowserContext needs an explicit policy for Widevine license challenges:

```bash
--bot-widevine=stub     # Profile-backed default policy
--bot-widevine=send     # Allow the normal challenge when supported
--bot-widevine=block    # Suppress license requests
--bot-widevine=no-cdm   # Disable CDM exposure for the context
```

The policy depends on the license tier and profile. Apply it before the first page or worker starts. `stub` is the default when the profile includes Widevine support.

---

<a id="how-it-works"></a>

## How It Works

### What Widevine CDM Does

The Widevine CDM handles:
- Encrypted Media Extensions (EME) API responses
- License request and response negotiation
- Decryption of protected video streams
- DRM capability reporting

### DRM Capability Consistency

A Windows profile applies Windows DRM policy, and an Android profile applies Android DRM policy.

### Platform Consistency

| Platform | DRM Behavior |
|----------|-------------|
| Windows | Widevine CDM loaded from standard location. License negotiation follows Windows patterns. |
| macOS | Widevine CDM loaded from macOS-specific path. |
| Android | Hardware-backed DRM support reported when profile specifies it. |
| Linux | Widevine CDM path follows Linux conventions. |

### The license request in the EME flow

A Widevine license request is not a single call. The page walks through a fixed sequence, and each step can fail for a different reason:

1. `navigator.requestMediaKeySystemAccess('com.widevine.alpha', configs)` resolves with a `MediaKeySystemAccess` only when the CDM exists and at least one requested configuration is supported.
2. `access.createMediaKeys()` returns a `MediaKeys` object backed by the CDM.
3. `mediaKeys.createSession()` creates a `MediaKeySession`, and the page calls `session.generateRequest(initDataType, initData)` with the initialization data from the container.
4. The CDM answers with a `message` event. That message is the license challenge: the page POSTs the bytes to the license server URL from the manifest.
5. The server responds with a license, the page calls `session.update(license)`, and decoding can start.

A page that stops at step 1 never sends a license request at all, so a "license request failed" report and a "DRM not supported" report have different causes. Pull the `MediaKeySession` events before reading server logs:

```javascript
const access = await navigator.requestMediaKeySystemAccess("com.widevine.alpha", [
  {
    initDataTypes: ["cenc"],
    videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
  },
]);

const mediaKeys = await access.createMediaKeys();
const session = mediaKeys.createSession();

session.addEventListener("message", event => {
  console.log("license challenge bytes:", event.message.byteLength);
});
session.addEventListener("keystatuseschange", () => {
  session.keyStatuses.forEach((status, keyId) => console.log(keyId, status));
});
```

`message` with a non-zero `byteLength` means the challenge reached the page. `keyStatuses` reporting `usable` after `session.update()` means the CDM accepted the license. Anything earlier is a capability or CDM-loading problem, not a license-server problem.

<a id="what-bot-widevine-does-to-that-flow"></a>
### What `--bot-widevine` does to that flow

| Mode | Effect on the license request | Typical use |
|------|------------------------------|-------------|
| `stub` | Profile-backed default policy; the challenge is answered without leaving the browser | Reference runs that must show DRM capability without contacting a provider |
| `send` | The normal challenge is emitted when the CDM supports it | Provider integration testing with a real license server |
| `block` | License requests are suppressed | Reproducing a device without DRM authorization |
| `no-cdm` | CDM exposure is removed for the context | Measuring how a page behaves when Widevine is absent |

Apply the mode at launch. Changing it after the first page or worker starts leaves already-created contexts on the previous policy.

---

<a id="quick-start"></a>

## Quick Start

### Ensuring Widevine CDM Availability

1. **Obtain the Widevine CDM** from official sources. BotBrowser does not bundle or distribute the CDM.

2. **Place the CDM** in the expected location for your platform:
   - **Windows:** The CDM is typically located in the BotBrowser installation directory or the user data directory.
   - **macOS:** The CDM follows macOS library conventions.
   - **Linux:** Place the CDM in the standard library path.

3. **Check the installation before opening a provider page.** Start with the same profile and binary that the workload will use, and query `requestMediaKeySystemAccess()` on a page you control. A `null` result is an installation, entitlement, or profile-policy problem; it is not evidence that the provider rejected a license.

4. **Launch BotBrowser** with your profile. BotBrowser detects the installed CDM automatically:

```javascript
import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
  ],
});

const page = await browser.newPage();

// Navigate to a DRM-protected streaming site to verify playback works
await page.goto("https://streaming-service.example.com");

await browser.close();
```

For a controlled negative check, repeat the probe with `--bot-widevine=no-cdm`. The result should become `null`; if it does not, the context was created with a different argument set or the probe ran in an already-created context. Restore `stub` or `send` before testing provider playback.

The profile and CDM are separate inputs. `--bot-profile` selects the platform identity and its declared DRM capability set; it does not install a CDM or import a device key. Keep the profile path, binary version, and CDM installation location in the same deployment record so a later license failure can be reproduced.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Testing DRM-protected content playback

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@proxy.example.com:1080",
  ],
});

const page = await browser.newPage();
await page.goto("https://streaming-service.example.com");

// The site should detect DRM support and offer content playback
```

### Verifying DRM capability consistency

To verify DRM protection is working correctly:

1. Launch BotBrowser with a profile and navigate to a DRM-protected streaming service.
2. Confirm that content plays back without errors.
3. Verify on a fingerprint testing site that DRM capability reporting matches the profile's target platform.

### Checking the CDM before touching a provider

Query the CDM directly on a page you control, so a provider failure is not confused with a missing module:

```javascript
const configs = [
  {
    initDataTypes: ["cenc"],
    videoCapabilities: [
      { contentType: 'video/mp4; codecs="avc1.42E01E"' },
      { contentType: 'video/mp4; codecs="hvc1.1.6.L93.B0"' },
    ],
    robustness: "SW_SECURE_CRYPTO",
  },
];

const supported = await navigator.requestMediaKeySystemAccess(
  "com.widevine.alpha",
  configs
).then(access => access.getConfiguration())
 .catch(() => null);

console.log("widevine cdm config:", supported);
```

`null` means the CDM is absent or the profile disables it (`--bot-widevine=no-cdm`). A configuration object with fewer `videoCapabilities` entries than you requested means the CDM loaded but the profile's declared codec and robustness set is narrower than the query.

### About Widevine device files

A Widevine device file (`.wvd` or the older `.prd` form) carries a client ID and device key that a license server can recognize. BotBrowser does not distribute device files, and loading one is not a configuration step for BotBrowser: the Widevine capability comes from the CDM binary plus the loaded profile. Profiles are `.enc` or `.json` files loaded with `--bot-profile`, and the DRM capability set they report is what a page sees. If a provider rejects playback while the CDM reports support, the cause is normally license authorization for that account or device class, not a missing `.wvd`.

Do not place a `.wvd` or `.prd` path in `--bot-profile`, and do not copy a device file into a profile directory as an attempted fix. Treat device files as provider credentials: obtain them only from the provider or an authorized device-management process, restrict their permissions, and redact their contents from issue logs. For the browser-side setup path, see [DRM fingerprinting and EME signals](../fingerprint/DRM.md); for headless-specific failure boundaries, see [Widevine headless troubleshooting](https://botbrowser.io/en/blog/widevine-headless-boundaries/).

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Widevine not detected | Ensure the CDM is installed in the correct location for your platform. BotBrowser does not bundle the CDM. Then re-run the `requestMediaKeySystemAccess` check above; `null` confirms the module is missing rather than the provider blocking playback. |
| DRM playback fails | Verify the CDM version is compatible with the BotBrowser version. |
| DRM playback fails but the CDM reports support | Read the `message` and `keystatuseschange` events: no `message` means the challenge never left the page, `keyStatuses` never reaching `usable` means the license server rejected the request. |
| DRM capability order differs from expected | The profile defines the expected DRM capability order. Ensure the profile matches the target platform. |
| "Unsupported platform" from streaming site | Check that the profile's platform identity matches a platform the site supports (e.g., Windows, macOS). |
| License request blocked | Check that `--bot-widevine` is not set to `block` or `no-cdm` for that BrowserContext. |
| The probe works but the provider returns 401/403 | Confirm that `message` emitted a non-zero challenge, then inspect the provider response status and account/device authorization. Do not replace the profile or device file before separating an HTTP authorization failure from a CDM failure. |
| A copied device file appears to fix one machine only | Remove the copied credential from the test path and reproduce with the official provider flow. A device file is not a substitute for CDM installation or profile selection, and sharing it can expose license credentials. |

---

<a id="next-steps"></a>

## Next Steps

- [Cross-Platform Profiles](CROSS_PLATFORM_PROFILES.md). Profile portability across operating systems.
- [Advanced Features](../../../ADVANCED_FEATURES.md#chrome-behavior-emulation). Widevine CDM integration details.
- [Device Emulation](DEVICE_EMULATION.md). Control device metrics for platform consistency.

---

**Related documentation:** [Advanced Features](../../../ADVANCED_FEATURES.md) | [Profile Configuration](../../../profiles/PROFILE_CONFIGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [What Is Widevine DRM? Headless Browser Setup and Privacy](https://botbrowser.io/en/blog/widevine-drm-setup/)
