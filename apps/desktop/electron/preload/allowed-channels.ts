import { IPC_CHANNELS, type IpcChannel } from '../ipc/contracts';

/** Every channel the renderer may reach, in both directions. */
export const ALLOWED_IPC_CHANNELS: readonly IpcChannel[] = Object.values(IPC_CHANNELS);

export function isAllowedChannel(channel: string): channel is IpcChannel {
  return (ALLOWED_IPC_CHANNELS as readonly string[]).includes(channel);
}

export function assertAllowedChannel(channel: string): asserts channel is IpcChannel {
  if (!isAllowedChannel(channel)) {
    throw new Error(`IPC channel is not allowed: ${channel}`);
  }
}
