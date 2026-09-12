import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, ViewChild, type AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet } from '@angular/router';
import * as Neutralino from '@neutralinojs/lib';
import { cloneDeep } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { CloneBrowserProfileComponent } from './clone-browser-profile.component';
import { AppName } from './const';
import { extractMajorVersion, getKernelMajorFromKernelField, getRequiredKernelMajor, isWebKitProfile } from './data/bot-profile';
import { BrowserProfileStatus, type BrowserProfile } from './data/browser-profile';
import { EditBrowserProfileComponent } from './edit-browser-profile.component';
import { KernelManagementComponent } from './kernel-management/kernel-management.component';
import { ProxyManagementComponent } from './proxy-management/proxy-management.component';
import { QuickProxyChangeComponent } from './quick-proxy-change.component';
import { AlertDialogComponent } from './shared/alert-dialog.component';
import { BrowserLauncherService } from './shared/browser-launcher.service';
import { BrowserProfileService } from './shared/browser-profile.service';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';
import { UpdateService } from './shared/update.service';
import { KernelService } from './shared/kernel.service';
import { ShellService } from './shared/shell.service';
import { StopPropagationDirective } from './shared/stop-propagation.directive';
import { compressFolder, decompressZip, formatDateTime, formatProxyDisplay } from './utils';
import { WarmupComponent } from './warmup.component';

