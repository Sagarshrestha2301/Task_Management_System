# Requirements — Task Management System

## 1. Product goal

Build a lightweight team task-management application where authenticated users can create projects, collaborate through project membership, manage issues on a Kanban board or list, search/filter/sort work, discuss issues, and attach files.

The project should demonstrate the engineering skills expected from a junior/full-stack intern candidate:

- authentication and session management;
- object-level authorization and role-based permissions;
- relational database design;
- robust request validation;
- server-side pagination/filtering/sorting;
- file-upload security;
- predictable error handling;
- testing at multiple layers;
- production-oriented deployment and maintenance.

## 2. Users and roles

### 2.1 Platform user

Any registered account. A user may belong to zero or more projects.

### 2.2 Project Owner

The creator of a project. Exactly one active owner per project in v1.

Permissions:

- update project settings;
- archive/delete project;
- invite members;
- remove members;
- manage project labels;
- perform all issue actions;
- transfer ownership is out of scope for v1.

### 2.3 Project Member

A user who has accepted membership in a project.

Permissions:

- view project and issues;
- create issues;
- edit issues they can access;
- change status/priority/assignee according to project rules;
- comment;
- upload attachments;
- manage their own profile/session settings.

Members cannot delete/archive a project or remove other members in v1.

## 3. Functional requirements

### 3.1 Authentication

| ID      | Requirement         | Acceptance criteria                                                                                |
| ------- | ------------------- | -------------------------------------------------------------------------------------------------- |
| AUTH-01 | Register            | Valid email + password + display name creates an account; duplicate email is rejected safely.      |
| AUTH-02 | Login               | Valid credentials create a session; invalid credentials do not reveal which field was wrong.       |
| AUTH-03 | Logout              | Current session is invalidated server-side and browser cookies are cleared.                        |
| AUTH-04 | Session restoration | Refreshing the browser keeps a valid session without storing the session token in localStorage.    |
| AUTH-05 | Profile             | User can view/update their display name and avatar metadata if supported.                          |
| AUTH-06 | Change password     | Current password is required; successful change invalidates other sessions.                        |
| AUTH-07 | Forgot password     | User submits email and receives a reset flow; response does not reveal whether the account exists. |
| AUTH-08 | Reset password      | Single-use expiring token changes the password and invalidates existing sessions.                  |

### 3.2 Projects

| ID      | Requirement            | Acceptance criteria                                                                                                          |
| ------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| PROJ-01 | Create project         | Name and optional description are validated server-side. Creator becomes owner.                                              |
| PROJ-02 | Update project         | Only owner may update project settings.                                                                                      |
| PROJ-03 | Archive/delete project | Only owner may perform it; destructive action requires explicit confirmation. Archived projects disappear from active views. |
| PROJ-04 | List projects          | User sees only projects they belong to. Pagination is applied when required.                                                 |
| PROJ-05 | View project           | Project details are inaccessible to non-members.                                                                             |
| PROJ-06 | Invite member          | Owner can invite by email. Duplicate/pending invitations are handled safely.                                                 |
| PROJ-07 | Accept invitation      | Valid invite can be accepted once. Membership is idempotent.                                                                 |
| PROJ-08 | Remove member          | Owner can remove a member, with rules preventing removal of the owner in v1.                                                 |
| PROJ-09 | Member list            | Project members include role and basic user identity only.                                                                   |

### 3.3 Issues

