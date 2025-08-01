<h1 align="center">🤖 BotBrowser</h1>

<h4 align="center">The Ultimate Solution for Undetectable Automated Browsing 🚀</h4>

<p align="center">
  <a href="https://github.com/botswin/BotBrowser/releases">
    <img src="https://img.shields.io/github/v/release/botswin/BotBrowser?style=flat-square" alt="Latest Release">
  </a>
  <a href="https://github.com/botswin/BotBrowser/commits/main/">
    <img src="https://img.shields.io/github/commit-activity/m/botswin/BotBrowser?style=flat-square" alt="Commit Activity">
  </a>
  <a href="https://github.com/botswin/BotBrowser/issues">
    <img src="https://img.shields.io/github/issues/botswin/BotBrowser?style=flat-square" alt="Issues">
  </a>
  <a href="https://github.com/botswin/BotBrowser/fork">
    <img src="https://img.shields.io/github/forks/botswin/BotBrowser?style=flat-square" alt="GitHub Forks">
  </a>
  <a href="https://github.com/botswin/BotBrowser">
    <img src="https://img.shields.io/github/stars/botswin/BotBrowser" alt="GitHub Stars">
  </a>
</p>

<div align="center">
  <img width="600" alt="BotBrowser GUI - Your Command Center" src="https://github.com/user-attachments/assets/e9c0b656-83b0-4be5-986e-d4bc3c04b4b5">
</div>

---

## What is BotBrowser?

BotBrowser is a cross-platform stealth browser designed to defeat modern antibot systems. By directly modifying Chromium's C++ source code, BotBrowser eliminates the fingerprint leaks and automation traces left behind by [CDP](https://chromedevtools.github.io/devtools-protocol/)-based solutions, enabling true undetectable browsing and automation.

---

## 🚀 Core Features

 **Cross-Platform OS Simulation**
  > Use distinct cross-platform profiles to emulate Windows, macOS, Ubuntu, or Android on any host-undetectable even in **headless** mode.

 **Latest Chromium Base**
  > Always aligned with the newest stable Chromium release, ensuring cutting‑edge compatibility with today's most advanced antibot defenses.

 **Unlimited Android Chrome Emulation**
  > Emulate Android devices (metrics, UA, touch & sensors, etc.) flawlessly and undetectably. [▶️ creepjs test](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs-Android), [▶️ iphey test](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-iphey-iphey-Android), [▶️ pixelscan test](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-pixelscan-pixelscan-Android)

 **Advanced Programmatic Control**
  > Harness CDP through [Playwright](examples/playwright) and [Puppeteer](examples/puppeteer) alongside deep C++ modifications that block CDP leak detection, delivering both powerful automation and rock‑solid stealth.

 **Success & Performance**
  > Proven **98%+ success** against sophisticated antibot measures, powering over 350,000 daily account registrations with exceptional stability and speed under heavy loads.

## 🛡️ Advanced Capabilities

- [x] **Headless & Incognito Evasion**: Seamlessly bypasses detection in both headless and incognito modes.

- [x] **Proxy Authentication**: Supports embedding credentials in proxy URLs (e.g., `http://usr:pwd@host:port`, `socks5://usr:pwd@host:port`).

- [x] **Custom Flags for Cookies, Bookmarks & Title**: Use startup flags (`--bot-cookies`, `--bot-bookmarks`, `--bot-title`) for session restoration and UI enhancements.

- [x] **Fingerprint Noise & Spoof Control**: Unified real/noise toggles and noise injection for Canvas, WebGL, audio, text metrics, and headless GPU simulation.

- [x] **On-Demand Geo & Language Detection**: Automatically sets timezone, geolocation, and browser languages based on proxy IP.

- [x] **WebRTC Leak Protection**: Full IPv4/IPv6 SDP refactor and candidate spoofing to prevent local IP exposure.

- [x] **Chrome Behavior Emulation**: Fully emulate Chrome, including Google `X-Browser-*` headers, Widevine CDM, and other Chrome-specific features.

- [x] **Comprehensive Fingerprint Spoofing**:

  | Category     | Details                                                                               |
  |--------------|---------------------------------------------------------------------------------------|
  | **Browser**  | Version, userAgentData, userAgent                                                     |
  | **OS**       | Windows, macOS, Ubuntu, Android emulation; Fonts (UI/System); Colors                               |
  | **Navigator**| Languages, Plugins, Permissions, Battery, Keyboard                                    |
  | **Network**  | Proxy auth, WebRTC SDP spoofing, Google headers                                       |
  | **Graphics** | Canvas noise, WebGL/WebGL2, GPUAdapter, GPUDevice                                     |
  | **Hardware** | Screen resolution, devicePixelRatio, CPU architecture                                 |
  | **Media**    | MediaDevices, MimeTypes, AudioContext                                                 |
  | **Other**    | Emoji, Unicode, matchMedia control, client rects, bookmarks                           |




