import { session, type Session, type WebContents } from 'electron';

export interface SecurityOptions {
  devServerUrl?: string;
}

function allowedOrigins(devServerUrl?: string): Set<string> {
  const origins = new Set<string>();

  if (devServerUrl) {
    try {
      origins.add(new URL(devServerUrl).origin);
    } catch {
      // A malformed dev URL simply grants no extra origin.
    }
  }

  return origins;
}

export function hardenWindowContents(contents: WebContents, options: SecurityOptions = {}): void {
  const trustedOrigins = allowedOrigins(options.devServerUrl);

  contents.setWindowOpenHandler(() => ({ action: 'deny' }));

  contents.on('will-navigate', (event, targetUrl) => {
    let isTrusted = false;
    try {
      const url = new URL(targetUrl);
      isTrusted = url.protocol === 'file:' || trustedOrigins.has(url.origin);
    } catch {
      isTrusted = false;
    }

    if (!isTrusted) {
      event.preventDefault();
    }
  });

  contents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });
}

export function hardenSession(targetSession: Session = session.defaultSession): void {
  // POS hardware permissions (printers, serial) are granted explicitly in a
  // later slice; everything is denied until then.
  targetSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });
}
