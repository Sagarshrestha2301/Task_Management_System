# API Contract

## 1. API principles

- JSON request/response bodies.
- Version the public API path, e.g. `/api/v1`.
- Explicitly allow supported HTTP methods.
- Validate `Content-Type` and request size.
- Never trust query parameters or JSON fields from the client.
- Use stable application error codes.

OWASP recommends validating lengths/types/ranges, rejecting unexpected content, limiting request sizes and returning `429` when rate limits are exceeded. citeturn364660search1

## 2. Authentication endpoints

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/session
POST   /api/v1/auth/change-password
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

## 3. User endpoints

```text
GET    /api/v1/me
PATCH  /api/v1/me
```

## 4. Project endpoints

```text
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:projectId
PATCH  /api/v1/projects/:projectId
DELETE /api/v1/projects/:projectId
```

## 5. Member/invitation endpoints

```text
GET    /api/v1/projects/:projectId/members
DELETE /api/v1/projects/:projectId/members/:userId
POST   /api/v1/projects/:projectId/invitations
GET    /api/v1/invitations/:token
POST   /api/v1/invitations/:token/accept
```

## 6. Issue endpoints

```text
GET    /api/v1/projects/:projectId/issues
POST   /api/v1/projects/:projectId/issues
GET    /api/v1/issues/:issueId
PATCH  /api/v1/issues/:issueId
DELETE /api/v1/issues/:issueId
POST   /api/v1/issues/:issueId/move
```

The move endpoint makes the state transition explicit rather than hiding complex board behavior behind a generic update.

## 7. Labels

```text
GET    /api/v1/projects/:projectId/labels
POST   /api/v1/projects/:projectId/labels
PATCH  /api/v1/labels/:labelId
DELETE /api/v1/labels/:labelId
```

## 8. Comments

```text
GET    /api/v1/issues/:issueId/comments
POST   /api/v1/issues/:issueId/comments
PATCH  /api/v1/comments/:commentId
DELETE /api/v1/comments/:commentId
```

## 9. Attachments

```text
POST   /api/v1/issues/:issueId/attachments
GET    /api/v1/attachments/:attachmentId
DELETE /api/v1/attachments/:attachmentId
```

## 10. Issue list query contract

Example:

```text
GET /api/v1/projects/{projectId}/issues?
    page=1&
    limit=25&
    search=login&
    status=IN_PROGRESS,DONE&
    priority=HIGH,URGENT&
    assigneeId=...&
    labelId=...&
    due=overdue&
    sort=updatedAt&
    order=desc
```

Rules:

- `page >= 1`;
- `limit` has a strict maximum such as 100;
- enum query values are allowlisted;
- `sort` and `order` are allowlisted, never interpolated from raw client input;
- project membership is checked before issue data is returned.

## 11. Error contract

### Validation

`400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "fields": {
      "title": "Title is required."
    },
    "requestId": "req_123"
  }
}
```

### Authentication

`401 Unauthorized`

```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication is required.",
    "requestId": "req_123"
  }
}
```

### Authorization

`403 Forbidden` when the resource is known to the requester but the action is not permitted.

`404 Not Found` may be used for inaccessible resources where revealing existence would create an information leak.

### Rate limit

`429 Too Many Requests`

Include a retry hint when appropriate.

### Unexpected failure

`500 Internal Server Error`

Return a generic message plus request ID. Detailed diagnostics go to server logs.

## 12. Mutation semantics

### PATCH

Use allowlisted fields.

Bad:

```json
{ "role": "OWNER", "projectId": "other-project" }
```

if the endpoint does not permit those fields.

The server must ignore/reject unexpected fields rather than assigning the request body directly to a model.

### Optimistic concurrency

Mutation requests for editable resources may include:

```json
{ "version": 7, "title": "Updated title" }
```

The service updates only when the stored version still equals `7`; otherwise it returns a conflict and the client refreshes.

## 13. Response shaping

Never return database records blindly.

Map database entities to API DTOs so internal columns, hashes, tokens and audit metadata cannot leak accidentally.

## 14. Authentication enumeration safety

For registration, login and forgot-password flows, avoid response differences that disclose whether an email belongs to an account.

## 15. API documentation

The finished API should have machine-readable OpenAPI documentation generated from the actual route schemas or maintained alongside them, not invented after implementation.
