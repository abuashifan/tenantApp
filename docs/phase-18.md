TASK TITLE:
Phase 18 — Flexible User Access & Permission Matrix

PROJECT:
TenantAppDevelopment

CONTEXT:
Project ini adalah aplikasi akuntansi / ERP multi-tenant.

Backend:

- Laravel API
- Sanctum Bearer token
- Multi-tenant via X-Company-ID
- 1 company = 1 tenant database
- Existing middleware:
  - auth:sanctum
  - company.access
  - permission middleware if already available

Frontend:

- Vue 3 / frontend-vue
- Vite
- TypeScript
- Pinia
- Vue Router
- Axios
- TailwindCSS
- TanStack Table
- VeeValidate
- Zod

CURRENT ROADMAP CONTEXT:
Phase 18 awalnya adalah:
Role, Permission & User Management Advanced

Namun business decision terbaru:
Permission system tidak boleh kaku satu paket dengan jabatan.

Contoh masalah:
Client kecil/UMKM sering hanya punya beberapa staff.
Satu orang bisa merangkap:

- Staff Accounting
- Sales Admin
- Purchase Admin
- Cash Bank Admin
- Inventory Staff

Karena itu:

- Role tidak boleh menjadi batasan permanen.
- Role hanya menjadi preset/template awal.
- Hak akses final harus bisa diedit fleksibel per user.
- User boleh punya permission gabungan lintas modul.
- User boleh diberi permission tambahan di luar role.
- User boleh dicabut permission tertentu walaupun role default memilikinya.

FINAL BUSINESS DECISION:
Gunakan konsep:

Final User Permission =
Role Default Permissions

- User Extra Allow Permissions

* User Explicit Deny Permissions

Role = template / preset
Permission = hak akses nyata
User Override = penyesuaian khusus per user

GOAL:
Membangun sistem flexible permission matrix seperti aplikasi ERP/Accurate-style:

- Tab modul
- Matrix permission per fitur
- Checkbox action
- Permission khusus
- Salin hak akses dari user/role lain
- Reset ke default role
- Simpan permission final per user/company

REFERENCE UI BEHAVIOR FROM SCREENSHOT:
UI permission harus menyerupai konsep berikut:

Hak Akses Pengguna
├── Pilih User / Masuk Sebagai
├── Nama Akun
├── Level Pengguna / Role Preset
├── Cabang / Company / Branch context if applicable
├── Tombol Salin Hak Akses
├── Tab modul:
│ ├── Info Perusahaan
│ ├── Pembelian
│ ├── Penjualan
│ ├── Master Data
│ ├── Aktiva
│ ├── Persediaan
│ ├── Buku Besar
│ ├── Manufaktur optional/future
│ ├── Laporan
│ ├── Rancangan Formulir optional/future
│ ├── Alat Bantu optional/future
│ └── lainnya sesuai modul project
├── Main permission matrix:
│ ├── Deskripsi akses
│ ├── Tambah
│ ├── Ubah
│ ├── Hapus / Void / Nonaktifkan
│ ├── Cetak
│ ├── Daftar
│ ├── Laporan
│ └── Persetujuan
└── Special permission table:
├── Deskripsi akses
└── Akses checkbox

IMPORTANT UI TERMINOLOGY:
In UI, column "Hapus" may be shown for familiarity, but internally it must map safely:

- Transaction documents: void / cancel
- Master data: deactivate
- Draft-only data: delete only if backend explicitly supports safe delete
- Posted accounting documents: never hard delete

Do not implement hard delete for financial/business transactions.

PHASE 18 REVISED NAME:
Phase 18 — Flexible User Access & Permission Matrix

SUBPHASES:

- Phase 18A — User Access Foundation
- Phase 18B — Permission Catalog & Matrix Schema
- Phase 18C — Role Preset Management
- Phase 18D — User Permission Override
- Phase 18E — Permission Matrix UI
- Phase 18F — Copy Access, Reset Default, and Bulk Update
- Phase 18G — Invitation & Company User Access Workflow
- Phase 18H — Permission Audit & Security Logs
- Phase 18I — Integration Tests & Documentation

