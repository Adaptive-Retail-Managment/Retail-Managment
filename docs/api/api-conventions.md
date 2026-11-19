# API conventions

## Base paths

- Business API: `/api/...` (global prefix set in `apps/api/src/main.ts`).
- Probes: `/health` (liveness) and `/ready` (readiness), intentionally outside `/api` so
  orchestrators can use stable paths.

## Probes

### `GET /health`

`200` whenever the Node process can serve requests. Does not touch the database.

```json
{
  "status": "ok",
  "service": "api",
  "version": "0.1.0-foundation",
  "uptimeSeconds": 42,
  "timestamp": "2026-11-19T08:00:00.000Z"
}
```

### `GET /ready`

`200` when PostgreSQL answers `SELECT 1` within `READINESS_TIMEOUT_MS`; otherwise `503` with the
same envelope and `"status": "degraded"`.

```json
{
  "status": "ok",
  "service": "api",
  "version": "0.1.0-foundation",
  "uptimeSeconds": 42,
  "timestamp": "2026-11-19T08:00:00.000Z",
  "checks": { "database": { "status": "up", "latencyMs": 3 } }
}
```

Database error details stay in server logs. Probes never return credentials or SQL errors.

Both probe responses send `Cache-Control: no-store`.

## Payloads and validation

- JSON only for Phase 0.
- A global `ValidationPipe` runs with `whitelist`, `forbidNonWhitelisted` and `transform`, so DTOs
  added later reject unknown fields instead of ignoring them.
- Error envelope is Nest's standard HTTP exception body. A custom error contract will be defined
  with the first business slice, before clients depend on it.

## Versioning

No URL versioning yet. The API has no external consumers. This decision is revisited when the
first business module ships; changing it later is a breaking change for the web/desktop clients.

## CORS

Only origins listed in `CORS_ORIGINS` are allowed, with credentials enabled. The Vite dev server
proxies `/api`, `/health` and `/ready` to the API so the browser can also work same-origin.
