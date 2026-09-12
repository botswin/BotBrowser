import { AsyncPipe, CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    inject,
    NgZone,
    ViewChild,
    type AfterViewInit,
    type OnDestroy,
    type OnInit,
    ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as Neutralino from '@neutralinojs/lib';
import { compact } from 'lodash-es';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { tryParseBotProfile, type BotProfileBasicInfo } from './data/bot-profile';
import {
    Architectures,
    Bitnesses,
    BrowserBrands,
    BrowserProfileStatus,
    ColorSchemes,
    DprModes,
    FontOptions,
    GpuEmulationModes,
    MediaTypesOptions,
    OrientationOptions,
    Platforms,
    ProfileRealDisabledOptions,
    ProfileRealOptions,
    V8LogModes,
    type BasicInfo,
    type BehaviorToggles,
    type BotProfileInfo,
    type BrowserProfile,
    type CustomUserAgentConfig,
    type DisplayInputConfig,
    type ForensicsConfig,
    type GpuEmulationMode,
    type IdentityLocaleConfig,
    type LaunchOptions,
    type AdvancedConfig,
    type MemoryStorageConfig,
    type NoiseConfig,
    type ProxyConfig,
    type RenderingMediaConfig,
} from './data/browser-profile';
import type { Proxy } from './data/proxy';
import { AlertDialogComponent } from './shared/alert-dialog.component';
import { BrowserLauncherService } from './shared/browser-launcher.service';
import { BrowserProfileService } from './shared/browser-profile.service';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';
import { ProxyInputComponent } from './shared/proxy-input.component';
import { ProxyParserService, type ParsedProxy } from './shared/proxy-parser.service';
import { ProxyService } from './shared/proxy.service';

@Component({
    selector: 'app-edit-browser-profile',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatCheckboxModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatAutocompleteModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        AsyncPipe,
        ProxyInputComponent,
    ],
    templateUrl: './edit-browser-profile.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './edit-browser-profile.component.scss',
})
export class EditBrowserProfileComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly #browserProfileService = inject(BrowserProfileService);
    readonly #browserLauncherService = inject(BrowserLauncherService);
    readonly #proxyService = inject(ProxyService);
    readonly #proxyParser = inject(ProxyParserService);

    #injectedData = inject<BrowserProfile | undefined>(MAT_DIALOG_DATA);

    readonly #formBuilder = inject(FormBuilder);
    readonly #dialog = inject(MatDialog);
    readonly #dialogRef = inject(MatDialogRef<EditBrowserProfileComponent>);
    readonly #ngZone = inject(NgZone);
    readonly #snackBar = inject(MatSnackBar);

    // Section navigation
    @ViewChild('sectionContent') sectionContent!: ElementRef<HTMLElement>;

    // keywords let the nav filter match fields/sub-sections that aren't in the visible label.
    readonly navItems = [
        { id: 'section-basic', label: 'Basic Info', keywords: 'name group description bot profile file' },
        { id: 'section-proxy', label: 'Proxy & Network', keywords: 'proxy network dns pac quic socks port protection ip bypass local' },
        { id: 'section-identity', label: 'Identity', keywords: 'identity locale language timezone location browser brand user agent history platform' },
        { id: 'section-display', label: 'Display', keywords: 'display window screen resolution keyboard fonts orientation color scheme scale device' },
        { id: 'section-noise', label: 'Noise', keywords: 'noise canvas webgl audio client text rects fps video seed timescale stack' },
        { id: 'section-rendering', label: 'Rendering', keywords: 'rendering media webgl webgpu speech voices devices webrtc gpu ice' },
        { id: 'section-behavior', label: 'Behavior', keywords: 'behavior debugger touch active console message mobile' },
        { id: 'section-forensics', label: 'Forensics', keywords: 'forensics v8log canvaslab audiolab record capture' },
        { id: 'section-advanced', label: 'Advanced', keywords: 'advanced executable kernel version script cookies bookmarks headers memory storage heap quota' },
    ];
    navQuery = '';
    activeSection = 'section-basic';
    #observer: IntersectionObserver | null = null;

    filteredNavItems() {
        const q = this.navQuery.trim().toLowerCase();
        if (!q) return this.navItems;
        return this.navItems.filter((n) => `${n.label} ${n.keywords}`.toLowerCase().includes(q));
    }

    // Expose constants for template
    readonly browserBrands = BrowserBrands;
    readonly platforms = Platforms;
    readonly architectures = Architectures;
    readonly bitnesses = Bitnesses;
    readonly profileRealDisabledOptions = ProfileRealDisabledOptions;
    readonly profileRealOptions = ProfileRealOptions;
    readonly fontOptions = FontOptions;
    readonly mediaTypesOptions = MediaTypesOptions;
    readonly colorSchemes = ColorSchemes;
    readonly dprModes = DprModes;
    readonly orientationOptions = OrientationOptions;
    readonly gpuEmulationModes = GpuEmulationModes;
    readonly v8LogModes = V8LogModes;

    readonly basicInfoFormGroup = this.#formBuilder.group<BasicInfo>({
        profileName: this.#injectedData?.basicInfo.profileName || 'New Profile',
        groupName: this.#injectedData?.basicInfo.groupName || '',
        description: this.#injectedData?.basicInfo.description || '',
    });

    #groupNames$ = new BehaviorSubject<string[]>([]);
    readonly filteredGroupNames = combineLatest([
        this.basicInfoFormGroup.get('groupName')!.valueChanges.pipe(startWith('')),
        this.#groupNames$,
    ]).pipe(
        map(([filterValue, groupNames]) => {
            const filter = (filterValue || '').toLowerCase();
            if (!filter) {
                return groupNames;
            }
            return groupNames.filter((option) => option.toLowerCase().includes(filter));
        })
    );

    readonly botProfileInfoGroup = this.#formBuilder.group<BotProfileInfo>({
        filename: this.#injectedData?.botProfileInfo.filename || '',
        content: this.#injectedData?.botProfileInfo.content,
    });

    readonly advancedGroup = this.#formBuilder.group({
        binaryPath: this.#injectedData?.binaryPath || '',
        kernelMajorOverride: [
            // Treat 0 as "unset" so legacy/hand-edited profiles with override=0 don't trip Validators.min(1).
            this.#injectedData?.kernelMajorOverride && this.#injectedData.kernelMajorOverride > 0
                ? this.#injectedData.kernelMajorOverride
                : (null as number | null),
            [Validators.min(1), Validators.max(999), Validators.pattern(/^\d+$/)],
        ],
    });

    proxyValue: ParsedProxy | null = this.#injectedData?.proxyServer
        ? this.#proxyParser.parse(this.#injectedData.proxyServer)
        : null;
    selectedProxyId = '';

    // Behavior toggles. Default-on flags (per CLI_FLAGS) keep the launcher fallback so the visible
    // toggle matches BB's actual behavior — a mat-slide-toggle can't represent a "no override" state.
    readonly behaviorGroup = this.#formBuilder.group<BehaviorToggles>({
        botDisableDebugger: this.#injectedData?.launchOptions?.behavior?.botDisableDebugger ?? true,
        botMobileForceTouch: this.#injectedData?.launchOptions?.behavior?.botMobileForceTouch,
        botMobileKeyboard: this.#injectedData?.launchOptions?.behavior?.botMobileKeyboard,
        botAlwaysActive: this.#injectedData?.launchOptions?.behavior?.botAlwaysActive ?? true,
        botDisableConsoleMessage: this.#injectedData?.launchOptions?.behavior?.botDisableConsoleMessage ?? true,
    });

    // Identity & Locale. browserBrand has NO default — when unset, the kernel uses the
    // brand encoded in the bot profile (WebKit-family profiles must NOT receive
    // --bot-browser-brand=chrome or they get coerced into Chrome identity).
    // botInjectRandomHistory: migrate from old behavior location
    readonly identityLocaleGroup = this.#formBuilder.group<IdentityLocaleConfig>({
        botConfigBrowserBrand: this.#injectedData?.launchOptions?.identityLocale?.botConfigBrowserBrand,
        botConfigBrandFullVersion: this.#injectedData?.launchOptions?.identityLocale?.botConfigBrandFullVersion,
        botConfigUaFullVersion: this.#injectedData?.launchOptions?.identityLocale?.botConfigUaFullVersion,
        botConfigLanguages: this.#injectedData?.launchOptions?.identityLocale?.botConfigLanguages,
        botConfigLocale: this.#injectedData?.launchOptions?.identityLocale?.botConfigLocale,
        botConfigTimezone: this.#injectedData?.launchOptions?.identityLocale?.botConfigTimezone,
        botConfigLocation: this.#injectedData?.launchOptions?.identityLocale?.botConfigLocation,
        botInjectRandomHistory:
            this.#injectedData?.launchOptions?.identityLocale?.botInjectRandomHistory ??
            (this.#injectedData?.launchOptions?.behavior as any)?.botInjectRandomHistory,
        botEnableVariationsInContext: this.#injectedData?.launchOptions?.identityLocale?.botEnableVariationsInContext,
    });

    // History injection mode: off / random / specific count
    historyMode: '' | 'random' | 'number' = (() => {
        const v =
            this.#injectedData?.launchOptions?.identityLocale?.botInjectRandomHistory ??
            (this.#injectedData?.launchOptions?.behavior as any)?.botInjectRandomHistory;
        if (typeof v === 'number') return 'number' as const;
        if (v === true) return 'random' as const;
        return '' as const;
    })();
    historyCount: number | null = (() => {
        const v =
            this.#injectedData?.launchOptions?.identityLocale?.botInjectRandomHistory ??
            (this.#injectedData?.launchOptions?.behavior as any)?.botInjectRandomHistory;
        return typeof v === 'number' ? v : null;
    })();

    // Custom User-Agent
    readonly customUserAgentGroup = this.#formBuilder.group<CustomUserAgentConfig>({
        userAgent: this.#injectedData?.launchOptions?.customUserAgent?.userAgent,
        botConfigPlatform: this.#injectedData?.launchOptions?.customUserAgent?.botConfigPlatform,
        botConfigPlatformVersion: this.#injectedData?.launchOptions?.customUserAgent?.botConfigPlatformVersion,
        botConfigModel: this.#injectedData?.launchOptions?.customUserAgent?.botConfigModel,
        botConfigArchitecture: this.#injectedData?.launchOptions?.customUserAgent?.botConfigArchitecture,
        botConfigBitness: this.#injectedData?.launchOptions?.customUserAgent?.botConfigBitness,
        // Old slide-toggle saved `false` for "off" (= "no override"); the new tri-state
        // mat-select would otherwise re-emit it as an explicit `--bot-mobile=false`
        // and silently force desktop mode on Android profiles. Coerce legacy false → null
        // and map undefined → null so [value]="null" pre-selects "Default (from profile)".
        botConfigMobile: (() => {
            const v = this.#injectedData?.launchOptions?.customUserAgent?.botConfigMobile;
            return (v === false ? null : v ?? null) as any;
        })(),
    });

    // Display & Input. No launcher-side defaults — when unset the kernel uses its own per-profile default.
    readonly displayInputGroup = this.#formBuilder.group<DisplayInputConfig>({
        botConfigWindow: this.#injectedData?.launchOptions?.displayInput?.botConfigWindow,
        botConfigScreen: this.#injectedData?.launchOptions?.displayInput?.botConfigScreen,
        botDpr: this.#injectedData?.launchOptions?.displayInput?.botDpr,
        botConfigKeyboard: this.#injectedData?.launchOptions?.displayInput?.botConfigKeyboard,
        botConfigFonts: this.#injectedData?.launchOptions?.displayInput?.botConfigFonts,
        botConfigOrientation: this.#injectedData?.launchOptions?.displayInput?.botConfigOrientation,
        botConfigColorScheme: this.#injectedData?.launchOptions?.displayInput?.botConfigColorScheme,
        botConfigDisableDeviceScaleFactor:
            this.#injectedData?.launchOptions?.displayInput?.botConfigDisableDeviceScaleFactor,
    });

    // Window/Screen mode derived from saved value. '' = "no override, use kernel default".
    windowMode: '' | 'profile' | 'real' | 'wxh' | 'json' = this.#deriveSizeMode(
        this.#injectedData?.launchOptions?.displayInput?.botConfigWindow
    );
    screenMode: '' | 'profile' | 'real' | 'wxh' | 'json' = this.#deriveSizeMode(
        this.#injectedData?.launchOptions?.displayInput?.botConfigScreen
    );
    // Cache last user-typed value per mode so wxh ↔ json toggles don't cross-pollute.
    #savedWindowWxh: string = (() => {
        const v = this.#injectedData?.launchOptions?.displayInput?.botConfigWindow;
        return typeof v === 'string' && /^\d+x\d+$/.test(v) ? v : '';
    })();
    #savedWindowJson: string = (() => {
        const v = this.#injectedData?.launchOptions?.displayInput?.botConfigWindow;
        return typeof v === 'string' && /^\s*\{/.test(v) ? v : '';
    })();
    #savedScreenWxh: string = (() => {
        const v = this.#injectedData?.launchOptions?.displayInput?.botConfigScreen;
        return typeof v === 'string' && /^\d+x\d+$/.test(v) ? v : '';
    })();
    #savedScreenJson: string = (() => {
        const v = this.#injectedData?.launchOptions?.displayInput?.botConfigScreen;
        return typeof v === 'string' && /^\s*\{/.test(v) ? v : '';
    })();

    // null/undefined/'' → undefined; otherwise coerce to integer in [1, 999] or undefined.
    #parseKernelMajorOverride(): number | undefined {
        const raw = this.advancedGroup.value.kernelMajorOverride as number | string | null | undefined;
        if (raw == null) return undefined;
        if (typeof raw === 'string' && raw.trim() === '') return undefined;
        const n = Number(raw);
        return Number.isInteger(n) && n >= 1 && n <= 999 ? n : undefined;
    }

    #deriveSizeMode(v: string | undefined): '' | 'profile' | 'real' | 'wxh' | 'json' {
        if (!v) return '';
        if (v === 'real') return 'real';
        if (v === 'profile') return 'profile';
        if (/^\s*\{/.test(v)) return 'json';
        if (/^\d+x\d+$/.test(v)) return 'wxh';
        return 'json';
    }

    // Noise. Default-on flags keep the launcher fallback so the visible toggle matches BB's actual
    // behavior — a mat-slide-toggle can't represent a "no override" state.
    readonly noiseGroup = this.#formBuilder.group<NoiseConfig>({
        botConfigNoiseWebglImage: this.#injectedData?.launchOptions?.noise?.botConfigNoiseWebglImage ?? true,
        botConfigNoiseCanvas: this.#injectedData?.launchOptions?.noise?.botConfigNoiseCanvas ?? true,
        botConfigNoiseAudioContext: this.#injectedData?.launchOptions?.noise?.botConfigNoiseAudioContext ?? true,
        botConfigNoiseClientRects: this.#injectedData?.launchOptions?.noise?.botConfigNoiseClientRects,
        botConfigNoiseTextRects: this.#injectedData?.launchOptions?.noise?.botConfigNoiseTextRects,
        botNoiseSeed: this.#injectedData?.launchOptions?.noise?.botNoiseSeed,
        botTimeScale: this.#injectedData?.launchOptions?.noise?.botTimeScale,
        botFps: this.#injectedData?.launchOptions?.noise?.botFps,
        botVideoFps: this.#injectedData?.launchOptions?.noise?.botVideoFps,
        botTimeSeed: this.#injectedData?.launchOptions?.noise?.botTimeSeed,
        botStackSeed: this.#injectedData?.launchOptions?.noise?.botStackSeed,
    });

    // FPS mode derived from botFps value
    fpsMode: '' | 'profile' | 'real' | 'number' = (() => {
        const fps = this.#injectedData?.launchOptions?.noise?.botFps;
        if (fps === 'profile' || fps === 'real') return fps;
        if (fps) return 'number' as const;
        return '' as const;
    })();

    // Stack Seed mode derived from botStackSeed value
    stackSeedMode: '' | 'profile' | 'real' | 'number' = (() => {
        const seed = this.#injectedData?.launchOptions?.noise?.botStackSeed;
        if (seed === 'profile' || seed === 'real') return seed;
        if (seed) return 'number' as const;
        return '' as const;
    })();

    // Rendering & Media. No launcher-side defaults — when unset the kernel applies its own.
    // botGpuEmulation: migrate from old behavior location.
    readonly renderingMediaGroup = this.#formBuilder.group<RenderingMediaConfig>({
        botConfigWebgl: this.#injectedData?.launchOptions?.renderingMedia?.botConfigWebgl,
        botConfigWebgpu: this.#injectedData?.launchOptions?.renderingMedia?.botConfigWebgpu,
        botConfigSpeechVoices: this.#injectedData?.launchOptions?.renderingMedia?.botConfigSpeechVoices,
        botConfigMediaDevices: this.#injectedData?.launchOptions?.renderingMedia?.botConfigMediaDevices,
        botConfigMediaTypes: this.#injectedData?.launchOptions?.renderingMedia?.botConfigMediaTypes,
        botConfigWebrtc: this.#injectedData?.launchOptions?.renderingMedia?.botConfigWebrtc,
        botWebrtcIce: this.#injectedData?.launchOptions?.renderingMedia?.botWebrtcIce,
        botGpuEmulation:
            this.#injectedData?.launchOptions?.renderingMedia?.botGpuEmulation ??
            (this.#injectedData?.launchOptions?.behavior as any)?.botGpuEmulation,
    });

    // GPU emulation mode (legacy boolean migrated to off/on/priority).
    gpuEmulationMode: '' | GpuEmulationMode = (() => {
        const v =
            this.#injectedData?.launchOptions?.renderingMedia?.botGpuEmulation ??
            (this.#injectedData?.launchOptions?.behavior as any)?.botGpuEmulation;
        if (v === 'priority') return 'priority';
        if (v === 'off' || v === false) return 'off';
        if (v === 'on' || v === true) return 'on';
        return '';
    })();

    // Proxy & Network config
    // Network flags: migrate from old behavior location
    readonly proxyConfigGroup = this.#formBuilder.group<ProxyConfig>({
        proxyServer: this.#injectedData?.launchOptions?.proxy?.proxyServer,
        proxyIp: this.#injectedData?.launchOptions?.proxy?.proxyIp,
        botIpService: this.#injectedData?.launchOptions?.proxy?.botIpService,
        proxyBypassRgx: this.#injectedData?.launchOptions?.proxy?.proxyBypassRgx,
        proxyPacUrl: this.#injectedData?.launchOptions?.proxy?.proxyPacUrl,
        disableQuic: this.#injectedData?.launchOptions?.proxy?.disableQuic,
        // Legacy 'off' option saved `false`, matching the kernel default. Normalize so the
        // form value agrees with the dropdown's "Default (off)" state and #cleanObject
        // strips the field instead of persisting redundant `botLocalDns: false`.
        botLocalDns: (() => {
            const v =
                this.#injectedData?.launchOptions?.proxy?.botLocalDns ??
                (this.#injectedData?.launchOptions?.behavior as any)?.botLocalDns;
            return v === false ? null : v;
        })(),
        botPortProtection:
            this.#injectedData?.launchOptions?.proxy?.botPortProtection ??
            (this.#injectedData?.launchOptions?.behavior as any)?.botPortProtection,
        botNetworkInfoOverride:
            this.#injectedData?.launchOptions?.proxy?.botNetworkInfoOverride ??
            (this.#injectedData?.launchOptions?.behavior as any)?.botNetworkInfoOverride,
    });

    // Local DNS mode: '' (kernel default = off) / local (resolve on this machine) / custom server.
    // Explicit-off is omitted: `--bot-local-dns=false` would match the kernel default, so we map it to ''.
    localDnsMode: '' | 'local' | 'custom' = (() => {
        const v =
            this.#injectedData?.launchOptions?.proxy?.botLocalDns ??
            (this.#injectedData?.launchOptions?.behavior as any)?.botLocalDns;
        if (typeof v === 'string' && v) return 'custom';
        if (v === true) return 'local';
        return '';
    })();
    localDnsServer: string = (() => {
        const v =
            this.#injectedData?.launchOptions?.proxy?.botLocalDns ??
            (this.#injectedData?.launchOptions?.behavior as any)?.botLocalDns;
        return typeof v === 'string' ? v : '';
    })();

    // Advanced config
    readonly advancedConfigGroup = this.#formBuilder.group<AdvancedConfig>({
        botCookies: this.#injectedData?.launchOptions?.advanced?.botCookies,
        botBookmarks: this.#injectedData?.launchOptions?.advanced?.botBookmarks,
        botCustomHeaders: this.#injectedData?.launchOptions?.advanced?.botCustomHeaders,
        botScript: this.#injectedData?.launchOptions?.advanced?.botScript,
    });

    // Forensics: V8Log + CanvasLab/AudioLab record file outputs. botV8Log uses null sentinel for "Off"
    // (matches the mat-option [value]="null") so round-trip after save preserves the selection.
    readonly forensicsGroup = this.#formBuilder.group({
        // Legacy 'none' (functionally identical to Off) is no longer a visible mode — coerce
        // to the null sentinel so the mat-select renders "Off" instead of blank.
        botV8Log: ((): any => {
            const v = this.#injectedData?.launchOptions?.forensics?.botV8Log;
            return v === 'none' ? null : v ?? null;
        })(),
        botV8LogDir: this.#injectedData?.launchOptions?.forensics?.botV8LogDir,
        botCanvasRecordFile: this.#injectedData?.launchOptions?.forensics?.botCanvasRecordFile,
        botAudioRecordFile: this.#injectedData?.launchOptions?.forensics?.botAudioRecordFile,
    });

    // Memory & Storage runtime policy. Values: '' (no override) / 'profile' / 'real' / byte value.
    readonly memoryStorageGroup = this.#formBuilder.group<MemoryStorageConfig>({
        botJsHeapSizeLimit: this.#injectedData?.launchOptions?.memoryStorage?.botJsHeapSizeLimit,
        botStorageQuota: this.#injectedData?.launchOptions?.memoryStorage?.botStorageQuota,
    });

    // Mode derived from stored value: 'profile' / 'real' / 'bytes' (explicit) / '' (default, no override).
    #deriveMemoryMode(v: string | number | undefined): '' | 'profile' | 'real' | 'bytes' {
        if (v === 'profile' || v === 'real') return v;
        if (v) return 'bytes';
        return '';
    }

    // Byte inputs are type=number (value may arrive as number or numeric string). Reject ''/0/negatives/decimals.
    #isPositiveIntBytes(v: unknown): boolean {
        const n = typeof v === 'number' ? v : Number(v);
        return Number.isInteger(n) && n > 0;
    }
    jsHeapMode: '' | 'profile' | 'real' | 'bytes' = this.#deriveMemoryMode(
        this.#injectedData?.launchOptions?.memoryStorage?.botJsHeapSizeLimit
    );
    storageQuotaMode: '' | 'profile' | 'real' | 'bytes' = this.#deriveMemoryMode(
        this.#injectedData?.launchOptions?.memoryStorage?.botStorageQuota
    );

    // Advanced section modes
    executableMode: 'kernel' | 'custom' = this.#injectedData?.binaryPath ? 'custom' : 'kernel';

    cookiesMode: 'file' | 'input' = (() => {
        const v = this.#injectedData?.launchOptions?.advanced?.botCookies;
        if (!v) return 'file' as const;
        return v.startsWith('@') ? ('file' as const) : ('input' as const);
    })();

    bookmarksMode: 'file' | 'input' = (() => {
        const v = this.#injectedData?.launchOptions?.advanced?.botBookmarks;
        if (!v) return 'file' as const;
        return v.startsWith('@') ? ('file' as const) : ('input' as const);
    })();

    cookiesFilePath = (() => {
        const v = this.#injectedData?.launchOptions?.advanced?.botCookies;
        return v?.startsWith('@') ? v.substring(1) : '';
    })();

    bookmarksFilePath = (() => {
        const v = this.#injectedData?.launchOptions?.advanced?.botBookmarks;
        return v?.startsWith('@') ? v.substring(1) : '';
    })();

    isEdit = false;
    isRunning = false;
    basicInfo: BotProfileBasicInfo | null = null;
    proxies: Proxy[] = [];

    constructor() {
        if (this.#injectedData) {
            this.isEdit = true;

            // Allow editing while running; changes apply on next launch (banner + save-time notice).
            const status = this.#browserLauncherService.getRunningStatus(this.#injectedData);
            this.isRunning = status !== BrowserProfileStatus.Idle && status !== BrowserProfileStatus.LaunchFailed;

            if (this.#injectedData.botProfileInfo.content) {
                this.basicInfo = tryParseBotProfile(this.#injectedData.botProfileInfo.content);
            }
        }

        // Per CLI_FLAGS: desktop headful defaults to 'real', Android/headless to 'profile'.
        // Round 3 reconciliation was wrong — silently rewrote legacy profiles to include the
        // flag on save. We instead leave the form value undefined; the kernel's own default
        // matches the dropdown's derived mode, so "no flag" is semantically equivalent.

        this.#browserProfileService.getAllBrowserProfiles().then((profiles) => {
            this.#groupNames$.next(compact(profiles.map((profile) => profile.basicInfo.groupName)));
        });
    }

    async ngOnInit() {
        // Load proxies
        this.proxies = await this.#proxyService.getAllProxies();

        // Unsaved changes guard
        this.#dialogRef.disableClose = true;
        this.#dialogRef.backdropClick().subscribe(() => this.#confirmClose());
        this.#dialogRef.keydownEvents().subscribe((event) => {
            if (event.key === 'Escape') this.#confirmClose();
        });
    }

    ngAfterViewInit() {
        this.#setupScrollspy();
    }

    ngOnDestroy() {
        this.#observer?.disconnect();
    }

    scrollToSection(sectionId: string): void {
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.activeSection = sectionId;
        }
    }

    clearNavQuery(): void {
        this.navQuery = '';
        this.onNavQueryChange();
    }

    // Highlight matching titles/labels/toggles in the content and scroll to the first hit.
    onNavQueryChange(): void {
        const root = this.sectionContent?.nativeElement;
        if (!root) return;
        const q = this.navQuery.trim().toLowerCase();
        const targets = root.querySelectorAll('.section-header, .section-title, mat-label, mat-slide-toggle');
        const hits: HTMLElement[] = [];
        targets.forEach((el) => {
            const hit = !!q && (el.textContent || '').toLowerCase().includes(q);
            // A mat-label is visually rendered elsewhere by Material, so highlight its enclosing field.
            const target = (el.tagName === 'MAT-LABEL' ? el.closest('mat-form-field') ?? el : el) as HTMLElement;
            target.classList.toggle('search-hit', hit);
            if (hit) hits.push(target);
        });
        hits[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    #setupScrollspy(): void {
        const container = this.sectionContent?.nativeElement;
        if (!container) return;

        this.#observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        this.#ngZone.run(() => {
                            this.activeSection = entry.target.id;
                        });
                        break;
                    }
                }
            },
            {
                root: container,
                rootMargin: '-10% 0px -80% 0px',
                threshold: 0,
            }
        );

        for (const nav of this.navItems) {
            const el = document.getElementById(nav.id);
            if (el) this.#observer.observe(el);
        }
    }

    onFpsModeChange(): void {
        if (this.fpsMode === 'profile' || this.fpsMode === 'real') {
            this.noiseGroup.patchValue({ botFps: this.fpsMode });
        } else {
            this.noiseGroup.patchValue({ botFps: '' });
        }
        this.noiseGroup.markAsDirty();
    }

    onStackSeedModeChange(): void {
        if (this.stackSeedMode === 'profile' || this.stackSeedMode === 'real') {
            this.noiseGroup.patchValue({ botStackSeed: this.stackSeedMode });
        } else {
            this.noiseGroup.patchValue({ botStackSeed: '' });
        }
        this.noiseGroup.markAsDirty();
    }

    onJsHeapModeChange(): void {
        const v = this.jsHeapMode === 'profile' || this.jsHeapMode === 'real' ? this.jsHeapMode : '';
        this.memoryStorageGroup.patchValue({ botJsHeapSizeLimit: v });
        this.memoryStorageGroup.markAsDirty();
    }

    onStorageQuotaModeChange(): void {
        const v = this.storageQuotaMode === 'profile' || this.storageQuotaMode === 'real' ? this.storageQuotaMode : '';
        this.memoryStorageGroup.patchValue({ botStorageQuota: v });
        this.memoryStorageGroup.markAsDirty();
    }

    onHistoryModeChange(): void {
        if (this.historyMode === 'random') {
            this.identityLocaleGroup.patchValue({ botInjectRandomHistory: true });
            this.historyCount = null;
        } else if (this.historyMode === 'number') {
            this.historyCount = this.historyCount ?? 15;
            this.identityLocaleGroup.patchValue({ botInjectRandomHistory: this.historyCount });
        } else {
            this.identityLocaleGroup.patchValue({ botInjectRandomHistory: undefined });
            this.historyCount = null;
        }
        this.identityLocaleGroup.markAsDirty();
    }

    onHistoryCountChange(): void {
        if (this.historyMode === 'number' && this.historyCount != null) {
            this.identityLocaleGroup.patchValue({ botInjectRandomHistory: Number(this.historyCount) });
            this.identityLocaleGroup.markAsDirty();
        }
    }

    onProxySelected(proxyId: string): void {
        if (!proxyId) {
            return;
        }
        const proxy = this.proxies.find((p) => p.id === proxyId);
        if (proxy) {
            this.proxyValue = {
                type: proxy.type,
                host: proxy.host,
                port: proxy.port,
                username: proxy.username,
                password: proxy.password,
            };
            this.proxyConfigGroup.markAsDirty();
        }
    }

    onProxyValueChange(value: ParsedProxy | null): void {
        this.proxyValue = value;
        this.selectedProxyId = '';
        this.proxyConfigGroup.markAsDirty();
    }

    onClearProxy(): void {
        this.proxyValue = null;
        this.selectedProxyId = '';
        this.proxyConfigGroup.patchValue({ proxyIp: '', botIpService: '' });
        this.proxyConfigGroup.markAsDirty();
    }

    async onSaveProxyToList(proxy: ParsedProxy): Promise<void> {
        const duplicate = this.proxies.find(
            (p) =>
                p.host === proxy.host &&
                p.port === proxy.port &&
                (p.username || '') === (proxy.username || '') &&
                (p.password || '') === (proxy.password || '')
        );
        if (duplicate) {
            this.#dialog.open(AlertDialogComponent, {
                data: { message: `Proxy ${proxy.host}:${proxy.port} already exists in the proxy list.` },
            });
            return;
        }

        await this.#proxyService.addProxy({
            id: uuidv4(),
            name: `${proxy.host}:${proxy.port}`,
            type: proxy.type,
            host: proxy.host,
            port: proxy.port,
            username: proxy.username,
            password: proxy.password,
        });
        this.proxies = await this.#proxyService.getAllProxies();
        this.#dialog.open(AlertDialogComponent, {
            data: { message: `Proxy ${proxy.host}:${proxy.port} saved to proxy list.` },
        });
    }

    async chooseFile(): Promise<void> {
        let entries: string[];
        try {
            entries = await Neutralino.os.showOpenDialog('Select a profile', {
                filters: [{ name: 'Profiles', extensions: ['json', 'enc'] }],
                multiSelections: false,
            });
        } catch (error) {
            console.error('Failed to open file dialog:', error);
            this.#dialog.open(AlertDialogComponent, {
                data: { message: `Failed to open file dialog: ${error instanceof Error ? error.message : error}` },
            });
            return;
        }
        const entry = entries[0];
        if (!entry) return;

        if (!this.isEdit || !this.#injectedData?.botProfileInfo.content) {
            this.#handleFileSelection(entry);
            return;
        }

        // Re-selecting an existing botprofile may result in an unknown detection error
        this.#dialog
            .open(ConfirmDialogComponent, {
                data: {
                    defaultCancel: true,
                    message:
                        'Re-selecting an existing bot profile may result in an unknown detection error. Are you sure you want to proceed?',
                },
            })
            .afterClosed()
            .subscribe((result: boolean) => {
                if (!result) return;
                this.#handleFileSelection(entry);
            });
    }

    onExecutableModeChange(mode: 'kernel' | 'custom'): void {
        this.executableMode = mode;
        if (mode === 'kernel') {
            this.advancedGroup.patchValue({ binaryPath: '' });
        }
        this.advancedGroup.markAsDirty();
    }

    onWindowModeChange(): void {
        const current = (this.displayInputGroup.get('botConfigWindow')?.value ?? '') as string;
        // Cache the current value into its matching slot so toggling wxh→json→wxh round-trips.
        if (/^\d+x\d+$/.test(current)) this.#savedWindowWxh = current;
        else if (/^\s*\{/.test(current)) this.#savedWindowJson = current;
        if (this.windowMode === '') {
            this.displayInputGroup.patchValue({ botConfigWindow: null });
        } else if (this.windowMode === 'profile' || this.windowMode === 'real') {
            this.displayInputGroup.patchValue({ botConfigWindow: this.windowMode });
        } else if (this.windowMode === 'wxh') {
            this.displayInputGroup.patchValue({ botConfigWindow: this.#savedWindowWxh });
        } else {
            this.displayInputGroup.patchValue({ botConfigWindow: this.#savedWindowJson });
        }
        this.displayInputGroup.markAsDirty();
    }

    onScreenModeChange(): void {
        const current = (this.displayInputGroup.get('botConfigScreen')?.value ?? '') as string;
        if (/^\d+x\d+$/.test(current)) this.#savedScreenWxh = current;
        else if (/^\s*\{/.test(current)) this.#savedScreenJson = current;
        if (this.screenMode === '') {
            this.displayInputGroup.patchValue({ botConfigScreen: null });
        } else if (this.screenMode === 'profile' || this.screenMode === 'real') {
            this.displayInputGroup.patchValue({ botConfigScreen: this.screenMode });
        } else if (this.screenMode === 'wxh') {
            this.displayInputGroup.patchValue({ botConfigScreen: this.#savedScreenWxh });
        } else {
            this.displayInputGroup.patchValue({ botConfigScreen: this.#savedScreenJson });
        }
        this.displayInputGroup.markAsDirty();
    }

    onGpuEmulationModeChange(): void {
        this.renderingMediaGroup.patchValue({
            botGpuEmulation: this.gpuEmulationMode === '' ? undefined : (this.gpuEmulationMode as GpuEmulationMode),
        });
        this.renderingMediaGroup.markAsDirty();
    }

    onLocalDnsModeChange(): void {
        if (this.localDnsMode === '') {
            this.proxyConfigGroup.patchValue({ botLocalDns: null });
            this.localDnsServer = '';
        } else if (this.localDnsMode === 'local') {
            this.proxyConfigGroup.patchValue({ botLocalDns: true });
            this.localDnsServer = '';
        } else if (this.localDnsServer) {
            this.proxyConfigGroup.patchValue({ botLocalDns: this.localDnsServer });
        }
        // 'custom' with empty server: leave the form value alone; onConfirmClick gates on a non-empty server.
        this.proxyConfigGroup.markAsDirty();
    }

    onLocalDnsServerChange(): void {
        if (this.localDnsMode === 'custom') {
            this.proxyConfigGroup.patchValue({ botLocalDns: this.localDnsServer });
            this.proxyConfigGroup.markAsDirty();
        }
    }

    async chooseBotScript(): Promise<void> {
        let entries: string[];
        try {
            entries = await Neutralino.os.showOpenDialog('Select bot script', {
                filters: [
                    { name: 'JavaScript', extensions: ['js', 'mjs'] },
                    { name: 'All Files', extensions: ['*'] },
                ],
                multiSelections: false,
            });
        } catch {
            return;
        }
        const entry = entries[0];
        if (!entry) return;
        this.#ngZone.run(() => {
            this.advancedConfigGroup.patchValue({ botScript: entry });
            this.advancedConfigGroup.markAsDirty();
        });
    }

    async chooseV8LogDir(): Promise<void> {
        let path: string;
        try {
            path = await Neutralino.os.showFolderDialog('Select V8Log output directory');
        } catch {
            return;
        }
        if (!path) return;
        this.#ngZone.run(() => {
            this.forensicsGroup.patchValue({ botV8LogDir: path });
            this.forensicsGroup.markAsDirty();
        });
    }

    async chooseCanvasRecordFile(): Promise<void> {
        let path: string;
        try {
            path = await Neutralino.os.showSaveDialog('Select CanvasLab record output', {
                filters: [{ name: 'JSONL', extensions: ['jsonl', 'json'] }],
                defaultPath: 'canvaslab.jsonl',
            });
        } catch {
            return;
        }
        if (!path) return;
        this.#ngZone.run(() => {
            this.forensicsGroup.patchValue({ botCanvasRecordFile: path });
            this.forensicsGroup.markAsDirty();
        });
    }

    async chooseAudioRecordFile(): Promise<void> {
        let path: string;
        try {
            path = await Neutralino.os.showSaveDialog('Select AudioLab record output', {
                filters: [{ name: 'JSONL', extensions: ['jsonl', 'json'] }],
                defaultPath: 'audiolab.jsonl',
            });
        } catch {
            return;
        }
        if (!path) return;
        this.#ngZone.run(() => {
            this.forensicsGroup.patchValue({ botAudioRecordFile: path });
            this.forensicsGroup.markAsDirty();
        });
    }

    onCookiesModeChange(mode: 'file' | 'input'): void {
        this.cookiesMode = mode;
        this.cookiesFilePath = '';
        this.advancedConfigGroup.patchValue({ botCookies: '' });
        this.advancedConfigGroup.markAsDirty();
    }

    onBookmarksModeChange(mode: 'file' | 'input'): void {
        this.bookmarksMode = mode;
        this.bookmarksFilePath = '';
        this.advancedConfigGroup.patchValue({ botBookmarks: '' });
        this.advancedConfigGroup.markAsDirty();
    }

    async chooseExecutable(): Promise<void> {
        let entries: string[];
        try {
            entries = await Neutralino.os.showOpenDialog('Select BotBrowser executable', {
                filters: [
                    { name: 'Executable', extensions: ['exe', 'app', ''] },
                    { name: 'All Files', extensions: ['*'] },
                ],
                multiSelections: false,
            });
        } catch (error) {
            console.error('Failed to open file dialog:', error);
            return;
        }
        const entry = entries[0];
        if (!entry) return;

        this.advancedGroup.get('binaryPath')?.setValue(entry);
        this.advancedGroup.markAsDirty();
    }

    async chooseCookiesFile(): Promise<void> {
        let entries: string[];
        try {
            entries = await Neutralino.os.showOpenDialog('Select cookies JSON file', {
                filters: [{ name: 'JSON', extensions: ['json'] }],
                multiSelections: false,
            });
        } catch {
            return;
        }
        const entry = entries[0];
        if (!entry) return;

        this.#ngZone.run(() => {
            this.cookiesFilePath = entry;
            this.advancedConfigGroup.patchValue({ botCookies: `@${entry}` });
            this.advancedConfigGroup.markAsDirty();
        });
    }

    async chooseBookmarksFile(): Promise<void> {
        let entries: string[];
        try {
            entries = await Neutralino.os.showOpenDialog('Select bookmarks JSON file', {
                filters: [{ name: 'JSON', extensions: ['json'] }],
                multiSelections: false,
            });
        } catch {
            return;
        }
        const entry = entries[0];
        if (!entry) return;

        this.#ngZone.run(() => {
            this.bookmarksFilePath = entry;
            this.advancedConfigGroup.patchValue({ botBookmarks: `@${entry}` });
            this.advancedConfigGroup.markAsDirty();
        });
    }

    onCancel(): void {
        this.#confirmClose();
    }

    #isFormDirty(): boolean {
        return (
            this.basicInfoFormGroup.dirty ||
            this.behaviorGroup.dirty ||
            this.identityLocaleGroup.dirty ||
            this.customUserAgentGroup.dirty ||
            this.displayInputGroup.dirty ||
            this.noiseGroup.dirty ||
            this.renderingMediaGroup.dirty ||
            this.proxyConfigGroup.dirty ||
            this.advancedConfigGroup.dirty ||
            this.advancedGroup.dirty ||
            this.forensicsGroup.dirty ||
            this.memoryStorageGroup.dirty
        );
    }

    #confirmClose(): void {
        if (!this.#isFormDirty()) {
            this.#dialogRef.close();
            return;
        }
        this.#dialog
            .open(ConfirmDialogComponent, {
                data: { message: 'You have unsaved changes. Discard and close?' },
            })
            .afterClosed()
            .subscribe((result: boolean) => {
                if (result) this.#dialogRef.close();
            });
    }

    #handleFileSelection(filePath: string): void {
        Neutralino.filesystem
            .readFile(filePath)
            .then((content) =>
                this.#ngZone.run(() => {
                    const basicInfo = tryParseBotProfile(content);
                    if (!basicInfo) {
                        this.#dialog.open(AlertDialogComponent, {
                            data: { message: 'Invalid bot profile file.' },
                        });
                        return;
                    }

                    this.basicInfo = basicInfo;
                    this.botProfileInfoGroup.get('content')?.setValue(content);
                    this.botProfileInfoGroup.get('filename')?.setValue(filePath);

                    // Bot profile changed → caches from the previous profile are stale.
                    this.#savedWindowWxh = '';
                    this.#savedWindowJson = '';
                    this.#savedScreenWxh = '';
                    this.#savedScreenJson = '';
                    // No launcher-side window/screen override on file change — leave it to BB.
                    // (botMobileForceTouch has no implicit kernel default, so we enable it for
                    // touch-first mobile profiles — Android and iOS alike.)
                    if (this.#isTouchMobileProfile(basicInfo)) {
                        this.behaviorGroup.patchValue({ botMobileForceTouch: true });
                        this.behaviorGroup.markAsDirty();
                    }
                })
            )
            .catch((error) =>
                this.#ngZone.run(() => {
                    console.error('Failed to read file:', error);
                    this.#dialog.open(AlertDialogComponent, {
                        data: { message: `Failed to read file: ${error.message || error}` },
                    });
                })
            );
    }

    // Touch-first mobile profiles (Android phones/tablets and iOS devices) default force-touch on.
    // iPadOS UAs that masquerade as desktop Mac aren't detectable here and are left to the user.
    #isTouchMobileProfile(basicInfo: BotProfileBasicInfo): boolean {
        return /android|iphone|ipad|ipod/.test(basicInfo.userAgent.toLowerCase());
    }

    #validate(): boolean {
        if (!this.basicInfo) {
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'Bot profile must be selected and valid.' },
            });
            return false;
        }

        return true;
    }

    clearUserData(): void {
        if (!this.#injectedData) return;
        const profile = this.#injectedData;
        this.#dialog
            .open(ConfirmDialogComponent, {
                data: {
                    message: `Clear user data for "${profile.basicInfo.profileName}"? This deletes cookies, cache, local storage, and all browsing data. The profile settings will be kept.`,
                },
            })
            .afterClosed()
            .subscribe(async (result: boolean) => {
                if (!result) return;
                try {
                    const userDataDirPath = await this.#browserProfileService.getBrowserProfileUserDataDirPath(profile);
                    await Neutralino.filesystem.remove(userDataDirPath);
                } catch (error) {
                    console.log('Clear user data:', error);
                }
                this.#dialog.open(AlertDialogComponent, {
                    data: { message: 'User data cleared successfully.' },
                });
            });
    }

    getCliPreview(): string {
        const tempProfile: BrowserProfile = {
            id: this.#injectedData?.id || '',
            basicInfo: this.basicInfoFormGroup.value,
            botProfileInfo: this.botProfileInfoGroup.value,
            proxyServer: this.proxyValue ? this.#proxyParser.toUrl(this.proxyValue) : undefined,
            createdAt: 0,
            updatedAt: 0,
            kernelMajorOverride: this.#parseKernelMajorOverride(),
            launchOptions: {
                behavior: this.#cleanObject(this.behaviorGroup.value) as BehaviorToggles | undefined,
                identityLocale: this.#cleanObject(this.identityLocaleGroup.value) as IdentityLocaleConfig | undefined,
                customUserAgent: this.#cleanObject(this.customUserAgentGroup.value) as
                    | CustomUserAgentConfig
                    | undefined,
                displayInput: this.#cleanObject(this.displayInputGroup.value) as DisplayInputConfig | undefined,
                noise: this.#cleanObject(this.noiseGroup.value) as NoiseConfig | undefined,
                renderingMedia: this.#cleanObject(this.renderingMediaGroup.value) as RenderingMediaConfig | undefined,
                proxy: this.#cleanObject(this.proxyConfigGroup.value) as ProxyConfig | undefined,
                advanced: this.#cleanObject(this.advancedConfigGroup.value) as AdvancedConfig | undefined,
                forensics: this.#cleanObject(this.forensicsGroup.value) as ForensicsConfig | undefined,
                memoryStorage: this.#cleanObject(this.memoryStorageGroup.value) as MemoryStorageConfig | undefined,
            },
        };
        const flags = BrowserLauncherService.buildProfileFlags(tempProfile);
        if (!flags.length) return '';
        return `chromium-browser \\\n  --bot-profile=<path-to-profile> \\\n  ${flags.join(' \\\n  ')}`;
    }

    async copyCliToClipboard(): Promise<void> {
        const cli = this.getCliPreview();
        if (!cli) return;
        await Neutralino.clipboard.writeText(cli);
        this.#snackBar.open('Copied to clipboard', '', { duration: 2000 });
    }

    async onConfirmClick(): Promise<void> {
        console.log('onConfirmClick called');

        if (!this.#validate()) {
            console.log('validate failed');
            return;
        }
        console.log('validate passed');

        if (!this.basicInfoFormGroup.valid) {
            console.log('basicInfoFormGroup invalid');
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'Please fill in all required fields.' },
            });
            return;
        }
        console.log('basicInfoFormGroup valid');

        if (this.advancedGroup.invalid) {
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'Kernel Version Override must be a positive integer (1-999), or leave it blank.' },
            });
            return;
        }

        // Custom window/screen modes require a value, otherwise the mode is silently lost on reload.
        const winVal = (this.displayInputGroup.get('botConfigWindow')?.value ?? '') as string;
        if ((this.windowMode === 'wxh' || this.windowMode === 'json') && !winVal.trim()) {
            this.#dialog.open(AlertDialogComponent, {
                data: {
                    message: `Window Mode is set to ${this.windowMode}; please fill in a value (e.g. 1920x1080 or {"innerWidth":1920,"innerHeight":1080}).`,
                },
            });
            return;
        }
        const scrVal = (this.displayInputGroup.get('botConfigScreen')?.value ?? '') as string;
        if ((this.screenMode === 'wxh' || this.screenMode === 'json') && !scrVal.trim()) {
            this.#dialog.open(AlertDialogComponent, {
                data: { message: `Screen Mode is set to ${this.screenMode}; please fill in a value.` },
            });
            return;
        }

        if (this.localDnsMode === 'custom' && !this.localDnsServer.trim()) {
            this.#dialog.open(AlertDialogComponent, {
                data: {
                    message: 'Local DNS is set to "custom DNS server"; please enter an IP or IP:port (e.g. 8.8.8.8).',
                },
            });
            return;
        }

        // Custom (bytes) modes require a positive integer, else a malformed value (-5, 2.5) leaks to the
        // CLI or an empty/0 value is silently lost on reload.
        if (this.jsHeapMode === 'bytes' && !this.#isPositiveIntBytes(this.memoryStorageGroup.get('botJsHeapSizeLimit')?.value)) {
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'JS Heap Size Limit (Custom) must be a positive integer number of bytes (e.g. 2147483648).' },
            });
            return;
        }
        if (this.storageQuotaMode === 'bytes' && !this.#isPositiveIntBytes(this.memoryStorageGroup.get('botStorageQuota')?.value)) {
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'Storage Quota (Custom) must be a positive integer number of bytes (e.g. 1073741824).' },
            });
            return;
        }

        if (!this.botProfileInfoGroup.value?.content) {
            console.log('botProfileInfoGroup content missing');
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'Bot profile content is missing. Please select a valid profile file.' },
            });
            return;
        }
        console.log('botProfileInfoGroup content exists');

        const launchOptions: LaunchOptions = {
            behavior: this.#cleanObject(this.behaviorGroup.value) as BehaviorToggles | undefined,
            identityLocale: this.#cleanObject(this.identityLocaleGroup.value) as IdentityLocaleConfig | undefined,
            customUserAgent: this.#cleanObject(this.customUserAgentGroup.value) as CustomUserAgentConfig | undefined,
            displayInput: this.#cleanObject(this.displayInputGroup.value) as DisplayInputConfig | undefined,
            noise: this.#cleanObject(this.noiseGroup.value) as NoiseConfig | undefined,
            renderingMedia: this.#cleanObject(this.renderingMediaGroup.value) as RenderingMediaConfig | undefined,
            proxy: this.#cleanObject(this.proxyConfigGroup.value) as ProxyConfig | undefined,
            advanced: this.#cleanObject(this.advancedConfigGroup.value) as AdvancedConfig | undefined,
            forensics: this.#cleanObject(this.forensicsGroup.value) as ForensicsConfig | undefined,
            memoryStorage: this.#cleanObject(this.memoryStorageGroup.value) as MemoryStorageConfig | undefined,
        };

        const browserProfile: BrowserProfile = {
            id: this.#injectedData?.id || uuidv4(),
            basicInfo: this.basicInfoFormGroup.value,
            botProfileInfo: this.botProfileInfoGroup.value,
            binaryPath: this.advancedGroup.value.binaryPath || undefined,
            kernelMajorOverride: this.#parseKernelMajorOverride(),
            proxyServer: this.proxyValue ? this.#proxyParser.toUrl(this.proxyValue) : undefined,
            createdAt: this.#injectedData?.createdAt || Date.now(),
            lastUsedAt: this.#injectedData?.lastUsedAt,
            updatedAt: Date.now(),
            warmupUrls: this.#injectedData?.warmupUrls,
            launchOptions: this.#cleanObject(launchOptions),
        };

        try {
            console.log('Saving browser profile...');
            await this.#browserProfileService.saveBrowserProfile(browserProfile);
            console.log('Browser profile saved successfully');
            // Use NgZone to ensure dialog close triggers change detection
            this.#ngZone.run(() => {
                if (this.isRunning) {
                    this.#snackBar.open(
                        'Saved. Changes take effect the next time you launch this profile.',
                        'OK',
                        { duration: 6000 }
                    );
                }
                console.log('Closing dialog...');
                this.#dialogRef.close(browserProfile.id);
                console.log('Dialog close called');
            });
        } catch (error) {
            console.error('Failed to save browser profile:', error);
            this.#ngZone.run(() => {
                this.#dialog.open(AlertDialogComponent, {
                    data: { message: `Failed to save profile: ${error instanceof Error ? error.message : error}` },
                });
            });
        }
    }

    #cleanObject<T extends object>(obj: T): T | undefined {
        const cleaned = Object.fromEntries(
            Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '')
        ) as T;
        return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }
}
