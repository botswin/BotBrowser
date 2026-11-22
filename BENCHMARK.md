# BotBrowser Performance Benchmark

Performance data comparing BotBrowser fingerprint protection overhead against stock Chromium, and evaluating Per-Context Fingerprint scalability.

## Key Findings

| Question | Answer |
|----------|--------|
| **How much overhead does BotBrowser add?** | Near-zero. Speedometer 3.0 shows **<1% difference** in both headed and headless modes, within run-to-run variance. |
| **Are fingerprint APIs slower?** | The tested Canvas, WebGL, Navigator, Screen, and Font API paths stayed within the benchmark's measurement resolution with or without profile protection on macOS, Linux, and Windows. |
| **Can video-heavy sessions lower CPU?** | Yes. In the tested Linux x64 video workload, `--bot-video-fps=1:30` reduced average CPU by **71-82%** where lower visual video cadence was acceptable. See [Video FPS Control](#video-fps-control). |
| **How does Per-Context Fingerprint scale?** | At 50 concurrent profiles: **29% less memory**, **57% fewer processes**, **2x faster creation** vs launching 50 separate browser instances. Full fingerprint isolation verified. |
| **How does Trimmed Build compare to Standard?** | On Linux x64 (400 official samples): **62% lower wall time**, **85% faster per-context creation**, **68% lower CPU peak**, **31% lower PSS peak** versus Standard, with **100% success rate** and **0 residual processes**. See [Trimmed Build](#trimmed-build). |

## Single Instance Performance

### Standard Benchmark Suites

All benchmarks run locally (no network dependency). Each test runs 3 times; median reported.

**Test Environment**: macOS (Apple M4 Max, 16 cores, 64GB RAM)

| Mode | Benchmark | Stock Chrome | BotBrowser + Android | Difference |
|------|-----------|-------------|---------------------|------------|
| Headless | **Speedometer 3.0** | 42.8 (±0.31) | 42.7 (±0.25) | **-0.2%** |
| Headed | **Speedometer 3.0** | 41.8 (±0.21) | 42.1 (±0.17) | **+0.7%** |

> **Methodology**: Warm-up run (discarded) + 3 measurement runs with interleaved test order (Stock → BB → Stock → BB → Stock → BB) to eliminate thermal/cache bias. Scores shown as median ± stddev.
>
> **Result**: BotBrowser's fingerprint protection adds **no measurable overhead** to JavaScript and DOM performance. Differences of 0.1-0.3 points are well within run-to-run variance. Consistent across both headed and headless modes.

### Fingerprint API Overhead

Individual API latency measured over 1,000 iterations each, median reported (milliseconds).

| API | Stock Chrome | BB + Android | BB + Windows | BB + macOS |
|-----|-------------|-------------|-------------|-----------|
| Canvas2D `toDataURL()` | 0.5 | 0.5 | 0.5 | 0.5 |
| Canvas2D `getImageData()` | 0.0 | 0.0 | 0.0 | 0.0 |
| WebGL `getParameter(RENDERER)` | 0.0 | 0.0 | 0.0 | 0.0 |
| WebGL `getSupportedExtensions()` | 0.0 | 0.0 | 0.0 | 0.0 |
| WebGL `getShaderPrecisionFormat()` | 0.0 | 0.0 | 0.0 | 0.0 |
| WebGL `readPixels()` | 0.2 | 0.2 | 0.2 | 0.2 |
| AudioContext Offline Render + Hash | 3.9 | 2.9 | 3.2 | 3.7 |
| Navigator `userAgent` | 0.0 | 0.0 | 0.0 | 0.0 |
| Navigator `platform` | 0.0 | 0.0 | 0.0 | 0.0 |
| Screen `width` + `height` | 0.0 | 0.0 | 0.0 | 0.0 |
| `performance.now()` | 0.0 | 0.0 | 0.0 | 0.0 |
| Font `measureText()` (50 fonts) | 0.0 | 0.0 | 0.0 | 0.0 |
| Intl `DateTimeFormat.resolvedOptions` | 0.0 | 0.0 | 0.0 | 0.0 |

> **Result**: The measured overhead was below the displayed 0.1 ms resolution on the tested API paths. Canvas, WebGL, Navigator, Screen, and Font APIs reported the same median at that resolution with or without a profile. AudioContext variance (2.9-3.9 ms) is within normal fluctuation.

### Page Load Time

Median load time for a locally-intercepted page (milliseconds).

| Configuration | Load Time | vs Stock |
|---------------|-----------|----------|
| Stock Chrome (no profile) | 29.7ms | - |
| BotBrowser + Android | 101.6ms | +72ms |
| BotBrowser + Windows | 102.9ms | +73ms |
| BotBrowser + macOS | 105.9ms | +76ms |

> **Note**: The additional ~72-76ms comes from one-time profile initialization (reading and applying fingerprint configuration on first page load). All three profile types show similar overhead, indicating no significant difference between cross-platform profiles.

---

<a id="video-fps-control"></a>
## Video FPS Control: Media Workload CPU

`--bot-video-fps` (ENT Tier2) lowers the actual video decode/render cadence while optionally keeping media FPS reporting aligned with the selected policy. It requires a profile with Video FPS Control enabled. This benchmark measures a video-heavy workload where full visual frame cadence is not required.

### Test Environment

| Dimension | Value |
|---|---|
| Platform | Linux x64 official build |
| Chromium line | BotBrowser 149.0.7827.102 |
| Workload | Local AVC 640x360, 30 FPS video elements |
| Mode | Headless |
| Video FPS policy | Baseline `30:30`; throttled `1:30` |
| Warmup | 10 seconds |
| Sample window | 30 seconds |
| Repeats | 3 per configuration |

### Result

Baseline uses normal 30 FPS video playback and reporting. Throttled uses `--bot-video-fps=1:30`, which updates video frames near 1 FPS while media reporting uses 30 FPS.

| Concurrent videos | Baseline avg CPU | `--bot-video-fps=1:30` avg CPU | Reduction |
|---:|---:|---:|---:|
| 8 | 33.96% | 9.70% | **71.43%** |
| 16 | 61.20% | 12.10% | **80.24%** |
| 24 | 76.49% | 13.81% | **81.95%** |

### Interpretation

Use Video FPS Control when video decode/render work is the CPU bottleneck and the workflow only needs occasional visual frame updates. Pixel output follows the actual FPS, so choose a higher actual cadence when the workload samples video pixels frame by frame. CPU percentages vary by host, driver, codec, and workload; use the reduction range as a benchmark reference, not a pass/fail threshold.

Configuration and examples: [FPS Control](docs/guides/fingerprint/FPS_CONTROL.md#video-fps-control).

---

## Scale Performance: Per-Context vs Multi-Instance

The core value proposition for enterprise users: running N different fingerprint profiles simultaneously.

### Architecture Comparison

| Architecture | How It Works |
|-------------|-------------|
| **Multi-Instance** | Launch N separate browser processes, each with a different `--bot-profile` |
| **Per-Context** (ENT Tier 3) | Launch 1 browser, create N BrowserContexts, each assigned a different profile via CDP `BotBrowser.setBrowserContextFlags` |

### Resource Usage at Scale

**Test Environment**: macOS (Apple M4 Max, 16 cores, 64GB RAM), Headless mode

| Scale | MI Memory | PC Memory | Savings | MI Processes | PC Processes | MI Create Time | PC Create Time | Speedup |
|-------|-----------|-----------|---------|-------------|-------------|---------------|---------------|---------|
| **1** | 16,055 MB | 14,022 MB | 13% | 140 | 136 | 1,667ms | 627ms | 2.7x |
| **10** | 23,345 MB | 19,586 MB | 16% | 212 | 150 | 11,434ms | 4,854ms | 2.4x |
| **25** | 30,133 MB | 23,781 MB | 21% | 320 | 174 | 28,205ms | 14,415ms | 2.0x |
| **50** | 40,218 MB | 28,553 MB | **29%** | 492 | 210 | 57,891ms | 28,946ms | **2.0x** |

> Per-Context memory savings increase with scale as the shared browser/GPU/network processes are amortized across more contexts.

### Canvas Fingerprint Isolation

Each context/instance receives a unique noise seed, producing distinct canvas fingerprints. Verified across all scale levels:

| Architecture | Scale | Unique Hashes | Status |
|-------------|-------|---------------|--------|
| Multi-Instance | 10 | 10/10 | PASS |
| Multi-Instance | 25 | 10/10 | PASS |
| Multi-Instance | 50 | 10/10 | PASS |
| Per-Context | 10 | 10/10 | PASS |
| Per-Context | 25 | 10/10 | PASS |
| Per-Context | 50 | 10/10 | PASS |

> Per-Context Fingerprint provides the same fingerprint isolation as running separate browser instances, while sharing infrastructure resources.

### Scaling Characteristics

**Multi-Instance** (N browsers):
- Memory grows linearly: each browser adds ~400-800MB
- Process count grows linearly: ~7-10 processes per browser
- Creation time grows linearly: ~1s per browser

**Per-Context** (1 browser, N contexts):
- Memory grows sub-linearly: contexts share browser/GPU/network processes
- Process count grows more slowly: shared processes are reused
- Creation time grows sub-linearly: no browser startup overhead per context

### At 50 Concurrent Profiles

```
Multi-Instance:  40,218 MB memory | 492 processes | 57.9s to create
Per-Context:     28,553 MB memory | 210 processes | 28.9s to create
                 ──────────────────────────────────────────────────
Savings:           29% memory     | 57% processes  |  2.0x faster
```

### Context Lifecycle Performance

Continuous create/destroy cycle test (200 iterations):

| Metric | Value |
|--------|-------|
| Context creation (median) | 278ms |
| Context creation (p95) | 369ms |
| Context destruction (median) | 7.9ms |
| Context destruction (p95) | 16ms |
| Memory trend (200 cycles) | Stable (no persistent growth) |

> Context creation is lightweight (~280ms) and destruction is near-instant (~8ms). Memory remains stable over 200 create/destroy cycles with no persistent memory leaks observed.

---

<a id="trimmed-build"></a>
## Trimmed Build: Linux x64 Short-Session Performance

Controlled comparison of **BotBrowser 148 Standard Build** vs **BotBrowser 148 Trimmed Build** on the same Linux x64 host using the same benchmark matrix. For positioning, engineering design, when-to-choose guidance, and FAQ, see the [Trimmed Build product page](TRIMMED_BUILD.md). This section is the performance evidence.

### Test Inputs

| Build | Configuration | Chromium version | Profile |
|---|---|---|---|
| Standard | BotBrowser 148 x64 standard build | 148.0.7778.168 | Windows x64 demo profile, standard-compatible |
| Trimmed (ENT Tier3) | BotBrowser 148 x64 trimmed build (May 2026) | 148.0.7778.168 | Windows x64 demo profile, trimmed-compatible |

Matrix: `1..20 contexts × 10 repeats × 2 builds = 400 official samples`. Both profiles were verified to support per-context flags, per-context proxy settings, proxy auth, and custom headers before the matrix started.

### Method

- Each repeat created `N` independent BrowserContexts, applied `BotBrowser.setBrowserContextFlags`, assigned per-context external proxy settings, loaded a lightweight external page, and ran a minimal fingerprint and proxy probe.
- Process metrics were sampled every `250ms`. CPU came from Linux process accounting; RSS/PSS/USS came from process memory rollups.
- Each repeat closed the browser and checked for residual Chromium processes.
- Both builds used identical launch flags, identical context counts, identical repeat counts, identical warmup shape, identical external target, and identical sampling interval.

### Overall Result

Negative delta means **Trimmed is faster/lighter than Standard**.

| Metric | Standard mean / median / p95 | Trimmed mean / median / p95 | Trimmed delta mean / median / p95 |
|---|---:|---:|---:|
| Wall time ms | 7,262.91 / 7,191.04 / 11,666.96 | 2,771.09 / 2,818.88 / 3,758.50 | **-61.85% / -60.80% / -67.79%** |
| Avg create ms/context | 443.44 / 418.73 / 604.90 | 65.10 / 64.75 / 75.54 | **-85.32% / -84.54% / -87.51%** |
| Avg first nav ms/context | 2,456.19 / 2,417.16 / 3,072.68 | 1,505.45 / 1,515.68 / 1,849.09 | **-38.71% / -37.30% / -39.82%** |
| CPU avg % | 4.12 / 4.22 / 4.78 | 1.83 / 2.02 / 2.89 | **-55.42% / -52.06% / -39.51%** |
| CPU peak % | 25.77 / 27.82 / 40.38 | 8.29 / 9.11 / 12.10 | **-67.81% / -67.25% / -70.03%** |
| RSS peak KB | 2,591,811 / 2,585,150 / 3,762,505 | 2,249,774 / 2,236,104 / 3,303,095 | -13.20% / -13.50% / -12.21% |
| PSS peak KB | 960,327 / 959,095 / 1,309,422 | 660,188 / 656,149 / 895,552 | **-31.25% / -31.59% / -31.61%** |
| USS peak KB | 800,760 / 793,448 / 1,128,869 | 497,876 / 497,038 / 718,904 | **-37.82% / -37.36% / -36.32%** |
| RSS stable KB | 1,499,234 / 1,491,875 / 1,819,937 | 1,377,981 / 1,360,862 / 1,758,705 | -8.09% / -8.78% / -3.36% |
| PSS stable KB | 637,313 / 635,427 / 747,051 | 492,405 / 490,987 / 591,358 | -22.74% / -22.73% / -20.84% |
| USS stable KB | 489,925 / 489,912 / 592,544 | 346,048 / 343,908 / 441,309 | -29.37% / -29.80% / -25.52% |
| Process peak | 26.27 / 27.00 / 40.10 | 19.50 / 19.50 / 28.05 | -25.76% / -27.78% / -30.05% |
| Success rate | 100% | 100% | unchanged |
| Residual processes | 0 | 0 | unchanged |

### Per-Context Matrix

Wall time, context creation, and first navigation at every context count from `1` to `20`. Negative percentage means Trimmed is faster than Standard at that context count.

| N | Wall Standard ms | Wall Trimmed ms | Wall delta | Create delta | First nav delta | CPU avg delta | CPU peak delta | PSS peak delta |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1  | 1,564.92  | 748.41    | -52.18% | -85.49% | -52.51% | -95.52% | -97.09% | -27.89% |
| 2  | 3,507.80  | 1,948.97  | -44.44% | -88.33% | -43.61% | -92.05% | -89.86% | -28.94% |
| 3  | 3,988.82  | 1,992.15  | -50.06% | -87.99% | -43.78% | -80.93% | -63.42% | -29.17% |
| 4  | 3,955.15  | 2,136.14  | -45.99% | -84.01% | -37.29% | -74.09% | -52.54% | -30.15% |
| 5  | 4,432.40  | 2,204.01  | -50.28% | -85.08% | -37.87% | -68.19% | -51.68% | -30.41% |
| 6  | 5,592.26  | 2,316.21  | -58.58% | -87.36% | -40.32% | -63.93% | -66.42% | -29.53% |
| 7  | 5,141.93  | 2,342.06  | -54.45% | -83.81% | -35.61% | -59.40% | -61.96% | -31.03% |
| 8  | 6,149.22  | 2,556.26  | -58.43% | -84.29% | -37.96% | -54.73% | -59.51% | -30.61% |
| 9  | 6,147.59  | 2,701.18  | -56.06% | -83.77% | -31.58% | -53.26% | -66.09% | -31.56% |
| 10 | 6,985.46  | 2,735.62  | -60.84% | -85.10% | -36.79% | -54.62% | -68.59% | -32.06% |
| 11 | 7,258.48  | 2,891.23  | -60.17% | -84.34% | -36.46% | -52.11% | -61.73% | -31.18% |
| 12 | 7,628.21  | 2,971.22  | -61.05% | -83.98% | -33.97% | -48.32% | -68.29% | -31.84% |
| 13 | 9,976.22  | 3,009.45  | -69.83% | -87.65% | -45.89% | -49.07% | -71.87% | -31.06% |
| 14 | 9,262.40  | 3,222.77  | -65.21% | -85.47% | -37.76% | -47.50% | -67.77% | -32.02% |
| 15 | 9,518.44  | 3,271.86  | -65.63% | -85.19% | -38.25% | -44.81% | -65.17% | -32.83% |
| 16 | 9,709.20  | 3,935.21  | -59.47% | -79.76% | -29.05% | -34.23% | -65.82% | -32.73% |
| 17 | 10,223.93 | 3,619.99  | -64.59% | -84.21% | -37.29% | -41.66% | -68.99% | -31.83% |
| 18 | 11,073.62 | 3,520.06  | -68.21% | -85.94% | -39.39% | -43.13% | -70.31% | -32.56% |
| 19 | 11,321.90 | 3,572.46  | -68.45% | -86.59% | -40.62% | -43.81% | -72.06% | -30.90% |
| 20 | 11,820.21 | 3,726.52  | -68.47% | -84.57% | -41.15% | -39.52% | -71.87% | -31.44% |

> Trimmed is faster than Standard at **every** context count for wall time, average context creation, average first navigation, CPU avg, CPU peak, and PSS peak. The gap is largest in CPU peak (`-51% to -97%`) and per-context creation (`-79% to -88%`), which directly drive throughput for short-session privacy workloads that rotate identities quickly.

### Stability

- Browser main process, network service, GPU, and utility process counts are unchanged across builds.
- Renderer count scales with context count in both builds.
- Trimmed reduces peak process count overall: mean `26.27 → 19.50`, median `27.00 → 19.50`, p95 `40.10 → 28.05`.
- All official runs exited cleanly: `400/400` successful samples, `0` errors, `0` residual Chromium processes.

### Scope Notes

- Linux x64 is the deployment shape Trimmed Build is built for: short-session, high-concurrency Ubuntu fleets are where the gap is largest.
- The benchmark includes external navigation and uses a fixed matrix for both builds.
- Profile bundles, host class, launch flags, and target endpoint were held identical between builds; runtime credentials and absolute paths are intentionally omitted from this customer-facing report.

### Next Steps

- Product overview, engineering design, and FAQ: [TRIMMED_BUILD.md](TRIMMED_BUILD.md)
- Access: [Enterprise](https://botbrowser.io/enterprise/) or [Pricing](https://botbrowser.io/pricing/)
- Public mirror with extended commentary: [Trimmed Build on botbrowser.io](https://botbrowser.io/docs/deployment/trimmed-build/)

---

## Cross-Platform Verification

BotBrowser supports applying any platform's fingerprint on any host OS. Tested on macOS, Linux, and Windows.

### Fingerprint API Latency: macOS Host

All values in milliseconds (median of 1,000 iterations). Headless mode.

| API | Stock Chrome | BB + Android | BB + Windows | BB + macOS |
|-----|-------------|-------------|-------------|-----------|
| Canvas2D `toDataURL()` | 0.5 | 0.5 | 0.5 | 0.5 |
| WebGL `readPixels()` | 0.2 | 0.2 | 0.2 | 0.2 |
| AudioContext Render | 3.9 | 2.9 | 3.2 | 3.7 |
| All other APIs | 0.0 | 0.0 | 0.0 | 0.0 |

### Fingerprint API Latency: Linux Host

Tested in both headless and headed modes.

| API | Headless Stock | Headless BB | Headed Stock | Headed BB |
|-----|---------------|------------|-------------|----------|
| Canvas2D `toDataURL()` | 0.3 | 0.3 | 0.3 | 0.3 |
| WebGL `readPixels()` | 0.1 | 0.1 | 0.1 | 0.1 |
| AudioContext Render | 8.5 | 7.1 | 9.0 | 7.7 |
| Font `measureText()` | 0.1 | 0.1 | 0.1 | 0.1 |
| All other APIs | 0.0 | 0.0 | 0.0 | 0.0 |

### Fingerprint API Latency: Windows Host

Tested in both headless and headed modes.

| API | Headless Stock | Headless BB | Headed Stock | Headed BB |
|-----|---------------|------------|-------------|----------|
| Canvas2D `toDataURL()` | 1.8 | 1.8 | 1.6 | 1.5 |
| Canvas2D `getImageData()` | 0.7 | 0.6 | 0.6 | 0.6 |
| WebGL `readPixels()` | 0.5 | 0.7 | 0.6 | 0.6 |
| AudioContext Render | 10.5 | 9.1 | 8.9 | 10.8 |
| Font `measureText()` | 0.3 | 0.3 | 0.3 | 0.3 |
| All other APIs | 0.0 | 0.0 | 0.0 | 0.0 |

> **Note**: The Windows test environment uses software rendering (no discrete GPU), resulting in higher Canvas/WebGL baseline latency compared to macOS. The measured Stock and BotBrowser values are equal after rounding to the table's 0.1 ms precision.

### Page Load: Windows Host

| Mode | Stock Chrome | BotBrowser + Android |
|------|-------------|---------------------|
| Headless | 28.7ms | 27.9ms (-0.8ms) |
| Headed | 27.9ms | 27.1ms (-0.8ms) |

### Page Load: Linux Host

| Mode | Stock Chrome | BotBrowser + Android |
|------|-------------|---------------------|
| Headless | 7.4ms | 8.4ms (+1.0ms) |
| Headed | 8.6ms | 6.9ms (-1.7ms) |

> **Result**: The tested core API paths add no change above the table's displayed precision across the three tested platforms and both rendering modes.

---

## Methodology

### Test Configuration

| Setting | Value |
|---------|-------|
| Chromium line | BotBrowser 145 benchmark run |
| Automation | Playwright (playwright-core) |
| Benchmark deployment | Local HTTP server (no network dependency) |
| Test categories | Speedometer 3.0, Fingerprint API micro-benchmarks (13 APIs), Page load timing, Per-Context vs Multi-Instance scale |

### How to Reproduce

All benchmark scripts are available in [`docs/benchmarks/`](docs/benchmarks/):

| Script | Purpose |
|--------|---------|
| [`bench-baseline.js`](docs/benchmarks/scripts/bench-baseline.js) | Single-instance benchmark (Speedometer + Fingerprint API + Page load) |
| [`bench-scale.js`](docs/benchmarks/scripts/bench-scale.js) | Per-Context vs Multi-Instance scale test |
| [`run-all.js`](docs/benchmarks/scripts/run-all.js) | Full automated orchestration |
| [`fingerprint-bench.html`](docs/benchmarks/pages/fingerprint-bench.html) | Fingerprint API overhead test page |
| [`config.js`](docs/benchmarks/config.js) | Platform detection and path configuration |
| [`utils.js`](docs/benchmarks/utils.js) | Shared utilities (stats, memory sampling) |

To run them:

```bash
# 1. Clone benchmark suites locally
cd docs/benchmarks
./setup-benchmarks.sh

# 2. Install dependencies
npm install

# 3. Set environment variables
export BROWSER_PATH=/path/to/botbrowser/chrome
export PROFILES_BASE=/path/to/your/profiles

# 4. Run baseline benchmark (single instance)
node scripts/bench-baseline.js --mode headless

# 5. Run scale benchmark (per-context vs multi-instance)
node scripts/bench-scale.js --mode headless --max-scale 50
```

### Statistical Method

- **Benchmark suites**: Warm-up run (discarded) + 3 interleaved measurement runs per configuration, median ± stddev reported
- **Fingerprint APIs**: 1,000 iterations per API, median reported
- **Page loads**: 10 measurements per configuration, median reported
- **Scale tests**: Single run per scale level (deterministic setup)

### Environment Details

**macOS (primary test platform)**:
- Apple M4 Max (16 cores), 64GB RAM
- macOS 15.3, arm64

**Linux (cross-platform verification)**:
- Ubuntu 22.04, x64

**Windows (cross-platform verification)**:
- Intel Xeon (20 cores / 40 threads), 64GB RAM
- Windows 11, x64

---

## Summary

BotBrowser's fingerprint protection engine is designed for production workloads:

1. **No measurable change in Speedometer 3.0 beyond run variance**: headless 42.7 vs 42.8 (stock minus profile), headed 42.1 vs 41.8
2. **No measured latency difference above display precision** for the tested Canvas, WebGL, Navigator, Screen, and Font API paths on macOS, Linux, and Windows
3. **Per-Context Fingerprint** provides resource savings at scale with full fingerprint isolation:
   - 29% less memory at 50 concurrent profiles
   - 2x faster profile creation
   - 57% fewer OS processes
   - 100% canvas fingerprint isolation verified (each context produces a unique hash)
4. **Consistent across platforms**, tested on macOS arm64, Linux x64, and Windows x64 with results inside the stated run-to-run variance

For enterprise users running concurrent fingerprint profiles, Per-Context Fingerprint (ENT Tier 3) delivers the same privacy protection with lower infrastructure cost and verified fingerprint isolation between contexts.

## Related Documentation

- [Guides](https://botbrowser.io/docs/) - Comprehensive guides for all BotBrowser features
- [Main README](README.md) - Project overview and quick start
- [Per-Context Fingerprint](PER_CONTEXT_FINGERPRINT.md) - Architecture and API details
- [Validation Results](VALIDATION.md) - Research data across 31+ tracking scenarios
- [Advanced Features](ADVANCED_FEATURES.md) - Comprehensive technical capabilities
- [CLI Flags Reference](CLI_FLAGS.md) - Complete command-line options

Related guides: [Performance Optimization](https://botbrowser.io/docs/deployment/performance-optimization/)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