ABSOLUTE RULES:

1. Do not allow client/user to create tenant/company.
2. Do not create public tenant creation endpoint.
3. Do not create public tenant migration endpoint.
4. Do not allow staff to assign themselves higher permissions.
5. Do not let user manage permissions unless they have permission management access.
6. Do not make role permission immutable.
7. Do not force one user to only one rigid job function.
8. Do not hardcode permission groups only for accounting manager/sales admin/etc.
9. Do not remove existing permission middleware.
10. Do not break existing auth/company access.
11. Do not bypass backend permission checks even if frontend hides buttons.
12. Do not implement delete for posted/financial documents.
13. Do not expose cross-tenant users.
14. Do not show users from another company.
15. Do not apply permission override globally across all companies unless explicitly designed.

MULTI-TENANT RULE:
Permission must be scoped by company access.

A user may have different access in different companies.

Example:
User A in Company 1:

- Can create sales invoice
- Can post sales invoice
- Cannot manage users

User A in Company 2:

- Can only view reports

Therefore permission override must be linked to company_user, not just global user.

RECOMMENDED DATA MODEL:
Check existing tables first. If Spatie permission or custom permission system already exists, adapt carefully.

Preferred conceptual model:

central database:

- users
- companies
- company_users
- roles
- permissions
- role_permissions
- company_user_permission_overrides
- company_invitations
- access_audit_logs or activity_logs if existing

IMPORTANT:
Because permissions control central/company access, store user/role/permission management in central database unless existing architecture already stores them differently.

TABLE: permissions
Fields:

- id
- key string unique
- module string
- group string nullable
- feature string
- action string
- label string
- description nullable
- matrix_column nullable
- is_special boolean default false
- is_system boolean default false
- sort_order integer default 0
- timestamps

Example permission keys:

- settings.company.view
- settings.company.edit
- users.view
- users.invite
- users.deactivate
- permissions.view
- permissions.manage

- master_data.chart_of_accounts.view
- master_data.chart_of_accounts.create
- master_data.chart_of_accounts.edit
- master_data.chart_of_accounts.deactivate
- master_data.chart_of_accounts.import
- master_data.chart_of_accounts.export

- accounting.journals.view
- accounting.journals.create
- accounting.journals.edit
- accounting.journals.post
- accounting.journals.void
- accounting.journals.print
- accounting.reports.view

- sales.invoices.view
- sales.invoices.create
- sales.invoices.edit
- sales.invoices.post
- sales.invoices.void
- sales.invoices.print
- sales.invoices.report

- purchase.orders.view
- purchase.orders.create
- purchase.orders.edit
- purchase.orders.approve
- purchase.orders.cancel
- purchase.orders.print
- purchase.orders.report

- inventory.stock_adjustments.view
- inventory.stock_adjustments.create
- inventory.stock_adjustments.edit
- inventory.stock_adjustments.post
- inventory.stock_adjustments.void

TABLE: roles
Fields:

- id
- name
- slug
- description nullable
- is_system boolean default false
- is_active boolean default true
- timestamps

Important:

- System roles can exist as presets.
- System roles should not be deleted.
- But permissions for user can still be overridden.
- If editing system role is risky, allow clone role instead.

TABLE: role_permissions
Fields:

- id
- role_id
- permission_id
- timestamps

TABLE: company_users
Check existing table.
If already has role/status, preserve it.
It should support:

- user_id
- company_id
- role_id nullable or role string existing
- status active/inactive
- joined_at nullable
- timestamps

TABLE: company_user_permission_overrides
Fields:

- id
- company_user_id
- permission_id
- effect enum/string: allow, deny
- reason nullable
- created_by nullable
- updated_by nullable
- timestamps

Unique:

- company_user_id + permission_id

