# Phase 6A — Analytical Dimensions Foundation

Phase 6A menambahkan fondasi **analytical dimensions** di **tenant database** agar jurnal (dan report di phase berikutnya) bisa dianalisis berdasarkan:
- **Department**
- **Project**

Scope Phase 6A:
- Backend-only foundation (CRUD + permission + validasi journal line).
- Tidak membuat Cost Center / Branch / Location.
- Tidak membuat General Ledger / Trial Balance / Financial Statements.
- Tidak membuat report endpoints.
- Tidak membuat frontend UI besar.

## Kenapa Department/Project diperlukan
Department dan Project memungkinkan analisis biaya/pendapatan lintas akun tanpa mengubah struktur COA:
- Beban listrik untuk Department Operasional
- Beban iklan untuk Project Campaign Lebaran
- Pendapatan dari Project Pembangunan X

## Kenapa dimension ada di `journal_entry_lines`
Dimension disimpan di level **line** karena satu journal entry bisa berisi beberapa akun dengan dimension yang berbeda. Jika disimpan di header `journal_entries` saja, maka seluruh line akan “terpaksa” memakai dimension yang sama dan kehilangan detail analisis.

## Tenant Tables

### `departments`
Kolom:
- `id`
- `code` (unique per-tenant)
- `name`
- `description` (nullable)
- `is_active` (default `true`)
- `metadata` (json, nullable)
- timestamps

Rules:
- Tidak ada hard delete (deactivate saja).
- Department inactive tidak boleh dipakai untuk journal line baru (create/update), tapi tetap bisa muncul untuk histori.

### `projects`
Kolom:
- `id`
- `code` (unique per-tenant)
- `name`
- `description` (nullable)
- `start_date` (nullable)
- `end_date` (nullable)
- `status` (default `active`)
- `is_active` (default `true`)
- `metadata` (json, nullable)
- timestamps

Allowed status:
- `active`
- `completed`
- `on_hold`
- `cancelled`

Rules:
- Project usable untuk journal line baru hanya jika:
  - `is_active = true`
  - `status = active`
- Project completed/on_hold/cancelled tidak boleh dipakai untuk journal line baru (create/update), tapi tetap bisa muncul untuk histori.

### Update `journal_entry_lines`
Tambahan kolom nullable:
- `department_id` (FK ke `departments`, `nullOnDelete`)
- `project_id` (FK ke `projects`, `nullOnDelete`)

## Permissions (granular)
Ditambahkan ke `backend/config/permissions.php`:
- `departments.view`, `departments.create`, `departments.edit`, `departments.deactivate`
- `projects.view`, `projects.create`, `projects.edit`, `projects.deactivate`

Semua endpoint master data tetap berada di:
- `auth:sanctum` + `company.access` (isolasi tenant via header `X-Company-ID`)
- middleware `permission:*` per endpoint

## API Endpoints (Phase 6A)
Prefix: `/api/master-data`

Departments:
- `GET /departments` (permission `departments.view`)
  - query: `search`, `is_active`
- `POST /departments` (permission `departments.create`)
- `GET /departments/{id}` (permission `departments.view`)
- `PATCH /departments/{id}` (permission `departments.edit`)
- `PATCH /departments/{id}/deactivate` (permission `departments.deactivate`)
- `PATCH /departments/{id}/activate` (permission `departments.edit`)

Projects:
- `GET /projects` (permission `projects.view`)
  - query: `search`, `status`, `is_active`
- `POST /projects` (permission `projects.create`)
- `GET /projects/{id}` (permission `projects.view`)
- `PATCH /projects/{id}` (permission `projects.edit`)
- `PATCH /projects/{id}/deactivate` (permission `projects.deactivate`)
- `PATCH /projects/{id}/activate` (permission `projects.edit`)

## Validation rules
Project request:
- `end_date` harus `after_or_equal:start_date`

Journal line (Phase 6A integration):
- `department_id` nullable; jika diisi: department harus ada dan `is_active=true`
- `project_id` nullable; jika diisi: project harus ada, `is_active=true`, dan `status=active`

## ERD ringkas
- `departments (1) -> (N) journal_entry_lines`
- `projects (1) -> (N) journal_entry_lines`
- `journal_entries (1) -> (N) journal_entry_lines`
- `chart_of_accounts (1) -> (N) journal_entry_lines`

## Integrasi dengan Journal Entry Engine (Phase 6)
- `journal_entry_lines` menyimpan `department_id` dan `project_id` (optional).
- `JournalValidationService` memvalidasi dimensi saat create/update/approve.
- `JournalLineNormalizer` menjaga field dimension agar tersimpan.

## Future integrations (Phase 7+)
General Ledger / Trial Balance / laporan keuangan di phase berikutnya dapat menambahkan filter:
- per `department_id`
- per `project_id`

## Test commands
```bash
cd backend
php artisan test --filter=DepartmentTest
php artisan test --filter=ProjectTest
php artisan test --filter=JournalDimensionTest
php artisan route:list
```

## Notes
- Phase 6A hanya menambah fondasi analytical dimensions (Department/Project).
- Cost Center / Branch / Location ditunda ke advanced phase.

