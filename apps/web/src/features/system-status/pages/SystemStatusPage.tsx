import { useSystemHealth, type SystemHealthSnapshot } from '../hooks/use-system-health';

type OverallState = 'checking' | 'healthy' | 'degraded' | 'unreachable';

function overallState(snapshot: SystemHealthSnapshot): OverallState {
  if (snapshot.api.status === 'unknown') return 'checking';
  if (snapshot.api.status === 'live' && snapshot.database.status === 'reachable') return 'healthy';
  if (snapshot.api.status === 'live') return 'degraded';
  return 'unreachable';
}

const OVERALL_LABEL: Record<OverallState, string> = {
  checking: 'Checking',
  healthy: 'All systems operational',
  degraded: 'Degraded',
  unreachable: 'Unreachable',
};

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export function SystemStatusPage() {
  const { snapshot, isChecking, check } = useSystemHealth();
  const overall = overallState(snapshot);

  return (
    <main className="status-page">
      <header className="status-page__header">
        <p className="eyebrow">Adaptive Retail Platform</p>
        <h1>Platform status</h1>
        <p className="lede">
          Foundation environment for grocery, fashion, pharmacy and cosmetics retail. This build
          verifies connectivity only; business modules are not enabled yet.
        </p>
        <p className="overall" data-status={overall} role="status">
          {OVERALL_LABEL[overall]}
        </p>
      </header>

      <section className="status-grid" aria-busy={isChecking} aria-live="polite">
        <article className="card" data-status={snapshot.api.status}>
          <h2>API service</h2>
          <p className="status-line">
            <span className="dot" aria-hidden="true" />
            {snapshot.api.status === 'unknown'
              ? 'Checking…'
              : snapshot.api.status === 'live'
                ? 'Live'
                : 'Unreachable'}
          </p>
          <dl>
            <div>
              <dt>Version</dt>
              <dd>{snapshot.api.version ?? '—'}</dd>
            </div>
            <div>
              <dt>Uptime</dt>
              <dd>
                {snapshot.api.uptimeSeconds === undefined
                  ? '—'
                  : formatUptime(snapshot.api.uptimeSeconds)}
              </dd>
            </div>
          </dl>
        </article>

        <article className="card" data-status={snapshot.database.status}>
          <h2>Database</h2>
          <p className="status-line">
            <span className="dot" aria-hidden="true" />
            {snapshot.database.status === 'unknown'
              ? 'Checking…'
              : snapshot.database.status === 'reachable'
                ? 'Reachable'
                : 'Not reachable'}
          </p>
          <dl>
            <div>
              <dt>Readiness</dt>
              <dd>
                {snapshot.database.status === 'reachable'
                  ? 'Passing'
                  : snapshot.database.status === 'down'
                    ? 'Failing'
                    : '—'}
              </dd>
            </div>
            <div>
              <dt>Latency</dt>
              <dd>
                {snapshot.database.latencyMs === undefined
                  ? '—'
                  : `${snapshot.database.latencyMs} ms`}
              </dd>
            </div>
          </dl>
        </article>
      </section>

      {snapshot.error ? (
        <p className="error" role="alert">
          {snapshot.error}
        </p>
      ) : null}

      <footer className="status-page__footer">
        <button type="button" onClick={() => void check()} disabled={isChecking}>
          {isChecking ? 'Checking…' : 'Check again'}
        </button>
        {snapshot.checkedAt ? (
          <span>Last checked {new Date(snapshot.checkedAt).toLocaleTimeString()}</span>
        ) : null}
      </footer>
    </main>
  );
}
