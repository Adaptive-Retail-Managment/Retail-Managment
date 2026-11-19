export const IPC_CHANNELS = {
  getAppInfo: 'app:get-info',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

export interface AppInfo {
  name: string;
  version: string;
  electron: string;
  chrome: string;
  node: string;
  platform: string;
}

export interface DesktopApi {
  getAppInfo: () => Promise<AppInfo>;
}