export type NavItem = 'profiles' | 'proxies' | 'kernels';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        MatButtonModule,
        MatMenuModule,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatCheckboxModule,
        MatToolbarModule,
        MatIconModule,
        MatSidenavModule,
        MatListModule,
        MatProgressBarModule,
        MatTooltipModule,
        MatSnackBarModule,
        StopPropagationDirective,
        ProxyManagementComponent,
        KernelManagementComponent,
    ],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
    readonly #browserProfileService = inject(BrowserProfileService);
    readonly #shell = inject(ShellService);
    readonly browserLauncherService = inject(BrowserLauncherService);
    readonly kernelService = inject(KernelService);
    readonly updateService = inject(UpdateService);

    readonly AppName = AppName;
    readonly #dialog = inject(MatDialog);
    readonly #snackBar = inject(MatSnackBar);
    currentNav: NavItem = 'profiles';
    readonly formatDateTime = formatDateTime;
    readonly formatProxyDisplay = formatProxyDisplay;
    readonly BrowserProfileStatus = BrowserProfileStatus;
    readonly displayedColumns = ['select', 'status', 'name', 'platform', 'proxy', 'kernel', 'lastUsedAt', 'group'];
    readonly dataSource = new MatTableDataSource<BrowserProfile>([]);
    readonly selection = new SelectionModel<BrowserProfile>(true, []);

    highlightedId: string | null = null;
    loading = false;

    @ViewChild(MatSort) set sort(sort: MatSort) {
        if (sort) {
            this.dataSource.sort = sort;
        }
    }

    constructor() {
        this.dataSource.sortingDataAccessor = (data, sortHeaderId) => {
            switch (sortHeaderId) {
                case 'name':
                    return data.basicInfo.profileName ?? '';
                case 'group':
                    return data.basicInfo.groupName ?? '';
                case 'status':
                    return this.browserLauncherService.getRunningStatus(data);
                case 'kernel':
                    return this.getKernelVersion(data) ?? 0;
                case 'platform':
                    return this.getProfilePlatform(data);
                case 'lastUsedAt':
                    return data.lastUsedAt ?? 0;
                default:
                    return '';
            }
        };
        // Refresh the WebKit-fallback snapshot whenever kernel installs/auto-updates run.
        effect(() => {
            this.kernelService.installedKernelsVersion();
            this.#refreshLatestKernelMajor().catch(console.error);
        });
    }

    async #refreshLatestKernelMajor(): Promise<void> {
        try {
            await this.kernelService.initialize();
            const latest = await this.kernelService.getLatestInstalledKernel();
            this.#latestInstalledKernelMajor = latest?.majorVersion ?? null;
        } catch {
            this.#latestInstalledKernelMajor = null;
        }
        // Invalidate WebKit-cached results — extractMajorVersion results don't depend on the snapshot
        // but isWebKitProfile rows do, and overwhelmingly the simpler reset is safer than tracking which.
        this.#kernelVersionCache = new WeakMap();
    }

    // Memoize per botProfileInfo reference: refreshProfiles() reassigns dataSource.data,
    // so stale entries are GC'd. Without this, JSON.parse runs on every change-detection tick.
    #kernelVersionCache = new WeakMap<object, number | null>();
    #parsedCache = new WeakMap<object, { ua: string; version: string } | null>();
    // Snapshot of the latest installed kernel major for the current platform. Refreshed
    // on installedKernelsVersion signal change so getKernelVersion() mirrors run()'s WebKit fallback synchronously.
    #latestInstalledKernelMajor: number | null = null;

    getKernelVersion(profile: BrowserProfile): number | null {
        const override = profile.kernelMajorOverride;
        if (typeof override === 'number' && Number.isInteger(override) && override >= 1 && override <= 999) {
            return override;
        }
        const info = profile.botProfileInfo;
        if (!info?.content) return null;
        const cached = this.#kernelVersionCache.get(info as object);
        if (cached !== undefined) return cached;
        let result: number | null = null;
        try {
            const parsed = JSON.parse(info.content);
            const userAgent = parsed.userAgent || '';
            const version = parsed.version || '';
            // Mirrors browser-launcher.service.ts run().
            result =
                getKernelMajorFromKernelField(parsed.kernel) ??
                extractMajorVersion(userAgent) ??
                getRequiredKernelMajor(userAgent);
            if (result == null) {
                if (isWebKitProfile({ userAgent, version, unmaskedVendor: '', unmaskedRenderer: '' })) {
                    result = this.#latestInstalledKernelMajor;
                } else {
                    result = extractMajorVersion(version);
                }
            }
        } catch {
            result = null;
        }
        this.#kernelVersionCache.set(info as object, result);
        return result;
    }

    #getParsedBasics(profile: BrowserProfile): { ua: string; version: string } | null {
        const info = profile.botProfileInfo;
        if (!info?.content) return null;
        const cached = this.#parsedCache.get(info as object);
        if (cached !== undefined) return cached;
        let result: { ua: string; version: string } | null = null;
        try {
            const parsed = JSON.parse(info.content);
            result = { ua: parsed.userAgent || '', version: parsed.version || '' };
        } catch {
            result = null;
        }
        this.#parsedCache.set(info as object, result);
        return result;
    }

    getProfileOS(profile: BrowserProfile): string {
        const basics = this.#getParsedBasics(profile);
        if (!basics) return '';
        const ua = basics.ua;
        if (/Android/i.test(ua)) return 'Android';
        if (/iPhone|iPad|iPod|iOS/i.test(ua)) return 'iOS';
        if (/Windows/i.test(ua)) return 'Windows';
        if (/Mac OS X|Macintosh|macOS/i.test(ua)) return 'macOS';
        if (/Linux|X11/i.test(ua)) return 'Linux';
        return '';
    }

    getProfileEngine(profile: BrowserProfile): string {
        const basics = this.#getParsedBasics(profile);
        if (!basics) return '';
        const ua = basics.ua;
        if (/Chrom(?:e|ium)\//.test(ua)) return 'Blink';
        if (/AppleWebKit\/|Safari\//.test(ua)) return 'WebKit';
        return '';
    }

    getProfilePlatform(profile: BrowserProfile): string {
        const os = this.getProfileOS(profile);
        const engine = this.getProfileEngine(profile);
        return [os, engine].filter(Boolean).join(' · ');
    }

    newProfile(): void {
        this.#dialog
            .open(EditBrowserProfileComponent, {
                width: '1100px',
                maxWidth: '95vw',
            })
            .afterClosed()
            .subscribe((result) => {
                if (!result) return;
                this.highlightedId = result;
                this.refreshProfiles().catch(console.error);
            });
    }

    editProfile(browserProfile: BrowserProfile): void {
        this.highlightedId = browserProfile.id;
        // Editing a running profile is allowed; saved changes apply on the next launch
        // (the editor shows a banner and confirms this on save).
        this.#dialog
            .open(EditBrowserProfileComponent, {
                width: '1100px',
                maxWidth: '95vw',
                data: browserProfile,
            })
            .afterClosed()
            .subscribe((result) => {
                if (!result) return;
                this.highlightedId = browserProfile.id;
                this.refreshProfiles().catch(console.error);
            });
    }

    changeProxy(browserProfile: BrowserProfile): void {
        this.highlightedId = browserProfile.id;
        this.#dialog
            .open(QuickProxyChangeComponent, {
                width: '620px',
                maxWidth: '95vw',
                data: browserProfile,
            })
            .afterClosed()
            .subscribe((result) => {
                if (!result) return;
                this.highlightedId = browserProfile.id;
                this.refreshProfiles().catch(console.error);
            });
    }

    editSelectedProfile(): void {
        const profile = this.highlightedId ? this.dataSource.data.find((p) => p.id === this.highlightedId) : null;
        if (!profile) return;
        this.editProfile(profile);
    }

    selectRow(browserProfile: BrowserProfile): void {
        this.highlightedId = browserProfile.id;
    }

    cloneProfile(browserProfile: BrowserProfile): void {
        this.#dialog
            .open(CloneBrowserProfileComponent)
            .afterClosed()
            .subscribe(async (result: number) => {
                await Promise.all(
                    Array.from({ length: result }).map(() => {
                        const newProfile = cloneDeep(browserProfile);
                        newProfile.id = uuidv4();
                        newProfile.createdAt = Date.now();
                        newProfile.updatedAt = Date.now();
                        return this.#browserProfileService.saveBrowserProfile(newProfile);
                    })
                );

                await this.refreshProfiles();
            });
    }

    async exportProfile(browserProfile: BrowserProfile): Promise<void> {
        const entry = await Neutralino.os.showSaveDialog('Export browser profile', {
            filters: [{ name: 'Zip', extensions: ['zip'] }],
        });

        const browserProfilePath = await this.#browserProfileService.getBrowserProfilePath(browserProfile);
        await compressFolder(browserProfilePath, entry, this.#shell);
    }

    async warmupProfile(browserProfile: BrowserProfile): Promise<void> {
        this.#dialog
            .open(WarmupComponent, { data: browserProfile })
            .afterClosed()
            .subscribe(async (result?: string) => {
                if (!result) return;
                console.log('Warmup result: ', result);

                await this.browserLauncherService.run(browserProfile, true);
            });
    }

    async importProfile(): Promise<void> {
        const entry = await Neutralino.os.showOpenDialog('Import a browser profile', {
            filters: [{ name: 'Zip', extensions: ['zip'] }],
        });

        if (!entry?.[0]) return;

        const browserProfilePath = await this.#browserProfileService.getBasePath();
        await decompressZip(entry[0], browserProfilePath, this.#shell);
        await this.refreshProfiles();
    }

    deleteProfiles(): void {
        if (this.selection.selected.length === 0) {
            throw new Error('Please select profiles to delete');
        }

        this.#dialog
            .open(ConfirmDialogComponent, {
                data: {
                    message: 'Are you sure you want to delete the selected profiles?',
                },
            })
            .afterClosed()
            .subscribe(async (result: boolean) => {
                if (!result) return;

                this.loading = true;
                try {
                    await this.#stopRunningProfiles(this.selection.selected);
                    await this.#browserProfileService.deleteBrowserProfiles(
                        this.selection.selected.map((profile) => profile.id)
                    );
                    await this.refreshProfiles();
                } finally {
                    this.loading = false;
                }
            });
    }

    deleteProfile(browserProfile: BrowserProfile): void {
        this.#dialog
            .open(ConfirmDialogComponent, {
                data: {
                    message: `Are you sure you want to delete the profile "${browserProfile.basicInfo.profileName}"?`,
                },
            })
            .afterClosed()
            .subscribe(async (result: boolean) => {
                if (!result) return;

                this.loading = true;
                try {
                    await this.#stopRunningProfiles([browserProfile]);
                    await this.#browserProfileService.deleteBrowserProfiles([browserProfile.id]);
                    await this.refreshProfiles();
                } finally {
                    this.loading = false;
                }
            });
    }

    async #stopRunningProfiles(profiles: BrowserProfile[]): Promise<void> {
        const running = profiles.filter(
            (p) => this.browserLauncherService.getRunningStatus(p) === BrowserProfileStatus.Running
        );
        for (const profile of running) {
            try {
                await this.browserLauncherService.stop(profile);
            } catch (error) {
                console.error(`Failed to stop profile ${profile.basicInfo.profileName}:`, error);
            }
        }
        // Wait for processes to fully exit
        if (running.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    clearUserData(browserProfile: BrowserProfile): void {
        this.#dialog
            .open(ConfirmDialogComponent, {
                data: {
                    message: `Clear user data for "${browserProfile.basicInfo.profileName}"? This deletes cookies, cache, local storage, and all browsing data. The profile settings will be kept.`,
                },
            })
            .afterClosed()
            .subscribe(async (result: boolean) => {
                if (!result) return;

                try {
                    const userDataDirPath =
                        await this.#browserProfileService.getBrowserProfileUserDataDirPath(browserProfile);
                    await Neutralino.filesystem.remove(userDataDirPath);
                } catch (error) {
                    // Directory may not exist yet, which is fine
                    console.log('Clear user data:', error);
                }

                this.#dialog.open(AlertDialogComponent, {
                    data: { message: 'User data cleared successfully.' },
                });
            });
    }

    async copyCliCommand(browserProfile: BrowserProfile): Promise<void> {
        const flags = BrowserLauncherService.buildProfileFlags(browserProfile);
        if (!flags.length) return;
        const cli = `chromium-browser \\\n  --bot-profile=<path-to-profile> \\\n  ${flags.join(' \\\n  ')}`;
        await Neutralino.clipboard.writeText(cli);
        this.#snackBar.open('Copied to clipboard', '', { duration: 2000 });
    }

    async refreshProfiles(): Promise<void> {
        this.loading = true;
        try {
            const profiles = await this.#browserProfileService.getAllBrowserProfiles();
            const checkedIds = this.selection.selected.map((profile) => profile.id);
            this.dataSource.data = profiles;
            this.selection.clear();
            this.selection.select(...profiles.filter((profile) => checkedIds.includes(profile.id)));
        } finally {
            this.loading = false;
        }
    }

    async ngAfterViewInit(): Promise<void> {
        await this.refreshProfiles();
        // Start kernel auto-update/auto-download: once now, then re-check every 10 minutes
        this.kernelService.startPeriodicCheck(10 * 60 * 1000);
        // Check for launcher updates: once now, then every 10 minutes
        this.updateService.startPeriodicCheck(10 * 60 * 1000);
    }

    restartApp(): void {
        // Applies a staged update (swap-on-exit) when one is ready, else a plain restart.
        this.updateService.applyUpdateAndRestart().catch(console.error);
    }

    get isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    toggleAllRows(): void {
        if (this.isAllSelected) {
            this.selection.clear();
            return;
        }

        this.selection.select(...this.dataSource.data);
    }

    checkboxLabel(row?: BrowserProfile): string {
        if (!row) {
            return `${this.isAllSelected ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
    }

    exportToCSV(): void {
        const headers = [
            'name',
            'group',
            'description',
            'bot_profile',
            'proxy',
            'executable_path',
            'warm_up_urls',
            'locale',
        ];

        const rows = (this.selection.selected.length > 0 ? this.selection.selected : this.dataSource.data).map(
            (profile) => ({
                name: profile.basicInfo?.profileName || '',
                group: profile.basicInfo?.groupName || '',
                description: profile.basicInfo?.description || '',
                bot_profile: profile.botProfileInfo?.filename || '',
                proxy: profile.proxyServer || '',
                executable_path: profile.binaryPath || '',
                warm_up_urls: profile.warmupUrls || '',
            })
        );

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => headers.map((header) => `${row[header as keyof typeof row] || ''}`).join(',')),
        ].join('\n');

        const defaultFilename = 'profiles.csv';
        Neutralino.os
            .showSaveDialog('Save CSV File', {
                defaultPath: defaultFilename,
                filters: [
                    { name: 'CSV', extensions: ['csv'] },
                    { name: 'All files', extensions: ['*'] },
                ],
            })
            .then((filePath) => {
                if (!filePath) {
                    console.warn('Save operation was canceled.');
                    return;
                }

                Neutralino.filesystem
                    .writeFile(filePath, csvContent)
                    .then(() => {
                        console.log(`CSV file saved successfully at ${filePath}`);
                        this.#snackBar.open('CSV file exported successfully', '', { duration: 3000 });
                    })
                    .catch((err) => {
                        console.error('Failed to save CSV file:', err);
                        this.#dialog.open(AlertDialogComponent, {
                            data: { message: 'Failed to export CSV file. Please check the logs.' },
                        });
                    });
            })
            .catch((err) => {
                console.error('Failed to show save dialog:', err);
                this.#dialog.open(AlertDialogComponent, {
                    data: { message: 'Unable to display the save dialog. Please check the logs.' },
                });
            });
    }

    async importProfilesFromCSV(): Promise<void> {
        const entry = await Neutralino.os.showOpenDialog('Import profiles from CSV', {
            filters: [{ name: 'CSV', extensions: ['csv'] }],
        });

        if (!entry?.[0]) {
            console.warn('No file selected for import.');
            return;
        }

        const filePath = entry[0];

        try {
            const fileContent = await Neutralino.filesystem.readFile(filePath);
            const lines = fileContent.split('\n').filter((line) => line.trim() !== '');

            if (lines.length <= 1) {
                console.warn('CSV file is empty or only contains headers.');
                this.#dialog.open(AlertDialogComponent, {
                    data: { message: 'The CSV file is empty or only contains headers. Please check the file content.' },
                });
                return;
            }

            const headers = lines[0]?.split(',').map((header) => header.trim()) || [];
            const data = lines.slice(1).map((line) => {
                const values = line.split(',').map((value) => value.trim());
                return headers.reduce((obj: any, header, index) => {
                    obj[header] = values[index] || '';
                    return obj;
                }, {});
            });

            const profiles = data.map(async (row: any) => {
                const { name, group, description, bot_profile, proxy, executable_path, warm_up_urls } = row;

                let botProfileContent = '';
                if (bot_profile) {
                    try {
                        botProfileContent = await Neutralino.filesystem.readFile(bot_profile);
                    } catch (error) {
                        console.error(`Failed to read bot profile file: ${bot_profile}`, error);
                        botProfileContent = '';
                    }
                }

                const newProfile: BrowserProfile = {
                    id: uuidv4(),
                    basicInfo: {
                        profileName: name || '',
                        groupName: group || '',
                        description: description || '',
                    },
                    botProfileInfo: {
                        filename: bot_profile || '',
                        content: botProfileContent,
                    },
                    binaryPath: executable_path || '',
                    proxyServer: proxy || '',
                    warmupUrls: warm_up_urls || '',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };

                return newProfile;
            });

            const resolvedProfiles = await Promise.all(profiles);

            await Promise.all(
                resolvedProfiles.map((profile) => this.#browserProfileService.saveBrowserProfile(profile))
            );
            await this.refreshProfiles();
            this.#snackBar.open('CSV file imported successfully', '', { duration: 3000 });
        } catch (error) {
            console.error('Failed to import profiles from CSV:', error);
            this.#dialog.open(AlertDialogComponent, {
                data: { message: 'Failed to import CSV file. Please check the logs.' },
            });
        }
    }

    async runBrowserProfile(browserProfile: BrowserProfile): Promise<void> {
        await this.browserLauncherService.run(browserProfile);
    }

    async stopBrowserProfile(browserProfile: BrowserProfile): Promise<void> {
        await this.browserLauncherService.stop(browserProfile);
    }

    hasIdleProfiles(): boolean {
        return this.selection.selected.some(
            (profile) => this.browserLauncherService.getRunningStatus(profile) === BrowserProfileStatus.Idle
        );
    }

    hasRunningProfiles(): boolean {
        return this.selection.selected.some(
            (profile) => this.browserLauncherService.getRunningStatus(profile) === BrowserProfileStatus.Running
        );
    }

    async startSelectedProfiles(): Promise<void> {
        const idleProfiles = this.selection.selected.filter(
            (profile) => this.browserLauncherService.getRunningStatus(profile) === BrowserProfileStatus.Idle
        );

        if (idleProfiles.length === 0) {
            return;
        }

        for (const profile of idleProfiles) {
            try {
                await this.browserLauncherService.run(profile);
            } catch (error) {
                console.error(`Failed to start profile ${profile.basicInfo.profileName}:`, error);
            }
        }
    }

    async stopSelectedProfiles(): Promise<void> {
        const runningProfiles = this.selection.selected.filter(
            (profile) => this.browserLauncherService.getRunningStatus(profile) === BrowserProfileStatus.Running
        );

        if (runningProfiles.length === 0) {
            return;
        }

        for (const profile of runningProfiles) {
            try {
                await this.browserLauncherService.stop(profile);
            } catch (error) {
                console.error(`Failed to stop profile ${profile.basicInfo.profileName}:`, error);
            }
        }
    }

    openExternalUrl(url: string): void {
        Neutralino.os.open(url);
    }

    is7ZipError(error: string | undefined): boolean {
        return !!error && error.includes('7-Zip');
    }
}
