export interface BasicInfo {
    profileName: string | null;
    groupName?: string | null;
    description?: string | null;
}

export interface BotProfileInfo {
    filename: string | null;
    content?: string | null;
}

export enum BrowserProfileStatus {
    Idle,
    Launching,
    LaunchFailed,
    Running,
    Stopping,
    StopFailed,
}

export const BrowserProfileStatusText = {
    [BrowserProfileStatus.Idle]: 'Idle',
    [BrowserProfileStatus.Launching]: 'Launching',
    [BrowserProfileStatus.LaunchFailed]: 'Launch Failed',
    [BrowserProfileStatus.Running]: 'Running',
    [BrowserProfileStatus.Stopping]: 'Stopping',
    [BrowserProfileStatus.StopFailed]: 'Stop Failed',
};

export function getBrowserProfileStatusText(status: BrowserProfileStatus): string {
    return BrowserProfileStatusText[status];
}

// Browser brand options
export type BrowserBrand = 'chrome' | 'chromium' | 'edge' | 'brave' | 'opera' | 'webview';
export const BrowserBrands: BrowserBrand[] = ['chrome', 'chromium', 'edge', 'brave', 'opera', 'webview'];

// Platform options
export type Platform = 'Windows' | 'Android' | 'macOS' | 'Linux';
export const Platforms: Platform[] = ['Windows', 'Android', 'macOS', 'Linux'];

// Architecture options
export type Architecture = 'x86' | 'arm' | 'arm64';
export const Architectures: Architecture[] = ['x86', 'arm', 'arm64'];

// Bitness options
export type Bitness = '32' | '64';
export const Bitnesses: Bitness[] = ['32', '64'];

// Profile/Real/Disabled options
export type ProfileRealDisabled = 'profile' | 'real' | 'disabled';
export const ProfileRealDisabledOptions: ProfileRealDisabled[] = ['profile', 'real', 'disabled'];

// Profile/Real options
export type ProfileReal = 'profile' | 'real';
export const ProfileRealOptions: ProfileReal[] = ['profile', 'real'];

export type DprMode = ProfileReal | 'advanced';
export const DprModes: DprMode[] = ['profile', 'real', 'advanced'];

// GPU emulation modes (--bot-gpu-emulation accepts false | true | priority)
export type GpuEmulationMode = 'off' | 'on' | 'priority';
export const GpuEmulationModes: GpuEmulationMode[] = ['off', 'on', 'priority'];

// V8Log modes
export type V8LogMode = 'sample' | 'full' | 'none';
export const V8LogModes: V8LogMode[] = ['sample', 'full', 'none'];

// Font options
export type FontOption = 'profile' | 'expand' | 'real';
export const FontOptions: FontOption[] = ['profile', 'expand', 'real'];

// Media types options
export type MediaTypesOption = 'expand' | 'profile' | 'real';
export const MediaTypesOptions: MediaTypesOption[] = ['expand', 'profile', 'real'];

// Color scheme options
export type ColorScheme = 'light' | 'dark';
export const ColorSchemes: ColorScheme[] = ['light', 'dark'];

// Orientation options
export type OrientationOption = 'profile' | 'landscape' | 'portrait' | 'landscape-primary' | 'landscape-secondary' | 'portrait-primary' | 'portrait-secondary';
export const OrientationOptions: OrientationOption[] = ['profile', 'landscape', 'portrait', 'landscape-primary', 'landscape-secondary', 'portrait-primary', 'portrait-secondary'];

// Behavior toggles (pure browser UI/runtime behavior)
export interface BehaviorToggles {
    botDisableDebugger?: boolean;
    botMobileForceTouch?: boolean;
    botMobileKeyboard?: boolean;
    botAlwaysActive?: boolean;
    botDisableConsoleMessage?: boolean;
}

// Identity & Locale config
export interface IdentityLocaleConfig {
    botConfigBrowserBrand?: BrowserBrand;
    botConfigBrandFullVersion?: string;
    botConfigUaFullVersion?: string;
    botConfigLanguages?: string;
    botConfigLocale?: string;
    botConfigTimezone?: string;
    botConfigLocation?: string;
    botInjectRandomHistory?: boolean | number;
    botEnableVariationsInContext?: boolean;
}

