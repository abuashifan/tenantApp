# Phase 4A — Company Settings Foundation

Phase 4A menambahkan fondasi pengaturan perusahaan di **central database** (`central.sqlite`) agar modul akuntansi berikutnya tidak hardcode rule.

## Tujuan

- Menyediakan settings akuntansi per company (currency, precision, workflow, approval/tax flags)
- Menyediakan settings modul per company (sales/purchase/cash-bank/inventory/dll enable flags)
- Semua settings dibaca berdasarkan **active company** dari `TenantContext` (bukan dari request body)

## Database (Central)

Tabel baru:
- `company_accounting_settings` (unique `company_id`)
- `company_module_settings` (unique `company_id`)

## API Endpoints

Semua endpoint wajib middleware:
- `auth:sanctum`
- `company.access`

Endpoints:
- `GET /api/settings/company`
  - Mengembalikan settings gabungan `accounting` + `modules`
  - Jika record belum ada, akan dibuat default terlebih dahulu
- `PATCH /api/settings/company/accounting`
  - Update accounting settings (partial update)
- `PATCH /api/settings/company/modules`
  - Update module settings (partial update)

## Consistency Rules (Service)

Service melakukan normalisasi agar konsisten:
1. `transaction_workflow_mode = simple_auto_post` → `auto_post_transactions` dipaksa `true`
2. `transaction_workflow_mode = draft_approve_post` → `approval_enabled` dipaksa `true`
3. `approval_enabled = false` → `transaction_workflow_mode` tidak boleh `draft_approve_post`
4. `tax_enabled` accounting dan modules disinkronkan
5. `approval_enabled` accounting dan modules disinkronkan

## Manual Testing Checklist

1. Login untuk dapat token:
- `POST /api/auth/login`
- ambil Bearer token

2. Pilih company lalu test settings:
- `GET /api/settings/company` dengan header:
  - `Authorization: Bearer <TOKEN>`
  - `X-Company-ID: <company_id>`

3. Update accounting settings:
- `PATCH /api/settings/company/accounting`
- body contoh:
  - `{ "transaction_workflow_mode": "draft_then_post", "auto_post_transactions": false }`

4. Update module settings:
- `PATCH /api/settings/company/modules`
- body contoh:
  - `{ "inventory_enabled": true }`

## Feature Test

Jalankan:
- `cd backend`
- `php artisan test --filter=CompanySettingTest`

## Notes Commit (suggested)

Commit message:
`add company settings foundation`

