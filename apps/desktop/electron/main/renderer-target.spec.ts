import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getRendererTarget } from './renderer-target';

describe('getRendererTarget', () => {
  it('uses the dev server URL in development', () => {
    const target = getRendererTarget({
      isDev: true,
      devServerUrl: 'http://localhost:5199',
      mainDir: 'C:/app/apps/desktop/dist-electron/main',
    });

    expect(target).toEqual({ kind: 'url', value: 'http://localhost:5199' });
  });

  it('defaults to the Vite dev server when no URL is configured', () => {
    const target = getRendererTarget({
      isDev: true,
      mainDir: '/app/apps/desktop/dist-electron/main',
    });

    expect(target).toEqual({ kind: 'url', value: 'http://localhost:5173' });
  });

  it('loads the shared web build when not in development', () => {
    const mainDir = path.resolve('/app/apps/desktop/dist-electron/main');

    const target = getRendererTarget({ isDev: false, mainDir });

    expect(target).toEqual({
      kind: 'file',
      value: path.resolve(mainDir, '../../../web/dist/index.html'),
    });
  });
});
