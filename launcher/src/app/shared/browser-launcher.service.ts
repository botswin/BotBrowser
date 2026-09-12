/// <reference path="../../neutralino/neutralino.d.ts" />

import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as Neutralino from '@neutralinojs/lib';
import { AppName } from '../const';
import { extractMajorVersion, getKernelMajorFromKernelField, getRequiredKernelMajor, isWebKitProfile } from '../data/bot-profile';
import { BrowserProfileStatus, getBrowserProfileStatusText, type BrowserProfile } from '../data/browser-profile';
import { SimpleCDP } from '../simple-cdp';
import { createDirectoryIfNotExists, sleep } from '../utils';
import { ShellService } from './shell.service';
import { AlertDialogComponent } from './alert-dialog.component';
import { BrowserProfileService } from './browser-profile.service';
import { KernelService } from './kernel.service';

// Neutralino.os.spawnProcess wraps the command in `/bin/sh -c "..."` on POSIX and
// `cmd.exe /c "..."` on Windows. shQuotePosix uses single-quote wrap to suppress $, backtick, \
// expansion. shQuoteWin handles BOTH the inner CommandLineToArgvW pass (program's argv parser)
// AND the outer cmd.exe parse (escapes %VAR% expansion + cmd metacharacters).
const IS_WINDOWS = (() => {
    try {
        const ua = (typeof navigator !== 'undefined')
            ? (navigator.userAgent || (navigator as any).platform || '')
            : '';
        return /Win/i.test(ua);
    } catch { return false; }
})();

