# Data Model

## 1. Core entities

```text
User
 │
 ├────< Session
 ├────< PasswordResetToken
 ├────< ProjectMember >──── Project
 │                              │
 │                              ├────< Invitation
 │                              ├────< Issue >────< Comment
 │                              │       │  │
 │                              │       │  └────< Attachment
 │                              │       │
 │                              │       └────< IssueLabel >──── Label
 │                              │
 │                              └────< AuditLog
```

## 2. Tables

### users

```text
id             UUID PK
email          normalized unique
password_hash  text
name           varchar(80)
avatar_url      nullable
created_at     timestamptz
updated_at     timestamptz
```

### sessions

```text
id             UUID PK
user_id        FK users.id
secret_hash    text unique
expires_at     timestamptz
created_at     timestamptz
last_used_at   timestamptz
revoked_at     nullable
ip_hash        nullable
user_agent     nullable
```

Index `user_id`, `expires_at`.

### projects

```text
id             UUID PK
name           varchar(80)
description    varchar(2000) nullable
owner_id       FK users.id
created_at     timestamptz
updated_at     timestamptz
archived_at    nullable
```

Index `owner_id`, `archived_at`.

### project_members

```text
project_id     FK projects.id
user_id        FK users.id
role           enum OWNER | MEMBER
joined_at      timestamptz
```

Composite primary key `(project_id, user_id)`.

Unique active membership by the composite key.

### invitations

```text
id             UUID PK
project_id     FK projects.id
email          normalized email
role           enum MEMBER
secret_hash    text unique
expires_at     timestamptz
accepted_at    nullable
created_by     FK users.id
created_at     timestamptz
```

A pending invitation should be treated as a business-state query rather than duplicated blindly.

### issues

```text
id             UUID PK
project_id     FK projects.id
issue_number   integer
created_by     FK users.id
title          varchar(100)
description    varchar(5000) nullable
status         enum TODO | IN_PROGRESS | IN_REVIEW | DONE
priority       enum LOW | MEDIUM | HIGH | URGENT
assignee_id    FK users.id nullable
due_date       date nullable
position       integer
version        integer default 1
created_at     timestamptz
updated_at     timestamptz
deleted_at     nullable
```

Constraints/business checks:

- `(project_id, issue_number)` unique;
- `assignee_id` must be a member of the same project via service-level transaction logic;
- deleted issues are excluded by normal queries.

Indexes:

- `(project_id, status, position)`;
- `(project_id, updated_at)`;
- `(project_id, priority)`;
- `(project_id, due_date)`;
- `(project_id, assignee_id)`.

### labels

```text
id             UUID PK
project_id     FK projects.id
name           varchar(40)
color_key      varchar(30)
created_at     timestamptz
```

Unique `(project_id, name)`.

### issue_labels

```text
issue_id       FK issues.id
label_id       FK labels.id
```

Composite primary key `(issue_id, label_id)`.

### comments

```text
id             UUID PK
issue_id       FK issues.id
author_id      FK users.id
body           varchar(5000)
created_at     timestamptz
updated_at     timestamptz
deleted_at     nullable
```

Index `(issue_id, created_at)`.

### attachments

```text
id             UUID PK
issue_id       FK issues.id
uploaded_by    FK users.id
original_name  varchar(255)
storage_key    text unique
mime_type      varchar(100)
byte_size      bigint
created_at     timestamptz
deleted_at     nullable
```

Never use `original_name` as the storage path.

### password_reset_tokens

```text
id             UUID PK
user_id        FK users.id
token_hash     text unique
expires_at     timestamptz
used_at        nullable
created_at     timestamptz
```

### audit_logs

```text
id             UUID PK
actor_id       FK users.id nullable
action         varchar(80)
resource_type  varchar(40)
resource_id    UUID nullable
project_id     UUID nullable
metadata_json  jsonb
created_at     timestamptz
```

Do not place secrets or full request bodies in audit metadata.

## 3. Referential integrity

Prefer database foreign keys for relationships that must remain valid.

Deletion behavior should be explicit.

Examples:

- deleting a user is out of scope for v1;
- archiving a project should not physically destroy history;
- issue/comment/attachment soft-deletion preserves auditability;
- deleting a membership does not automatically erase historical authorship.

## 4. Issue numbering

Issue identifiers should be human-friendly inside a project, e.g. `OPS-42`.

The project can own a short immutable key such as `OPS`, while `issue_number` increments per project.

Do not use the human identifier as the primary key.

## 5. Kanban ordering

Use `position` integers scoped to the project/status.

For v1, moving an issue can run in a transaction that:

1. validates the destination status;
2. validates authorization;
3. updates affected positions;
4. moves the issue;
5. increments the issue version.

This is simpler to reason about than introducing a specialized ranking algorithm early.

## 6. Search strategy

Start with PostgreSQL `ILIKE`/trigram-style indexing only if needed after measuring.

Search v1 can cover:

- title;
- issue identifier;
- description.

Do not introduce a search engine until PostgreSQL performance shows a real need.
