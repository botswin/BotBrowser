const { app, BrowserWindow, ipcMain, dialog, shell, Menu, nativeTheme, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const net = require('net');
const { spawn, execFile } = require('child_process');
const https = require('https');
const http = require('http');
const Store = require('electron-store');
const { v4: uuidv4 } = require('uuid');

// ─── Fix app name BEFORE anything else ───
app.setName('BotBrowser Control');

// ─── Platform-aware defaults ──────────────────────────────────────────────────
const IS_WIN = process.platform === 'win32';
const IS_MAC = process.platform === 'darwin';
const IS_LINUX = process.platform === 'linux';

function getDefaultBotBrowserPath() {
  if (IS_MAC) return '/Applications/Chromium.app/Contents/MacOS/Chromium';
  if (IS_WIN) return 'C:\\Program Files\\BotBrowser\\chrome.exe';
  return '/usr/bin/botbrowser';
}

function getDefaultUserDataDir() {
  return path.join(app.getPath('userData'), 'browser-profiles');
}

const DEFAULT_BOTBROWSER_PATH = getDefaultBotBrowserPath();

// ─── Persistent store ─────────────────────────────────────────────────────────
const store = new Store({
  name: 'botbrowser-control',
  defaults: {
    profiles: [],
    settings: {
      botBrowserPath: DEFAULT_BOTBROWSER_PATH,
      defaultUserDataDir: getDefaultUserDataDir(),
      theme: 'dark',
      defaultProxy: '',
      autoLaunch: false,
    },
    windowBounds: { width: 1280, height: 800 },
    lastSeenKernelRelease: null,
    lastSeenControlRelease: null,
    cachedKernelReleases: null,
  }
});

// ─── Runtime state ────────────────────────────────────────────────────────────
const runningInstances = new Map();
const tempFiles = new Map();
let mainWindow = null;

// ─── Window ───────────────────────────────────────────────────────────────────
function createWindow() {
  const bounds = store.get('windowBounds');

  mainWindow = new BrowserWindow({
    width: bounds.width || 1280,
    height: bounds.height || 800,
    minWidth: 960,
    minHeight: 600,
    ...(IS_MAC ? {
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 16, y: 18 },
      vibrancy: 'under-window',
      visualEffectState: 'active',
    } : {
      frame: true,
    }),
    backgroundColor: '#2c3e50',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: false,  // disable devtools
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Prevent devtools from opening
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });

  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize();
    store.set('windowBounds', { width, height });
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  buildMenu();
}

