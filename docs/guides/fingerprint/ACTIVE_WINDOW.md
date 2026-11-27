# Active Window Emulation

> Keep the active page in each context focused while the application is unfocused. Use a profile that supports active-window protection.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser PRO license** or higher.
- **A profile file** (`.enc` for production).

---

<a id="quick-start"></a>

## Quick Start

Active window emulation is opt-in. Pass the PRO launch flag with a supported profile. A profile that does not support active-window protection keeps the option inactive.

```bash
chromium-browser \
    --headless \
    --bot-profile="/path/to/profile.enc" \
    --proxy-server=socks5://user:pass@proxy.example.com:1080 \
    --bot-always-active
```

To explicitly control it:

```bash
# Enable explicitly on PRO
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-always-active

# Disable for testing purposes
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-always-active=false
```

---

<a id="how-it-works"></a>

## How It Works

Browser window focus and visibility state can be used as a privacy signal to distinguish automated sessions from real user activity.

When active-window protection is enabled, BotBrowser keeps the active page in focus while another browser context or application receives focus. The foreground tab in each context remains active. Switching among tabs inside the same context still produces normal blur and visibility transitions.

This protection works in both headless and headful modes.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Production deployment

In production, enable active window emulation explicitly when the workflow needs it:

```javascript
const browser = await chromium.launch({
    executablePath: BOTBROWSER_EXEC_PATH,
    headless: true,
    args: [
        `--bot-profile=${BOT_PROFILE_PATH}`,
        "--proxy-server=socks5://user:pass@proxy.example.com:1080",
    ],
});

const page = await browser.newPage();

// document.hidden will always be false
const hidden = await page.evaluate(() => document.hidden);
console.log("hidden:", hidden); // false

await page.goto("https://example.com");
await browser.close();
```

### Multi-tab with consistent active state

When opening multiple tabs, the active tab in each context stays active. Inactive tabs in the same context follow normal visibility behavior:

```javascript
const page1 = await browser.newPage();
const page2 = await browser.newPage();

// The newly created active tab becomes visible; the previous tab becomes hidden
const hidden1 = await page1.evaluate(() => document.hidden);
const hidden2 = await page2.evaluate(() => document.hidden);
console.log(hidden1, hidden2); // typically true, false
```

### Disabling for debugging

If you need to test focus-dependent behavior in your application, disable the emulation:

```bash
chromium-browser \
    --bot-profile="/path/to/profile.enc" \
    --bot-always-active=false
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Page detects background state despite emulation | Verify your license is PRO or above. The flag is not available on lower tiers. |
| Need to test real focus/blur events | Disable with `--bot-always-active=false`. Remember that this changes the browser's behavior for tracking-sensitive pages. |
| `visibilitychange` listener never fires | Confirm that the page uses a supported profile and passes `--bot-always-active`. Tab changes within one context still produce normal visibility transitions. |

---

<a id="next-steps"></a>

## Next Steps

- [Console Suppression](CONSOLE_SUPPRESSION.md). Control CDP console message forwarding.
- [FPS Control](FPS_CONTROL.md). Tune frame-rate behavior to reduce rendering-timing fingerprints.
- [Automation Consistency Practices](../getting-started/AUTOMATION_CONSISTENCY.md). Additional techniques for maintaining consistent browser behavior.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of behavior and protection toggles.

---

**Related documentation:** [Advanced Features: Active Window Emulation](../../../ADVANCED_FEATURES.md#active-window-emulation)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [What Is Browser Fingerprinting](https://botbrowser.io/en/blog/what-is-browser-fingerprinting/)
