# Deployment & Maintenance Plan

## 1. Environments

Use three logical environments:

```text
development → staging → production
```

### Development

- local frontend;
- local PostgreSQL;
- local object-storage emulator or development bucket;
- test email sink/provider.

### Staging

- production-like database/storage;
- separate secrets;
- migration rehearsal;
- smoke/E2E verification.

### Production

- HTTPS;
- managed PostgreSQL;
- private object storage;
- transactional email;
- monitored API.

## 2. Configuration

Required categories:

```text
APP_ENV
APP_ORIGIN
API_ORIGIN
DATABASE_URL
SESSION_SECRET
EMAIL_PROVIDER_KEY
EMAIL_FROM
OBJECT_STORAGE_ENDPOINT
OBJECT_STORAGE_BUCKET
OBJECT_STORAGE_ACCESS_KEY
OBJECT_STORAGE_SECRET_KEY
```

The exact provider-specific names can change; document semantics, not vendor coupling.

`.env.example` contains placeholders only.

## 3. Container strategy

Backend image should:

- use a supported LTS Node base image;
- run as a non-root user;
- install only production dependencies in the runtime layer where practical;
- avoid copying local secrets;
- define a deterministic startup command;
- expose only the API port.

Frontend can be built into static assets and served by a suitable static host/CDN.

## 4. Database migrations

Migrations are source-controlled.

Deployment flow:

```text
build image
  ↓
run migration
  ↓
start application
  ↓
health check
  ↓
smoke test
```

Never make production schema changes by manually editing tables without a migration.

Before destructive migrations:

- verify backup;
- test restore path in staging;
- understand lock/availability impact;
- provide rollback/recovery notes.

## 5. Health checks

### Liveness

Confirms the process is running.

`GET /health`

### Readiness

Confirms the API can reach its required dependencies.

`GET /health/ready`

Do not include secrets or detailed dependency errors in public health responses.

## 6. CI/CD

Pull request:

```text
install
→ lint
→ typecheck
→ unit tests
→ integration tests
→ build
→ dependency/security checks
```

Main/protected branch:

```text
build artifact
→ deploy staging
→ migration rehearsal/smoke tests
→ production approval/automated policy
→ deploy
→ health check
→ smoke test
```

## 7. Logging

Use structured logs containing:

- timestamp;
- level;
- request ID;
- route/method;
- duration;
- high-level result/error code.

Never log credentials, reset tokens, cookies or full private request bodies.

## 8. Backups

Minimum production plan:

- automated PostgreSQL backups through the managed provider;
- documented retention policy;
- periodic restore test;
- object-storage versioning/backup policy where appropriate.

A backup is not a verified recovery mechanism until a restore has been tested.

## 9. Dependency maintenance

Monthly or scheduled maintenance:

- inspect outdated dependencies;
- review security advisories;
- update framework/runtime versions through controlled PRs;
- run the full test suite;
- review breaking changes before merging.

Node 24 is an LTS line as of September 2026; avoid using a non-LTS runtime merely because it has a newer version number. citeturn175600search0turn175600search5

## 10. Incident basics

When a production issue appears:

```text
contain
→ identify scope
→ preserve useful logs
→ recover service/data
→ fix root cause
→ add regression test
→ document lesson
```

Do not treat deleting logs or restarting the service as a root-cause fix.

## 11. Release checklist

```text
[ ] tests pass
[ ] migrations reviewed
[ ] environment variables verified
[ ] backup/recovery path known
[ ] security-sensitive changes reviewed
[ ] frontend production build verified
[ ] API health check passes
[ ] critical user journey smoke-tested
[ ] error monitoring checked
[ ] rollback/recovery notes available
```
