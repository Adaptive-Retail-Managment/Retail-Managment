import { useCallback, useEffect, useState } from 'react';
import { fetchLiveness, fetchReadiness } from '../api/system-health.api';

export interface SystemHealthSnapshot {
  api: {
    status: 'unknown' | 'live' | 'unreachable';
    version?: string;
    uptimeSeconds?: number;
  };
  database: {
    status: 'unknown' | 'reachable' | 'down';
    latencyMs?: number;
  };
  checkedAt?: string;
  error?: string;
}

const INITIAL_SNAPSHOT: SystemHealthSnapshot = {
  api: { status: 'unknown' },
  database: { status: 'unknown' },
};

export function useSystemHealth() {
  const [snapshot, setSnapshot] = useState<SystemHealthSnapshot>(INITIAL_SNAPSHOT);
  const [isChecking, setIsChecking] = useState(true);

  const check = useCallback(async () => {
    setIsChecking(true);

    const [liveness, readiness] = await Promise.allSettled([fetchLiveness(), fetchReadiness()]);
    const next: SystemHealthSnapshot = {
      api: { status: 'unreachable' },
      database: { status: 'down' },
      checkedAt: new Date().toISOString(),
    };

    if (liveness.status === 'fulfilled' && liveness.value.ok && liveness.value.body) {
      next.api = {
        status: 'live',
        version: liveness.value.body.version,
        uptimeSeconds: liveness.value.body.uptimeSeconds,
      };
    } else if (liveness.status === 'rejected') {
      next.error = 'The API could not be reached. Is it running on port 4000?';
    }

    if (readiness.status === 'fulfilled' && readiness.value.body) {
      const database = readiness.value.body.checks.database;
      next.database =
        database.status === 'up'
          ? { status: 'reachable', latencyMs: database.latencyMs }
          : { status: 'down', latencyMs: database.latencyMs };
    } else if (readiness.status === 'rejected' && !next.error) {
      next.error = 'The API could not be reached. Is it running on port 4000?';
    }

    setSnapshot(next);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return { snapshot, isChecking, check };
}