| ID       | Requirement  | Acceptance criteria                                                                                                |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| ISSUE-01 | Create issue | Title is required; description, priority, status, due date, assignee and labels are validated.                     |
| ISSUE-02 | Edit issue   | Only an authorized project member can edit. Server rejects unknown fields.                                         |
| ISSUE-03 | Delete issue | Authorized user can soft-delete; deleted issues do not appear in active views.                                     |
| ISSUE-04 | Assign user  | Assignee must be an active member of the same project or `null`.                                                   |
| ISSUE-05 | Priority     | Fixed v1 enum: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.                                                                  |
| ISSUE-06 | Status       | Fixed v1 enum: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`.                                                         |
| ISSUE-07 | Due date     | Optional date; UI flags overdue issues without changing server truth.                                              |
| ISSUE-08 | Labels       | Issue can have multiple project-scoped labels.                                                                     |
| ISSUE-09 | Comments     | Authorized members can create and delete their own comments; owners can moderate project comments in v1 if needed. |
| ISSUE-10 | Attachments  | Authorized members can upload supported file types within configured size limits.                                  |
| ISSUE-11 | Deep-link    | Each issue has a stable URL that opens the issue detail view.                                                      |
| ISSUE-12 | Concurrency  | Update requests include a version/timestamp check to reduce accidental last-write-wins overwrites.                 |

### 3.4 Views and discovery

| ID      | Requirement | Acceptance criteria                                                                |
| ------- | ----------- | ---------------------------------------------------------------------------------- |
| VIEW-01 | Kanban      | Issues grouped by status; authorized drag-and-drop changes status/order.           |
| VIEW-02 | List        | Issues appear in a dense table/list with important fields visible.                 |
| VIEW-03 | Search      | Search filters project issues by relevant text fields.                             |
| VIEW-04 | Filter      | Filter by status, priority, assignee, label and due-date state.                    |
| VIEW-05 | Sort        | Server-supported allowlist: updated date, due date, priority, created date, title. |
| VIEW-06 | Pagination  | API enforces page/limit bounds; UI preserves filters when navigating pages.        |
| VIEW-07 | URL state   | Search/filter/sort/view state that should be shareable is represented in the URL.  |

## 4. Non-functional requirements

### Security

- All protected endpoints require an authenticated session.
- Authorization is enforced on the server for every resource/action.
- Validation occurs at the API boundary; client validation is UX only.
- Passwords are hashed with a slow password-hashing algorithm; Argon2id is the default choice.
- Secrets are never committed to the repository or logged.
- Request body and upload sizes are bounded.
- Authentication and invitation endpoints are rate-limited.
- Attachments are stored privately and accessed through authorized handlers/signed URLs.

OWASP distinguishes authentication from authorization and recommends least privilege, deny-by-default behavior, and server-side authorization checks. citeturn364660search0

### Reliability

- Mutating operations are transactional where multiple records must stay consistent.
- API returns stable, documented error shapes.
- Database migrations are versioned.
- Failed background email/upload actions do not silently report success.

### Accessibility

- Full keyboard path for forms, menus, dialogs and Kanban movement.
- Visible focus states.
- Correct labels and accessible names.
- Color is never the only signal for status/priority.
- `prefers-reduced-motion` is respected.
- Interactive components meet a practical WCAG 2.2 AA target.

### Performance

- Paginate server-side data sets.
- Debounce search requests.
- Avoid loading every issue when only one page/column is visible.
- Use optimistic UI selectively and reconcile with server responses.
- Lazy-load heavy attachment previews.

## 5. Business rules

1. A user can access a project only while they are an active member, unless the endpoint is explicitly public.
2. An assignee must belong to the issue's project.
3. A label must belong to the same project as the issue.
4. A project cannot be left without an owner.
5. A pending invitation can be accepted only once and expires.
6. Deleted/archived records are excluded from normal active queries.
7. User-supplied identifiers are never sufficient proof of permission.
8. Server-side rules are authoritative even when the UI hides unavailable actions.

## 6. Validation baseline

### User

- `displayName`: required, trimmed, 1–80 characters.
- `email`: normalized and valid email syntax.
- `password`: minimum 12 characters in v1; reject obviously empty/repeated-only values.

### Project

- `name`: required, trimmed, 1–80 characters.
- `description`: optional, max 2,000 characters.

### Issue

- `title`: required, trimmed, 1–100 characters.
- `description`: optional, max 5,000 characters.
- `priority`: enum only.
- `status`: enum only.
- `projectId`, `assigneeId`, `labelIds`: UUIDs / validated identifiers as used by the database model.
- `dueDate`: valid ISO date, normalized to the product's date semantics.

### Comment

- `body`: required, trimmed, 1–5,000 characters.
- No raw HTML is accepted in v1.

### Attachment

- Allowlist extensions and verified media types.
- Maximum per-file size is configured server-side; initial target: 10 MB.
- Generate storage names server-side.
- Store outside the public web root / in private object storage.

OWASP recommends validating untrusted input on the server and using allowlists, size limits, and other constraints. citeturn364660search3turn364660search2

## 7. Out of scope for v1

- Real-time WebSocket collaboration.
- Email notification preferences.
- Custom workflow statuses per project.
- Sprints, epics, story points and advanced Jira reporting.
- Public projects.
- Enterprise SSO/SAML/OIDC.
- Billing/subscriptions.
- Mobile native apps.
- AI-generated task features.

These can be added later only after the core system is stable.

## 8. Definition of done for the product

The application is not considered complete when the happy-path UI works. v1 is complete when:

1. all in-scope user flows work through the UI;
2. APIs independently enforce validation and authorization;
3. unauthorized resource access is covered by tests;
4. important failure/loading/empty states are implemented;
5. file uploads obey documented security limits;
6. database migrations can create the production schema from scratch;
7. automated tests and CI pass;
8. production deployment is reproducible;
9. secrets and environment configuration are documented;
10. the README can explain architecture, security decisions, setup, testing and deployment.
