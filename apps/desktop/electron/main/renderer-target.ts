import path from 'node:path';

export type RendererTarget = { kind: 'url'; value: string } | { kind: 'file'; value: string };

export interface RendererTargetOptions {
  isDev: boolean;
  devServerUrl?: string;
  mainDir: string;
}

/**
 * Dev loads the shared React app from the Vite server. Any other run loads the
 * built web app, so desktop never ships a second, divergent frontend.
 */
export function getRendererTarget({
  isDev,
  devServerUrl,
  mainDir,
}: RendererTargetOptions): RendererTarget {
  if (isDev) {
    return { kind: 'url', value: devServerUrl ?? 'http://localhost:5173' };
  }

  return { kind: 'file', value: path.resolve(mainDir, '../../../web/dist/index.html') };
}