Meaning:

- allow = user gets this permission even if role does not have it
- deny = user loses this permission even if role has it

FINAL PERMISSION RESOLUTION:
Create service:

backend/app/Services/Permissions/EffectivePermissionService.php

Required methods:

- getRolePermissionKeys(Role $role): array
- getUserAllowOverrideKeys(CompanyUser $companyUser): array
- getUserDenyOverrideKeys(CompanyUser $companyUser): array
- getEffectivePermissionKeys(CompanyUser $companyUser): array
- hasPermission(CompanyUser $companyUser, string $permissionKey): bool
- explainPermission(CompanyUser $companyUser, string $permissionKey): array

Formula:
effective = role_permissions + allow_overrides - deny_overrides

Explain result example:
{
"permission": "sales.invoices.post",
"allowed": true,
"source": "user_override_allow"
}

or:
{
"permission": "journals.void",
"allowed": false,
"source": "user_override_deny"
}

PERMISSION CATALOG SERVICE:
Create:

backend/app/Services/Permissions/PermissionCatalogService.php

Responsibilities:

- Return permissions grouped for matrix UI
- Group by module
- Group by feature
- Map technical action into matrix columns
- Separate standard matrix permissions and special permissions

Matrix columns:

- daftar
- tambah
- ubah
- hapus
- cetak
- laporan
- persetujuan

Mapping:

- view/list/index/show => daftar
- create/store => tambah
- edit/update => ubah
- delete/deactivate/void/cancel => hapus
- print/export_pdf => cetak
- report/view_report => laporan
- approve/post/confirm/close/reopen => persetujuan

Special permission:
Anything not fitting matrix columns:

- import
- export
- access_all_branches
- change_price
- manage_users
- manage_permissions
- fiscal_closing
- period_lock_manage
- reopen_period
- view_audit_log

API ENDPOINTS:
Add under auth:sanctum + company.access where appropriate.

Permission catalog:
GET /api/access/permission-catalog

Effective user permissions:
GET /api/access/users/{companyUserId}/permissions

Update user permission override:
PUT /api/access/users/{companyUserId}/permissions

Copy access:
POST /api/access/users/{companyUserId}/copy-access

Reset to role default:
POST /api/access/users/{companyUserId}/reset-permissions

Company users:
GET /api/access/company-users
GET /api/access/company-users/{companyUserId}
PATCH /api/access/company-users/{companyUserId}/role
PATCH /api/access/company-users/{companyUserId}/deactivate
PATCH /api/access/company-users/{companyUserId}/activate

Roles:
GET /api/access/roles
POST /api/access/roles
GET /api/access/roles/{roleId}
PATCH /api/access/roles/{roleId}
POST /api/access/roles/{roleId}/clone
PUT /api/access/roles/{roleId}/permissions
PATCH /api/access/roles/{roleId}/deactivate
PATCH /api/access/roles/{roleId}/activate

Invitations if existing/future:
GET /api/access/invitations
POST /api/access/invitations
POST /api/access/invitations/{id}/resend
POST /api/access/invitations/{id}/revoke

Required middleware:

- auth:sanctum
- company.access
- permission:access.users.view
- permission:access.users.manage
- permission:access.permissions.view
- permission:access.permissions.manage
- permission:access.roles.view
- permission:access.roles.manage
- permission:access.invitations.manage

IMPORTANT SECURITY:
Backend must prevent:

- user modifying their own permissions unless owner/superadmin policy allows
- non-owner assigning owner-level permissions
- cross-company permission editing
- inactive company_user being edited as active
- editing users from other company
- assigning permission keys that do not exist
- giving tenant/company creation permission to client users if such permission exists
- exposing tenant generator, tenant migration, or internal admin commands

REQUEST VALIDATION:
Create requests:

- UpdateCompanyUserPermissionRequest
- CopyAccessRequest
- UpdateCompanyUserRoleRequest
- StoreRoleRequest
- UpdateRoleRequest
- UpdateRolePermissionsRequest
- InviteCompanyUserRequest if needed