function buildMenu() {
  const template = [
    ...(IS_MAC ? [{
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'New Profile', accelerator: IS_MAC ? 'Cmd+N' : 'Ctrl+N', click: () => mainWindow?.webContents.send('action', 'new-profile') },
        { type: 'separator' },
        IS_MAC ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Profiles', accelerator: IS_MAC ? 'Cmd+1' : 'Ctrl+1', click: () => mainWindow?.webContents.send('navigate', 'profiles') },
        { label: 'Running Sessions', accelerator: IS_MAC ? 'Cmd+2' : 'Ctrl+2', click: () => mainWindow?.webContents.send('navigate', 'sessions') },
        { label: 'Settings', accelerator: IS_MAC ? 'Cmd+3' : 'Ctrl+3', click: () => mainWindow?.webContents.send('navigate', 'settings') },
        { type: 'separator' },
        { role: 'reload' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(IS_MAC ? [{ type: 'separator' }, { role: 'front' }] : [])
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── IPC: Profile Management ──────────────────────────────────────────────────

ipcMain.handle('profiles:getAll', () => store.get('profiles', []));

ipcMain.handle('profiles:create', (_, profileData) => {
  const profiles = store.get('profiles', []);
  const newProfile = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'stopped',
    ...profileData
  };
  profiles.push(newProfile);
  store.set('profiles', profiles);
  return newProfile;
});

ipcMain.handle('profiles:update', (_, { id, updates }) => {
  const profiles = store.get('profiles', []);
  const idx = profiles.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Profile not found');
  profiles[idx] = { ...profiles[idx], ...updates, updatedAt: new Date().toISOString() };
  store.set('profiles', profiles);
  return profiles[idx];
});

ipcMain.handle('profiles:delete', (_, id) => {
  const profiles = store.get('profiles', []);
  store.set('profiles', profiles.filter(p => p.id !== id));
  if (runningInstances.has(id)) {
    try { runningInstances.get(id).process.kill('SIGTERM'); } catch {}
    runningInstances.delete(id);
  }
  return true;
});

ipcMain.handle('profiles:deleteMultiple', (_, ids) => {
  const idSet = new Set(ids);
  const profiles = store.get('profiles', []);
  store.set('profiles', profiles.filter(p => !idSet.has(p.id)));
  for (const id of ids) {
    if (runningInstances.has(id)) {
      try { runningInstances.get(id).process.kill('SIGTERM'); } catch {}
      runningInstances.delete(id);
    }
  }
  return true;
});

ipcMain.handle('profiles:duplicate', async (_, id) => {
  const profiles = store.get('profiles', []);
  const original = profiles.find(p => p.id === id);
  if (!original) throw new Error('Profile not found');

  const newId = uuidv4();
  const copy = {
    ...original,
    id: newId,
    name: original.name + ' (Copy)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'stopped',
    cookieCount: 0,
    cookiesSavedAt: null,
    savedCookiesPath: null,
  };

  const settings = store.get('settings');
  const srcDir = path.join(settings.defaultUserDataDir, id);
  const dstDir = path.join(settings.defaultUserDataDir, newId);

  if (fs.existsSync(srcDir)) {
    try {
      copyDirRecursive(srcDir, dstDir);
      const newCookiesPath = path.join(dstDir, 'saved-cookies.json');
      if (fs.existsSync(newCookiesPath)) {
        copy.savedCookiesPath = newCookiesPath;
        try {
          const cookies = JSON.parse(fs.readFileSync(newCookiesPath, 'utf8'));
          copy.cookieCount = Array.isArray(cookies) ? cookies.length : 0;
          copy.cookiesSavedAt = original.cookiesSavedAt;
        } catch {}
      }
    } catch (e) {}
  }

  profiles.push(copy);
  store.set('profiles', profiles);
  return copy;
});

function copyDirRecursive(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

// ─── IPC: Browser Launch ──────────────────────────────────────────────────────

ipcMain.handle('browser:launch', async (_, profileId) => {
  let profiles = store.get('profiles', []);
  let profile = profiles.find(p => p.id === profileId);
  if (!profile) throw new Error('Profile not found');

  if (runningInstances.has(profileId)) {
    throw new Error('Profile is already running.');
  }

  if (profile.status === 'running') {
    updateProfileStatus(profileId, 'stopped');
    profile = { ...profile, status: 'stopped' };
  }

  const settings = store.get('settings');
  const botBrowserPath = settings.botBrowserPath || DEFAULT_BOTBROWSER_PATH;

  if (!fs.existsSync(botBrowserPath)) {
    throw new Error(
      `BotBrowser executable not found at:\n${botBrowserPath}\n\nPlease install BotBrowser or update the path in Settings.`
    );
  }

  const userDataDir = path.join(settings.defaultUserDataDir, profileId);
  fs.mkdirSync(userDataDir, { recursive: true });

  const savedCookiesPath = path.join(userDataDir, 'saved-cookies.json');
  if (fs.existsSync(savedCookiesPath) && !profile.cookies) {
    profile = { ...profile, cookies: `@${savedCookiesPath}` };
  }

  let botProfileArg = '';
  if (profile.profileFilePath && fs.existsSync(profile.profileFilePath)) {
    botProfileArg = injectConfigsIntoEncFile(profile.profileFilePath, profile, profileId);
  } else if (profile.profileDirPath && fs.existsSync(profile.profileDirPath)) {
    botProfileArg = null;
  } else {
    botProfileArg = writeStandaloneConfigFile(profile, profileId);
  }

  const args = buildLaunchArgs(profile, userDataDir, botProfileArg);

  const proc = spawn(botBrowserPath, args, {
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...(IS_WIN ? { shell: false } : {})
  });

  const rdpArg = args.find(a => a.startsWith('--remote-debugging-port='));
  const remoteDebuggingPort = rdpArg ? parseInt(rdpArg.split('=')[1], 10) : null;

  const instance = {
    process: proc,
    pid: proc.pid,
    profileId,
    profileName: profile.name,
    startTime: new Date().toISOString(),
    url: profile.startUrl || 'about:blank',
    userDataDir,
    remoteDebuggingPort,
    args
  };

  runningInstances.set(profileId, instance);
  updateProfileStatus(profileId, 'running');

  proc.stdout.on('data', (_data) => {});
  proc.stderr.on('data', (_data) => {});

  proc.on('close', (code) => {
    runningInstances.delete(profileId);
    updateProfileStatus(profileId, 'stopped');
    cleanupTempFile(profileId);
    mainWindow?.webContents.send('instance:stopped', { profileId, code });
  });

  proc.on('error', (err) => {
    runningInstances.delete(profileId);
    updateProfileStatus(profileId, 'stopped');
    cleanupTempFile(profileId);
    mainWindow?.webContents.send('instance:error', { profileId, error: err.message });
  });

  mainWindow?.webContents.send('instance:started', { profileId, pid: proc.pid });
  return { pid: proc.pid, args };
});

ipcMain.handle('browser:stop', async (_, profileId) => {
  if (!runningInstances.has(profileId)) {
    updateProfileStatus(profileId, 'stopped');
    return false;
  }
  const inst = runningInstances.get(profileId);

  if (inst.remoteDebuggingPort) {
    try {
      await saveCookiesViaCDP(profileId, inst.remoteDebuggingPort, inst.userDataDir);
    } catch (e) {}
  }

  try { inst.process.kill(IS_WIN ? undefined : 'SIGTERM'); } catch {}
  runningInstances.delete(profileId);
  cleanupTempFile(profileId);
  updateProfileStatus(profileId, 'stopped');
  return true;
});

ipcMain.handle('browser:stopAll', async () => {
  const savePromises = [];
  for (const [profileId, inst] of runningInstances) {
    if (inst.remoteDebuggingPort) {
      savePromises.push(
        saveCookiesViaCDP(profileId, inst.remoteDebuggingPort, inst.userDataDir)
          .catch(_e => {})
      );
    }
  }
  await Promise.allSettled(savePromises);

  for (const [profileId, inst] of runningInstances) {
    try { inst.process.kill(IS_WIN ? undefined : 'SIGTERM'); } catch {}
    cleanupTempFile(profileId);
    updateProfileStatus(profileId, 'stopped');
  }
  runningInstances.clear();
  return true;
});

ipcMain.handle('browser:getRunning', () => {
  const result = [];
  for (const [profileId, inst] of runningInstances) {
    result.push({
      profileId,
      pid: inst.pid,
      profileName: inst.profileName,
      startTime: inst.startTime,
      url: inst.url
    });
  }
  return result;
});

// ─── IPC: Settings ────────────────────────────────────────────────────────────

ipcMain.handle('settings:get', () => store.get('settings'));
ipcMain.handle('settings:set', (_, newSettings) => {
  store.set('settings', { ...store.get('settings'), ...newSettings });
  return true;
});

// ─── IPC: Dialogs ─────────────────────────────────────────────────────────────

ipcMain.handle('dialog:openFile', async (_, options = {}) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: options.filters || [{ name: 'All Files', extensions: ['*'] }],
    ...options
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('dialog:saveFile', async (_, options = {}) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result.canceled ? null : result.filePath;
});

ipcMain.handle('dialog:selectExecutable', async () => {
  const filters = IS_WIN
    ? [{ name: 'Executable', extensions: ['exe'] }]
    : [{ name: 'All Files', extensions: ['*'] }];
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('dialog:selectDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('shell:openPath', (_, p) => shell.openPath(p));
ipcMain.handle('shell:showItemInFolder', (_, p) => shell.showItemInFolder(p));

// ─── IPC: Proxy / IP Check ────────────────────────────────────────────────────

/**
 * Parse a proxy URL string into { protocol, host, port, username, password }
 */
function parseProxy(proxyStr) {
  if (!proxyStr || !proxyStr.trim()) return null;
  let s = proxyStr.trim();
  // Strip accidental double-scheme e.g. "socks5://socks5://host:port"
  s = s.replace(/^(socks5?[ah]?|https?):\/\/(socks5?[ah]?|https?):\/\//i, '$1://');
  if (!/^[a-z][a-z0-9+\-.]*:\/\//i.test(s)) s = 'socks5://' + s;
  try {
    const u = new URL(s);
    const proto = u.protocol.replace(':', '').toLowerCase();
    const host = u.hostname;
    if (!host) return null;
    return {
      protocol: proto,
      host,
      port: parseInt(u.port) || (proto.startsWith('http') ? 8080 : 1080),
      username: u.username ? decodeURIComponent(u.username) : '',
      password: u.password ? decodeURIComponent(u.password) : '',
    };
  } catch { return null; }
}

/**
 * Connect through SOCKS5 proxy using raw TCP (no external deps).
 * Returns a socket connected to targetHost:targetPort via the proxy.
 */
function connectViaSocks5(proxyHost, proxyPort, targetHost, targetPort, username, password) {
  return new Promise((resolve, reject) => {
    const sock = net.connect(proxyPort, proxyHost, () => {
      // SOCKS5 greeting
      const authMethods = (username && password) ? [0x00, 0x02] : [0x00];
      const greeting = Buffer.from([0x05, authMethods.length, ...authMethods]);
      sock.write(greeting);
    });

    sock.setTimeout(15000);
    sock.on('timeout', () => { sock.destroy(); reject(new Error('SOCKS5 connect timeout')); });
    sock.on('error', reject);

    let state = 'greeting';
    let buf = Buffer.alloc(0);

    sock.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk]);

      if (state === 'greeting') {
        if (buf.length < 2) return;
        if (buf[0] !== 0x05) { sock.destroy(); reject(new Error('Not a SOCKS5 server')); return; }
        const method = buf[1];
        buf = buf.slice(2);

        if (method === 0xFF) { sock.destroy(); reject(new Error('SOCKS5: no acceptable auth method')); return; }

        if (method === 0x02) {
          // Username/password auth
          state = 'auth';
          const uBuf = Buffer.from(username || '', 'utf8');
          const pBuf = Buffer.from(password || '', 'utf8');
          const authPkt = Buffer.from([0x01, uBuf.length, ...uBuf, pBuf.length, ...pBuf]);
          sock.write(authPkt);
        } else {
          // No auth — send CONNECT
          state = 'connect';
          sendSocks5Connect(sock, targetHost, targetPort);
        }
        return;
      }

      if (state === 'auth') {
        if (buf.length < 2) return;
        if (buf[1] !== 0x00) { sock.destroy(); reject(new Error('SOCKS5 auth failed')); return; }
        buf = buf.slice(2);
        state = 'connect';
        sendSocks5Connect(sock, targetHost, targetPort);
        return;
      }

      if (state === 'connect') {
        if (buf.length < 10) return;  // minimum response
        if (buf[0] !== 0x05 || buf[1] !== 0x00) {
          const errCodes = { 1: 'General failure', 2: 'Connection not allowed', 3: 'Network unreachable', 4: 'Host unreachable', 5: 'Connection refused' };
          sock.destroy();
          reject(new Error('SOCKS5 connect error: ' + (errCodes[buf[1]] || `code ${buf[1]}`)));
          return;
        }
        // Success — socket is now connected to target
        state = 'done';
        sock.removeAllListeners('data');
        resolve({ socket: sock, remaining: buf.slice(10) });
      }
    });
  });
}

function sendSocks5Connect(sock, host, port) {
  const hostBuf = Buffer.from(host, 'utf8');
  const pkt = Buffer.from([
    0x05, 0x01, 0x00, 0x03,
    hostBuf.length, ...hostBuf,
    (port >> 8) & 0xFF, port & 0xFF
  ]);
  sock.write(pkt);
}

/**
 * Do an HTTP GET through a raw socket (used after SOCKS5 tunnel is established).
 */
function httpGetThroughSocket(socket, host, path, remainingData) {
  return new Promise((resolve, reject) => {
    let data = '';
    const req = `GET ${path} HTTP/1.1\r\nHost: ${host}\r\nConnection: close\r\nUser-Agent: BotBrowserControl/1.0\r\n\r\n`;
    socket.write(req);
    if (remainingData && remainingData.length > 0) {
      data += remainingData.toString();
    }
    socket.on('data', (chunk) => { data += chunk.toString(); });
    socket.on('end', () => {
      const bodyStart = data.indexOf('\r\n\r\n');
      const body = bodyStart !== -1 ? data.slice(bodyStart + 4) : data;
      try { resolve(JSON.parse(body)); } catch (e) { reject(new Error('Invalid JSON response from ip-api.com')); }
    });
    socket.on('error', reject);
  });
}

/**
 * Check proxy exit IP via ip-api.com.
 * Supports HTTP, HTTPS (CONNECT tunnel), SOCKS4, SOCKS5.
 */
ipcMain.handle('proxy:checkIp', async (_, proxyServer) => {
  const API_HOST = 'ip-api.com';
  const API_PATH = '/json/?fields=66846719';
  const API_PORT = 80;

  // No proxy — direct request
  if (!proxyServer || !proxyServer.trim()) {
    return doDirectHttpGet(`http://${API_HOST}${API_PATH}`);
  }

  const proxy = parseProxy(proxyServer);
  if (!proxy) throw new Error('Invalid proxy URL');

  const proto = proxy.protocol.toLowerCase();

  // SOCKS5 / SOCKS5H
  if (proto === 'socks5' || proto === 'socks5h' || proto === 'socks4' || proto === 'socks4a') {
    const { socket, remaining } = await connectViaSocks5(
      proxy.host, proxy.port, API_HOST, API_PORT,
      proxy.username, proxy.password
    );
    return httpGetThroughSocket(socket, API_HOST, API_PATH, remaining);
  }

  // HTTP / HTTPS proxy — use CONNECT tunnel
  return doHttpProxyIpCheck(proxy, API_HOST, API_PATH, API_PORT);
});

function doDirectHttpGet(url) {
  return new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('Request timeout')), 15000);
    const req = http.get(url, { headers: { 'User-Agent': 'BotBrowserControl/1.0' } }, (res) => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => {
        clearTimeout(to);
        try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid JSON')); }
      });
    });
    req.on('error', e => { clearTimeout(to); reject(e); });
    req.setTimeout(12000, () => { req.destroy(); clearTimeout(to); reject(new Error('Timeout')); });
  });
}

