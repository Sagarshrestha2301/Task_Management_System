# Security Plan

## 1. Threat model

Primary assets:

- account credentials;
- active sessions;
- private projects and issue data;
- project membership and invitations;
- attachments;
- password reset capability;
- audit history.

Primary threats:

- account takeover;
- broken object-level authorization / IDOR;
- brute-force login attempts;
- mass assignment;
- injection;
- XSS through issue/comment content;
- malicious file upload;
- CSRF against cookie-authenticated endpoints;
- enumeration of private projects/users;
- abuse of search, uploads or invitation endpoints;
- accidental data loss from concurrent edits.

## 2. Authentication controls

### Password storage

- Hash passwords with Argon2id.
- Never encrypt passwords for later recovery.
- Never log plaintext passwords.
- Never send passwords back in API responses.

OWASP's current password-storage guidance recommends Argon2id and provides minimum configuration guidance. citeturn364660search5

### Session security

- random, high-entropy session secret;
- server-side session lookup;
- HttpOnly cookie;
- Secure cookie in production;
- appropriate SameSite policy;
- idle and absolute expiration;
- server-side revocation;
- invalidate affected sessions after password change/reset.

## 3. Authorization matrix

| Resource/action        | Owner | Member | Non-member |
| ---------------------- | ----: | -----: | ---------: |
| View project           |   Yes |    Yes |         No |
| Update project         |   Yes |     No |         No |
| Archive/delete project |   Yes |     No |         No |
| Invite member          |   Yes |     No |         No |
| Remove member          |   Yes |     No |         No |
| Create issue           |   Yes |    Yes |         No |
| View issue             |   Yes |    Yes |         No |
| Edit issue             |   Yes |    Yes |         No |
| Delete issue           |   Yes |   Yes* |         No |
| Comment                |   Yes |    Yes |         No |
| Upload attachment      |   Yes |    Yes |         No |

`*` Members may delete issues they are authorized to edit; enforce the exact rule in the service rather than in the UI.

The project owner is a role assignment, not a client-provided property.

OWASP recommends least privilege, deny-by-default and server-side authorization enforcement. citeturn364660search0turn364660search4

## 4. Authorization implementation pattern

```text
1. Authenticate session
2. Load target resource
3. Determine project context
4. Load actor membership/role
5. Check action policy
6. Apply business rule
7. Perform mutation
```

Never do this:

```ts
if (req.body.userId === currentUser.id) {
  // therefore user can edit the resource
}
```

The target resource relationship must be checked first.

## 5. Input validation

Validate at the boundary:

- path parameters;
- query parameters;
- headers used by the API;
- JSON body;
- multipart metadata;
- file size/type.

Reject unexpected fields on security-sensitive endpoints.

Use schema validation for shape, then business validation for cross-record rules.

OWASP advises validating untrusted data early and notes that input validation is complementary to, not a replacement for, other defenses such as output encoding and parameterized database access. citeturn364660search3

## 6. XSS/content safety

V1 issue descriptions and comments are plain text.

If rich text/Markdown is added later:

- parse with a trusted library;
- sanitize to a strict allowlist;
- never render arbitrary HTML with a dangerous escape hatch;
- test payloads such as script tags, event handlers, malformed URLs and protocol injection.

## 7. SQL injection

- use Prisma/parameterized queries;
- never concatenate raw user input into SQL;
- allowlist dynamic sort fields;
- review raw SQL queries separately if any are introduced.

## 8. CSRF

Because authentication uses cookies, browser cross-site request behavior must be considered.

Baseline:

- appropriate SameSite cookie setting;
- verify `Origin`/trusted origin for unsafe methods where the deployment model allows it;
- use a CSRF token when the deployment crosses sites or policy requires it.

Do not assume a custom frontend UI prevents forged requests.

## 9. Rate limiting

Initial starting points, to be tuned using logs rather than treated as universal constants:

| Endpoint group        | Initial policy                                                     |
| --------------------- | ------------------------------------------------------------------ |
| login                 | 10 requests / 15 min / IP + additional identifier-aware protection |
| register              | 5 requests / hour / IP                                             |
| forgot/reset password | 5 requests / hour / IP                                             |
| invitations           | 20 / hour / authenticated user                                     |
| uploads               | 30 / hour / authenticated user                                     |
| normal API            | moderate per-user/IP limit with burst allowance                    |

Use `429` and do not let the rate-limit layer become an easy way to permanently lock out legitimate users.

## 10. File upload security

Allowed v1 types should be intentionally narrow, e.g.:

```text
image/jpeg
image/png
image/webp
application/pdf
```

Controls:

1. user must be authenticated;
2. user must be authorized for the issue/project;
3. enforce request and per-file size limits;
4. verify actual file type rather than trusting only the browser `Content-Type`;
5. use a generated storage key;
6. store privately/outside the webroot;
7. serve through authorized access or short-lived signed URLs;
8. consider malware scanning where infrastructure supports it;
9. log upload failures without logging sensitive file contents.

OWASP specifically recommends extension allowlists, content/type validation, generated filenames, size limits, authorization and private storage patterns for uploads. citeturn364660search2

## 11. Enumeration resistance

Examples:

- login errors should be generic;
- forgot-password response should be generic;
- inaccessible project/issue lookups can use 404 rather than confirming existence;
- invitation tokens should be high entropy and single-use.

## 12. Mass assignment protection

Bad:

```ts
await prisma.project.update({
  where: { id: projectId },
  data: req.body,
});
```

Good pattern:

```text
parse request schema
      ↓
select allowed business fields
      ↓
perform authorization
      ↓
map DTO → persistence fields
```

## 13. Security headers and transport

Production must use HTTPS and suitable security headers.

At minimum review:

- CSP strategy;
- HSTS;
- frame restrictions;
- MIME sniffing protection;
- referrer policy;
- permissions policy where useful.

Do not copy a giant header list blindly; verify what each header does in the actual deployment.

## 14. Secrets

Never commit:

- database passwords;
- session secrets;
- email provider keys;
- object-storage keys;
- 21st.dev account/API keys;
- CI credentials.

Use `.env.example` for names only.

## 15. Logging and audit

Security-relevant events:

- failed login;
- password reset request;
- successful password reset;
- membership changes;
- invitations created/accepted/rejected/expired;
- project deletion/archive;
- issue deletion;
- repeated authorization failures;
- suspicious upload failures.

Do not log:

- passwords;
- reset tokens;
- session secrets;
- authentication cookies;
- complete private attachment content.

## 16. Security test cases

At minimum, tests must prove:

- user A cannot read user B's private project;
- member cannot archive a project;
- member cannot remove another member;
- user cannot assign an issue to someone outside the project;
- user cannot attach a file to an issue in another project;
- forged IDs do not bypass authorization;
- unknown PATCH fields are rejected;
- expired/reset/used tokens fail;
- rate-limited endpoints return 429 after configured thresholds;
- attachment type/size validation cannot be bypassed by spoofed metadata.

## 17. OWASP review gates

During each major phase, review relevant OWASP guidance rather than waiting until the end. The secure-code-review guidance also calls out resource limits, business-rule enforcement, secret management, secure defaults, dependency management, authentication/authorization logging and audit trails as review areas. citeturn364660search6
