import path from 'node:path';
import { app, BrowserWindow } from 'electron';
import { registerAppInfoHandler } from '../ipc/handlers/app-info';
import { getRendererTarget } from './renderer-target';
import { hardenSession, hardenWindowContents } from './security';

const isDev = process.argv.includes('--dev');
const devServerUrl = isDev ? (process.env.WEB_DEV_URL ?? 'http://localhost:5173') : undefined;

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0f141a',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
    },
  });

  window.once('ready-to-show', () => window.show());

  const target = getRendererTarget({ isDev, devServerUrl, mainDir: __dirname });

  if (target.kind === 'url') {
    void window.loadURL(target.value);
  } else {
    void window.loadFile(target.value);
  }

  return window;
}

// Renders are only ever created by this process.
app.on('web-contents-created', (_event, contents) => {
  hardenWindowContents(contents, { devServerUrl });
});

app.whenReady().then(() => {
  hardenSession();
  registerAppInfoHandler();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
