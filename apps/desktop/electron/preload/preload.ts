import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, type AppInfo, type DesktopApi } from '../ipc/contracts';
import { assertAllowedChannel } from './allowed-channels';

const api: DesktopApi = {
  getAppInfo: (): Promise<AppInfo> => {
    assertAllowedChannel(IPC_CHANNELS.getAppInfo);
    return ipcRenderer.invoke(IPC_CHANNELS.getAppInfo);
  },
};

// Only this explicit, frozen surface is exposed to the renderer. No raw
// ipcRenderer, no Node primitives.
contextBridge.exposeInMainWorld('desktop', Object.freeze(api));
