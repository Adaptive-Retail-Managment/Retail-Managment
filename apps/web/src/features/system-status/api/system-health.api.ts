import { apiRequest } from '../../../lib/api-client';

export interface LivenessResponse {
  status: 'ok';
  service: 'api';
  version: string;
  uptimeSeconds: number;
  timestamp: string;
}

export interface ReadinessResponse {
  status: 'ok' | 'degraded';
  service: 'api';
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  checks: {
    database: {
      status: 'up' | 'down';
      latencyMs: number;
    };
  };
}

export function fetchLiveness() {
  return apiRequest<LivenessResponse>('/health');
}

export function fetchReadiness() {
  return apiRequest<ReadinessResponse>('/ready');
}
