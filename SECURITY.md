# Security policy

## Reporting

Report suspected vulnerabilities privately to the repository owner (private issue / security
advisory). Do not open a public issue or include exploit details in a PR. Include affected
component, reproduction steps and impact.

## Current posture (foundation)

Implemented:

- Environment variables validated at API boot; malformed configuration stops startup.
- CORS restricted to an explicit origin allowlist with credentials enabled.
- Helmet security headers on API responses.
- Probes send `Cache-Control: no-store` and never return database error details or credentials.
- Electron: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, a frozen
  allowlisted preload API, denied window-open/navigation/webview attachment, and all permission
  requests denied by default.
- Secrets are read from `.env` (git-ignored); no secrets are committed.
- Access tokens/credentials are not stored anywhere yet because authentication does not exist.

Not yet implemented — do not deploy as production-ready:

- Authentication, session management, password recovery, MFA.
- Backend authorization and tenancy isolation guards.
- Audit logging and access logs.
- Rate limiting, request size limits and abuse protection beyond Nest defaults.
- Secret manager integration, TLS termination and database least-privilege roles.
- Electron code signing, auto-update integrity and IPC payload validation beyond TypeScript types.

## Handling data

- Never commit real customer, prescription, payment or employee data.
- Seed data must be synthetic. Pharmacy data must never include real prescriptions.
- Offline devices will hold transactional data; encryption-at-rest and key management are required
  before that slice ships.
