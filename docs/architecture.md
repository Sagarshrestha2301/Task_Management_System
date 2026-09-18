# Architecture

## 1. Architecture goals

Priorities for this project:

1. clear boundaries;
2. secure defaults;
3. easy local development;
4. independently testable business logic;
5. low operational complexity;
6. enough structure to grow without premature microservices.

## 2. High-level system

```text
┌───────────────────────────────┐
│ React + TypeScript Frontend   │
│ Vite / Router / Query / Forms │
└───────────────┬───────────────┘
                │ HTTPS/JSON
                ▼
┌───────────────────────────────┐
│ Express API                   │
│ auth → validation → authz     │
│ → service → persistence       │
└───────┬───────────┬───────────┘
        │           │
        ▼           ▼
┌────────────┐  ┌──────────────┐
│ PostgreSQL │  │ Object       │
│ via Prisma │  │ Storage      │
└────────────┘  └──────────────┘
        │
        ▼
┌───────────────────────────────┐
│ Transactional Email Provider  │
└───────────────────────────────┘
```

One deployable backend is enough for v1. Do not split services merely to create an impressive diagram.

## 3. Frontend structure

Suggested shape:

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── layouts/
├── features/
│   ├── auth/
│   ├── projects/
│   ├── issues/
│   ├── members/
│   └── account/
├── components/
│   ├── ui/
│   └── shared/
├── lib/
│   ├── api/
│   ├── validation/
│   └── utils/
└── styles/
```

Rules:

- feature-specific code stays near the feature;
- generic UI primitives belong in `components/ui`;
- API access is centralized instead of scattered across components;
- server state is handled by TanStack Query rather than duplicated in local stores;
- local UI state stays local until there is a concrete reason to centralize it.

## 4. Backend structure

```text
src/
├── app.ts
├── server.ts
├── config/
├── middleware/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── projects/
│   ├── members/
│   ├── invitations/
│   ├── issues/
│   ├── comments/
│   ├── attachments/
│   └── audit/
├── db/
├── lib/
└── shared/
```

Each module should roughly contain:

```text
route/controller → validation → authorization → service → repository/ORM
```

Do not turn every function into a new abstraction. Split a module when the boundary improves reasoning or testability.

## 5. Request lifecycle

```text
HTTP request
   ↓
security headers / request limits
   ↓
session authentication
   ↓
request schema validation
   ↓
resource lookup
   ↓
authorization check
   ↓
business rules
   ↓
database transaction
   ↓
auditing / side effects
   ↓
response mapping
```

A client-provided identifier such as `projectId` or `assigneeId` is data, not authorization.

## 6. Authentication architecture

Use database-backed opaque sessions rather than putting authorization state into a browser-readable token.

Cookie characteristics:

- `HttpOnly`;
- `Secure` in production;
- appropriate `SameSite` policy;
- narrow path/domain scope;
- expiration/idle timeout policy.

Session table stores a server-side hash/identifier and metadata such as creation time, last-used time and revocation state.

Password reset uses a separate short-lived one-time secret rather than reusing the login session.

OWASP recommends strong password hashing such as Argon2id instead of plaintext or fast general-purpose hashes. citeturn364660search5

## 7. Authorization architecture

Central principle: every protected resource operation asks “who is acting on what resource, and are they allowed to perform this action?”

Do not rely on:

- hidden buttons;
- route guards in React;
- assumed ownership from a request field;
- client-provided role values.

Use an authorization layer that receives authenticated identity plus the resource context needed to decide.

## 8. Database strategy

PostgreSQL is the source of truth.

Use Prisma for:

- migrations;
- schema constraints;
- parameterized queries;
- transaction boundaries.

Still design indexes deliberately. ORM safety does not replace database design.

## 9. Attachments

Use private object storage for file bytes and PostgreSQL for metadata.

```text
Upload request
   ↓
Authentication + project authorization
   ↓
Size/content validation
   ↓
Generate storage key
   ↓
Upload private object
   ↓
Store metadata transactionally
   ↓
Return attachment metadata
```

Downloads should go through an authorization-aware handler or short-lived signed URL.

## 10. Error model

All API errors follow one predictable shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "fields": {
      "title": "Title is required."
    },
    "requestId": "..."
  }
}
```

Do not expose:

- SQL errors;
- stack traces;
- internal file paths;
- secret values;
- sensitive authorization details.

## 11. Observability

At minimum record:

- request ID;
- structured error logs;
- authentication failures;
- authorization failures;
- destructive operations;
- background job failures;
- upload failures.

Never log passwords, session secrets, reset tokens or raw authorization headers.

## 12. Deployment shape

Production should use:

- HTTPS;
- frontend hosting/CDN;
- containerized Node API;
- managed PostgreSQL;
- private object storage;
- environment-specific secrets;
- automated database migrations;
- CI checks before deploy.

A reverse proxy can expose the API under the same site origin in production if desired, simplifying browser security and cookie configuration.

## 13. What we deliberately do not build yet

- microservices;
- Kubernetes;
- event buses;
- CQRS;
- GraphQL;
- Redis unless a concrete requirement emerges;
- WebSockets until real-time collaboration is required.

These are architecture tools, not portfolio badges.