---

## 🚀 Getting Started

### Download & Installation

1. **Download Installer**
  Get the BotBrowser installer for your OS from the [Releases](https://github.com/botswin/BotBrowser/releases) page.

2. **Windows**
- Extract the downloaded `.7z` archive.
- Run `chrome.exe` from the extracted folder.
- If you encounter `STATUS_ACCESS_VIOLATION`, launch with [--no-sandbox](https://peter.sh/experiments/chromium-command-line-switches/#no-sandbox).

3. **macOS**
- Open the downloaded `.dmg` file.
- Drag `Chromium.app` into your Applications folder or any desired location.
- If you see the error:
   ```
   "Chromium" is damaged and can't be opened
   ```
   Run:
   ```bash
   xattr -rd com.apple.quarantine /Applications/Chromium.app
   ```

4. **Ubuntu**
- Install via `dpkg`:
   ```bash
   sudo dpkg -i botbrowser_<version>_amd64.deb
   ```
- If dependencies are missing, run:
   ```bash
   sudo apt-get install -f
   ```

### Profiles Configuration

> 📢 In BotBrowser, everything starts with a profile. Your stealth, reliability, and success depend on it.


- **Demo Profiles**: located in the [profiles](profiles) directory of the repository.
- **Cross-Platform**:

  > 🔥 A *macOS profile* works on Ubuntu; a *Windows profile* works on macOS; an *Android profile* can be fully emulated on macOS, Windows, and Ubuntu.
- **Configuration Options**: see the [📚 profile-configs guide](https://github.com/botswin/BotBrowser/blob/main/profiles/profile-configs.md).

---

### Quick Start Examples

#### 1. CLI (Windows / macOS / Ubuntu)

**Windows (CMD)**

```cmd
chrome.exe --no-sandbox --bot-profile="C:\\path\\to\\chrome137_win11_x64.enc" --user-data-dir="%TEMP%\\botprofile_%RANDOM%"
```

**macOS**

```bash
/Applications/Chromium.app/Contents/MacOS/Chromium \
  --no-sandbox \
  --user-data-dir="$(mktemp -d)" \
  --bot-profile="/path/to/chrome137_win11_x64.enc"
```

**Ubuntu**

```bash
chromium-browser \
  --no-sandbox \
  --user-data-dir="$(mktemp -d)" \
  --bot-profile="/path/to/chrome137_win11_x64.enc"
```

> Use `--user-data-dir` with a unique temporary folder to avoid conflicts with any running Chromium instances. It ensures BotBrowser launches cleanly without interfering with your normal browser profiles.
> Use `--proxy-server`, `--proxy-username`, `--proxy-password` to connect to a proxy server, we support http, https, socks5 protocol.

#### 2. [Playwright](examples/playwright) / [Puppeteer](examples/puppeteer) Examples

```javascript
const browser = await chromium.launch({
  headless: true,
  executablePath: BOTBROWSER_EXEC_PATH,   // Absolute path to the BotBrowser executable
  args: [
    `--bot-profile=${BOT_PROFILE_PATH}`,  // Absolute or relative path to the bot profile
    '--proxy-server="socks5://127.0.0.1:8989"',  // or: "socks5://usr:pwd@127.0.0.1:8989"
    '--proxy-username="usr"',
    '--proxy-password="pwd"',
  ],
});

const page = await browser.newPage();

// Remove Playwright's bindings to avoid detection.
await page.addInitScript(() => {
  delete window.__playwright__binding__;
  delete window.__pwInitScripts;
});
await page.goto("https://abrahamjuliot.github.io/creepjs/");
```

#### 3. [BotBrowserConsole](console) (GUI)

Streamline your automation with [BotBrowserConsole](console), a free and open-source GUI tool designed to:
- Select your profile and start browsing without code
- Easily launch multiple browser instances
- Seamlessly manage different environments
- Efficiently handle multiple accounts



#### 4. 🐳 Docker Deployment

For a complete Docker setup and usage guide, please see [docker/README.md](docker/).


---


### 🐞 Debugging & FAQs

| Issue | Solution |
|-------|----------|
| **"Chromium" is damaged** (macOS) | Run `xattr -rd com.apple.quarantine /Applications/Chromium.app` |
| **STATUS_ACCESS_VIOLATION** (Windows) | Add `--no-sandbox` flag when launching |
| **Profile file permission errors** | Ensure `.enc` file has read permissions (`chmod 644`) |
| **BotBrowser won't start or crashes** | Check that your OS and Chromium version match the build; update BotBrowser to the latest release |



---

## 🎯 Proven Effectiveness

Use our detailed test scripts to explore real-world use cases and implementation examples: **[Tests](tests)**.


⚠️ **DISCLAIMER**

These test scripts are provided for **educational purposes** and to **demonstrate** the capabilities of BotBrowser. They are intended solely for **legal use cases** that comply with all applicable laws and regulations.  **Any misuse**-such as violating website terms of service or engaging in unlawful activities-**is strictly prohibited.**



| Service & Scripts                                                  | Test Results                                                                                                                                                                                                                                                                       |
|--------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **[Cloudflare](tests/tests/antibots/cloudflare.spec.ts)**          | [▶️ BookDemo](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-cloudflare-bookdemo), [▶️ Turnstile](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-cloudflare-turnstile), [▶️ Challenge](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-cloudflare-challenge), [▶️ TaxSlayer](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-cloudflare-taxslayer), [▶️ Chegg](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-cloudflare-chegg) |
| **[Akamai](tests/tests/antibots/akamai.spec.ts)**                  | [▶️ PlayStation](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-akamai-playstation), [▶️ WizzAir](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-kasada-wizzair), [▶️ StubHub](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-akamai-stubhub), [▶️ AirCanada](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-akamai-aircanada)             |
| **[Kasada](tests/tests/antibots/kasada.spec.ts)**                  | [▶️ Kick](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-kasada-kick), [▶️ PlayStation](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-akamai-playstation), [▶️ Twitch](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-kasada-twitch), [▶️ WizzAir](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-kasada-wizzair) |
| **[F5 Shape](tests/tests/antibots/shape.spec.ts)**                 | [▶️ Southwest](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-shape-southwest), [▶️ Target](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-shape-target), [▶️ Temu](//botswin.github.io/BotBrowser/video_player/index.html?video=websites-temu-temu)                                                                                     |
| **[reCAPTCHA](tests/tests/antibots/recaptcha.spec.ts)**            | [▶️ reCAPTCHA v3](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-recaptcha-v3), [▶️ reCAPTCHA v2](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-recaptcha-v2)                                                                                 |
| **[PerimeterX](tests/tests/antibots/perimeterx.spec.ts)**          | [▶️ TextNow](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-perimeterx-textnow), [▶️ Grubhub](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-perimeterx-grubhub), [▶️ Zillow](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-perimeterx-zillow)                                                                                    |
| **[Imperva (Incapsula)](tests/tests/antibots/incapsula.spec.ts)**  | [▶️ CopaAir](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-incapsula-copaair), [▶️ TAROM](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-incapsula-tarom)                                                                       |
| **[DataDome](tests/tests/antibots/datadome.spec.ts)**              | [▶️ ShutterStock](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-datadome-shutterstock), [▶️ SeatGeek](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-datadome-seatgeek), [▶️ Hermes](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-datadome-hermes), [▶️ SoundCloud](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-datadome-soundcloud), [▶️ Paypal](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-datadome-paypal)                                                                           |
| **[hCaptcha](tests/tests/antibots/hcaptcha.spec.ts)**              | [▶️ EpicGames](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-hcaptcha-epicgames), [▶️ Discord](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-hcaptcha-discord), [▶️ Steam](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-hcaptcha-steam), [▶️ RiotGames](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-hcaptcha-riotgames), [▶️ TITAN22](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-hcaptcha-titan22)                                                                       |
| **[FunCaptcha](tests/tests/antibots/funcaptcha.spec.ts)**          | [▶️ Blizzard](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-funcaptcha-blizzard), [▶️ Roblox](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-funcaptcha-roblox), [▶️ Hotmail](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-funcaptcha-hotmail)                                                                       |
| **[Qrator](tests/tests/antibots/qrator.spec.ts)**                  | [▶️ MTS.ru](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-qrator-mts)                                                                        |
| **[TencentCaptcha](tests/tests/antibots/tencentcaptcha.spec.ts)**  | [▶️ One-Click CAPTCHA](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-tencentcaptcha-oneclick)                                                                       |
| **[Accertify](tests/tests/antibots/accertify.spec.ts)**            | [▶️ Grubhub](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-perimeterx-grubhub)                                                                       |
| **[Forter](tests/tests/antibots/forter.spec.ts)**                  | [▶️ Grubhub](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-perimeterx-grubhub)                                                                       |
| **[Adscore](tests/tests/antibots/adscore.spec.ts)**                | [▶️ Test Video](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-adscore-adscore)                                                                                          |
| **[MTCaptcha](tests/tests/antibots/mtcaptcha.spec.ts)**            | [▶️ Invisible Captcha](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-mtcaptcha-invisiblecaptcha)                                                                                          |
| **[FriendlyCaptcha](tests/tests/antibots/friendlycaptcha.spec.ts)**  | [▶️ Captcha Demo](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-friendlycaptcha-captchademo)                                                                                          |
| **[YandexCaptcha](tests/tests/antibots/yandexcaptcha.spec.ts)**  | [▶️ SmartCaptcha](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-yandexcaptcha-smartcaptcha)                                                                                          |
| **ThreatMetrix**                                                   | 🚧 Coming Soon                                                                                                                                                                                                                                                                            |
| **ProtectedMedia**                                                 | 🚧 Coming Soon                                                                                                                                                                                                                                                                            |
| **[Fake Vision](tests/tests/antibots/fvpro.spec.ts)**              | [▶️ FakeVision](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-fvpro-fvpro)                                                                                           |
| **[FingerprintJS](tests/tests/antibots/fingerprintjs.spec.ts)**    | [▶️ BotDetection](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-fingerprintjs-botdetection), [▶️ Fingerprint Pro](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-fingerprintjs-playground)                                                         |
| **[CreepJS](tests/tests/antibots/creepjs.spec.ts)**                | [▶️ Test Video](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs), [▶️ Android Profile](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-creepjs-creepjs-Android)                                                                                            |
| **[BrowserScan](tests/tests/antibots/browserscan.spec.ts)**        | [▶️ Test Video](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-browserscan-browserscan)                                                                                     |
| **[Pixelscan](tests/tests/antibots/pixelscan.spec.ts)**            | [▶️ Test Video](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-pixelscan-pixelscan), [▶️ Android Profile](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-pixelscan-pixelscan-Android)                                                                                         |
| **[iphey](tests/tests/antibots/iphey.spec.ts)**                    | [▶️ Test Video](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-iphey-iphey), [▶️ Android Profile](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-iphey-iphey-Android)                                                                                               |
| **[device&browserinfo](tests/tests/antibots/deviceandbrowserinfo.spec.ts)**     | [▶️ Test Video](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-deviceandbrowserinfo-deviceandbrowserinfo)                                                                                               |
| **[FingerprintScan](tests/tests/antibots/fingerprintscan.spec.ts)**            | [▶️ Test Video](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-fingerprintscan-fingerprintscan)                                                                                       |
| **[brotector](tests/tests/antibots/brotector.spec.ts)**            | [▶️ Test Video](//botswin.github.io/BotBrowser/video_player/index.html?video=antibots-brotector-brotector)                                                                                       |



| Service & Scripts | Antibot Services | Test Results |
|------------------|-------------------|--------------|
| **[Nike](tests/tests/websites/nike.spec.ts)** | F5 Shape Security | ✅ Success  [▶️ Checkout Video](//botswin.github.io/BotBrowser/video_player/index.html?video=websites-nike-checkout)  |
| **[Instagram](tests/tests/websites/instagram.spec.ts)** | Generic Antibot | ✅ Success  [▶️ Signup Video](//botswin.github.io/BotBrowser/video_player/index.html?video=websites-instagram-signup)  |
| **[TikTok](tests/tests/websites/tiktok.spec.ts)** | TiktokVM | ✅ Success [▶️ Signup Video](//botswin.github.io/BotBrowser/video_player/index.html?video=websites-tiktok-signup) |
| **[Walmart](tests/tests/websites/walmart.spec.ts)** | PerimeterX | ✅ Success [▶️ Test Video](//botswin.github.io/BotBrowser/video_player/index.html?video=websites-walmart-walmart) |
| **[Temu](tests/tests/websites/temu.spec.ts)** | F5 Shape Security | ✅ Success [▶️ Test Video](//botswin.github.io/BotBrowser/video_player/index.html?video=websites-temu-temu) |
| **LinkedIn** | Generic Antibot | ✅ Success |
| **[TicketMaster](tests/tests/websites/ticketmaster.spec.ts)** | PerimeterX, FingerprintJS, reCAPTCHA | ✅ Success  [▶️ Checkout Video](//botswin.github.io/BotBrowser/video_player/index.html?video=websites-ticketmaster-checkout) |
| **Shein** | F5 Shape Security, FingerprintJS, Forter | ✅ Success |
| **Facebook** | FunCaptcha, reCAPTCHA    | ✅ Success |
| **Bet365** | Generic Antibot | ✅ Success |

...and many more


---


## 📚 Additional Resources

### Profile Generation

We do not provide the private key required to generate new profiles. If you need additional profiles, please contact us directly. We maintain over **300,000 real user browser fingerprints** to support your needs.


| 📧 Email    | [botbrowser@bk.ru](mailto:botbrowser@bk.ru) |
|-------------|--------------------------------------------------|
| 📱 Telegram | [@botbrowser_support](https://t.me/botbrowser_support)   |


### Building from Source

If you wish to compile your own version of Chromium with our modifications, follow the instructions provided [here](build).


---

## ⚠️ DISCLAIMER

**BotBrowser** is intended for **legitimate use cases** that comply with all applicable **laws and regulations**. **Misuse** of this tool to violate the **terms of service** of websites or engage in illegal activities **is strictly prohibited**.