function doHttpProxyIpCheck(proxy, targetHost, targetPath, targetPort) {
  return new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('Proxy timeout')), 15000);

    const connectTarget = `${targetHost}:${targetPort}`;
    const headers = { 'User-Agent': 'BotBrowserControl/1.0' };
    if (proxy.username && proxy.password) {
      headers['Proxy-Authorization'] = 'Basic ' + Buffer.from(`${proxy.username}:${proxy.password}`).toString('base64');
    }

    const connectReq = http.request({
      method: 'CONNECT',
      hostname: proxy.host,
      port: proxy.port,
      path: connectTarget,
      headers,
    });

    connectReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        clearTimeout(to);
        reject(new Error(`Proxy CONNECT rejected: ${res.statusCode}`));
        return;
      }
      const req = `GET ${targetPath} HTTP/1.1\r\nHost: ${targetHost}\r\nConnection: close\r\nUser-Agent: BotBrowserControl/1.0\r\n\r\n`;
      socket.write(req);
      let data = '';
      socket.on('data', d => { data += d.toString(); });
      socket.on('end', () => {
        clearTimeout(to);
        const bodyStart = data.indexOf('\r\n\r\n');
        const body = bodyStart !== -1 ? data.slice(bodyStart + 4) : data;
        try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); }
      });
      socket.on('error', e => { clearTimeout(to); reject(e); });
    });

    connectReq.on('error', e => { clearTimeout(to); reject(e); });
    connectReq.setTimeout(12000, () => { connectReq.destroy(); clearTimeout(to); reject(new Error('Connect timeout')); });
    connectReq.end();
  });
}