UpdateCompanyUserPermissionRequest payload:
{
"role_id": 1,
"overrides": [
{
"permission_key": "sales.invoices.post",
"effect": "allow"
},
{
"permission_key": "journals.void",
"effect": "deny"
}
]
}

Rules:

- role_id nullable/exists
- overrides array
- permission_key exists in permissions.key
- effect in allow,deny
- no duplicate permission_key
- require manage permission
- reason optional string

CopyAccessRequest payload:
{
"source_company_user_id": 10,
"copy_role": true,
"copy_overrides": true
}

Behavior:

- source and target must belong to same company
- copy role if copy_role true
- copy overrides if copy_overrides true
- replace target overrides with source overrides
- audit log required

Reset permissions:
POST /api/access/users/{companyUserId}/reset-permissions

Behavior:

- delete all allow/deny overrides for company_user
- keep role_id
- final permissions become role default
- audit log required

ROLE PRESET RULES:
Default roles can exist:

- Owner
- Admin
- Finance Manager
- Accountant
- Sales Admin
- Purchase Admin
- Warehouse Staff
- Viewer

But these are only presets.
Do not lock final user permissions to role.

Role can be used to quickly assign initial permissions.
User permission matrix can override after role selection.

FRONTEND UI:
Create Vue permission matrix UI similar to uploaded screenshot.

Pages:
src/pages/access/UserAccessPage.vue
src/pages/access/RolesPage.vue
src/pages/access/RoleDetailPage.vue
src/pages/access/InvitationsPage.vue optional

Components:
src/components/access/
├── UserAccessHeader.vue
├── UserSelector.vue
├── RolePresetSelector.vue
├── CopyAccessDialog.vue
├── ResetPermissionDialog.vue
├── PermissionModuleTabs.vue
├── PermissionMatrixTable.vue
├── SpecialPermissionTable.vue
├── PermissionCheckbox.vue
├── PermissionSaveBar.vue
├── PermissionDiffBadge.vue
└── PermissionAuditPanel.vue optional

USER ACCESS PAGE LAYOUT:
Top section:

- Title: Hak Akses Pengguna
- User selector / Masuk Sebagai
- Nama Akun readonly
- Level Pengguna / Role Preset selector
- Company/Branch selector if branch module exists; otherwise disabled/hidden
- Button: Salin Hak Akses
- Button: Reset ke Role Default
- Button: Simpan

Module tabs:

- Info Perusahaan
- Master Data
- Buku Besar / Akuntansi
- Penjualan
- Pembelian
- Kas & Bank
- Persediaan
- Aktiva Tetap
- Laporan
- Pengaturan
- Audit
- Other modules only if permissions exist

Main matrix table:
Columns:

- Deskripsi akses
- Tambah
- Ubah
- Hapus
- Cetak
- Daftar
- Laporan
- Persetujuan

Special permission table:
Columns:

- Deskripsi akses
- Akses

UI CHECKBOX STATE:
Each checkbox must know its source:

1. checked from role default
2. checked from user allow override
3. unchecked from user deny override
4. unchecked because not assigned anywhere

Visual suggestion:

- Role default checked: normal checked
- User allow override: checked with accent/highlight
- User deny override: unchecked with warning/different border
- Not assigned: unchecked normal

Tooltip or small badge:

- Default role
- Tambahan user
- Dicabut dari user

IMPORTANT FRONTEND BEHAVIOR:
When role changes:

- show warning: "Mengubah role akan mengubah default permission. Override user tetap bisa dipertahankan atau direset."
- provide options:
  - Keep current overrides
  - Reset overrides to new role default

When checkbox changes:

- If permission is in role default and user unchecks it:
  create deny override
- If permission is not in role default and user checks it:
  create allow override
- If user returns checkbox to role default state:
  remove override
- Save button sends only overrides, not the whole catalog if possible

