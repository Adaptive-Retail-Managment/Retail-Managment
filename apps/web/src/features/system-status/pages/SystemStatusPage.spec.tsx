import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SystemStatusPage } from './SystemStatusPage';

const liveness = {
  status: 'ok',
  service: 'api',
  version: '0.1.0-foundation',
  uptimeSeconds: 42,
  timestamp: new Date().toISOString(),
};

const readinessUp = {
  status: 'ok',
  service: 'api',
  version: '0.1.0-foundation',
  uptimeSeconds: 42,
  timestamp: new Date().toISOString(),
  checks: { database: { status: 'up', latencyMs: 3 } },
};

const readinessDown = {
  ...readinessUp,
  status: 'degraded',
  checks: { database: { status: 'down', latencyMs: 3000 } },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockProbes(responses: Record<string, Response>): void {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const path = String(input);
      const key = Object.keys(responses).find((candidate) => path.endsWith(candidate));
      return key
        ? Promise.resolve(responses[key]!.clone())
        : Promise.reject(new Error(`Unexpected request: ${path}`));
    }),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('SystemStatusPage', () => {
  it('shows healthy API and database state', async () => {
    mockProbes({ '/health': jsonResponse(liveness), '/ready': jsonResponse(readinessUp) });

    render(<SystemStatusPage />);

    expect(screen.getByRole('heading', { name: /platform status/i })).toBeInTheDocument();
    expect(await screen.findByText('Live')).toBeInTheDocument();
    expect(await screen.findByText('Reachable')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/all systems operational/i);
  });

  it('shows degraded database when readiness returns 503', async () => {
    mockProbes({
      '/health': jsonResponse(liveness),
      '/ready': jsonResponse(readinessDown, 503),
    });

    render(<SystemStatusPage />);

    expect(await screen.findByText('Not reachable')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/degraded/i);
    expect(screen.getByText('3000 ms')).toBeInTheDocument();
  });

  it('reports an unreachable API instead of failing silently', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('connect ECONNREFUSED'))),
    );

    render(<SystemStatusPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be reached/i);
    expect(screen.getByRole('status')).toHaveTextContent(/unreachable/i);
  });
});