// ─── IPC: Update Checker ──────────────────────────────────────────────────────

const BOTBROWSER_RELEASES_API = 'https://api.github.com/repos/botswin/BotBrowser/releases/latest';
const CONTROL_RELEASES_API    = 'https://api.github.com/repos/tombaki/BotBrowser/releases/latest';
const CONTROL_VERSION         = '1.2.1';

ipcMain.handle('app:checkForUpdates', async () => {
  const results = { kernel: null, control: null };

  try {
    const kernelRes = await httpsGet(BOTBROWSER_RELEASES_API);
    if (kernelRes.statusCode === 200) {
      const release = JSON.parse(kernelRes.body);
      results.kernel = {
        tagName: release.tag_name,
        name: release.name || release.tag_name,
        publishedAt: release.published_at,
        url: release.html_url,
      };
    }
  } catch {}

  try {
    const controlRes = await httpsGet(CONTROL_RELEASES_API);
    if (controlRes.statusCode === 200) {
      const release = JSON.parse(controlRes.body);
      const tag = release.tag_name || '';
      const remoteVer = tag.replace(/^control-v/, '');
      results.control = {
        tagName: tag,
        version: remoteVer,
        name: release.name || tag,
        publishedAt: release.published_at,
        url: release.html_url,
        isNewer: remoteVer !== CONTROL_VERSION && remoteVer > CONTROL_VERSION,
      };
    }
  } catch {}

  // Persist last seen so we can detect "new since last check"
  const lastKernel  = store.get('lastSeenKernelRelease');
  const lastControl = store.get('lastSeenControlRelease');

  const newKernel  = results.kernel  && results.kernel.tagName  !== lastKernel;
  const newControl = results.control && results.control.tagName !== lastControl && results.control.isNewer;

  if (results.kernel?.tagName)  store.set('lastSeenKernelRelease',  results.kernel.tagName);
  if (results.control?.tagName) store.set('lastSeenControlRelease', results.control.tagName);

  results.newKernel  = newKernel;
  results.newControl = newControl;

  return results;
});

// ─── IPC: Kernel Manager ──────────────────────────────────────────────────────

const KERNEL_GITHUB_API = 'https://api.github.com/repos/botswin/BotBrowser/releases';

function httpsGet(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) { reject(new Error('Too many redirects')); return; }
    const req = https.get(url, {
      headers: {
        'User-Agent': 'BotBrowserControl/1.0',
        'Accept': 'application/vnd.github+json',
      }
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const location = res.headers.location;
        res.resume();
        if (!location) { reject(new Error('Redirect without location')); return; }
        resolve(httpsGet(location, redirectCount + 1));
        return;
      }
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

ipcMain.handle('kernel:fetchReleases', async () => {
  const res = await httpsGet(KERNEL_GITHUB_API);
  if (res.statusCode !== 200) throw new Error(`GitHub API error: ${res.statusCode}`);
  const releases = JSON.parse(res.body);
  const mapped = releases.slice(0, 20).map(r => ({
    id: r.id,
    tagName: r.tag_name,
    name: r.name || r.tag_name,
    publishedAt: r.published_at,
    prerelease: r.prerelease,
    body: (r.body || '').slice(0, 500),
    assets: (r.assets || []).map(a => ({
      id: a.id,
      name: a.name,
      size: a.size,
      downloadUrl: a.browser_download_url,
      contentType: a.content_type,
    }))
  }));
  // Cache releases to store so they persist across restarts
  store.set('cachedKernelReleases', mapped);
  return mapped;
});

// Return cached releases (fast, no network)
ipcMain.handle('kernel:getCachedReleases', () => {
  return store.get('cachedKernelReleases', null);
});

function getKernelsDir() {
  return path.join(app.getPath('userData'), 'kernels');
}

ipcMain.handle('kernel:getDir', () => getKernelsDir());

ipcMain.handle('kernel:listInstalled', () => {
  const dir = getKernelsDir();
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => {
      const vdir = path.join(dir, e.name);
      const meta = path.join(vdir, '.meta.json');
      let info = { version: e.name, installedAt: null, platform: null, execPath: null };
      if (fs.existsSync(meta)) {
        try { info = { ...info, ...JSON.parse(fs.readFileSync(meta, 'utf8')) }; } catch {}
      }
      return info;
    });
});

ipcMain.handle('kernel:delete', (_, version) => {
  const dir = path.join(getKernelsDir(), version);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    return true;
  }
  return false;
});

/**
 * Download a kernel asset, then auto-install it.
 * - macOS .dmg: mount with hdiutil, copy .app to /Applications (xattr -rd + codesign -f)
 * - Linux .deb: install with dpkg -i (requires sudo) or just mark as ready
 * - Linux .AppImage: chmod +x
 * - Windows .7z/.zip: extract with built-in tools
 */
