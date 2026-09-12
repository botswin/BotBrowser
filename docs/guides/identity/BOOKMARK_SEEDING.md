# Bookmark Seeding

> Inject realistic bookmarks to strengthen browser state consistency and authentic session behavior.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** installed. See [INSTALLATION.md](../../../INSTALLATION.md).
- **A profile file** (`.enc` or `.json`).

---

<a id="overview"></a>

## Overview

Real browsers accumulate bookmarks over time. An empty bookmarks bar is a consistency signal that does not match authentic usage patterns. The `--bot-bookmarks` flag lets you inject bookmarks at launch time, ensuring the browser starts with a populated bookmarks bar consistent with normal browsing behavior.

Bookmarks support both flat URLs and nested folder structures.

---

<a id="quick-start"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-bookmarks='[{"title":"Google","type":"url","url":"https://www.google.com"},{"title":"News","type":"folder","children":[{"title":"BBC","type":"url","url":"https://www.bbc.com"}]}]'
```

---

<a id="how-it-works"></a>

## How It Works

1. **Bookmark parsing.** At launch, BotBrowser reads the `--bot-bookmarks` JSON value and populates the browser's bookmark store.

2. **Structure.** Bookmarks are defined as a JSON array. Each entry is either a URL bookmark or a folder containing child bookmarks.

3. **Persistence.** Bookmarks persist for the duration of the session. They are stored in the browser's user data directory alongside other session data.

### Bookmark Format

Each bookmark entry has these fields:

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Display name of the bookmark or folder. |
| `type` | Yes | Either `url` (a bookmark) or `folder` (a container). |
| `url` | For `url` type | The bookmark URL. |
| `children` | For `folder` type | Array of child bookmark entries. |

---

<a id="common-scenarios"></a>

## Common Scenarios

### Simple bookmarks bar

```javascript
import { chromium } from "playwright-core";

const bookmarks = JSON.stringify([
  { title: "Google", type: "url", url: "https://www.google.com" },
  { title: "YouTube", type: "url", url: "https://www.youtube.com" },
  { title: "Gmail", type: "url", url: "https://mail.google.com" },
  { title: "GitHub", type: "url", url: "https://github.com" },
]);

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    `--bot-bookmarks=${bookmarks}`,
  ],
});
```

### Bookmarks with folder structure

```javascript
const bookmarks = JSON.stringify([
  { title: "Google", type: "url", url: "https://www.google.com" },
  {
    title: "Work",
    type: "folder",
    children: [
      { title: "Jira", type: "url", url: "https://jira.example.com" },
      { title: "Confluence", type: "url", url: "https://wiki.example.com" },
    ],
  },
  {
    title: "News",
    type: "folder",
    children: [
      { title: "BBC", type: "url", url: "https://www.bbc.com" },
      { title: "Reuters", type: "url", url: "https://www.reuters.com" },
    ],
  },
]);

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    `--bot-bookmarks=${bookmarks}`,
  ],
});
```

### Region-appropriate bookmarks

Match bookmarks to the geographic identity of the session:

```javascript
// German identity
const deBookmarks = JSON.stringify([
  { title: "Google", type: "url", url: "https://www.google.de" },
  { title: "Spiegel", type: "url", url: "https://www.spiegel.de" },
  { title: "Amazon", type: "url", url: "https://www.amazon.de" },
]);

const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  headless: true,
  args: [
    "--bot-profile=/path/to/profile.enc",
    "--proxy-server=socks5://user:pass@de-proxy.example.com:1080",
    "--bot-timezone=Europe/Berlin",
    `--bot-bookmarks=${deBookmarks}`,
  ],
});
```

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Bookmarks not appearing | Verify the JSON is valid and each entry has `title` and `type` fields. |
| Folder shows empty | Ensure the `children` array contains valid bookmark entries. |
| JSON parse error | In JavaScript, use `JSON.stringify()` to build the value. Do not wrap in extra quotes. |

---

<a id="next-steps"></a>

## Next Steps

- [Cookie Management](COOKIE_MANAGEMENT.md). Inject cookies for session restoration.
- [History Seeding](HISTORY_SEEDING.md). Add browsing history for privacy protection.
- [`--bot-bookmarks`](../../../CLI_FLAGS.md#flag-bot-bookmarks). CLI values and availability.

---

**Related documentation:** [CLI Flags Reference](../../../CLI_FLAGS.md) | [Playwright Guide](../getting-started/PLAYWRIGHT.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
