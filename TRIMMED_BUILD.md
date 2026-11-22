# Trimmed Build (ENT Tier3)

A purpose-built browser core for short-session, high-concurrency privacy testing and automation workloads. It uses the same fingerprint protection model, profile format, and CLI surface as Standard Build, with faster context spin-up and lower CPU and shared-memory overhead.

> Trimmed Build is distributed through the [enterprise channel](https://botbrowser.io/enterprise/). Standard Build remains the public download on [Releases](https://github.com/botswin/BotBrowser/releases) and is what the installation guide describes.

<a id="why-a-separate-build"></a>
## Why a Separate Build

Privacy research and authorized automation work falls into two very different operating shapes:

- **Long-running, interactive sessions**: a browser starts once, opens many pages over minutes to hours, exercises the full browser feature surface. Startup cost amortizes over the session.
- **Short-session, high-concurrency workloads**: a browser creates a BrowserContext, loads a small number of pages within seconds to minutes, then tears the context down and starts another with a different identity. Startup cost dominates the run.

A single browser binary cannot be optimal for both shapes. The default browser engine initializes a broad set of background services so that any session can use any feature: search providers, sync, prefetch, optimization-guide models, variations seed, component updater pipelines, and more. For a long interactive session, this initialization is irrelevant overhead, amortized over the session lifetime. For high-concurrency privacy workloads that rotate through hundreds of identities per hour, this initialization is repeated hundreds of times per hour, and most of it does nothing useful for the workload.

Trimmed Build is the deployment shape designed for the second case.

<a id="engineering-design"></a>
## Engineering Design

Trimmed Build is a browser core where the **runtime cost around the protection model** has been reduced, while the protection model itself is left unchanged.

What "reduced runtime cost around the protection model" means in practice:

- **Startup work that does not affect short sessions is deferred or removed.** Browser-level subsystems that are useful for long interactive sessions but irrelevant for short-session privacy workloads are not initialized eagerly.
- **Per-context spin-up work is shortened.** Each new BrowserContext spends less time in setup before the first navigation can begin.
- **Memory shared across contexts is reduced.** Resident memory used by background subsystems is lower, returning headroom to the renderer processes that actually run the workload.
- **The protection surface is held constant.** Fingerprint protection, Per-Context Fingerprint behavior, profile loading, CLI flag surface, and CDP commands share the same behavior as Standard Build.

The goal is a build that pays less startup cost and less per-context cost without changing the browser's privacy policy. A Trimmed Build and Standard Build comparison is meaningful when both runs use the same profile, launch flags, host, and rendering path.

<a id="what-stays-the-same"></a>
## What Stays the Same

Trimmed Build is a drop-in performance variant. If you have code that runs on Standard Build, the same code, same profiles, and same automation framework configurations run on Trimmed Build unchanged.

| Layer | Standard vs Trimmed |
|---|---|
| Fingerprint protection model | Same policy |
| Profile format (`.enc` / `.json`) | Same |
| Profile compatibility | Same |
| CLI flag surface (`--bot-*` and standard browser flags) | Same |
| CDP commands (`BotBrowser.*`) | Same |
| Per-Context Fingerprint behavior | Same interface and isolation model |
| Per-context proxy and dynamic proxy switching | Same |
| Canvas, WebGL, WebGPU, Audio noise | Same policy |
| Font fallback, Client Hints, navigator properties | Same supported profile policy |
| Browser version cadence | Same |
| Profile downloaded from one channel works in the other | Yes |

You can build and test against Standard Build locally, then run Trimmed Build in production without changing automation code, profiles, or deployment inputs except the binary.

<a id="when-to-choose-trimmed-build"></a>
## When to Choose Trimmed Build

Trimmed Build is workload-driven, not host-driven. Choose it when at least one of the following describes the deployment:

- **Context spin-up dominates wall time.** Short-session privacy testing, single-page consistency checks, high-rotation per-context fleets, screenshot or rendering services.
- **CPU peak per context is the bottleneck.** Hosts already running near peak CPU recover the most headroom.
- **Shared memory (PSS / USS) is the binding constraint.** Memory-pressured hosts see meaningful reductions in peak and steady-state memory.
- **Workloads rotate through many identities per hour.** Each context lives seconds to minutes before the next identity takes over. The shorter the per-context lifespan, the larger the advantage.

Stay on Standard Build when:

- Sessions are long-running and interactive.
- The workload exercises the full browser feature surface (extensions, custom protocols, broad browser-internal pages).
- The host has plenty of CPU and memory headroom, and per-context spin-up is not the bottleneck.

<a id="performance-summary"></a>
## Performance Summary

Controlled comparison of BotBrowser 148 Standard Build vs Trimmed Build on Linux x64 (`1..20 contexts × 10 repeats × 2 builds = 400 official samples`). Negative delta means Trimmed is faster or lighter than Standard.

| Dimension | Trimmed delta (mean) | What this drives |
|---|---:|---|
| Wall time | **-61.85%** | Total throughput per shift |
| Per-context creation | **-85.32%** | How fast a fleet can rotate contexts |
| Per-context first navigation | **-38.71%** | Time to first useful work in each context |
| CPU peak | **-67.81%** | How many concurrent contexts a host can sustain |
| CPU average | **-55.42%** | Sustained host load under steady operation |
| PSS peak | **-31.25%** | Shared memory headroom under bursty load |
| USS peak | **-37.82%** | Per-fleet memory headroom |
| Success rate | unchanged at 100% | Stability and cleanup are not regressed |
| Residual processes | unchanged at 0 | Clean shutdown is preserved |

Trimmed Build is faster than Standard Build at **every** context count from `1` to `20` for wall time, per-context creation, per-context first navigation, CPU avg, CPU peak, and PSS peak. Linux x64 is the deployment shape Trimmed Build is built for: short-session, high-concurrency Ubuntu fleets are where the gap is largest.

Full per-context matrix and methodology: [BENCHMARK.md#trimmed-build](BENCHMARK.md#trimmed-build).

<a id="pairs-with-per-context-fingerprint"></a>
## Pairs With Per-Context Fingerprint

Trimmed Build composes with [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md). Per-Context Fingerprint reduces memory and process count by running multiple fingerprint identities in a single browser process; Trimmed Build cuts the spin-up cost and CPU peak of each of those contexts. Together they form the densest deployment shape BotBrowser ships.

A high-density privacy workload running on Trimmed Build with Per-Context Fingerprint and per-context proxy switching combines:

- Per-Context Fingerprint: 29% less memory and 57% fewer processes versus running 50 separate browser instances.
- Trimmed Build: 62% lower wall time and 85% faster per-context spin-up versus Standard Build.

The two effects are independent and stack.

<a id="faq"></a>
## FAQ

**Does Trimmed Build change the fingerprint a page sees?**

No. Profile loading, Canvas / WebGL / WebGPU / Audio noise, font fallback, Client Hints, and the profile-controlled signal policy use the same behavior as Standard Build. The builds share the same Chromium release line, so a profile produces the same protected browser surface under the same host and rendering path.

**Will sites see Trimmed Build differently from Standard Build?**

The browser surface presented to pages is the same. The protection model controls what sites and trackers can observe; Trimmed Build only changes the runtime cost of the browser around that protection model.

**Do I need different profiles for Trimmed Build?**

No. Profiles are interchangeable. The same `.enc` profile file works on both builds.

**Do I need to change automation code when switching from Standard to Trimmed Build?**

No. CLI flags, CDP commands, Playwright and Puppeteer integration, `--bot-script`, and the documented configuration paths are shared.

**Is Trimmed Build a different Chromium version?**

No. Trimmed Build and Standard Build track the same Chromium version and release on the same cadence.

**Why isn't Trimmed Build in the public Releases?**

Trimmed Build is part of the ENT Tier 3 enterprise distribution, together with Per-Context Fingerprint and Dynamic Per-Context Proxy Switching. Standard Build is the public download for the open project; Trimmed Build is delivered through the enterprise channel.

**Is the Chromium version cadence the same?**

Yes. Both builds track the same Chromium version and are released on the same cadence. A Trimmed Build release at version `N.x.y.z` pairs with the matching Standard Build at `N.x.y.z`.

**Can I install both builds on the same host?**

Yes. The two builds are independent binaries with independent install paths. Many teams keep Standard Build on developer machines for interactive work and run Trimmed Build on production hosts.

<a id="getting-trimmed-build"></a>
## Getting Trimmed Build

Trimmed Build ships through the enterprise distribution channel. For access:

- [Enterprise page](https://botbrowser.io/enterprise/) for track structure and engagement model
- [Pricing page](https://botbrowser.io/pricing/) for ENT Tier 3 details
- Contact enterprise sales directly for the distribution package matching your deployment shape

<a id="related-documentation"></a>
## Related Documentation

- [BENCHMARK.md#trimmed-build](BENCHMARK.md#trimmed-build) - Full Linux x64 performance data, methodology, per-context matrix
- [PER_CONTEXT_FINGERPRINT.md](PER_CONTEXT_FINGERPRINT.md) - Per-Context Fingerprint (composes with Trimmed Build)
- [Performance Optimization Guide](docs/guides/deployment/PERFORMANCE_OPTIMIZATION.md) - Practical tuning for high-scale automation
- [Multi-Account Isolation Guide](docs/guides/identity/MULTI_ACCOUNT_ISOLATION.md) - High-density per-context deployment patterns
- [Docker Deployment Guide](docs/guides/deployment/DOCKER_DEPLOYMENT.md) - Container fleet deployment
- [Builds in README](README.md#builds) - Short comparison table
- [Trimmed Build on botbrowser.io](https://botbrowser.io/docs/deployment/trimmed-build/) - Public mirror with extended commentary

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