ipcMain.handle('kernel:download', async (_, { downloadUrl, fileName, version }) => {
  const kernelsDir = getKernelsDir();
  const versionDir = path.join(kernelsDir, version);
  fs.mkdirSync(versionDir, { recursive: true });

  const destPath = path.join(versionDir, fileName);

  // Download first
  await new Promise((resolve, reject) => {
    function doDownload(url, redirectCount) {
      if (redirectCount > 5) { reject(new Error('Too many redirects')); return; }
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      const req = protocol.get(url, { headers: { 'User-Agent': 'BotBrowserControl/1.0' } }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          const location = res.headers.location;
          res.resume();
          if (!location) { reject(new Error('Redirect without location')); return; }
          doDownload(location, redirectCount + 1);
          return;
        }
        if (res.statusCode !== 200) { reject(new Error(`Download failed: HTTP ${res.statusCode}`)); return; }

        const total = parseInt(res.headers['content-length'] || '0', 10);
        let downloaded = 0;
        const fileStream = fs.createWriteStream(destPath);

        res.on('data', (chunk) => {
          downloaded += chunk.length;
          if (total > 0) {
            const progress = Math.round((downloaded / total) * 100);
            mainWindow?.webContents.send('kernel:downloadProgress', { version, progress, downloaded, total });
          }
        });

        res.pipe(fileStream);
        fileStream.on('finish', () => { fileStream.close(resolve); });
        fileStream.on('error', reject);
      });
      req.on('error', reject);
      req.setTimeout(180000, () => { req.destroy(); reject(new Error('Download timeout')); });
    }
    doDownload(downloadUrl, 0);
  });

  // Auto-install
  let execPath = null;
  let installStatus = 'downloaded';
  let installNote = '';

  try {
    if (IS_MAC && fileName.endsWith('.dmg')) {
      // Mount DMG, copy .app to /Applications, unmount
      const mountResult = await runCmd('hdiutil', ['attach', '-nobrowse', '-noverify', '-noautoopen', destPath]);
      // Find mount point from output (last line with /Volumes/)
      const mountPoint = (mountResult.stdout || '').split('\n')
        .map(l => l.trim())
        .filter(l => l.includes('/Volumes/'))
        .pop()?.split(/\s+/).pop();

      if (mountPoint && fs.existsSync(mountPoint)) {
        // Find .app bundle in mount
        const apps = fs.readdirSync(mountPoint).filter(f => f.endsWith('.app'));
        if (apps.length > 0) {
          const appName = apps[0];
          const srcApp = path.join(mountPoint, appName);
          const dstApp = path.join('/Applications', appName);

          // Remove old if exists
          if (fs.existsSync(dstApp)) {
            await runCmd('rm', ['-rf', dstApp]);
          }

          // Copy .app to /Applications
          await runCmd('cp', ['-R', srcApp, '/Applications/']);

          // Remove quarantine flag (xattr) so unsigned app can open
          try { await runCmd('xattr', ['-rd', 'com.apple.quarantine', dstApp]); } catch {}
          // Ad-hoc codesign to allow launch
          try { await runCmd('codesign', ['--force', '--deep', '--sign', '-', dstApp]); } catch {}

          // Find the actual executable inside .app
          const infoPlistPath = path.join(dstApp, 'Contents', 'Info.plist');
          let execName = 'Chromium';
          if (fs.existsSync(infoPlistPath)) {
            const plistContent = fs.readFileSync(infoPlistPath, 'utf8');
            const match = plistContent.match(/<key>CFBundleExecutable<\/key>\s*<string>([^<]+)<\/string>/);
            if (match) execName = match[1];
          }
          execPath = path.join(dstApp, 'Contents', 'MacOS', execName);
          installStatus = 'installed';
          installNote = `Installed to /Applications/${appName}`;
        }
        // Unmount
        try { await runCmd('hdiutil', ['detach', mountPoint, '-quiet']); } catch {}
      }
    } else if (IS_LINUX && fileName.endsWith('.AppImage')) {
      fs.chmodSync(destPath, 0o755);
      execPath = destPath;
      installStatus = 'ready';
      installNote = 'AppImage is ready to use';
    } else if (IS_LINUX && fileName.endsWith('.deb')) {
      // Try to install with pkexec/sudo dpkg
      try {
        await runCmd('pkexec', ['dpkg', '-i', destPath]);
        installStatus = 'installed';
        installNote = 'Installed via dpkg';
        execPath = '/usr/bin/botbrowser';
      } catch {
        installStatus = 'downloaded';
        installNote = `Run: sudo dpkg -i ${destPath}`;
        execPath = null;
      }
    } else if (IS_WIN && (fileName.endsWith('.zip') || fileName.endsWith('.7z'))) {
      // Extract to versionDir
      if (fileName.endsWith('.zip')) {
        await runCmd('powershell', ['-Command', `Expand-Archive -Force -Path "${destPath}" -DestinationPath "${versionDir}"`]);
      }
      // Find .exe
      const exes = findFilesRecursive(versionDir, '.exe').filter(f => !f.includes('Uninstall'));
      execPath = exes[0] || null;
      installStatus = 'extracted';
      installNote = 'Extracted successfully';
    } else if (IS_WIN && fileName.endsWith('.exe')) {
      execPath = destPath;
      installStatus = 'ready';
      installNote = 'Installer ready — run to install';
    }
  } catch (installErr) {
    installNote = `Install step failed: ${installErr.message}`;
  }

  const meta = {
    version, installedAt: new Date().toISOString(),
    platform: process.platform, fileName, execPath, downloadUrl,
    installStatus, installNote,
  };
  fs.writeFileSync(path.join(versionDir, '.meta.json'), JSON.stringify(meta, null, 2), 'utf8');

  mainWindow?.webContents.send('kernel:downloadComplete', { version, execPath, destPath, installStatus, installNote });
  return { version, execPath, destPath, installStatus, installNote };
});

function runCmd(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = execFile(cmd, args, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve({ stdout, stderr });
    });
  });
}

function findFilesRecursive(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findFilesRecursive(full, ext));
    else if (entry.name.toLowerCase().endsWith(ext)) results.push(full);
  }
  return results;
}

// ─── Config File Helpers ──────────────────────────────────────────────────────

function writeStandaloneConfigFile(profile, profileId) {
  const configs = buildConfigsBlock(profile);
  const json = JSON.stringify({ configs }, null, 2);
  const tmpPath = path.join(os.tmpdir(), `botbrowser-config-${profileId}.json`);
  fs.writeFileSync(tmpPath, json, 'utf8');
  tempFiles.set(profileId, tmpPath);
  return tmpPath;
}

function injectConfigsIntoEncFile(encFilePath, profile, profileId) {
  try {
    const raw = fs.readFileSync(encFilePath, 'utf8');
    const enc = JSON.parse(raw);
    enc.configs = buildConfigsBlock(profile);
    const tmpPath = path.join(os.tmpdir(), `botbrowser-enc-${profileId}.json`);
    fs.writeFileSync(tmpPath, JSON.stringify(enc, null, 2), 'utf8');
    tempFiles.set(profileId, tmpPath);
    return tmpPath;
  } catch (e) {
    return writeStandaloneConfigFile(profile, profileId);
  }
}

function cleanupTempFile(profileId) {
  const p = tempFiles.get(profileId);
  if (p && fs.existsSync(p)) {
    try { fs.unlinkSync(p); } catch {}
  }
  tempFiles.delete(profileId);
}