function shQuotePosix(s: string): string {
    return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

function shQuoteWin(s: string): string {
    // Step 1: CommandLineToArgvW — double backslash runs preceding a `"` or end of string.
    const argvEscaped = String(s).replace(/(\\*)("|$)/g, (_m, slashes: string, q: string) => {
        if (q === '"') return slashes + slashes + '\\"';
        return slashes + slashes;
    });
    // Step 2: Walk argvEscaped tracking cmd.exe's quote-parity. cmd toggles on EVERY raw `"`
    // (including the `\"` Step 1 emits — cmd is unaware of CommandLineToArgvW's backslash rule).
    // Emit `"^%"` only when currently INSIDE a cmd-quoted region; otherwise `^%` suffices.
    // Backslashes preceding the synthetic `"` must be doubled (CommandLineToArgvW will see them
    // immediately before a literal `"`).
    let out = '';
    let insideCmdQuotes = true;
    let pendingSlashes = 0;
    for (const ch of argvEscaped) {
        if (ch === '\\') { pendingSlashes++; continue; }
        if (ch === '"') {
            out += '\\'.repeat(pendingSlashes) + '"';
            insideCmdQuotes = !insideCmdQuotes;
        } else if (ch === '%') {
            if (insideCmdQuotes) out += '\\'.repeat(pendingSlashes * 2) + '"^%"';
            else out += '\\'.repeat(pendingSlashes) + '^%';
        } else {
            out += '\\'.repeat(pendingSlashes) + ch;
        }
        pendingSlashes = 0;
    }
    out += '\\'.repeat(pendingSlashes);
    // If walk ended OUT, the closing wrap `"` would toggle cmd INTO quoted mode, leaking
    // state into the next token. Append a `"` so the closing wrap brings cmd back to OUT.
    // The trailing `""` becomes zero literal chars in CommandLineToArgvW.
    if (!insideCmdQuotes) out += '"';
    return `"${out}"`;
}

function shQuote(s: string): string {
    return IS_WINDOWS ? shQuoteWin(s) : shQuotePosix(s);
}

export interface RunningInfo {
    browserProfileId: string;
    status: BrowserProfileStatus;
    spawnProcessInfo?: Neutralino.SpawnedProcess;
    resolver?: any;
    startTime?: number;
    kernelId?: string;
}

@Injectable({ providedIn: 'root' })
export class BrowserLauncherService {
    readonly #browserProfileService = inject(BrowserProfileService);
    readonly #kernelService = inject(KernelService);
    readonly #shell = inject(ShellService);
    readonly #runningStatuses = new Map<string, RunningInfo>();
    readonly #dialog = inject(MatDialog);

    constructor() {
        Neutralino.events.on('spawnedProcess', (evt) => {
            const runningInfo = Array.from(this.#runningStatuses.values()).find(
                (info) => info.spawnProcessInfo?.id === evt.detail.id
            );

            switch (evt.detail.action) {
                case 'stdOut':
                    console.log('stdOut', evt.detail.data);
                    break;
                case 'stdErr':
                    {
                        console.error('stdErr', evt.detail.data);
                        const rgx = /\bws:\/\/.*\/devtools\/browser\/.*\b/;
                        const match = evt.detail.data.match(rgx);
                        const wsURL = match?.[0];
                        if (wsURL) runningInfo?.resolver?.resolve(wsURL);
                    }
                    break;
                case 'exit':
                    {
                        const exitCode = Number(evt.detail.data);
                        console.log(`process terminated with exit code: ${exitCode} id: ${evt.detail.id}`);
                        if (!runningInfo) break; // System process (7z, curl, etc.) — not a browser

                        const uptime = runningInfo.startTime ? Date.now() - runningInfo.startTime : Infinity;
                        const exitedKernelId = runningInfo.kernelId;
                        runningInfo.status = BrowserProfileStatus.Idle;
                        runningInfo.spawnProcessInfo = undefined;

                        if (exitCode !== 0 && uptime < 5000) {
                            const message = exitedKernelId
                                ? `Browser failed to start (exit code ${exitCode}). This can happen right after a kernel update while files are being indexed. Please wait a few seconds and try again.`
                                : `Browser failed to start (exit code ${exitCode}). Check the custom Binary Path and any extra arguments in the profile's Advanced section, or switch back to "Auto (from kernel)".`;
                            this.#dialog.open(AlertDialogComponent, { data: { message } });
                        }

                        // Try to clean up old kernels now that this browser exited
                        if (exitedKernelId) {
                            this.#tryCleanupOldKernel(exitedKernelId);
                        }
                    }
                    break;
            }
        });
    }

    async getUserDataDirPath(): Promise<string> {
        const systemDataPath = await Neutralino.os.getPath('data');
        const result = await Neutralino.filesystem.getJoinedPath(systemDataPath, AppName, 'user-data-dirs');

        try {
            await Neutralino.filesystem.getStats(result);
        } catch {
            await Neutralino.filesystem.createDirectory(result);
        }

        return result;
    }

    getRunningStatus(browserProfile: string | BrowserProfile): BrowserProfileStatus {
        const id = typeof browserProfile === 'string' ? browserProfile : browserProfile.id;
        return this.#runningStatuses.get(id)?.status ?? BrowserProfileStatus.Idle;
    }

    getRunningStatusText(browserProfile: string | BrowserProfile): string {
        return getBrowserProfileStatusText(this.getRunningStatus(browserProfile));
    }

    async run(browserProfile: BrowserProfile, warmup = false): Promise<void> {
        const osInfo = await Neutralino.computer.getOSInfo();
        const osType = osInfo.name;

        if (this.getRunningStatus(browserProfile) !== BrowserProfileStatus.Idle) {
            throw new Error('The profile is already running');
        }

        let botProfileObject: any | undefined;
        try {
            botProfileObject = JSON.parse(browserProfile.botProfileInfo.content ?? '');
        } catch (error) {
            console.error('Error parsing bot profile content: ', error);
        }

        if (!botProfileObject) {
            this.#dialog.open(AlertDialogComponent, { data: { message: 'Bot profile content is empty, cannot run' } });
            return;
        }

        const sysTempPath = await Neutralino.os.getPath('temp');

        // Save bot profile
        const botProfileContent = JSON.stringify(botProfileObject);
        const botProfilesBasePath = await Neutralino.filesystem.getJoinedPath(sysTempPath, AppName, 'bot-profiles');
        await createDirectoryIfNotExists(botProfilesBasePath);
        const botProfilePath = await Neutralino.filesystem.getJoinedPath(
            botProfilesBasePath,
            `${browserProfile.id}.json`
        );
        await Neutralino.filesystem.writeFile(botProfilePath, botProfileContent);

        // Save browser profile
        browserProfile.lastUsedAt = Date.now();
        await this.#browserProfileService.saveBrowserProfile(browserProfile);

        const browserProfilePath = await this.#browserProfileService.getBrowserProfilePath(browserProfile);
        const userDataDirPath = await Neutralino.filesystem.getJoinedPath(browserProfilePath, 'user-data-dir');
        const diskCacheDirPath = await Neutralino.filesystem.getJoinedPath(
            sysTempPath,
            AppName,
            'disk-cache-dir',
            browserProfile.id
        );

        let execPath: string | undefined;
        let majorVersion: number | null = null;
        let kernel: Awaited<ReturnType<KernelService['getInstalledKernelByMajorVersion']>> = undefined;

        // Validate kernelMajorOverride unconditionally so hand-edited/imported JSON surfaces an
        // error even when binaryPath would short-circuit kernel resolution. 0 is a no-override sentinel.
        const rawOverride = browserProfile.kernelMajorOverride;
        if (rawOverride != null && rawOverride !== 0
            && (!Number.isInteger(rawOverride) || rawOverride < 1 || rawOverride > 999)) {
            this.#dialog.open(AlertDialogComponent, {
                data: { message: `Invalid kernel version override: ${rawOverride}. Use a positive integer (e.g. 149).` },
            });
            return;
        }
        const overrideVersion = (typeof rawOverride === 'number' && rawOverride > 0) ? rawOverride : null;

        // Custom executable path takes precedence — skip kernel resolution entirely.
        if (browserProfile.binaryPath) {
            const trimmed = browserProfile.binaryPath.trim();
            if (trimmed) {
                // Strip trailing separators so a Finder-pasted ".app/" still routes through #findMacOSExecutable.
                const stripped = trimmed.replace(/[\\/]+$/, '');
                const candidate = osType.includes('Darwin') && stripped.endsWith('.app')
                    ? await this.#findMacOSExecutable(stripped)
                    : stripped;
                try {
                    const stats = await Neutralino.filesystem.getStats(candidate);
                    if (!stats.isFile) {
                        this.#dialog.open(AlertDialogComponent, {
                            data: { message: `Custom executable path is not a file: ${trimmed}. Point Binary Path at the browser binary (or a .app bundle on macOS).` },
                        });
                        return;
                    }
                    execPath = candidate;
                } catch {
                    this.#dialog.open(AlertDialogComponent, {
                        data: { message: `Custom executable not found: ${trimmed}. Update Binary Path in the profile's Advanced section, or switch back to "Auto (from kernel)".` },
                    });
                    return;
                }
            }
        }

        if (!execPath) {
            await this.#kernelService.initialize();

            // Resolution order: override → Chrome UA major → WebKit Safari→Chromium map → WebKit fallback
            // (latest installed / available). The WebKit branch must run BEFORE the generic
            // extractMajorVersion(version) fallback, because WebKit profiles store the Safari major
            // (e.g. "26.0") in `version`, which would otherwise resolve to the wrong kernel.
            const userAgent = botProfileObject.userAgent || '';
            const version = botProfileObject.version || '';

            if (overrideVersion) {
                majorVersion = overrideVersion;
            } else {
                // The `kernel` field is authoritative; WebKit UAs only carry a Safari version.
                majorVersion = getKernelMajorFromKernelField(botProfileObject.kernel);
                if (majorVersion) {
                    console.log(`Bot profile kernel field -> major ${majorVersion} (${botProfileObject.kernel})`);
                } else {
                    majorVersion = extractMajorVersion(userAgent);
                }
                if (!majorVersion) {
                    const requiredMajor = getRequiredKernelMajor(userAgent);
                    if (requiredMajor != null) {
                        majorVersion = requiredMajor;
                        console.log(`WebKit/Safari profile mapped to required kernel major ${requiredMajor}`);
                    } else if (isWebKitProfile({ userAgent, version, unmaskedVendor: '', unmaskedRenderer: '' })) {
                        const latestKernel = await this.#kernelService.getLatestInstalledKernel();
                        if (latestKernel) {
                            kernel = latestKernel;
                            majorVersion = latestKernel.majorVersion;
                            console.log(`WebKit/Safari profile: falling back to latest installed kernel ${latestKernel.majorVersion} (${latestKernel.fullVersion})`);
                        } else {
                            const latestAvailable = await this.#kernelService.getLatestAvailableMajorVersion();
                            if (latestAvailable) {
                                majorVersion = latestAvailable;
                                console.log(`WebKit/Safari profile + no installed kernels: routing to auto-download of v${latestAvailable}`);
                            }
                        }
                    } else {
                        // Non-WebKit profile with no Chrome UA — fall back to the generic version field.
                        majorVersion = extractMajorVersion(version);
                    }
                }
            }

            if (!majorVersion) {
                this.#dialog.open(AlertDialogComponent, {
                    data: {
                        message:
                            'Could not auto-detect a kernel major version from this bot profile (userAgent has no Chrome/Chromium or Safari Version/<N> marker). Set a Kernel Version Override in the Advanced section to force a specific kernel.',
                    },
                });
                return;
            }

            if (!kernel) {
                kernel = await this.#kernelService.getInstalledKernelByMajorVersion(majorVersion);
            }

            console.log('Bot profile requires kernel major version:', majorVersion);

            if (kernel) {
                if (osType.includes('Darwin') && kernel.executablePath.endsWith('.app')) {
                    execPath = await this.#findMacOSExecutable(kernel.executablePath);
                } else {
                    execPath = kernel.executablePath;
                }
            }
        }

        if (!execPath) {
            // Auto-download the required kernel
            try {
                await this.#kernelService.downloadKernelByMajorVersion(majorVersion!);
                this.#dialog.open(AlertDialogComponent, {
                    data: {
                        message: `Kernel version ${majorVersion} is being downloaded. Please wait for the download to complete and try again.`,
                    },
                });
            } catch (error) {
                this.#dialog.open(AlertDialogComponent, {
                    data: {
                        message: `No kernel available for version ${majorVersion}. Error: ${error instanceof Error ? error.message : error}`,
                    },
                });
            }
            return;
        }

        console.log('Neutralino NL_PATH: ', NL_PATH);
        console.log('Chromium path: ', execPath);

        console.log('Starting browser with profile: ', browserProfile.id);
        console.log('Bot profile path: ', botProfilePath);
        console.log('User data dir path: ', userDataDirPath);
        console.log('Disk cache dir path: ', diskCacheDirPath);

        const args = this.#buildCliArgs(browserProfile, { botProfilePath, userDataDirPath, diskCacheDirPath });

        const runningInfo: RunningInfo = { browserProfileId: browserProfile.id, status: BrowserProfileStatus.Running, startTime: Date.now(), kernelId: kernel?.id };

        const warmupUrls = (browserProfile.warmupUrls ?? '').split('\n');
        if (!warmupUrls.length) warmup = false;

        if (warmup) {
            args.push('--remote-debugging-port=0');
            args.push('--remote-allow-origins="*"');

            runningInfo.resolver = {};
            runningInfo.resolver.promise = new Promise<string>((resolve) => {
                runningInfo.resolver.resolve = resolve;
            });
        }

        const proc = await Neutralino.os.spawnProcess(`${shQuote(execPath)} ${args.join(' ')}`);
        runningInfo.spawnProcessInfo = proc;

        this.#runningStatuses.set(browserProfile.id, runningInfo);

        if (warmup) {
            console.log('Waiting for WS URL, browserProfile.id: ', browserProfile.id);
            const wsURL = await runningInfo.resolver.promise;
            console.log('We got WS URL: ', wsURL);

            const simpleCDP = new SimpleCDP(wsURL);
            try {
                await simpleCDP.connect();
                const targets = await simpleCDP.getTargets();
                console.log('Targets: ', targets);
                const pageTarget = targets.find((t) => t.type === 'page');
                const sessionId = await simpleCDP.attachToTarget(pageTarget.targetId);
                console.log('Session ID: ', sessionId);

                for (const warmupUrl of warmupUrls) {
                    console.log('Navigating to: ', warmupUrl);
                    await simpleCDP.navigate(sessionId, warmupUrl);
                    await sleep(Math.floor(Math.random() * 8000) + 5000);
                }
            } finally {
                simpleCDP.close();
            }
        }
    }

    #buildCliArgs(
        profile: BrowserProfile,
        paths: { botProfilePath: string; userDataDirPath: string; diskCacheDirPath: string }
    ): string[] {
        const args = [
            '--allow-pre-commit-input',
            '--enable-automation',
            '--metrics-recording-only',
            '--no-first-run',
            '--password-store=basic',
            '--use-mock-keychain',
            '--restore-last-session',
            '--disable-blink-features=AutomationControlled',
            `--user-data-dir=${shQuote(paths.userDataDirPath)}`,
            `--disk-cache-dir=${shQuote(paths.diskCacheDirPath)}`,
            `--bot-profile=${shQuote(paths.botProfilePath)}`,
        ];

        args.push(...BrowserLauncherService.buildProfileFlags(profile));

        return args;
    }

    /**
     * Build only the bot-specific CLI flags for a profile (no chrome startup args or paths).
     * Useful for CLI preview / copy.
     */
    static buildProfileFlags(profile: BrowserProfile): string[] {
        const args: string[] = [];
        const opts = profile.launchOptions;

        // Window title mirrors profile name; emit here so CLI preview matches the spawn.
        if (profile.basicInfo?.profileName) args.push(`--bot-title=${shQuote(profile.basicInfo.profileName)}`);

        // Default-on behavior flags: only emit when user explicitly overrides to OFF (matches BB default → no flag).
        if (opts?.behavior?.botDisableDebugger === false) args.push('--bot-disable-debugger=false');
        if (opts?.behavior?.botMobileForceTouch) args.push('--bot-mobile-force-touch');
        if (opts?.behavior?.botMobileKeyboard) args.push('--bot-mobile-keyboard');
        if (opts?.behavior?.botAlwaysActive === false) args.push('--bot-always-active=false');
        if (opts?.behavior?.botDisableConsoleMessage === false) args.push('--bot-disable-console-message=false');

        // Backward compat: legacy `behavior.*` for fields that moved. Use `in` so explicit `false` is honored.
        const beh = opts?.behavior as any;
        if (beh && 'botLocalDns' in beh && opts?.proxy?.botLocalDns == null) {
            const v = beh.botLocalDns;
            if (typeof v === 'string' && v) args.push(`--bot-local-dns=${shQuote(v)}`);
            else if (v === true) args.push('--bot-local-dns');
            // v === false matches the kernel default (off) — emit nothing.
        }
        if (beh?.botPortProtection && !opts?.proxy?.botPortProtection) args.push('--bot-port-protection');
        if (beh?.botNetworkInfoOverride && !opts?.proxy?.botNetworkInfoOverride) args.push('--bot-network-info-override');
        if (beh && 'botGpuEmulation' in beh && opts?.renderingMedia?.botGpuEmulation == null) {
            const v = beh.botGpuEmulation;
            if (v === 'priority') args.push('--bot-gpu-emulation=priority');
            else if (v === 'off' || v === false) args.push('--bot-gpu-emulation=false');
            else if (v === 'on' || v === true) args.push('--bot-gpu-emulation');
        }
        if (beh?.botInjectRandomHistory && !opts?.identityLocale?.botInjectRandomHistory) {
            if (typeof beh.botInjectRandomHistory === 'number') {
                args.push(`--bot-inject-random-history=${beh.botInjectRandomHistory}`);
            } else {
                args.push('--bot-inject-random-history');
            }
        }

        // Identity & Locale
        if (opts?.identityLocale?.botConfigBrowserBrand)
            args.push(`--bot-browser-brand=${opts.identityLocale.botConfigBrowserBrand}`);
        if (opts?.identityLocale?.botConfigBrandFullVersion)
            args.push(`--bot-brand-full-version=${shQuote(opts.identityLocale.botConfigBrandFullVersion)}`);
        if (opts?.identityLocale?.botConfigUaFullVersion)
            args.push(`--bot-ua-full-version=${shQuote(opts.identityLocale.botConfigUaFullVersion)}`);
        // 'auto' equals BB's IP-derived default; suppress to avoid redundant emit.
        {
            const v = opts?.identityLocale?.botConfigLanguages?.trim();
            if (v && v.toLowerCase() !== 'auto') args.push(`--bot-languages=${shQuote(v)}`);
        }
        {
            const v = opts?.identityLocale?.botConfigLocale?.trim();
            if (v && v.toLowerCase() !== 'auto') args.push(`--bot-locale=${shQuote(v)}`);
        }
        {
            const v = opts?.identityLocale?.botConfigTimezone?.trim();
            if (v && v.toLowerCase() !== 'auto') args.push(`--bot-timezone=${shQuote(v)}`);
        }
        {
            const v = opts?.identityLocale?.botConfigLocation?.trim();
            if (v && v.toLowerCase() !== 'auto') args.push(`--bot-location=${shQuote(v)}`);
        }
        if (opts?.identityLocale?.botInjectRandomHistory != null) {
            const v = opts.identityLocale.botInjectRandomHistory;
            if (typeof v === 'number') args.push(`--bot-inject-random-history=${v}`);
            else if (v === true) args.push('--bot-inject-random-history');
        }
        if (opts?.identityLocale?.botEnableVariationsInContext)
            args.push('--bot-enable-variations-in-context');

        // Custom User-Agent
        if (opts?.customUserAgent?.userAgent)
            args.push(`--user-agent=${shQuote(opts.customUserAgent.userAgent)}`);
        if (opts?.customUserAgent?.botConfigPlatform)
            args.push(`--bot-platform=${opts.customUserAgent.botConfigPlatform}`);
        if (opts?.customUserAgent?.botConfigPlatformVersion)
            args.push(`--bot-platform-version=${shQuote(opts.customUserAgent.botConfigPlatformVersion)}`);
        if (opts?.customUserAgent?.botConfigModel)
            args.push(`--bot-model=${shQuote(opts.customUserAgent.botConfigModel)}`);
        if (opts?.customUserAgent?.botConfigArchitecture)
            args.push(`--bot-architecture=${opts.customUserAgent.botConfigArchitecture}`);
        if (opts?.customUserAgent?.botConfigBitness)
            args.push(`--bot-bitness=${opts.customUserAgent.botConfigBitness}`);
        // Tri-state: null/undefined → inherit profile's mobile flag (no emit).
        if (opts?.customUserAgent?.botConfigMobile === true) args.push('--bot-mobile=true');
        else if (opts?.customUserAgent?.botConfigMobile === false) args.push('--bot-mobile=false');

        // Display & Input — window/screen accept JSON, so always quote.
        if (opts?.displayInput?.botConfigWindow)
            args.push(`--bot-window=${shQuote(opts.displayInput.botConfigWindow)}`);
        if (opts?.displayInput?.botConfigScreen)
            args.push(`--bot-screen=${shQuote(opts.displayInput.botConfigScreen)}`);
        if (opts?.displayInput?.botDpr)
            args.push(`--bot-dpr=${opts.displayInput.botDpr}`);
        if (opts?.displayInput?.botConfigKeyboard)
            args.push(`--bot-keyboard=${opts.displayInput.botConfigKeyboard}`);
        if (opts?.displayInput?.botConfigFonts)
            args.push(`--bot-fonts=${opts.displayInput.botConfigFonts}`);
        if (opts?.displayInput?.botConfigOrientation)
            args.push(`--bot-orientation=${opts.displayInput.botConfigOrientation}`);
        if (opts?.displayInput?.botConfigColorScheme)
            args.push(`--bot-color-scheme=${opts.displayInput.botConfigColorScheme}`);
        if (opts?.displayInput?.botConfigDisableDeviceScaleFactor)
            args.push('--bot-disable-device-scale-factor');

        // Noise toggles: emit only when user diverges from BB default; matching default → no flag.
        const emitToggle = (flag: string, v: boolean | null | undefined, bbDefault: boolean) => {
            if (v == null || v === bbDefault) return;
            args.push(`${flag}=${v}`);
        };
        emitToggle('--bot-noise-webgl-image', opts?.noise?.botConfigNoiseWebglImage, true);
        emitToggle('--bot-noise-canvas', opts?.noise?.botConfigNoiseCanvas, true);
        emitToggle('--bot-noise-audio-context', opts?.noise?.botConfigNoiseAudioContext, true);
        emitToggle('--bot-noise-client-rects', opts?.noise?.botConfigNoiseClientRects, false);
        emitToggle('--bot-noise-text-rects', opts?.noise?.botConfigNoiseTextRects, false);
        if (opts?.noise?.botNoiseSeed != null) args.push(`--bot-noise-seed=${opts.noise.botNoiseSeed}`);
        if (opts?.noise?.botTimeScale != null) args.push(`--bot-time-scale=${opts.noise.botTimeScale}`);
        if (opts?.noise?.botFps) args.push(`--bot-fps=${opts.noise.botFps}`);
        if (opts?.noise?.botVideoFps) args.push(`--bot-video-fps=${opts.noise.botVideoFps}`);
        if (opts?.noise?.botTimeSeed != null && opts.noise.botTimeSeed !== 0)
            args.push(`--bot-time-seed=${opts.noise.botTimeSeed}`);
        if (opts?.noise?.botStackSeed) args.push(`--bot-stack-seed=${opts.noise.botStackSeed}`);

        // Rendering & Media
        if (opts?.renderingMedia?.botConfigWebgl)
            args.push(`--bot-webgl=${opts.renderingMedia.botConfigWebgl}`);
        if (opts?.renderingMedia?.botConfigWebgpu)
            args.push(`--bot-webgpu=${opts.renderingMedia.botConfigWebgpu}`);
        if (opts?.renderingMedia?.botConfigSpeechVoices)
            args.push(`--bot-speech-voices=${opts.renderingMedia.botConfigSpeechVoices}`);
        if (opts?.renderingMedia?.botConfigMediaDevices)
            args.push(`--bot-media-devices=${opts.renderingMedia.botConfigMediaDevices}`);
        if (opts?.renderingMedia?.botConfigMediaTypes)
            args.push(`--bot-media-types=${opts.renderingMedia.botConfigMediaTypes}`);
        if (opts?.renderingMedia?.botConfigWebrtc)
            args.push(`--bot-webrtc=${opts.renderingMedia.botConfigWebrtc}`);
        if (opts?.renderingMedia?.botWebrtcIce)
            args.push(`--bot-webrtc-ice=${shQuote(opts.renderingMedia.botWebrtcIce)}`);
        {
            const v = opts?.renderingMedia?.botGpuEmulation;
            if (v === 'priority') args.push('--bot-gpu-emulation=priority');
            else if (v === 'off' || v === false) args.push('--bot-gpu-emulation=false');
            else if (v === 'on' || v === true) args.push('--bot-gpu-emulation');
        }

        // Proxy
        if (profile.proxyServer) args.push(`--proxy-server=${shQuote(profile.proxyServer)}`);
        if (opts?.proxy?.proxyIp) args.push(`--proxy-ip=${shQuote(opts.proxy.proxyIp)}`);
        if (opts?.proxy?.botIpService) args.push(`--bot-ip-service=${shQuote(opts.proxy.botIpService)}`);
        if (opts?.proxy?.proxyBypassRgx) args.push(`--proxy-bypass-rgx=${shQuote(opts.proxy.proxyBypassRgx)}`);
        if (opts?.proxy?.proxyPacUrl) args.push(`--proxy-pac-url=${shQuote(opts.proxy.proxyPacUrl)}`);
        if (opts?.proxy?.disableQuic) args.push('--disable-quic');
        {
            const v = opts?.proxy?.botLocalDns;
            if (typeof v === 'string' && v) args.push(`--bot-local-dns=${shQuote(v)}`);
            else if (v === true) args.push('--bot-local-dns');
            // false/null/undefined → kernel default (off), emit nothing.
        }
        if (opts?.proxy?.botPortProtection) args.push('--bot-port-protection');
        if (opts?.proxy?.botNetworkInfoOverride) args.push('--bot-network-info-override');

        // Advanced (JSON / paths — always quote)
        if (opts?.advanced?.botCookies) args.push(`--bot-cookies=${shQuote(opts.advanced.botCookies)}`);
        if (opts?.advanced?.botBookmarks) args.push(`--bot-bookmarks=${shQuote(opts.advanced.botBookmarks)}`);
        if (opts?.advanced?.botCustomHeaders)
            args.push(`--bot-custom-headers=${shQuote(opts.advanced.botCustomHeaders)}`);
        if (opts?.advanced?.botScript) args.push(`--bot-script=${shQuote(opts.advanced.botScript)}`);

        // Forensics: --bot-v8-log and --bot-v8-log-dir must travel together per CLI_FLAGS doc.
        const v8Mode = opts?.forensics?.botV8Log;
        if (v8Mode) {
            args.push(`--bot-v8-log=${v8Mode}`);
            if (v8Mode !== 'none' && opts?.forensics?.botV8LogDir) {
                args.push(`--bot-v8-log-dir=${shQuote(opts.forensics.botV8LogDir)}`);
            }
        }
        if (opts?.forensics?.botCanvasRecordFile)
            args.push(`--bot-canvas-record-file=${shQuote(opts.forensics.botCanvasRecordFile)}`);
        if (opts?.forensics?.botAudioRecordFile)
            args.push(`--bot-audio-record-file=${shQuote(opts.forensics.botAudioRecordFile)}`);

        // Memory & Storage — emit 'profile'/'real' or a positive-integer byte count only.
        // Re-validated here (not just in the editor) so malformed hand-edited/imported JSON
        // can't leak an invalid value or inject extra CLI args at launch.
        const emitBytePolicy = (flag: string, v: unknown) => {
            if (v === 'profile' || v === 'real') {
                args.push(`${flag}=${v}`);
                return;
            }
            const n = typeof v === 'number' ? v : Number(v);
            if (v != null && v !== '' && Number.isInteger(n) && n > 0) args.push(`${flag}=${n}`);
        };
        emitBytePolicy('--bot-js-heap-size-limit', opts?.memoryStorage?.botJsHeapSizeLimit);
        emitBytePolicy('--bot-storage-quota', opts?.memoryStorage?.botStorageQuota);

        return args;
    }

    #tryCleanupOldKernel(kernelId: string): void {
        // Check if any other running browser is still using this kernel
        const stillInUse = Array.from(this.#runningStatuses.values()).some(
            (info) => info.kernelId === kernelId && info.status === BrowserProfileStatus.Running
        );
        if (stillInUse) return;

        // Ask kernel service to clean up old versions if this one is outdated
        this.#kernelService.cleanupOldKernelIfOutdated(kernelId).catch(console.error);
    }

    async stop(browserProfile: BrowserProfile): Promise<void> {
        if (this.getRunningStatus(browserProfile) !== BrowserProfileStatus.Running) {
            throw new Error('The profile is not running');
        }

        const runningInfo = this.#runningStatuses.get(browserProfile.id);
        if (!runningInfo || !runningInfo.spawnProcessInfo) {
            throw new Error('No running info found');
        }

        runningInfo.status = BrowserProfileStatus.Stopping;
        await Neutralino.os.updateSpawnedProcess(runningInfo.spawnProcessInfo.id, 'exit');
    }

    async #findMacOSExecutable(appPath: string): Promise<string> {
        // Try common executable names inside .app bundle
        const possibleNames = ['Chromium', 'chrome', 'Google Chrome', 'BotBrowser'];

        for (const name of possibleNames) {
            const execPath = await Neutralino.filesystem.getJoinedPath(appPath, 'Contents', 'MacOS', name);
            try {
                await Neutralino.filesystem.getStats(execPath);
                return execPath;
            } catch {
                continue;
            }
        }

        // If no known name found, try to find the first executable in Contents/MacOS
        try {
            const result = await this.#shell.run(`ls "${appPath}/Contents/MacOS" 2>/dev/null | head -1`);
            const mainExec = result.stdOut.trim();
            if (mainExec) {
                return await Neutralino.filesystem.getJoinedPath(appPath, 'Contents', 'MacOS', mainExec);
            }
        } catch {
            // Ignore
        }

        // Fallback to default Chromium path
        return await Neutralino.filesystem.getJoinedPath(appPath, 'Contents', 'MacOS', 'Chromium');
    }
}
