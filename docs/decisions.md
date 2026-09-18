# Architecture Decisions

## ADR-001 — React + TypeScript frontend

**Decision:** React + TypeScript + Vite.

**Why:** Strong ecosystem, explicit frontend/backend boundary, fast local iteration, and directly relevant full-stack skills.

**Not choosing:** Next.js full-stack for this project because separating the API makes authentication, authorization and HTTP contracts easier to study and discuss. This is a teaching/portfolio decision, not a claim that Next.js is inferior.

## ADR-002 — PostgreSQL instead of MongoDB

**Decision:** PostgreSQL.

**Why:** Projects, memberships, invitations, issues, labels and comments have clear relationships and integrity rules. This project is a good opportunity to demonstrate relational modeling.

**Tradeoff:** More explicit schema/migrations than a document-first database.

## ADR-003 — Database-backed sessions

**Decision:** Opaque server-side sessions stored in PostgreSQL.

**Why:** Easy revocation, simple mental model, no auth state in browser storage, and good teaching value for authentication/session lifecycle.

**Tradeoff:** Each authenticated request requires a session lookup; optimize only if measurement requires it.

## ADR-004 — Fixed statuses in v1

**Decision:** `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`.

**Why:** Keeps the board useful without designing an entire workflow engine.

**Tradeoff:** Less customizable than Jira.

## ADR-005 — Soft deletion for issues/projects

**Decision:** Archive/delete state is represented explicitly where history matters.

**Why:** Prevents destructive user actions from immediately erasing collaboration history and simplifies auditability.

**Tradeoff:** Queries must consistently exclude archived/deleted data.

## ADR-006 — Private object storage

**Decision:** File bytes live in private object storage; metadata lives in PostgreSQL.

**Why:** Separates binary storage from application data and makes access control explicit.

**Tradeoff:** More infrastructure than local disk, but closer to a production deployment model.

## ADR-007 — No real-time updates in v1

**Decision:** No WebSockets initially.

**Why:** Real-time collaboration is not needed to demonstrate the core engineering skills. Polling/refetching is simpler.

**Future trigger:** Add real-time only when a concrete product requirement appears.

## ADR-008 — 21st.dev as a component source, not a design system

**Decision:** Borrow focused source components, then adapt them to the project's design tokens.

**Why:** 21st.dev offers a large living registry and AI-ready component prompts. Mixing many authors' raw styles would create visual inconsistency. citeturn695335search4

## ADR-009 — UI/UX Pro Max as design evidence/framework

**Decision:** Use UI/UX Pro Max principles for design-system generation and UX review, while keeping this repository's `MASTER.md` as the final local source of truth.

**Why:** The skill documents product-specific recommendations across styles, palettes, typography, accessibility and supported frontend stacks. citeturn695335search2turn695335search3