function buildConfigsBlock(profile) {
  const configs = {};

  if (profile.locale) configs.locale = profile.locale;
  if (profile.languages) configs.languages = profile.languages;
  if (profile.timezone) configs.timezone = profile.timezone;

  if (profile.location) {
    if (typeof profile.location === 'string' && /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(profile.location.trim())) {
      const [lat, lon] = profile.location.split(',').map(Number);
      configs.location = { latitude: lat, longitude: lon };
    } else {
      configs.location = profile.location;
    }
  }

  if (profile.colorScheme) configs.colorScheme = profile.colorScheme;
  if (profile.browserBrand) configs.browserBrand = profile.browserBrand;
  if (profile.brandFullVersion) configs.brandFullVersion = profile.brandFullVersion;
  if (profile.uaFullVersion) configs.uaFullVersion = profile.uaFullVersion;

  if (profile.platform) configs.platform = profile.platform;
  if (profile.platformVersion) configs.platformVersion = profile.platformVersion;
  if (profile.model) configs.model = profile.model;
  if (profile.architecture) configs.architecture = profile.architecture;
  if (profile.bitness) configs.bitness = profile.bitness;
  if (profile.mobile !== undefined && profile.mobile !== '') configs.mobile = !!profile.mobile;

  if (profile.proxyServer) {
    configs.proxy = { server: profile.proxyServer };
    if (profile.proxyIp) configs.proxy.ip = profile.proxyIp;
  }

  if (profile.customHeaders && typeof profile.customHeaders === 'object' && Object.keys(profile.customHeaders).length > 0) {
    configs.customHeaders = profile.customHeaders;
  }

  if (profile.windowSize) configs.window = profile.windowSize;
  if (profile.screenSize) configs.screen = profile.screenSize;
  if (profile.orientation) configs.orientation = profile.orientation;
  if (profile.disableDeviceScaleFactorOnGUI) configs.disableDeviceScaleFactorOnGUI = true;

  if (profile.webgl) configs.webgl = profile.webgl;
  if (profile.webgpu) configs.webgpu = profile.webgpu;
  if (profile.webrtc) configs.webrtc = profile.webrtc;
  if (profile.webrtcICE) configs.webrtcICE = profile.webrtcICE;
  if (profile.speechVoices) configs.speechVoices = profile.speechVoices;
  if (profile.mediaDevices) configs.mediaDevices = profile.mediaDevices;
  if (profile.mediaTypes) configs.mediaTypes = profile.mediaTypes;
  if (profile.fonts) configs.fonts = profile.fonts;
  if (profile.keyboard) configs.keyboard = profile.keyboard;

  if (profile.noiseCanvas !== undefined && profile.noiseCanvas !== '') configs.noiseCanvas = !!profile.noiseCanvas;
  if (profile.noiseWebglImage !== undefined && profile.noiseWebglImage !== '') configs.noiseWebglImage = !!profile.noiseWebglImage;
  if (profile.noiseAudioContext !== undefined && profile.noiseAudioContext !== '') configs.noiseAudioContext = !!profile.noiseAudioContext;
  if (profile.noiseClientRects !== undefined && profile.noiseClientRects !== '') configs.noiseClientRects = !!profile.noiseClientRects;
  if (profile.noiseTextRects !== undefined && profile.noiseTextRects !== '') configs.noiseTextRects = !!profile.noiseTextRects;

  if (profile.alwaysActive !== undefined) configs.alwaysActive = !!profile.alwaysActive;
  if (profile.disableDebugger !== undefined) configs.disableDebugger = !!profile.disableDebugger;
  if (profile.disableConsoleMessage !== undefined) configs.disableConsoleMessage = !!profile.disableConsoleMessage;
  if (profile.portProtection !== undefined) configs.portProtection = !!profile.portProtection;
  if (profile.mobileForceTouch !== undefined) configs.mobileForceTouch = !!profile.mobileForceTouch;
  if (profile.networkInfoOverride !== undefined) configs.networkInfoOverride = !!profile.networkInfoOverride;
  if (profile.enableVariationsInContext !== undefined) configs.enableVariationsInContext = !!profile.enableVariationsInContext;

  if (profile.injectRandomHistory !== undefined && profile.injectRandomHistory !== '') {
    const v = profile.injectRandomHistory;
    if (v === true || v === 'true') configs.injectRandomHistory = true;
    else if (v === false || v === 'false') configs.injectRandomHistory = false;
    else if (!isNaN(Number(v))) configs.injectRandomHistory = Number(v);
  }

  if (profile.fps !== undefined && profile.fps !== '' && profile.fps !== 'profile') configs.fps = isNaN(Number(profile.fps)) ? profile.fps : Number(profile.fps);
  if (profile.timeScale !== undefined && profile.timeScale !== '') { const ts = parseFloat(profile.timeScale); if (!isNaN(ts)) configs.timeScale = ts; }
  if (profile.noiseSeed !== undefined && profile.noiseSeed !== '') { const ns = parseInt(profile.noiseSeed); if (!isNaN(ns)) configs.noiseSeed = ns; }
  if (profile.timeSeed !== undefined && profile.timeSeed !== '') { const ts = parseInt(profile.timeSeed); if (!isNaN(ts)) configs.timeSeed = ts; }
  if (profile.stackSeed !== undefined && profile.stackSeed !== '') {
    const ss = profile.stackSeed;
    if (ss === 'profile' || ss === 'real') configs.stackSeed = ss;
    else if (!isNaN(parseInt(ss))) configs.stackSeed = parseInt(ss);
  }

  return configs;
}

