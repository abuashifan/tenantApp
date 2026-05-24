# Phase 18 - Flexible User Access & Permission Matrix

Phase 18 implements flexible access control for TenantApp.

Core decision:

`Final User Permission = Role Default Permissions + User Allow Overrides - User Deny Overrides`

Role is only a preset. A user can receive extra permissions outside their role or lose permissions that the role normally grants. Overrides are scoped to `company_users`, so the same user can have different access in different companies.

Implemented backend foundation:

- Central permission catalog table: `permissions`
- Central role preset table: `roles`
- Role permission pivot: `role_permissions`
- Per-company-user override table: `company_user_permission_overrides`
- Effective permission resolver service
- Permission catalog service for matrix UI
- `/api/access/*` endpoints for users, roles, catalog, update, copy access, and reset
- Invitation access endpoints for list/create/resend/revoke inside the active company
- Existing `permission:*` middleware now resolves effective permission

Implemented frontend foundation:

- User access page at `/access/users`
- Role preset list at `/access/roles`
- Module tabs
- Matrix columns: Daftar, Tambah, Ubah, Hapus, Cetak, Laporan, Persetujuan
- Special permission table
- Checkbox override behavior for allow/deny/default
- Copy access dialog
- Reset to role default

Security rules:

- No public tenant/company creation endpoint was added.
- User access endpoints require `auth:sanctum`, `company.access`, and access-management permissions.
- Company users are always filtered by the active company from `X-Company-ID`.
- Non owner/admin users cannot modify their own permission record.
- Transaction delete is not introduced. UI column `Hapus` maps to void/cancel/deactivate semantics.

Known limitations:

- Invitation frontend page is not implemented in this pass; invitation APIs and service exist.
- Role detail edit UI is a placeholder; role APIs are available.
- Permission audit is stored in existing `activity_logs`, not a dedicated audit table.
