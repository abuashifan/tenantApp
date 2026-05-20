# Phase 4B — Permission Foundation (Basic, Extensible)

Phase 4B menambahkan fondasi permission dasar untuk mengamankan endpoint backend berdasarkan **role user** pada company aktif.

Catatan penting:
- Permission di Phase 4B masih **static template** berbasis config.
- Phase 14 nanti akan menambahkan **dynamic/manual permission per user tenant** lewat UI.
- Middleware cukup bertanya `PermissionService::can($permission)` agar sumber permission mudah diganti di Phase 14.
- Naming permission dibuat granular sejak awal (contoh: `sales.create`, `journal.post`, `reports.export`), bukan permission kasar seperti `manage_sales`.

## Tujuan

- Menyediakan naming permission yang granular sejak awal (view/create/edit/void/approve/post/export).
- Menyediakan role template awal sebagai fallback: `owner`, `admin`, `finance`, `accountant`, `sales`, `purchasing`, `warehouse`, `viewer`.
- Mengamankan route sensitif seperti company settings dengan permission `settings.company.view/edit`.

## Permission Mode (Phase 4A readiness)

`company_accounting_settings.user_permission_mode`:
- `role_template` (default): permission mengikuti role template dari config
- `manual_per_user`: placeholder untuk Phase 14 (Phase 4B masih fallback ke role template)

## Config

File: `backend/config/permissions.php`

- `permissions`: daftar permission granular yang bisa dipakai oleh middleware
- `roles`: role → list permission (mendukung wildcard `*`)

## PermissionService

File: `backend/app/Services/Permissions/PermissionService.php`

Behavior:
- membaca role dari `TenantContext` (bukan dari request body)
- mendukung wildcard `*`
- unknown/null role → permission kosong
- struktur disiapkan untuk Phase 14 via placeholder `resolveUserOverrides()`

## Middleware permission

Alias middleware: `permission`

Contoh pemakaian:
- `permission:settings.company.view`
- `permission:settings.company.edit`

Jika permission ditolak, response 403:
```json
{
  "success": false,
  "code": "PERMISSION_DENIED",
  "message": "You do not have permission to perform this action."
}
```

## Endpoint

### GET `/api/auth/permissions`

Middleware:
- `auth:sanctum`
- `company.access`

Response:
```json
{
  "success": true,
  "message": "Permissions retrieved successfully",
  "data": {
    "role": "admin",
    "permission_mode": "role_template",
    "permissions": ["*"]
  }
}
```

## Proteksi Company Settings (Phase 4A)

Routes settings diproteksi dengan permission:
- `GET /api/settings/company` → `permission:settings.company.view`
- `PATCH /api/settings/company/accounting` → `permission:settings.company.edit`
- `PATCH /api/settings/company/modules` → `permission:settings.company.edit`

## Design for Phase 14

Phase 14 akan menambahkan:
- custom role per company
- user-specific allow permission
- user-specific deny permission
- UI checklist permission per user
- audit log perubahan permission
- tenant admin bisa memberi akses lintas modul ke satu user

Dengan desain Phase 4B:
- Controller tidak menyimpan logic permission.
- Middleware bertanya ke `PermissionService`, sehingga sumber permission bisa diganti dari config → database tanpa mengubah semua route/controller.

## Testing

Commands:
- `cd backend`
- `php artisan migrate`
- `php artisan test --filter=PermissionTest`
- `php artisan route:list`

## Notes Commit

Commit message:
`add extensible permission foundation`
