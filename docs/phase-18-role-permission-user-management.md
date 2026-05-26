# Phase 18 - Role, Permission, and User Management Advanced

## Scope

Phase 18 makes company-scoped access administration usable from the Laravel API and the Vue frontend:

- company users: list, detail, deactivate, reactivate, remove, and manage access;
- roles: system presets plus company-scoped custom role create, edit, clone, activate, and deactivate;
- permissions: catalog, user override matrix, and custom role permission matrix;
- invitations: invite, list, resend, and revoke;
- audit: central activity-log view for access mutations.

Access management uses central records because it controls entry to tenant databases. Operational/accounting tenant data is not changed by this feature.

## Security Rules

- Every `/api/access/*` route requires `auth:sanctum` and `company.access`.
- The active company is supplied through `X-Company-ID`; records from another company are not returned or mutable.
- Each action additionally requires its `access.*` permission.
- System role presets are read-only. Custom roles carry `company_id` and can only be managed in that company.
- A user cannot change, deactivate, or remove their own company access through access management.
- The last active owner/admin cannot be removed or deactivated.
- Removing a company user sets status to `removed`; no user, role, invitation, or audit data is deleted.
- The existing API interceptor continues sending Bearer authorization and `X-Company-ID`.

## Backend Routes

All endpoints below are under `/api`, `auth:sanctum`, and `company.access`.

| Area | Endpoint | Permission |
| --- | --- | --- |
| Company users | `GET /access/users`, `GET /access/company-users`, `GET /access/company-users/{id}` | `access.users.view` |
| Company users | `PATCH /access/company-users/{id}/role` | `access.users.manage` |
| Company users | `PATCH /access/company-users/{id}/deactivate` | `access.users.deactivate` |
| Company users | `PATCH /access/company-users/{id}/reactivate` | `access.users.manage` |
| Company users | `PATCH /access/company-users/{id}/remove` | `access.users.remove` |
| User matrix | `GET /access/users/{id}/permissions` | `access.permissions.view` |
| User matrix | `PUT /access/users/{id}/permissions`, copy/reset actions | `access.permissions.manage` |
| Permission catalog | `GET /access/permission-catalog`, `GET /access/permissions/catalog` | `access.permissions.view` |
| Roles | `GET /access/roles`, `GET /access/roles/{id}` | `access.roles.view` |
| Roles | `POST /access/roles` | `access.roles.create` |
| Roles | `PATCH /access/roles/{id}` | `access.roles.edit` |
| Roles | `POST /access/roles/{id}/clone` | `access.roles.clone` |
| Roles | `PATCH /access/roles/{id}/deactivate` | `access.roles.deactivate` |
| Roles | `PATCH /access/roles/{id}/reactivate` | `access.roles.edit` |
| Role matrix | `GET /access/roles/{id}/permissions` | `access.permissions.view` |
| Role matrix | `PUT /access/roles/{id}/permissions` | `access.permissions.manage` |
| Invitations | `GET /access/invitations` | `access.invitations.view` |
| Invitations | `POST /access/invitations` | `access.invitations.create` |
| Invitations | `POST /access/invitations/{id}/resend` | `access.invitations.resend` |
| Invitations | `POST /access/invitations/{id}/revoke` | `access.invitations.revoke` |
| Audit | `GET /access/audit` | `access.audit.view` |

## Frontend Routes

| Route | Purpose |
| --- | --- |
| `/access/company-users` | Company user list and status actions |
| `/access/users/:id` | User permission matrix and role preset selection |
| `/access/permissions` | User permission matrix entry point |
| `/access/roles` | Role list, creation, clone, and status actions |
| `/access/roles/:id` | Role details and custom role permission matrix |
| `/access/invitations` | Invitation form and pending invitation actions |
| `/access/audit` | Filterable access mutation log |

The sidebar displays each Access Management entry only when the current permission payload includes its view permission.

## Permission Keys

The access namespace contains:

```text
access.users.view
access.users.invite
access.users.deactivate
access.users.remove
access.users.manage
access.roles.view
access.roles.create
access.roles.edit
access.roles.clone
access.roles.deactivate
access.roles.manage
access.permissions.view
access.permissions.assign
access.permissions.revoke
access.permissions.manage
access.invitations.view
access.invitations.create
access.invitations.resend
access.invitations.revoke
access.invitations.manage
access.audit.view
```

Owner/admin wildcard presets receive these keys through the existing permission configuration and seeder. Existing module permission keys are preserved.
The Phase 18 upgrade migration idempotently adds the `access.*` catalog rows and attaches them to existing owner/admin system presets, so upgraded databases receive access-management keys without a destructive reseed.

## Matrix Behavior

- A role supplies default permissions.
- A company user can have `allow` and `deny` overrides; deny takes precedence.
- Middleware now evaluates the effective company-user permission set, so role/override changes apply to existing API permission checks.
- Updating permissions for the logged-in user is protected against self-escalation. Authentication permission refresh remains available where an administrator changes access for another session/user.

## Invitation And Audit Flow

Invitations are scoped to the active company. A pending unexpired invitation for the same email cannot be duplicated. Resend generates a new token and expiry; revoke marks the invitation `revoked`.

Mutations write central `activity_logs` entries with company and acting user context for:

- role create, edit, clone, activate/deactivate, and role matrix sync;
- invitation create, resend, and revoke;
- company-user role, permission, copy/reset, activate/deactivate, and remove actions.

`GET /api/access/audit` reads those access-module entries with action/user/date filters.

## Manual QA Checklist

- Log in and select a company; confirm API requests include `Authorization: Bearer` and `X-Company-ID`.
- As an owner/admin, open all five Access Management menu entries.
- As a user without `access.*.view`, confirm Access Management entries are hidden and the API responds `403`.
- Create and edit a custom role; clone it; change its permission matrix.
- Confirm system roles cannot be edited and a role assigned to active users cannot be deactivated.
- Open a company user; set a role/override; confirm the resulting menu/API permission behavior.
- Deactivate/reactivate/remove a non-manager user and confirm its status changes without deletion.
- Invite an email, reject duplicate pending invite, resend, then revoke; confirm status and expiration display.
- Filter Access Audit and verify role, permission, invitation, and user actions appear.
- Switch company and confirm roles, invitations, users, and audit entries do not cross company scope.
- Recheck dashboard, master data, journal, sales, purchase, cash bank, inventory, virtual tabs, and Product History under Products.

## Known Limitations

- Invitation token acceptance and outbound email delivery are not exposed as a public workflow in this phase; invitations are manageable records pending an existing approved onboarding flow.
- Permission managers can assign any configured permission to another user/custom role. A constrained delegated-grant policy is a follow-up if non-owner permission administrators are required.
- Frontend automated tests are not currently configured for these access pages; the checklist above supplements backend feature coverage.
