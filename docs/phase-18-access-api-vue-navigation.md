# Phase 18 Access API and Vue Navigation

## Problem Found

The audit item reported that Phase 18 Access controllers and Vue pages existed but were not reliably usable from the active app flow. In the current codebase the backend `/api/access/*` route group is already registered, but Vue workspace integration still had a gap: several Access sidebar routes did not have entries in `workspace/registry.ts`, so they could fall back to the generic backend workspace instead of the intended Access pages. Direct route loads also needed route metadata so the workspace shell can open the correct primary tab.

## Backend Routes

The active Laravel route group is:

- prefix: `/api/access`
- middleware: `auth:sanctum`, `company.access`
- per-route middleware: `permission:access.*`

Activated surfaces include:

- Company Users: `GET /access/users`, `GET /access/company-users`, detail, role update, deactivate, reactivate, remove
- Permission Catalog: `GET /access/permission-catalog`, `GET /access/permissions/catalog`
- User Permissions: `GET|PUT /access/users/{companyUserId}/permissions`, copy access, reset permissions
- Roles: list, create, detail, update, clone, deactivate, reactivate
- Role Permissions: `GET|PUT /access/roles/{roleId}/permissions`
- Invitations: list, create, resend, revoke
- Access Audit: `GET /access/audit`

No public tenant/company creation route is added by this work.

## Vue Routes And Navigation

Access routes now carry workspace metadata so direct route visits and sidebar clicks open the right primary workspace tab:

- `/access/company-users`
- `/access/users/:id`
- `/access/permissions`
- `/access/roles`
- `/access/roles/:id`
- `/access/invitations`
- `/access/audit`

The Access Management sidebar group remains permission-aware:

- Company Users: `access.users.view`
- Permission Matrix: `access.permissions.view`
- Roles: `access.roles.view`
- Invitations: `access.invitations.view`
- Access Audit: `access.audit.view`

## API Service Mapping

Vue services use the existing API client and do not include `/api` twice:

- `company-users.service.ts` → `/access/company-users`
- `permissions.service.ts` → `/access/permission-catalog`, `/access/users/{id}/permissions`
- `roles.service.ts` → `/access/roles`, `/access/roles/{id}/permissions`
- `invitations.service.ts` → `/access/invitations`
- `audit.service.ts` → `/access/audit`

The shared API client still attaches `Authorization: Bearer ...` and `X-Company-ID`.

## Pages Available

- Company Users page with list and status actions.
- User Permission Matrix page.
- Roles page with create, clone, activate/deactivate actions.
- Role Detail page with role permission matrix.
- Invitations page with create, resend, revoke actions.
- Access Audit page with simple filters.

## Permission Keys

The access namespace exists in `backend/config/permissions.php`, including `access.users.*`, `access.roles.*`, `access.permissions.*`, `access.invitations.*`, and `access.audit.view`. Owner/admin roles continue to receive wildcard access.

## Tests And Checks

Backend feature coverage exists in `AccessManagementTest` for auth/company context, permission denial, users, roles, role permissions, invitations, audit, and company scoping.

Manual QA checklist:

- Log in as an owner/admin and select a company.
- Confirm Access Management appears in the sidebar.
- Open Company Users, Permission Matrix, Roles, Invitations, and Access Audit.
- Open a user access matrix from Company Users.
- Open a role detail from Roles.
- Confirm a user without `access.*.view` cannot see the menu and receives `403` from protected endpoints.
- Confirm requests include `Authorization` and `X-Company-ID`.
- Confirm existing dashboard, master data, journal, reports, sales, purchase, cash-bank, and inventory menus still open.
- Confirm Product History remains under Products, not Product Category.

## Known Limitations

Frontend automated tests are not configured for these Vue access pages. Current verification relies on backend feature tests, TypeScript, lint, build, and the manual QA checklist above.
