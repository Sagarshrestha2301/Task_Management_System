# AGENTS.md — Task Management System

## Project Rules

### Architecture

- Monorepo with two workspace packages: `apps/web` (React) and `apps/api` (Express/Prisma)
- Frontend: React 19 + TypeScript + Vite + TanStack Query + React Router
- Backend: Node 24 LTS + Express + Prisma + PostgreSQL
- API versioned under `/api/v1`
- Database-backed opaque sessions (no localStorage JWT)

### Security

- All passwords hashed with Argon2id
- Session cookies: HttpOnly, Secure (production), SameSite=Lax
- Authorization enforced server-side for every resource/action
- Never trust client-provided roles, ownership, or identifiers as proof of permission
- File uploads: allowlist types, verify content type, generated storage keys, private storage
- Rate limiting on auth/invitation/upload endpoints
- No secrets in logs, git, or environment files committed to repo

### Validation

- Backend validation is authoritative; frontend validation is UX only
- Use Zod schemas at API boundary
- Reject unexpected mutation fields (allowlist approach)
- All identifiers validated as UUIDs
- Sort fields and enum values allowlisted server-side

### Data Integrity

- PostgreSQL constraints + Prisma transactions for multi-record consistency
- Soft deletion: `deleted_at` / `archived_at` columns exclude records from active queries
- Foreign keys enforced at database level
- Concurrency: optimistic versioning on editable resources (version field check)

### Code Style

- TypeScript strict mode
- No generic abstractions (GenericRepository, UniversalService, BaseController, etc.)
- Feature code stays near the feature
- Shared components only when reuse is demonstrated
- No comments unless explaining non-obvious decisions
- Use 4-space indentation (matching design-system preference)

### Testing

- Unit tests for validators, permission rules, status transitions, pagination, sort allowlists
- Integration/API tests for auth, authz, membership, issue CRUD, assignment, attachments
- Authorization regression tests for every role/resource combination
- E2E journeys cover critical user flows
- Never mark a feature tested without actually running the tests

### Phase Discipline

- Follow Phase 0 through Phase 10 in order
- Do not proceed past a phase with unresolved security or data-integrity defects
- Each phase leaves the repository runnable

### Development Environment

- Windows/PowerShell for all commands
- Docker Desktop for PostgreSQL (compose.yaml)
- VS Code for editing
- Node 24 LTS, npm 12+
