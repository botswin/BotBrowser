# Stack Depth Protection

> JavaScript recursive stack depth is a privacy-relevant signal. BotBrowser controls stack depth values through the `--bot-stack-seed` flag.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser** installed. See [Installation Guide](../../../INSTALLATION.md).
- **A profile file** (`.enc` for production).

---

<a id="overview"></a>

## Overview

JavaScript recursive call stack depth is a privacy-relevant signal that varies by platform and cannot be controlled through JavaScript injection. BotBrowser protects this surface through the `--bot-stack-seed` flag (ENT Tier2).

---

<a id="quick-start"></a>

## Quick Start

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc"
```

---

<a id="configuration"></a>

## How BotBrowser Controls Stack Depth

The `--bot-stack-seed` flag provides three modes of stack depth control:

| Value | Behavior |
|-------|----------|
| `profile` | Use the exact stack depth values stored in the profile, matching the reference device. |
| `real` | Use the native stack depth of the host system. Useful when running on the same platform as the profile target. |
| `<integer>` (1-UINT32_MAX) | Per-session depth variation. Each seed produces a different but stable value. Same seed = same depth across sessions. |

### Profile Mode

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-stack-seed=profile
```

### Real Mode

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-stack-seed=real
```

### Seed Mode

```bash
chromium-browser \
  --bot-profile="/path/to/profile.enc" \
  --bot-stack-seed=12345
```

### Coverage Across Contexts

BotBrowser controls stack depth across all three execution contexts:

- **Main thread**: The primary JavaScript execution context
- **Web Workers**: Background thread contexts
- **WASM**: WebAssembly execution stack

The controlled values maintain realistic ratios between contexts, matching what the target platform would produce.

---

<a id="common-scenarios"></a>

## Common Scenarios

### Keeping profile-consistent depth across hosts

Use `--bot-stack-seed=profile` when your profile should stay aligned across macOS/Linux/Windows deployment hosts.

### Controlled per-session variance

Use integer seed mode (`--bot-stack-seed=12345`) to keep runs reproducible per seed while avoiding one fixed depth for every session.

### Verifying multi-context behavior

Compare main-thread and Worker depth together when validating changes. A realistic ratio between contexts is often more important than one absolute number.

---

<a id="verification"></a>

## Effect Verification

To verify protection is active:

1. Launch BotBrowser with a profile and visit a fingerprint testing site such as [BrowserLeaks](https://browserleaks.com/) or [CreepJS](https://abrahamjuliot.github.io/creepjs/).
2. Confirm that the reported stack depth values match the profile configuration, not the host machine.
3. To verify reproducibility, launch two sessions with the same profile and `--bot-stack-seed`, then compare stack depth across the main thread, Web Workers, and WASM contexts.

---

<a id="troubleshooting"></a>

## Troubleshooting / FAQ

| Problem | Solution |
|---------|----------|
| Stack depth is lower than expected on all contexts | Confirm `--bot-stack-seed` mode is what you intended (`profile`, `real`, or integer seed). |
| Main thread and Worker depths look inconsistent | Re-check that context setup and runtime flags are applied before page scripts execute. |
| Depth varies across sessions unexpectedly | Avoid mixing seed mode and real mode between runs. Keep a fixed seed for reproducible validation. |

---

<a id="next-steps"></a>

## Next Steps

- [Performance Fingerprinting](PERFORMANCE.md). Control timing-based fingerprint signals.
- [CPU Core Scaling Protection](CPU_CORE_SCALING.md). Constrain Worker parallelism to match claimed core count.
- [`--bot-stack-seed`](../../../CLI_FLAGS.md#flag-bot-stack-seed). CLI values and availability.

---

**Related documentation:** [Advanced Features: Stack Depth Control](../../../ADVANCED_FEATURES.md#stack-depth-control) | [CLI Flags](../../../CLI_FLAGS.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.

---

**Related BotBrowser blog:** [JavaScript Stack Depth: A Browser Privacy Signal](https://botbrowser.io/en/blog/stack-depth-fingerprinting/)