function buildLaunchArgs(profile, userDataDir, botProfileArg) {
  const args = [];

  if (botProfileArg) args.push(`--bot-profile=${botProfileArg}`);
  if (profile.profileDirPath && fs.existsSync(profile.profileDirPath)) {
    args.push(`--bot-profile-dir=${profile.profileDirPath}`);
  }

  args.push(`--user-data-dir=${userDataDir}`);
  args.push('--restore-last-session');
  args.push(`--no-first-run`);

  if (profile.name) args.push(`--bot-title=${profile.name}`);

  if (profile.proxyServer && profile.proxyServer.trim()) args.push(`--proxy-server=${profile.proxyServer.trim()}`);
  if (profile.proxyIp && profile.proxyIp.trim()) args.push(`--proxy-ip=${profile.proxyIp.trim()}`);
  if (profile.proxyBypassRgx && profile.proxyBypassRgx.trim()) args.push(`--proxy-bypass-rgx=${profile.proxyBypassRgx.trim()}`);

  if (profile.browserBrand && profile.browserBrand !== '') args.push(`--bot-browser-brand=${profile.browserBrand}`);
  if (profile.brandFullVersion && profile.brandFullVersion !== '') args.push(`--bot-brand-full-version=${profile.brandFullVersion}`);
  if (profile.uaFullVersion && profile.uaFullVersion !== '') args.push(`--bot-ua-full-version=${profile.uaFullVersion}`);
  if (profile.userAgent && profile.userAgent.trim()) args.push(`--user-agent=${profile.userAgent.trim()}`);

  if (profile.locale && profile.locale !== '') args.push(`--bot-locale=${profile.locale}`);
  if (profile.timezone && profile.timezone !== '') args.push(`--bot-timezone=${profile.timezone}`);
  if (profile.languages && profile.languages !== '') args.push(`--bot-languages=${profile.languages}`);
  if (profile.location && profile.location !== '') args.push(`--bot-location=${profile.location}`);
  if (profile.colorScheme) args.push(`--bot-color-scheme=${profile.colorScheme}`);

  if (profile.platform && profile.platform !== '') args.push(`--bot-platform=${profile.platform}`);
  if (profile.platformVersion) args.push(`--bot-platform-version=${profile.platformVersion}`);
  if (profile.model) args.push(`--bot-model=${profile.model}`);
  if (profile.architecture) args.push(`--bot-architecture=${profile.architecture}`);
  if (profile.bitness) args.push(`--bot-bitness=${profile.bitness}`);
  if (profile.mobile !== undefined && profile.mobile !== '') args.push(`--bot-mobile=${!!profile.mobile}`);

  if (profile.windowSize) args.push(`--bot-window=${profile.windowSize}`);
  if (profile.screenSize) args.push(`--bot-screen=${profile.screenSize}`);
  if (profile.dprMode) args.push(`--bot-dpr=${profile.dprMode}`);
  if (profile.orientation) args.push(`--bot-orientation=${profile.orientation}`);
  if (profile.keyboard) args.push(`--bot-keyboard=${profile.keyboard}`);
  if (profile.fonts) args.push(`--bot-fonts=${profile.fonts}`);
  if (profile.disableDeviceScaleFactorOnGUI) args.push('--bot-disable-device-scale-factor');

  if (profile.webgl) args.push(`--bot-webgl=${profile.webgl}`);
  if (profile.webgpu) args.push(`--bot-webgpu=${profile.webgpu}`);
  if (profile.webrtc) args.push(`--bot-webrtc=${profile.webrtc}`);
  if (profile.speechVoices) args.push(`--bot-speech-voices=${profile.speechVoices}`);
  if (profile.mediaDevices) args.push(`--bot-media-devices=${profile.mediaDevices}`);
  if (profile.mediaTypes) args.push(`--bot-media-types=${profile.mediaTypes}`);

  if (profile.noiseCanvas !== undefined && profile.noiseCanvas !== '') args.push(`--bot-noise-canvas=${!!profile.noiseCanvas}`);
  if (profile.noiseWebglImage !== undefined && profile.noiseWebglImage !== '') args.push(`--bot-noise-webgl-image=${!!profile.noiseWebglImage}`);
  if (profile.noiseAudioContext !== undefined && profile.noiseAudioContext !== '') args.push(`--bot-noise-audio-context=${!!profile.noiseAudioContext}`);
  if (profile.noiseClientRects !== undefined && profile.noiseClientRects !== '') args.push(`--bot-noise-client-rects=${!!profile.noiseClientRects}`);
  if (profile.noiseTextRects !== undefined && profile.noiseTextRects !== '') args.push(`--bot-noise-text-rects=${!!profile.noiseTextRects}`);

  if (profile.disableDebugger === true || profile.disableDebugger === 'true') args.push('--bot-disable-debugger');
  if (!(profile.disableConsoleMessage === false || profile.disableConsoleMessage === 'false')) args.push('--bot-disable-console-message');
  args.push('--bot-always-active');
  if (profile.portProtection === true || profile.portProtection === 'true') args.push('--bot-port-protection');
  if (profile.localDns === true || profile.localDns === 'true') args.push('--bot-local-dns');
  if (profile.mobileForceTouch === true || profile.mobileForceTouch === 'true') args.push('--bot-mobile-force-touch');
  if (profile.enableVariationsInContext === true || profile.enableVariationsInContext === 'true') args.push('--bot-enable-variations-in-context');
  if (profile.networkInfoOverride === true || profile.networkInfoOverride === 'true') args.push('--bot-network-info-override');

  if (profile.injectRandomHistory !== undefined && profile.injectRandomHistory !== '') {
    const v = profile.injectRandomHistory;
    if (v === true || v === 'true') args.push('--bot-inject-random-history=true');
    else if (v !== false && v !== 'false' && !isNaN(Number(v))) args.push(`--bot-inject-random-history=${Number(v)}`);
  }

  if (profile.webrtcICE && profile.webrtcICE !== 'profile' && profile.webrtcICE !== '') {
    args.push(`--bot-webrtc-ice=${profile.webrtcICE}`);
  }

  if (profile.noiseSeed !== undefined && profile.noiseSeed !== '') { const ns = parseInt(profile.noiseSeed); if (!isNaN(ns) && ns >= 0) args.push(`--bot-noise-seed=${ns}`); }
  if (profile.timeSeed !== undefined && profile.timeSeed !== '') { const ts = parseInt(profile.timeSeed); if (!isNaN(ts) && ts >= 0) args.push(`--bot-time-seed=${ts}`); }
  if (profile.stackSeed !== undefined && profile.stackSeed !== '') {
    const ss = profile.stackSeed;
    if (ss === 'profile' || ss === 'real') args.push(`--bot-stack-seed=${ss}`);
    else if (!isNaN(parseInt(ss))) args.push(`--bot-stack-seed=${parseInt(ss)}`);
  }
  if (profile.timeScale !== undefined && profile.timeScale !== '') { const ts = parseFloat(profile.timeScale); if (!isNaN(ts) && ts > 0 && ts < 1) args.push(`--bot-time-scale=${ts}`); }
  if (profile.fps !== undefined && profile.fps !== '' && profile.fps !== 'profile') args.push(`--bot-fps=${profile.fps}`);

  if (profile.gpuEmulation === false || profile.gpuEmulation === 'false') args.push('--bot-gpu-emulation=false');

  if (profile.customHeaders && typeof profile.customHeaders === 'object' && Object.keys(profile.customHeaders).length > 0) {
    args.push('--bot-custom-headers=' + JSON.stringify(profile.customHeaders));
  }

  if (profile.ipService) args.push(`--bot-ip-service=${profile.ipService}`);

  if (profile.mirrorController) args.push(`--bot-mirror-controller-endpoint=${profile.mirrorController}`);
  if (profile.mirrorClient) args.push(`--bot-mirror-client-endpoint=${profile.mirrorClient}`);

  if (profile.canvasRecordFile) args.push(`--bot-canvas-record-file=${profile.canvasRecordFile}`);
  if (profile.audioRecordFile) args.push(`--bot-audio-record-file=${profile.audioRecordFile}`);

  if (profile.botScript) args.push(`--bot-script=${profile.botScript}`);

  if (profile.remoteDebuggingPort) args.push(`--remote-debugging-port=${profile.remoteDebuggingPort}`);

  if (profile.cookies && profile.cookies.trim()) {
    const cookieVal = profile.cookies.trim();
    if (cookieVal.startsWith('@')) {
      args.push(`--bot-cookies=${cookieVal}`);
    } else {
      try { JSON.parse(cookieVal); args.push('--bot-cookies=' + cookieVal); } catch {; }
    }
  }

  if (profile.bookmarks && profile.bookmarks.trim()) {
    try { JSON.parse(profile.bookmarks.trim()); args.push('--bot-bookmarks=' + profile.bookmarks.trim()); } catch {; }
  }

  if (profile.startUrl && profile.startUrl.trim()) args.push(profile.startUrl.trim());

  return args;
}