Permission calculation in frontend:

- Use backend effective permission response as source of truth
- Frontend may compute preview, but backend decides final result

COPY ACCESS:
Button: Salin Hak Akses

Dialog:

- Select source user or source role
- Options:
  - Copy role preset
  - Copy user overrides
  - Replace existing overrides
- Confirm button

Backend must validate same company for user copy.

RESET:
Button: Reset ke Role Default

Behavior:

- Confirm dialog
- Deletes user overrides
- Final permission becomes role default

SAVE:
Button: Simpan

On save:

- call PUT /api/access/users/{companyUserId}/permissions
- show success notification
- refetch effective permissions
- update auth permissions if edited user is current user

AUTH PERMISSION REFRESH:
If current logged-in user edits their own effective permission or company switch occurs:

- refresh permissions store
- update sidebar/menu/action visibility

PINIA STORES:
Create/update:

src/stores/access.store.ts

State:

- companyUsers
- selectedCompanyUser
- roles
- permissionCatalog
- effectivePermissions
- overrides
- loading
- saving
- error

Actions:

- fetchCompanyUsers()
- fetchRoles()
- fetchPermissionCatalog()
- fetchUserPermissions(companyUserId)
- updateUserPermissions(companyUserId, payload)
- copyAccess(targetCompanyUserId, payload)
- resetPermissions(companyUserId)
- updateRole(companyUserId, roleId)
- computeLocalOverrideChange(permissionKey, desiredChecked)

Backend services:
src/services/access/
├── company-users.service.ts
├── roles.service.ts
├── permissions.service.ts
└── invitations.service.ts

ROUTER:
Add routes:

- /access/users
- /access/roles
- /access/roles/:id
- /access/invitations optional

Route meta:

- requiresAuth: true
- requiresCompany: true
- permission:
  - access.users.view
  - access.permissions.view
  - access.roles.view

SIDEBAR:
Add menu group:

- Access Management / Hak Akses
  - User Access
  - Roles
  - Invitations optional
  - Audit optional

Only show menu if user has relevant permission.

BACKEND PERMISSION SEED:
Seed permission catalog grouped by module.

Required core permission groups:

Info Perusahaan:

- settings.company.view
- settings.company.edit
- settings.accounting.edit
- settings.modules.edit

Hak Akses:

- access.users.view
- access.users.manage
- access.roles.view
- access.roles.manage
- access.permissions.view
- access.permissions.manage
- access.invitations.view
- access.invitations.manage

Master Data:

- master_data.chart_of_accounts.view/create/edit/deactivate/import/export
- master_data.contacts.view/create/edit/deactivate/import/export
- master_data.products.view/create/edit/deactivate/import/export
- master_data.units.view/create/edit/deactivate
- master_data.warehouses.view/create/edit/deactivate
- master_data.departments.view/create/edit/deactivate
- master_data.projects.view/create/edit/deactivate

Accounting:

- accounting.journals.view/create/edit/post/void/print
- accounting.general_ledger.view/report/print
- accounting.trial_balance.view/report/print
- accounting.financial_statements.view/report/print
- accounting.fiscal_closing.view/manage
- accounting.period_locks.view/manage

Sales:

- sales.quotations.view/create/edit/approve/cancel/print
- sales.orders.view/create/edit/approve/confirm/cancel/print
- sales.delivery_orders.view/create/edit/approve/cancel/void/print
- sales.invoices.view/create/edit/post/void/print/report
- sales.receipts.view/create/post/void/print
- sales.deposits.view/create/post/void/refund
- sales.returns.view/create/approve/post/void
- sales.ar.view/report

Purchase:

- purchase.requests.view/create/edit/approve/cancel
- purchase.orders.view/create/edit/approve/confirm/cancel/print
- purchase.goods_receipts.view/create/edit/approve/cancel/void/print
- purchase.bills.view/create/edit/post/void/print/report
- purchase.payments.view/create/post/void/print
- purchase.deposits.view/create/post/void/refund
- purchase.returns.view/create/approve/post/void
- purchase.ap.view/report

