# Phase 3D — Tenant Isolation Testing

Phase 3D menambahkan automated backend tests untuk memastikan tenant isolation dan security boundary berjalan benar.

## Tujuan

- Memastikan endpoint tenant context hanya bisa diakses oleh user yang login dan hanya untuk company yang di-assign.
- Memastikan request tenant wajib membawa header `X-Company-ID`.
- Memastikan tidak ada route publik yang berbahaya (create tenant/company, migrate tenant, assign user).

## Test yang Dibuat

File:
- `backend/tests/Feature/Tenant/TenantIsolationTest.php`

Daftar scenario:
1. Unauthenticated user tidak bisa akses `/api/tenant-context-test` (401)
2. Authenticated user tanpa `X-Company-ID` ditolak (422)
3. Authenticated user bisa akses tenant context untuk company yang di-assign (200)
4. Authenticated user tidak bisa akses tenant context company user lain (403)
5. `/api/companies` hanya mengembalikan company yang di-assign ke user login (200)
6. User tidak bisa select company user lain (403)
7. Tenant database status inactive ditolak (422)
8. Route publik terlarang tidak ada di route collection

## Security Behavior yang Divalidasi

- `auth:sanctum` wajib untuk endpoint tenant context test
- `company.access` menolak akses jika:
  - header `X-Company-ID` tidak dikirim
  - user tidak punya assignment aktif di `company_users`
  - tenant database tidak aktif

## Manual Test Command

1. Jalankan test khusus:

`php artisan test --filter=TenantIsolationTest`

2. Jalankan semua test:

`php artisan test`

3. Cek route:

`php artisan route:list`

## Route Security Check

Test memverifikasi route berikut tidak ada:
- `POST /api/companies`
- `POST /api/tenants`
- `POST /api/tenant/migrate`
- `POST /api/company-users`
- `POST /api/companies/{id}/users`

## Batasan Scope

- Tidak ada perubahan frontend
- Tidak ada endpoint API baru
- Tidak ada perubahan flow login/select-company/dashboard

## Notes Commit

Commit message (suggested):
`add tenant isolation feature tests`

[Progress Notes] Phase 3D — Tenant Isolation Testing

Summary:
- Added automated Feature tests to validate tenant isolation and route security boundaries.
- Covered 8 required scenarios in `TenantIsolationTest`:
  1) Unauthenticated access to `/api/tenant-context-test` returns 401
  2) Authenticated access without `X-Company-ID` returns 422
  3) Authenticated user can access assigned company tenant context (200 + company_id matches)
  4) Authenticated user cannot access another user's company tenant context (403)
  5) GET `/api/companies` returns only companies assigned to the authenticated user
  6) User cannot select another user's company via POST `/api/companies/select` (403)
  7) Inactive tenant database is rejected for tenant context (422)
  8) Forbidden public tenant management routes do not exist (asserted via route collection)
- Tests create minimal data (User A/B, Company A/B, TenantDatabase A/B, CompanyUser assignments) and create temporary tenant sqlite files under `backend/database/tenants` then clean up in teardown.

Docs:
- Added `docs/phase-3d-tenant-isolation-testing.md` describing goals, scenarios, commands, and route security checks.

Testing fix:
- Updated `backend/phpunit.xml` to set `APP_KEY` in testing env so `php artisan test` passes (previously failing with "No application encryption key has been specified." from existing ExampleTest).

Files created:
- backend/tests/Feature/Tenant/TenantIsolationTest.php
- docs/phase-3d-tenant-isolation-testing.md

Files edited:
- backend/phpunit.xml
