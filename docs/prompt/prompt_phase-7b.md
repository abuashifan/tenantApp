Kita masuk ke Phase 7B project TenantAppDevelopment.

NAMA PHASE:
Phase 7B — Account Ledger Detail

KONTEKS PROJECT:
Project ini adalah aplikasi akuntansi multi-tenant dengan stack:
- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database development/MVP awal: SQLite
- Production database nanti bisa MySQL / MariaDB / PostgreSQL

ARSITEKTUR TENANT:
- central database = database pusat
- 1 company = 1 tenant database
- user bisa punya akses ke banyak company
- user memilih active company setelah login
- request tenant memakai header X-Company-ID
- company access divalidasi via auth:sanctum + company.access
- TenantContext menyimpan active company dan user_role
- Data jurnal, COA, department, project, dan report source berada di tenant database
- Data antar company tidak boleh dicampur dalam satu tenant database yang sama

PENTING:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat logic yang hanya bergantung pada SQLite.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- Phase 7B hanya membuat Account Ledger Detail.
- Phase 7B tidak membuat Trial Balance final.
- Phase 7B tidak membuat Financial Statements.
- Phase 7B tidak membuat frontend UI.
- Phase 7B tidak mengubah transaksi.
- Phase 7B hanya membaca journal_entries dan journal_entry_lines yang reportable.

TUJUAN PHASE 7B:
Membuat Account Ledger Detail, yaitu detail mutasi satu akun tertentu dalam periode tertentu.

Account Ledger Detail harus menampilkan:
1. Informasi akun
2. Filter yang digunakan
3. Opening balance sebelum start_date
4. Daftar mutasi jurnal dalam periode
5. Debit/credit per line
6. Running balance setelah tiap line
7. Period total debit/credit
8. Ending balance
9. Source document info jika ada
10. Department/project info jika ada
11. Export-ready response structure, tapi belum membuat export PDF/Excel

ROUTE:
- GET /api/reports/account-ledger/{account}
- middleware: auth:sanctum + company.access + permission:reports.view

FILES:
- backend/app/Data/Reports/AccountLedgerFilter.php
- backend/app/Data/Reports/AccountLedgerLineData.php
- backend/app/Services/Reports/AccountLedgerDetailService.php
- backend/app/Http/Requests/Reports/AccountLedgerDetailRequest.php
- backend/app/Http/Controllers/Api/Reports/AccountLedgerDetailController.php
- backend/tests/Unit/Reports/AccountLedgerDetailServiceTest.php
- backend/tests/Feature/Reports/AccountLedgerDetailApiTest.php
- docs/phase-7b-account-ledger-detail.md
- docs/progress-list/phase-7b-done.md