// Custom User-Agent config
export interface CustomUserAgentConfig {
    userAgent?: string;
    botConfigPlatform?: Platform;
    botConfigPlatformVersion?: string;
    botConfigModel?: string;
    botConfigArchitecture?: Architecture;
    botConfigBitness?: Bitness;
    botConfigMobile?: boolean;
}

// Display & Input config
// botConfigWindow / botConfigScreen accept: 'profile' | 'real' | 'WxH' (e.g. '1920x1080') | JSON
export interface DisplayInputConfig {
    botConfigWindow?: string;
    botConfigScreen?: string;
    botDpr?: DprMode;
    botConfigKeyboard?: ProfileReal;
    botConfigFonts?: FontOption;
    botConfigOrientation?: OrientationOption;
    botConfigColorScheme?: ColorScheme;
    botConfigDisableDeviceScaleFactor?: boolean;
}

// Noise config
export interface NoiseConfig {
    botConfigNoiseWebglImage?: boolean;
    botConfigNoiseCanvas?: boolean;
    botConfigNoiseAudioContext?: boolean;
    botConfigNoiseClientRects?: boolean;
    botConfigNoiseTextRects?: boolean;
    botNoiseSeed?: number;
    botTimeScale?: number;
    botFps?: string;
    // --bot-video-fps: <actual>[:<reported>], where reported is a number or 'real'.
    botVideoFps?: string;
    botTimeSeed?: number;
    botStackSeed?: string;
}

// Rendering & Media config
export interface RenderingMediaConfig {
    botConfigWebgl?: ProfileRealDisabled;
    botConfigWebgpu?: ProfileRealDisabled;
    botConfigSpeechVoices?: ProfileReal;
    botConfigMediaDevices?: ProfileReal;
    botConfigMediaTypes?: MediaTypesOption;
    botConfigWebrtc?: ProfileRealDisabled;
    botWebrtcIce?: string;
    // Accepts boolean (legacy) or GpuEmulationMode
    botGpuEmulation?: boolean | GpuEmulationMode;
}

// Proxy & Network config
export interface ProxyConfig {
    proxyServer?: string;
    proxyIp?: string;
    botIpService?: string;
    proxyBypassRgx?: string;
    // Standard Chromium --proxy-pac-url; accepts file:// or http(s):// PAC sources.
    proxyPacUrl?: string;
    // Standard Chromium --disable-quic; required to keep SOCKS5 UDP fallback off QUIC/HTTP3.
    disableQuic?: boolean;
    // --bot-local-dns: boolean (legacy on/off) or string ('IP' / 'IP:port' for custom upstream DNS)
    botLocalDns?: boolean | string;
    botPortProtection?: boolean;
    botNetworkInfoOverride?: boolean;
}

// Advanced config
export interface AdvancedConfig {
    botCookies?: string;
    botBookmarks?: string;
    botCustomHeaders?: string;
    botScript?: string;
}

// Forensics config (V8Log + CanvasLab + AudioLab record files)
export interface ForensicsConfig {
    botV8Log?: V8LogMode;
    botV8LogDir?: string;
    botCanvasRecordFile?: string;
    botAudioRecordFile?: string;
}

// Memory & Storage runtime policy overrides. Each: 'profile' | 'real' | positive byte value.
// Byte values arrive from a type=number input as a JS number, so allow both.
export interface MemoryStorageConfig {
    botJsHeapSizeLimit?: string | number;
    botStorageQuota?: string | number;
}

// Launch options (all CLI flags combined)
export interface LaunchOptions {
    behavior?: BehaviorToggles;
    identityLocale?: IdentityLocaleConfig;
    customUserAgent?: CustomUserAgentConfig;
    displayInput?: DisplayInputConfig;
    noise?: NoiseConfig;
    renderingMedia?: RenderingMediaConfig;
    proxy?: ProxyConfig;
    advanced?: AdvancedConfig;
    forensics?: ForensicsConfig;
    memoryStorage?: MemoryStorageConfig;
}

export interface BrowserProfile {
    id: string;
    basicInfo: Partial<BasicInfo>;
    botProfileInfo: Partial<BotProfileInfo>;
    binaryPath?: string; // Deprecated, kept for backward compatibility
    proxyServer?: string;
    createdAt: number;
    updatedAt: number;
    warmupUrls?: string;
    lastUsedAt?: number;
    deletedAt?: number;
    launchOptions?: LaunchOptions;
    // Chromium kernel major override (required for WebKit/Safari profiles where UA has no Chrome major).
    kernelMajorOverride?: number;
}
