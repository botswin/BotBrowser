# Getting Started with Bot Script

> Automate BotBrowser without Playwright or Puppeteer using `--bot-script` and the Chrome Debugger API.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed on your system. See [INSTALLATION.md](../../../INSTALLATION.md) for platform-specific setup.
- **A profile file** (`.enc` for production, `.json` for local development). Download from [GitHub Releases](https://github.com/botswin/BotBrowser/releases) or use the profiles in [profiles/](../../../profiles/).
- **A JavaScript file** containing your automation logic.
- No Node.js, Playwright, or Puppeteer installation required.

---

<a id="quick-start"></a>

## Quick Start

### 1. Create a bot script

Save the following as `my-script.js`:

```javascript
console.log("Bot script loaded.");

if (typeof chrome !== "undefined" && chrome.debugger) {
  console.log("chrome.debugger API is available.");

  // Find all browser targets
  chrome.debugger.getTargets(function (targets) {
    targets.forEach(function (target) {
      if (target.type === "page") {
        console.log("Found page:", target.url);
      }
    });
  });
} else {
  console.log("ERROR: chrome.debugger API not available.");
}
```

### 2. Launch BotBrowser with the script

```bash
# Windows
chrome.exe --bot-profile="C:\path\to\profile.enc" --bot-script="C:\path\to\my-script.js"

# macOS
/Applications/Chromium.app/Contents/MacOS/Chromium \
  --bot-profile="/path/to/profile.enc" \
  --bot-script="/path/to/my-script.js"

# Ubuntu
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-script="/path/to/my-script.js"
```

That is it. BotBrowser loads the profile, opens a browser window, and executes your script in a privileged context.

For multi-identity workflows, `--bot-script` can also be passed through Per-Context Fingerprint when creating a BrowserContext. Use this when each context needs its own framework-less automation bootstrap.

---

<a id="how-it-works"></a>

## How It Works

The `--bot-script` flag tells BotBrowser to execute a JavaScript file in a privileged, non-extension context immediately after startup. This context provides:

1. **Full `chrome.debugger` API access.** You can attach to any browser target (page, iframe, service worker) and send Chrome DevTools Protocol (CDP) commands directly.

2. **No framework artifacts.** Because no external framework is loaded, the page context remains clean. There are no Playwright bindings, no Puppeteer protocol hooks, and no framework-introduced artifacts in the page context.

3. **Early execution.** The script runs before the first page navigation completes, allowing you to set up CDP listeners, intercept network requests, or configure protections before any page code executes.

4. **Standard browser APIs.** You have access to `console`, `setTimeout`, `setInterval`, `fetch`, and other standard APIs alongside the `chrome.*` extension APIs.

5. **Context-scoped bootstrap.** When used with Per-Context Fingerprint, a bot script can be associated with a newly created BrowserContext so automation setup follows the selected context profile.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Attaching to a page and sending CDP commands

```javascript
chrome.debugger.getTargets(function (targets) {
  const pageTarget = targets.find((t) => t.type === "page");
  if (!pageTarget) return;

  chrome.debugger.attach({ targetId: pageTarget.id }, "1.3", function () {
    if (chrome.runtime.lastError) {
      console.log("Attach failed:", chrome.runtime.lastError.message);
      return;
    }

    // Enable the Page domain
    chrome.debugger.sendCommand(
      { targetId: pageTarget.id },
      "Page.enable",
      {},
      function () {
        console.log("Page domain enabled.");
      }
    );

    // Navigate to a URL
    chrome.debugger.sendCommand(
      { targetId: pageTarget.id },
      "Page.navigate",
      { url: "https://example.com" },
      function () {
        console.log("Navigation started.");
      }
    );
  });
});
```

### Per-context bot script bootstrap

Create a BrowserContext with a profile and bot script in the same call:

```javascript
const client = await browser.newBrowserCDPSession();

const { browserContextId } = await client.send("Target.createBrowserContext", {
  botbrowserFlags: [
    "--bot-profile=/path/to/profile.enc",
    "--bot-script=/path/to/context-bootstrap.js"
  ]
});
```

Create pages after the context is created so the script and profile are available from the start of the workflow.

### Interacting with iframe content

Bot scripts can monitor for embedded iframes and interact with them using CDP input events:

```javascript
let activeTargets = new Set();

function startMonitoring() {
  chrome.debugger.getTargets(function (targets) {
    targets.forEach(function (target) {
      if (target.type === "iframe" && !activeTargets.has(target.id)) {
        activeTargets.add(target.id);
        interactWithFrame(target.id);
      }
    });
    setTimeout(startMonitoring, 2000);
  });
}

function interactWithFrame(targetId) {
  chrome.debugger.attach({ targetId: targetId }, "1.3", function () {
    if (chrome.runtime.lastError) {
      activeTargets.delete(targetId);
      return;
    }

    // Click within the iframe at a specific coordinate
    setTimeout(function () {
      chrome.debugger.sendCommand(
        { targetId: targetId },
        "Input.dispatchMouseEvent",
        { type: "mousePressed", x: 30, y: 30, button: "left", clickCount: 1 }
      );
      setTimeout(function () {
        chrome.debugger.sendCommand(
          { targetId: targetId },
          "Input.dispatchMouseEvent",
          { type: "mouseReleased", x: 30, y: 30, button: "left", clickCount: 1 }
        );
        activeTargets.delete(targetId);
      }, 100);
    }, 500);
  });
}

startMonitoring();
```

### Human-like mouse movement

```javascript
async function moveMouse(targetId, fromX, fromY, toX, toY, steps) {
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const x = fromX + (toX - fromX) * progress + Math.random() * 0.7;
    const y = fromY + (toY - fromY) * progress + Math.random() * 0.7;

    await new Promise((resolve) => {
      chrome.debugger.sendCommand(
        { targetId: targetId },
        "Input.dispatchMouseEvent",
        { type: "mouseMoved", x: x, y: y, modifiers: 0, buttons: 0 },
        resolve
      );
    });
    await new Promise((r) => setTimeout(r, 12 + Math.random() * 18));
  }
}
```

### Typing with realistic cadence

```javascript
async function typeText(targetId, text) {
  for (const ch of text) {
    await new Promise((resolve) => {
      chrome.debugger.sendCommand(
        { targetId: targetId },
        "Input.insertText",
        { text: ch },
        resolve
      );
    });
    await new Promise((r) => setTimeout(r, 35 + Math.random() * 45));
  }
}
```

---

<a id="available-apis"></a>

## Available APIs

Bot scripts run in a privileged isolated page context. The following APIs are available:

| API | Description |
|-----|-------------|
| `chrome.debugger.getTargets()` | List all browser targets (pages, iframes, workers) |
| `chrome.debugger.attach()` | Attach the debugger to a target |
| `chrome.debugger.detach()` | Detach from a target |
| `chrome.debugger.sendCommand()` | Send any CDP command to an attached target |
| `chrome.runtime.lastError` | Check for errors after API calls |
| `console.log()` | Log messages (visible in the terminal) |
| `setTimeout()` / `setInterval()` | Standard timing functions |

For the full list of CDP commands you can send via `chrome.debugger.sendCommand()`, see the [Chrome DevTools Protocol documentation](https://chromedevtools.github.io/devtools-protocol/).

---

<a id="bot-script-vs-frameworks"></a>

## When to Use Bot Script vs Frameworks

| Consideration | Bot Script | Playwright / Puppeteer |
|---------------|-----------|----------------------|
| Dependencies | None | Node.js + npm packages |
| Page context cleanliness | No framework artifacts at all | Requires cleanup (Playwright bindings) |
| API style | Callback-based Chrome extension APIs | Promise-based, high-level APIs |
| Page selectors | Manual CDP queries | Built-in `page.$()`, `page.click()`, etc. |
| Multi-page workflows | Manual target management | Built-in context and page management |
| Best for | Simple interactions, lightweight single-page tasks | Complex multi-page workflows, testing, data collection |

**Use bot script when:**
- You need the cleanest possible page context with zero framework artifacts.
- Your task is a focused interaction (clicking a button, filling a form).
- You want zero external dependencies.
- You need the earliest possible intervention before page load.

**Use Playwright or Puppeteer when:**
- You need high-level page interaction APIs (selectors, screenshots, PDF generation).
- You are building complex multi-step workflows.
- You need built-in waiting and retry mechanisms.
- You are integrating with a test framework.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| "chrome.debugger API not available" | Ensure you are using `--bot-script`, not loading the script another way. |
| Script does not execute | Use an absolute path for `--bot-script`. Relative paths resolve from the binary's directory. |
| Context-scoped script does not run | Pass `--bot-script` in `botbrowserFlags` when creating the BrowserContext, then create pages after that context exists. |
| `chrome.runtime.lastError` on attach | Another debugger may already be attached. Call `chrome.debugger.detach()` first, then retry. |
| Target not found | Targets appear asynchronously. Use `setTimeout` to poll `chrome.debugger.getTargets()` until the target appears. |
| No output visible | Console output from bot scripts appears in the terminal where BotBrowser was launched. |

---

<a id="next-steps"></a>

## Next Steps

- [CLI Recipes](CLI_RECIPES.md). Common flag combinations for typical scenarios.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Complete list of all available flags, including `--bot-script`.
- [Playwright Guide](PLAYWRIGHT.md). If you need high-level page APIs.
- [Puppeteer Guide](PUPPETEER.md). Alternative framework integration.
- [Profile Management](PROFILE_MANAGEMENT.md). Understand profile types, versions, and configuration.
- [Bot Script Examples](../../../examples/bot-script/). Additional script examples for common automation patterns.
- [Per-Context Fingerprint](../../../PER_CONTEXT_FINGERPRINT.md). Use bot scripts with isolated BrowserContexts.

---

**Related documentation:** [Installation](../../../INSTALLATION.md) | [Bot Script Examples](../../../examples/bot-script/) | [Chrome Debugger API](https://developer.chrome.com/docs/extensions/reference/api/debugger/) | [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
