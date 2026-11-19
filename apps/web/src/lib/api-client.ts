const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  body: T | null;
}

export class ApiUnreachableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiUnreachableError';
  }
}

/**
 * Returns the parsed body for any HTTP status (probes use 503 meaningfully).
 * Throws only when the request could not complete at all.
 */
export async function apiRequest<T>(path: string, timeoutMs = 5000): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    const body = (await response.json().catch(() => null)) as T | null;

    return { ok: response.ok, status: response.status, body };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown network error';
    throw new ApiUnreachableError(reason);
  } finally {
    clearTimeout(timer);
  }
}
