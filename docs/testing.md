# Testing Strategy

## 1. Quality model

```text
                 E2E / browser
               ┌───────────────┐
               │ critical user│
               │   journeys   │
               └───────┬───────┘
                       │
             Integration/API tests
          ┌────────────┴─────────────┐
          │ auth + authz + DB + files│
          └────────────┬─────────────┘
                       │
                 Unit tests
        ┌──────────────┴──────────────┐
        │ pure rules + validators     │
        └─────────────────────────────┘
```

Do not maximize test count. Maximize confidence in important behavior.

## 2. Unit tests

Test isolated business rules:

- status transition validation;
- project permission rules;
- issue field validation;
- pagination parsing;
- sorting allowlist;
- invitation expiry/acceptance logic;
- password reset token state transitions;
- attachment validation helpers.

## 3. Integration/API tests

Use a disposable test database.

Critical suites:

### Authentication

- registration success/failure;
- duplicate email;
- login success/failure;
- logout invalidates session;
- password change;
- reset token expiry and single use.

### Authorization

Create multiple users/projects/memberships and verify every matrix edge.

Examples:

```text
Owner → owner action       = allow
Member → member action     = allow
Member → owner action      = deny
Non-member → any resource  = deny
User A → User B resource   = deny
```

### Issues

- create/edit/delete;
- assignee must be project member;
- labels must belong to project;
- move between columns;
- concurrent update conflict;
- filters/sort/pagination.

### Attachments

- valid upload;
- oversized file;
- spoofed type;
- unauthorized issue upload;
- private download access;
- deleted attachment behavior.

## 4. Frontend tests

Test the user-facing behavior that can regress easily:

- form validation messages;
- disabled/loading mutation states;
- filter URL synchronization;
- issue drawer/page state;
- board move rollback on API failure;
- keyboard-accessible interactions;
- permission-aware action visibility.

Remember: visibility is UX; API authorization remains authoritative.

## 5. E2E journeys

Start with a small set:

1. Register → create project → create issue.
2. Login → invite member → accept invitation.
3. Member → move issue → comment → attach file.
4. Owner → update project → remove member → archive project.
5. Forgot password → reset → login again.

## 6. Regression tests for security

Every discovered authorization bug becomes a permanent regression test.

Use unique test identities and projects so a passing test does not accidentally inherit shared state.

## 7. CI quality gates

Pull requests should block on:

```text
format/lint
↓
typecheck
↓
unit tests
↓
integration tests
↓
frontend build
↓
backend build
↓
dependency/security checks
```

E2E can run on pull requests and/or the protected main branch depending on execution time.

## 8. Manual QA checklist

Before a release, verify manually:

- desktop and mobile layouts;
- keyboard-only operation;
- reduced-motion mode;
- slow network;
- expired session;
- permission changes after page load;
- empty project;
- 100+ issue list behavior;
- upload failures;
- destructive confirmations;
- browser refresh on every deep route.

## 9. Definition of tested

A feature is “tested” only when the specific automated/manual checks described here have actually been executed and passed. Do not mark a checklist complete from code inspection alone.
