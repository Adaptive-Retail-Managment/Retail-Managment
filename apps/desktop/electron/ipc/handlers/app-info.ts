import { app, ipcMain } from 'electron';
import { IPC_CHANNELS, type AppInfo } from '../contracts';

export function registerAppInfoHandler(): void {
  ipcMain.handle(IPC_CHANNELS.getAppInfo, (): AppInfo => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      platform: process.platform,
    };
  });
}