// ─── CDP Cookie Save ──────────────────────────────────────────────────────────

async function saveCookiesViaCDP(profileId, port, userDataDir) {
  const cookies = await fetchCookiesViaCDP(port);
  if (!Array.isArray(cookies)) return;

  const savePath = path.join(userDataDir, 'saved-cookies.json');
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.writeFileSync(savePath, JSON.stringify(cookies, null, 2), 'utf8');

  const profiles = store.get('profiles', []);
  const idx = profiles.findIndex(p => p.id === profileId);
  if (idx !== -1) {
    profiles[idx].cookieCount = cookies.length;
    profiles[idx].cookiesSavedAt = new Date().toISOString();
    profiles[idx].savedCookiesPath = savePath;
    store.set('profiles', profiles);
  }

  mainWindow?.webContents.send('profile:cookiesSaved', { profileId, count: cookies.length, path: savePath });
}

function fetchCookiesViaCDP(port) {
  return new Promise((resolve, reject) => {
    const crypto = require('crypto');
    const timeout = setTimeout(() => reject(new Error('CDP timeout')), 5000);

    const httpClient = net.createConnection({ port, host: '127.0.0.1' }, () => {
      httpClient.write('GET /json/list HTTP/1.1\r\nHost: 127.0.0.1:' + port + '\r\nConnection: close\r\n\r\n');
    });
    let httpData = '';
    httpClient.on('data', d => { httpData += d.toString(); });
    httpClient.on('end', () => {
      try {
        const body = httpData.slice(httpData.indexOf('\r\n\r\n') + 4);
        const tabs = JSON.parse(body);
        const tab = tabs.find(t => t.type === 'page') || tabs[0];
        if (!tab?.webSocketDebuggerUrl) { clearTimeout(timeout); reject(new Error('No debuggable tab')); return; }
        const wsPath = tab.webSocketDebuggerUrl.replace(/^ws:\/\/[^/]+/, '');

        const wsClient = net.createConnection({ port, host: '127.0.0.1' }, () => {
          const key = crypto.randomBytes(16).toString('base64');
          wsClient.write('GET ' + wsPath + ' HTTP/1.1\r\nHost: 127.0.0.1:' + port + '\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ' + key + '\r\nSec-WebSocket-Version: 13\r\n\r\n');
        });

        let wsHandshakeDone = false, wsBuffer = Buffer.alloc(0);

        function sendWsFrame(payload) {
          const data = Buffer.from(JSON.stringify(payload));
          const maskKey = crypto.randomBytes(4);
          const masked = Buffer.alloc(data.length);
          for (let i = 0; i < data.length; i++) masked[i] = data[i] ^ maskKey[i % 4];
          let header;
          if (data.length < 126) { header = Buffer.alloc(6); header[0] = 0x81; header[1] = 0x80 | data.length; maskKey.copy(header, 2); }
          else if (data.length < 65536) { header = Buffer.alloc(8); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(data.length, 2); maskKey.copy(header, 4); }
          else { header = Buffer.alloc(14); header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(data.length), 2); maskKey.copy(header, 10); }
          wsClient.write(Buffer.concat([header, masked]));
        }

        function parseWsFrames(buf) {
          const messages = []; let offset = 0;
          while (offset + 2 <= buf.length) {
            const b1 = buf[offset + 1]; const isMasked = (b1 & 0x80) !== 0;
            let payloadLen = b1 & 0x7f, headerLen = 2;
            if (payloadLen === 126) { if (offset + 4 > buf.length) break; payloadLen = buf.readUInt16BE(offset + 2); headerLen = 4; }
            else if (payloadLen === 127) { if (offset + 10 > buf.length) break; payloadLen = Number(buf.readBigUInt64BE(offset + 2)); headerLen = 10; }
            const maskLen = isMasked ? 4 : 0;
            const frameEnd = offset + headerLen + maskLen + payloadLen;
            if (frameEnd > buf.length) break;
            let payload = buf.slice(offset + headerLen + maskLen, frameEnd);
            if (isMasked) { const mask = buf.slice(offset + headerLen, offset + headerLen + 4); payload = Buffer.from(payload); for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4]; }
            messages.push(payload.toString('utf8')); offset = frameEnd;
          }
          return { messages, remaining: buf.slice(offset) };
        }

        wsClient.on('data', (chunk) => {
          if (!wsHandshakeDone) {
            if (chunk.indexOf('\r\n\r\n') !== -1) {
              wsHandshakeDone = true;
              const rest = chunk.slice(chunk.indexOf('\r\n\r\n') + 4);
              if (rest.length > 0) wsBuffer = Buffer.concat([wsBuffer, rest]);
              sendWsFrame({ id: 1, method: 'Network.getAllCookies', params: {} });
            }
            return;
          }
          wsBuffer = Buffer.concat([wsBuffer, chunk]);
          const { messages, remaining } = parseWsFrames(wsBuffer);
          wsBuffer = remaining;
          for (const msg of messages) {
            try {
              const parsed = JSON.parse(msg);
              if (parsed.id === 1 && parsed.result?.cookies) {
                clearTimeout(timeout); wsClient.destroy(); resolve(parsed.result.cookies); return;
              }
            } catch {}
          }
        });
        wsClient.on('error', e => { clearTimeout(timeout); reject(e); });
      } catch (e) { clearTimeout(timeout); reject(e); }
    });
    httpClient.on('error', e => { clearTimeout(timeout); reject(e); });
  });
}

// ─── Profile Status ───────────────────────────────────────────────────────────

function updateProfileStatus(profileId, status) {
  const profiles = store.get('profiles', []);
  const idx = profiles.findIndex(p => p.id === profileId);
  if (idx !== -1) {
    profiles[idx].status = status;
    store.set('profiles', profiles);
    mainWindow?.webContents.send('profile:statusChanged', { profileId, status });
  }
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark';

  const profiles = store.get('profiles', []);
  const hadStale = profiles.some(p => p.status === 'running');
  if (hadStale) {
    store.set('profiles', profiles.map(p =>
      p.status === 'running' ? { ...p, status: 'stopped' } : p
    ));
  }

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  for (const [, inst] of runningInstances) { try { inst.process.kill(); } catch {} }
  for (const [profileId] of tempFiles) { cleanupTempFile(profileId); }
  if (!IS_MAC) app.quit();
});

app.on('before-quit', () => {
  for (const [, inst] of runningInstances) { try { inst.process.kill(); } catch {} }
  for (const [profileId] of tempFiles) { cleanupTempFile(profileId); }
});