Inventory:

- inventory.stock.view/report
- inventory.movements.view/report
- inventory.adjustments.view/create/edit/post/void
- inventory.opname.view/create/edit/post/void
- inventory.valuation.view/report
- inventory.stock_card.view/report

Reports:

- reports.accounting.view
- reports.sales.view
- reports.purchase.view
- reports.inventory.view
- reports.cash_bank.view
- reports.audit.view
- reports.export

Audit:

- audit.logs.view
- audit.security.view
- audit.permission_changes.view
- audit.user_access.view

TESTS:
Backend tests:

- PermissionCatalogTest
- EffectivePermissionServiceTest
- UserPermissionOverrideTest
- CopyAccessTest
- RolePermissionTest
- AccessSecurityTest

Test scenarios:

1. User gets permission from role.
2. User gets extra allow permission not in role.
3. User deny override removes permission from role.
4. Removing override restores role default.
5. Copy access from another user in same company works.
6. Copy access from another company is rejected.
7. Reset permissions removes overrides.
8. User without manage permission cannot edit access.
9. User cannot assign permission to themselves if policy forbids.
10. Inactive company user cannot access app.
11. Effective permission API returns grouped matrix.
12. Tenant/company isolation works.

Frontend tests or manual checklist:

- User access page loads.
- Select user loads permission matrix.
- Change checkbox creates correct allow/deny override.
- Save updates permission.
- Reset returns to role default.
- Copy access works.
- Permission tabs render correctly.
- Special permissions render separately.
- Sidebar updates after permission refresh.
- Buttons hide/show based on permission.

DOCUMENTATION:
Create/update:

docs/phase-18-flexible-user-access-permission-matrix.md
docs/permission-catalog.md
docs/permission-resolution-rules.md
docs/frontend-permission-matrix-ui.md

Docs must explain:

- Role as preset
- User override allow/deny
- Effective permission formula
- Matrix UI columns
- Special permissions
- Copy access behavior
- Reset behavior
- Security rules
- No tenant/company creation for client
- No hard delete for transactions

COMMANDS TO RUN:
Backend:
cd backend
php artisan migrate
php artisan db:seed --class=PermissionSeeder if created
php artisan test --filter=Permission
php artisan route:list --path=api/access

Frontend:
cd frontend-vue
npm install
npm run typecheck
npm run lint
npm run build

If commands cannot run, state clearly in final summary.

ACCEPTANCE CRITERIA:
Phase 18 permission system is accepted when:

Backend:
[ ] Permission catalog exists and grouped by module/feature/action
[ ] Role permissions exist as preset
[ ] Company user permission overrides exist
[ ] Effective permission formula works
[ ] Allow override can add permission
[ ] Deny override can remove role permission
[ ] Copy access works
[ ] Reset to role default works
[ ] Cross-company editing is blocked
[ ] Permission audit logs are created
[ ] Existing permission middleware uses effective permission result
[ ] No public tenant/company creation endpoint is added

Frontend:
[ ] User Access page exists
[ ] Permission matrix matches ERP-style screenshot concept
[ ] Module tabs exist
[ ] Matrix columns exist
[ ] Special permissions table exists
[ ] Role selector works as preset
[ ] Checkbox changes produce allow/deny overrides
[ ] Save works
[ ] Copy access works
[ ] Reset works
[ ] Menu/action visibility respects effective permission
[ ] UI does not force rigid job-based access

FINAL SUMMARY REQUIRED:
When done, report:

1. Backend files created
2. Backend files changed
3. Frontend files created
4. Frontend files changed
5. API endpoints added
6. Permission catalog groups added
7. Tests added
8. Docs added
9. Commands run and result
10. Known limitations
11. Next recommended phase/subphase

COMMIT MESSAGE:
add flexible user access permission matrix
