# Implementation Phases

The project is intentionally built in vertical slices. Each phase should leave the repository runnable rather than creating a large unfinished foundation.

## Phase 0 — Product and repository setup

### Deliverables

- repository initialized;
- README and planning docs committed;
- frontend/backend workspace structure;
- formatting/lint/typecheck;
- environment variable strategy;
- CI skeleton;
- local PostgreSQL setup;
- branch/commit conventions.

### Exit criteria

- clean clone can install dependencies;
- lint/typecheck/build commands exist;
- CI runs on pull requests.

## Phase 1 — Design system and application shell

### Deliverables

- `design-system/MASTER.md` implemented;
- route structure;
- responsive app shell;
- sidebar/project switcher;
- typography/colors/spacing tokens;
- reusable form, dialog, sheet, table, badge and feedback primitives;
- loading/error/empty patterns.

### 21st.dev workflow

Use 21st.dev to inspect/borrow focused components for:

- sidebar;
- Kanban board structure;
- data table/filter controls;
- command palette only if justified;
- dialog/drawer patterns.

Adapt every borrowed component to the project's tokens. Do not paste unrelated styles from multiple authors into the product.

### Exit criteria

All core routes render with consistent visual language, including mobile states.

## Phase 2 — Authentication and account security

### Deliverables

- register;
- login;
- logout;
- session restoration;
- profile;
- change password;
- forgot/reset password;
- rate limiting;
- security logging;
- auth integration tests.

### Exit criteria

Unauthenticated requests are rejected; session lifecycle is tested; reset tokens are single-use/expiring.

## Phase 3 — Projects and membership

### Deliverables

- project CRUD/archive;
- project list/detail;
- owner/member model;
- invitation creation;
- invitation acceptance;
- member removal;
- authorization matrix tests.

### Exit criteria

No project can be viewed or mutated through direct API calls without correct membership/role.

## Phase 4 — Issues CRUD

### Deliverables

- issue data model;
- create/edit/delete;
- assignment;
- status/priority;
- due date;
- labels;
- issue detail route/drawer;
- concurrency versioning.

### Exit criteria

Issue rules are enforced server-side and all major mutation paths have integration tests.

## Phase 5 — Board and list views

### Deliverables

- Kanban columns;
- issue cards;
- accessible drag-and-drop;
- issue move API;
- list/table view;
- URL-synchronized search/filter/sort;
- pagination.

### Exit criteria

A user can move and discover work efficiently with mouse, keyboard and mobile/touch behavior considered.

## Phase 6 — Collaboration surface

### Deliverables

- comments;
- attachment metadata;
- secure file upload;
- private download access;
- file deletion;
- activity timeline if useful.

### Exit criteria

Unauthorized file access is blocked; spoofed/oversized files fail safely; upload/download paths are tested.

## Phase 7 — Hardening

### Deliverables

- security headers;
- CSRF/origin strategy verified;
- request/body limits;
- rate-limit tuning;
- audit logging;
- error response review;
- dependency audit;
- authorization regression suite;
- backup/restore procedure.

### Exit criteria

Security checklist is reviewed against the actual deployment, not just source code.

## Phase 8 — UX polish and accessibility pass

### Deliverables

- keyboard navigation audit;
- focus management;
- screen-reader labels/live regions;
- reduced motion;
- responsive edge cases;
- empty/error/loading states;
- optimistic update rollback polish;
- visual consistency cleanup.

### Exit criteria

A manual QA pass covers desktop/mobile/keyboard/slow-network scenarios.

## Phase 9 — Observability and deployment

### Deliverables

- production container;
- environment configuration;
- managed PostgreSQL;
- object storage;
- email provider integration;
- migrations on deploy;
- structured logging;
- health endpoint;
- CI/CD pipeline;
- rollback notes.

### Exit criteria

A new environment can be deployed from documented steps and verified with smoke tests.

## Phase 10 — Portfolio readiness

### Deliverables

- architecture diagram;
- security section in README;
- API docs/OpenAPI;
- test strategy/results based on real runs;
- screenshots/GIFs only where they communicate functionality;
- seeded demo environment/data;
- concise project write-up describing tradeoffs and lessons learned.

### Portfolio story

Be ready to explain:

- why PostgreSQL over a document database;
- why sessions over browser-stored tokens;
- how object-level authorization works;
- how file upload is secured;
- how Kanban ordering is handled;
- how stale concurrent edits are detected;
- what is intentionally not implemented yet.

## Phase discipline

Do not start the next phase when the previous phase has unresolved security or data-integrity defects.

For each feature:

```text
Requirement
  ↓
Data/API design
  ↓
Server validation + authorization
  ↓
Backend tests
  ↓
UI implementation
  ↓
Frontend tests
  ↓
Accessibility/edge cases
  ↓
Review
  ↓
Commit
```
