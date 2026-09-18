# Task Management System — Project Planning Pack

A portfolio-grade lightweight Jira/Trello-style task management system designed to demonstrate real full-stack engineering rather than CRUD-only UI work.

## Planning documents

| File                           | Purpose                                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `docs/requirements.md`         | Product scope, actors, functional/non-functional requirements, acceptance criteria, MVP boundaries    |
| `docs/design.md`               | Product/UX design, information architecture, interaction rules, responsive behavior, visual direction |
| `docs/architecture.md`         | Frontend/backend/system architecture, boundaries, request flow, deployment shape                      |
| `docs/data-model.md`           | Relational data model, entities, relationships, constraints, indexes                                  |
| `docs/api-contract.md`         | REST API conventions, endpoint inventory, validation, pagination, errors                              |
| `docs/security.md`             | Authentication, authorization, input validation, rate limiting, file security, abuse prevention       |
| `docs/testing.md`              | Test strategy, test pyramid, critical cases, quality gates                                            |
| `docs/phase.md`                | Incremental implementation plan from repository setup through deployment/maintenance                  |
| `docs/decisions.md`            | Architecture decisions and tradeoffs to revisit explicitly                                            |
| `design-system/MASTER.md`      | UI/UX source of truth for tokens, typography, components, motion and anti-patterns                    |
| `prompts/21st-dev-and-uiux.md` | Prompts and rules for using 21st.dev components with the design system                                |

## Proposed stack

### Frontend

- React 19.3 + TypeScript
- Vite
- React Router
- TanStack Query for server state
- React Hook Form + Zod for form handling and client-side schema validation
- Tailwind CSS + shadcn/ui primitives
- Lucide icons
- A focused drag-and-drop solution for the Kanban board with keyboard support

### Backend

- Node.js 24 LTS + TypeScript
- Express
- Zod request schemas shared or mirrored explicitly where appropriate
- Prisma ORM
- PostgreSQL
- Cookie-based database-backed sessions

### Infrastructure

- Containerized API
- Managed PostgreSQL
- S3-compatible private object storage for attachments
- Transactional email provider behind an interface for password reset/invitations
- CI for linting, type checking, unit/integration tests, build, and security checks

Node 24 is the current LTS line as of September 2026, while React 19.3 is the current React release. citeturn175600search0turn175600search3

## Design direction

The interface is an operational workbench, not a marketing page:

- high information density where users repeatedly scan and act;
- restrained neutral surfaces with one controlled accent;
- strong typography and spacing hierarchy;
- minimal decorative gradients;
- no glassmorphism, glowing cards, giant hero sections, or gratuitous 3D effects;
- motion communicates state changes and hierarchy rather than decoration;
- keyboard and reduced-motion behavior are first-class requirements;
- empty, loading, error, disabled and permission-denied states are designed, not afterthoughts.

21st.dev is used as a source of adaptable React/shadcn components, not as a reason to mix unrelated visual styles. The registry currently exposes 12,000+ React components/templates/themes and includes dedicated Kanban, data-table, command-palette and dashboard collections. citeturn695335search4turn207394search1turn207394search4turn207394search0

The UI/UX Pro Max skill is used as a design decision framework for product-specific style, typography, accessibility, interaction and responsive checks; the official repository documents design-system generation and stack-specific guidance. citeturn695335search2turn695335search3

## Engineering principle

No UI feature is considered finished until its server-side authorization, validation, failure states, loading states, accessibility path, tests, and observability implications have been considered.
