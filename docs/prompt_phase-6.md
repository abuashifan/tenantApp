Kita masuk ke Phase 6 project TenantAppDevelopment.

NAMA PHASE:
Phase 6 — Journal Entry Engine

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
- Data master akuntansi dan transaksi akuntansi berada di tenant database
- Data antar company tidak boleh dicampur dalam satu tenant database yang sama

PENTING:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat logic yang hanya bergantung pada SQLite.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- Phase 6 mulai membuat engine jurnal nyata di tenant database.
- Phase 6 belum membuat General Ledger, Trial Balance, Financial Statements, Sales Invoice, Purchase Invoice, Cash Bank, Inventory, atau Stock Movement.
- Phase 6 fokus pada journal_entries dan journal_entry_lines.

STATUS SEBELUM PHASE 6:
Phase 2 sudah/akan membuat:
- auth:sanctum
- company.access middleware
- TenantContext
- validasi X-Company-ID
- user hanya bisa akses company miliknya

Phase 3 sudah/akan membuat:
- tenant database generator
- tenant migration command
- tenant connection manager
- tenant isolation testing

Phase 4A sudah/akan membuat:
- company_accounting_settings
- CompanySettingService
- transaction_workflow_mode
- auto_post_transactions
- allow_edit_transactions
- allow_edit_posted_transactions
- allow_void_transactions
- require_void_reason

Phase 4B sudah/akan membuat:
- PermissionService
- EnsurePermission middleware
- granular permission:
  - journal.view
  - journal.create
  - journal.edit
  - journal.void
  - journal.approve
  - journal.post

Phase 4C sudah/akan membuat:
- TransactionLifecycle
- TransactionStatus
- HasTransactionLifecycle
- status draft/approved/posted/void
- posted editable secara lifecycle
- void terminal/read-only
- void hidden dari UI normal

Phase 4D sudah/akan membuat:
- TransactionPolicyService
- canCreate/canEdit/canVoid/canApprove/canPost
- TransactionPolicyResult

Phase 4E sudah/akan membuat:
- TransactionDependencyService
- DependencyCheckResult

Phase 4F sudah/akan membuat:
- FiscalYearService
- TransactionDateGuardService
- fiscal year closed read-only
- date guard block outside active fiscal year
- annual closing gate

Phase 4G sudah/akan membuat:
- DocumentNumberService
- document_type journal_entry
- prefix JV

Phase 4H sudah/akan membuat:
- SourceLink standard
- source_type
- source_id
- source_number
- source_revision
- source_module
- source_batch_id
- is_system_generated
- is_obsolete

Phase 4I sudah/akan membuat:
- TransactionRevisionService
- HasRevisionTracking
- transaction_revisions

Phase 4J sudah/akan membuat:
- AuditLogService
- tenant_audit_logs

Phase 4K sudah/akan membuat:
- ReportVisibilityService
- report rule: posted and not obsolete
- void/obsolete excluded from normal reports

Phase 4L sudah/akan membuat:
- OpeningBalance foundation
- opening balance nanti masuk melalui opening journal

Phase 4M sudah/akan membuat:
- AccountMapping foundation
- account mapping final sudah/akan mulai ada di Phase 5 setelah COA

Phase 4N sudah/akan membuat:
- Standard API error code
- ApiResponseBuilder / ApiErrorCode jika tersedia

Phase 5 sudah/akan membuat:
- chart_of_accounts
- contacts
- units
- product_categories
- products
- warehouses
- account_mappings
- ChartOfAccount model
- AccountMapping model
- master data API

TUJUAN PHASE 6:
Membuat Journal Entry Engine sebagai inti pencatatan akuntansi debit-kredit.

Phase 6 harus membuat:
1. journal_entries tenant table
2. journal_entry_lines tenant table
3. JournalEntry model
4. JournalEntryLine model
5. JournalEntryService
6. JournalPostingService
7. JournalValidationService
8. JournalVoidService
9. Journal source/system-generated support
10. API CRUD jurnal manual
11. Posting jurnal
12. Void jurnal
13. Revision tracking untuk edit jurnal manual
14. Audit log
15. Permission guard
16. Fiscal year/date guard
17. Tests
18. Dokumentasi

KEPUTUSAN BISNIS WAJIB:
1. Jurnal adalah sumber utama General Ledger dan Trial Balance.
2. Jurnal harus balance: total debit = total credit.
3. Minimal 2 line.
4. Setiap line wajib account_id valid.
5. Satu line tidak boleh punya debit dan credit sekaligus.
6. Debit dan credit tidak boleh negatif.
7. Draft journal belum masuk laporan.
8. Approved journal belum masuk laporan.
9. Posted journal masuk laporan.
10. Void journal tidak masuk laporan.
11. Obsolete journal tidak masuk laporan.
12. Buku besar nanti hanya membaca journal_entries status posted dan is_obsolete false.
13. Hard delete jurnal tidak ada.
14. Delete jurnal diganti void.
15. Jurnal void tetap tersimpan untuk audit.
16. Jurnal void hidden dari UI normal.
17. Posted manual journal boleh diedit jika company setting mengizinkan, tidak ada dependency, dan fiscal year belum closed.
18. Edit posted manual journal harus menggunakan revision tracking.
19. Edit posted manual journal tidak mengubah journal_number.
20. Edit posted manual journal menaikkan revision_no.
21. System-generated journal tidak boleh diedit langsung dari modul jurnal.
22. System-generated journal harus diedit dari source transaction-nya.
23. Manual journal dibuat dari modul jurnal umum.
24. System-generated journal dibuat oleh modul lain nanti: sales, purchase, cash bank, inventory, opening balance, closing entry.
25. Phase 6 belum membuat modul sales/purchase/cash/inventory.
26. Phase 6 hanya menyiapkan journal agar bisa menerima source link dari modul tersebut nanti.
27. Fiscal year closed membuat jurnal read-only.
28. Date guard harus menolak journal_date di luar active fiscal year atau fiscal year closed.
29. Permission wajib granular:
    - journal.view
    - journal.create
    - journal.edit
    - journal.approve
    - journal.post
    - journal.void
30. Jika auto_post_transactions true dan workflow simple_auto_post, journal manual boleh langsung posted sesuai policy.
31. Jika workflow draft_then_post, journal awal draft dan perlu post manual.
32. Jika workflow draft_approve_post, journal perlu approve sebelum post.
33. Namun flow detail approval harus sederhana dulu, jangan over-engineer.

SCOPE PHASE 6:
A. Tenant migrations:
- journal_entries
- journal_entry_lines

B. Tenant models:
- JournalEntry
- JournalEntryLine

C. Services:
- JournalValidationService
- JournalEntryService
- JournalPostingService
- JournalVoidService
- JournalLineNormalizer
- JournalSourceService optional

D. Requests:
- StoreJournalEntryRequest
- UpdateJournalEntryRequest
- PostJournalEntryRequest
- ApproveJournalEntryRequest
- VoidJournalEntryRequest

E. Controller:
- JournalEntryController

F. Routes:
- REST-like journal routes under auth:sanctum + company.access + permission middleware

G. Tests:
- JournalEntryTest
- JournalValidationServiceTest
- JournalPostingTest
- JournalVoidTest

H. Documentation:
- docs/phase-6-journal-entry-engine.md

JANGAN MENGERJAKAN:
- General Ledger report
- Trial Balance report
- Financial Statements
- Sales Invoice
- Purchase Invoice
- Cash Bank transaction module
- Inventory stock movement module
- Stock Adjustment module
- Opening Balance UI
- Closing Wizard
- Closing Journal generation full implementation
- Sales/Purchase automatic posting
- Frontend UI besar
- Audit viewer UI
- Role management UI
- Create company endpoint public
- Create tenant endpoint public
- Migrate tenant endpoint public
- Assign user endpoint public
- Archive/purge engine
- SQLite-specific logic

TENANT MIGRATION 1: journal_entries
Buat tenant migration:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_journal_entries_table.php

Table:
journal_entries

Fields:
- id
- journal_number string
- journal_date date
- description text nullable
- status string default draft
- revision_no unsignedInteger default 1

Source link fields:
- source_type string nullable
- source_id string nullable
- source_number string nullable
- source_revision unsignedInteger nullable
- source_module string nullable
- source_batch_id string nullable
- is_system_generated boolean default false
- is_obsolete boolean default false

Audit/user fields:
- created_by unsignedBigInteger nullable
- updated_by unsignedBigInteger nullable
- approved_by unsignedBigInteger nullable
- posted_by unsignedBigInteger nullable
- voided_by unsignedBigInteger nullable

Timestamps:
- approved_at timestamp nullable
- posted_at timestamp nullable
- voided_at timestamp nullable
- void_reason text nullable
- edit_reason text nullable

Metadata:
- metadata json/text nullable
- timestamps

Indexes/constraints:
- journal_number unique
- journal_date index
- status index
- revision_no index
- source_type + source_id index
- source_number index
- source_module index
- source_revision index
- is_system_generated index
- is_obsolete index
- posted_at index
- voided_at index
- created_by index
- posted_by index
- voided_by index

Important:
- journal_number unique dalam tenant database.
- Tidak perlu company_id karena tenant database sudah per company.
- user id mengarah ke central users, tapi jangan foreign key lintas database.
- Simpan user id sebagai unsignedBigInteger nullable.
- metadata gunakan json jika kompatibel, text jika perlu.

Allowed status:
- draft
- approved
- posted
- void

TENANT MIGRATION 2: journal_entry_lines
Buat tenant migration:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_journal_entry_lines_table.php

Table:
journal_entry_lines

Fields:
- id
- journal_entry_id unsignedBigInteger
- account_id unsignedBigInteger
- description text nullable
- debit decimal(18, 2) default 0
- credit decimal(18, 2) default 0
- line_order unsignedInteger default 0
- metadata json/text nullable
- timestamps

Indexes/constraints:
- journal_entry_id index
- account_id index
- line_order index
- foreign journal_entry_id references journal_entries.id cascadeOnDelete if supported
- foreign account_id references chart_of_accounts.id restrict/null behavior sesuai style project; recommended restrictOnDelete if supported

Important:
- debit dan credit gunakan decimal.
- Untuk quantity tidak relevan di journal.
- Jangan izinkan debit dan credit sama-sama terisi > 0.
- Jangan izinkan debit atau credit negatif.
- account_id harus menunjuk chart_of_accounts tenant.

MODEL: JournalEntry
Buat:
backend/app/Models/Tenant/JournalEntry.php

Connection:
- protected $connection = 'tenant';

Table:
- journal_entries

Fillable:
- journal_number
- journal_date
- description
- status
- revision_no
- source_type
- source_id
- source_number
- source_revision
- source_module
- source_batch_id
- is_system_generated
- is_obsolete
- created_by
- updated_by
- approved_by
- posted_by
- voided_by
- approved_at
- posted_at
- voided_at
- void_reason
- edit_reason
- metadata

Casts:
- journal_date date
- revision_no integer
- source_revision integer
- is_system_generated boolean
- is_obsolete boolean
- approved_at datetime
- posted_at datetime
- voided_at datetime
- metadata array

Relations:
- lines()
- creator? optional no FK central
- updater? optional no FK central

Traits if available:
- HasTransactionLifecycle
- HasRevisionTracking
- HasSourceLink
- HasReportVisibility

Helpers:
- isDraft()
- isApproved()
- isPosted()
- isVoided()
- isManual()
- isSystemGenerated()
- isObsolete()
- canBeEditedDirectly()
  - true if not system generated
  - false if system generated

MODEL: JournalEntryLine
Buat:
backend/app/Models/Tenant/JournalEntryLine.php

Connection:
- protected $connection = 'tenant';

Table:
- journal_entry_lines

Fillable:
- journal_entry_id
- account_id
- description
- debit
- credit
- line_order
- metadata

Casts:
- debit decimal:2
- credit decimal:2
- line_order integer
- metadata array

Relations:
- journalEntry()
- account() => ChartOfAccount

Helpers:
- isDebit()
- isCredit()
- amount()
- hasBothDebitAndCredit()

JOURNAL LINE NORMALIZER:
Buat:
backend/app/Services/Journal/JournalLineNormalizer.php

Responsibilities:
- normalize line input
- ensure debit/credit default 0
- ensure line_order
- remove empty lines if desired
- format numeric values

Methods:
- normalize(array $lines): array
- normalizeLine(array $line, int $index): array

Rules:
- missing debit => 0
- missing credit => 0
- line_order default index + 1
- keep description nullable
- account_id required later by validator

JOURNAL VALIDATION SERVICE:
Buat:
backend/app/Services/Journal/JournalValidationService.php

Methods:
- validateLines(array $lines): array
- validateBalanced(array $lines): array
- totalDebit(array $lines): string|float
- totalCredit(array $lines): string|float
- validateAccounts(array $lines): array
- validateCanPost(JournalEntry $journal): array

Return format:
[
  'valid' => true/false,
  'errors' => [],
  'warnings' => [],
  'totals' => [
    'debit' => ...,
    'credit' => ...,
    'difference' => ...
  ]
]

Validation rules:
1. Minimal 2 valid lines.
2. account_id wajib ada.
3. account_id harus exist di chart_of_accounts.
4. Account harus active untuk journal baru.
5. Untuk historical update, account inactive handling boleh lebih fleksibel, tapi Phase 6 create harus active.
6. Debit dan credit tidak boleh sama-sama > 0.
7. Debit dan credit tidak boleh negatif.
8. Line tidak boleh debit=0 dan credit=0.
9. Total debit harus sama dengan total credit.
10. Difference harus 0 dalam tolerance kecil.
11. Journal posted harus balance.
12. Journal void tidak bisa post.
13. System-generated journal tidak boleh diedit langsung.

JOURNAL ENTRY SERVICE:
Buat:
backend/app/Services/Journal/JournalEntryService.php

Dependencies:
- JournalValidationService
- JournalLineNormalizer
- DocumentNumberService if available
- TransactionPolicyService if available
- TransactionRevisionService if available
- AuditLogService if available
- TenantContext if needed
- CompanySettingService if needed

Methods:
- list(array $filters = [])
- find(int|string $id): JournalEntry
- createManual(array $data): JournalEntry
- updateManual(JournalEntry $journal, array $data): JournalEntry
- approve(JournalEntry $journal, ?int $userId = null): JournalEntry
- post(JournalEntry $journal, ?int $userId = null): JournalEntry
- void(JournalEntry $journal, string $reason, ?int $userId = null): JournalEntry

createManual behavior:
1. Check policy canCreate('journal', journal_date) if TransactionPolicyService available.
2. Validate journal_date.
3. Generate journal_number via DocumentNumberService with document_type journal_entry.
4. If DocumentNumberService unavailable, fail with clear exception or use safe fallback only if already established by project.
5. Normalize lines.
6. Validate lines balanced.
7. Determine status:
   - If company setting simple_auto_post and auto_post true, status can be posted.
   - If workflow draft_then_post, status draft.
   - If workflow draft_approve_post, status draft.
   - Keep simple and safe.
8. created_by = auth user id if available.
9. is_system_generated = false.
10. source_type = manual_journal or null? Recommended: source_type = manual_journal.
11. source_module = journal.
12. revision_no = 1.
13. Save journal and lines in DB transaction.
14. If status posted, set posted_by/posted_at.
15. Audit log journal.created and journal.posted if posted.

updateManual behavior:
1. Reject if journal is system-generated.
2. Check policy canEdit('journal', journal).
3. Reject if status void.
4. If status posted and edit_reason required, require edit_reason.
5. Capture old values if TransactionRevisionService available.
6. Normalize and validate new lines.
7. Do not change journal_number.
8. Increase revision_no if substantive data changes.
9. Replace lines safely:
   - delete existing lines and recreate is acceptable for manual journal lines in Phase 6, as long as revision captures old/new values.
   - Do this inside DB transaction.
10. Save transaction revision action edit if service available.
11. Audit log journal.updated if service available.
12. If posted journal edited, ensure report remains clean:
   - Since same journal row is updated, no obsolete copy is created in Phase 6 manual journal update.
   - This is acceptable for manual journal direct edit with revision history.
   - System-generated journals later should use obsolete/rebuild pattern from source transaction.

Important:
- For manual journal, editing same row with revision history is acceptable.
- For system-generated journal, do not edit directly.
- For future source transactions, old generated effects may be obsolete/rebuilt.

approve behavior:
1. Check policy canApprove('journal', journal).
2. Reject if system-generated? System generated approval depends future module, but manual approve allowed.
3. Reject if void.
4. If already approved or posted, handle gracefully.
5. Validate balanced.
6. Set status approved, approved_by, approved_at.
7. Audit log journal.approved.

post behavior:
1. Check policy canPost('journal', journal).
2. Reject if void.
3. Reject if already posted.
4. If workflow draft_approve_post, require status approved before post.
5. Validate balanced.
6. Set status posted, posted_by, posted_at.
7. Audit log journal.posted.
8. Posted journal is now reportable if is_obsolete false.

void behavior:
1. Check policy canVoid('journal', journal).
2. Reject if void.
3. If require_void_reason true, reason required.
4. Reject system-generated journal direct void unless source module explicitly allows? For Phase 6:
   - manual journal can be voided
   - system-generated journal should not be voided directly from journal module
5. Set status void, voided_by, voided_at, void_reason.
6. Record revision action void if TransactionRevisionService available.
7. Audit log journal.voided.
8. Void journal not reportable.

JOURNAL POSTING SERVICE:
Buat:
backend/app/Services/Journal/JournalPostingService.php

Purpose:
- Encapsulate posting logic.
- Used by JournalEntryService.
- Future modules can call this service to post system-generated journals.

Methods:
- post(JournalEntry $journal, ?int $userId = null): JournalEntry
- assertCanPost(JournalEntry $journal): void

Rules:
- validate balanced
- reject void
- reject already posted
- reject obsolete
- set posted_by/posted_at/status

JOURNAL VOID SERVICE:
Buat:
backend/app/Services/Journal/JournalVoidService.php

Methods:
- void(JournalEntry $journal, string $reason, ?int $userId = null): JournalEntry
- assertCanVoid(JournalEntry $journal): void

Rules:
- reject already void
- reject system-generated direct void unless explicitly allowed
- set status void
- not hard delete

REQUESTS:
Buat folder:
backend/app/Http/Requests/Journal

Requests:
- StoreJournalEntryRequest
- UpdateJournalEntryRequest
- ApproveJournalEntryRequest
- PostJournalEntryRequest
- VoidJournalEntryRequest

StoreJournalEntryRequest:
- journal_date required|date
- description nullable|string
- lines required|array|min:2
- lines.*.account_id required|integer
- lines.*.description nullable|string
- lines.*.debit nullable|numeric|min:0
- lines.*.credit nullable|numeric|min:0

After validation:
- each line cannot have debit and credit both > 0
- each line cannot have both zero
- total debit = total credit
- account ids exist/active can be in service rather than request

UpdateJournalEntryRequest:
- journal_date sometimes|date
- description nullable|string
- edit_reason nullable|string
- lines required|array|min:2
- same line rules

If updating posted journal:
- edit_reason should be required by service because request may not know current status.

VoidJournalEntryRequest:
- reason required|string|min:3|max:1000

Approve/Post requests:
- can be empty, but create classes for consistency.

CONTROLLER:
Buat:
backend/app/Http/Controllers/Api/Journal/JournalEntryController.php

Methods:
- index()
- store()
- show($id)
- update($id)
- approve($id)
- post($id)
- void($id)

Do not create destroy/delete method.

Controller behavior:
- Use services.
- Use ApiResponseBuilder/ApiResponse trait if available.
- Return clear success/error.
- Do not expose tenant database details.
- Do not accept company_id in body.
- Active company comes from X-Company-ID/TenantContext/company.access.

ROUTES:
Tambahkan routes di backend/routes/api.php:

Group:
- auth:sanctum
- company.access

Routes:
GET /api/journals
  permission:journal.view

POST /api/journals
  permission:journal.create

GET /api/journals/{journal}
  permission:journal.view

PATCH /api/journals/{journal}
  permission:journal.edit

POST /api/journals/{journal}/approve
  permission:journal.approve

POST /api/journals/{journal}/post
  permission:journal.post

POST /api/journals/{journal}/void
  permission:journal.void

Important:
- No DELETE route.
- No public route without auth/company.access.
- Use route model binding carefully with tenant connection. If route model binding is risky, manually find in controller.

FILTERS INDEX:
Journal index should support basic filters:
- status
- date_from
- date_to
- search journal_number/description
- include_void optional
- page/per_page if project uses pagination

Default:
- hide void journals from normal list unless include_void=true.
- exclude obsolete from normal list unless audit/revision context.

PERMISSIONS:
Use granular permissions:
- journal.view
- journal.create
- journal.edit
- journal.approve
- journal.post
- journal.void

If PermissionService not available, do not create alternative auth system.
Use existing middleware if present.
If missing, document pending integration.

SOURCE LINK RULES:
Manual journal:
- source_type = manual_journal
- source_module = journal
- is_system_generated = false
- source_revision = revision_no

System-generated journal future:
- source_type = sales_invoice/purchase_invoice/opening_balance/etc.
- source_id = source transaction id
- source_number = source document number
- source_revision = source transaction revision
- source_module = sales/purchase/opening_balance/etc.
- is_system_generated = true

Phase 6 should support fields, but only manual journal endpoint creates manual journal.

SYSTEM-GENERATED JOURNAL:
Add service helper if useful:
- createSystemGenerated(array $data): JournalEntry

But be careful:
- This is foundation only.
- It can be protected/internal method.
- It must require source_type/source_id/source_number/source_module.
- It should not be exposed via public route.
- It will be used by future modules.

ACCOUNT VALIDATION:
Use ChartOfAccount model from Phase 5:
- account exists
- account is_active true for new journal
- account_type valid
- if inactive account used in old journal display, allow view but not new create/post

If ChartOfAccount model not found:
- Do not create COA here.
- Throw clear exception or mark Phase 5 dependency missing.
- Do not duplicate ChartOfAccount model.

INTEGRATION WITH DOCUMENT NUMBERING:
Use DocumentNumberService:
- document_type journal_entry
- document date = journal_date
- generated number JV-YYYY-000001

If DocumentNumberService unavailable:
- Do not silently create random number.
- Fail clearly or document missing dependency.
- Phase 6 depends on Phase 4G.

INTEGRATION WITH DATE GUARD:
Use TransactionPolicyService canCreate/canEdit/canVoid/canPost if available.
If not available, use TransactionDateGuardService directly if available.
Do not duplicate date guard logic.

INTEGRATION WITH AUDIT LOG:
If AuditLogService exists:
- journal.created
- journal.updated
- journal.approved
- journal.posted
- journal.voided

If audit logging fails, do not corrupt transaction. Prefer after successful DB transaction or safe try/catch.

INTEGRATION WITH REVISION:
If TransactionRevisionService exists:
- update manual journal records revision edit
- void manual journal records revision void
- edit posted requires reason
- revision_no increments on edit if data changed

INTEGRATION WITH REPORT VISIBILITY:
If HasReportVisibility trait exists, use it.
Index default should hide void.
Future reports will use posted and not obsolete.

TESTS:
Buat:
backend/tests/Feature/Journal/JournalEntryTest.php
backend/tests/Unit/JournalValidationServiceTest.php
backend/tests/Feature/Journal/JournalPostingTest.php
backend/tests/Feature/Journal/JournalVoidTest.php

JournalValidationServiceTest:
1. balanced lines pass
2. unbalanced lines fail
3. less than 2 lines fail
4. line with both debit and credit fails
5. line with zero debit and zero credit fails
6. negative debit fails
7. negative credit fails
8. totalDebit calculates correctly
9. totalCredit calculates correctly

JournalEntryTest:
1. unauthenticated cannot list journals => 401
2. missing X-Company-ID rejected => 422
3. user with journal.create can create draft journal
4. journal_number generated
5. journal lines saved
6. duplicate/unbalanced journal rejected
7. journal with invalid account rejected
8. journal index hides void by default
9. journal show works
10. user without permission cannot create journal
11. user cannot access another company tenant journal

JournalPostingTest:
1. draft balanced journal can be posted
2. posted journal gets posted_by and posted_at
3. posted journal cannot be posted again
4. void journal cannot be posted
5. unbalanced journal cannot be posted
6. fiscal year closed/date guard blocks post if service exists
7. workflow draft_approve_post requires approved before post if setting active

JournalVoidTest:
1. draft journal can be voided
2. posted journal can be voided if policy allows
3. void requires reason if setting require_void_reason true
4. void journal not reportable
5. void journal cannot be voided again
6. system-generated journal cannot be voided directly
7. void creates audit log if AuditLogService available
8. void creates revision action if TransactionRevisionService available

Testing notes:
- Use tenant test database setup.
- Use ChartOfAccount test records.
- Use auth:sanctum and X-Company-ID.
- Do not rely only on demo admin@example.com.
- If some integrations are unavailable, test core journal engine and document limitations honestly.

DOCUMENTATION:
Buat:
docs/phase-6-journal-entry-engine.md

Isi wajib:
- tujuan Phase 6
- tabel journal_entries
- tabel journal_entry_lines
- status lifecycle journal
- manual journal vs system-generated journal
- debit credit validation rules
- posting rules
- void rules
- edit posted manual journal rules
- no hard delete
- source link fields
- revision tracking integration
- audit log integration
- document numbering integration
- fiscal year/date guard integration
- permission integration
- report visibility rule
- API endpoints
- request/response examples
- test commands
- limitations/scope
- notes commit

Jelaskan secara eksplisit:
- Phase 6 belum membuat GL/Trial Balance.
- Phase 6 belum membuat sales/purchase/cash/inventory.
- System-generated journals are supported structurally but not produced by modules yet.
- Manual journal can be created via API.
- System-generated journal should not be edited directly.
- Reports later must read posted and not obsolete journals only.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan tenant:migrate --company=<id>
  atau command tenant migration sesuai project Phase 3
- php artisan test --filter=JournalValidationServiceTest
- php artisan test --filter=JournalEntryTest
- php artisan test --filter=JournalPostingTest
- php artisan test --filter=JournalVoidTest
- php artisan route:list

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 6 selesai jika:
1. Tenant migration journal_entries dibuat
2. Tenant migration journal_entry_lines dibuat
3. JournalEntry model dibuat
4. JournalEntryLine model dibuat
5. JournalEntry relationships dibuat
6. JournalValidationService dibuat
7. JournalEntryService dibuat
8. JournalPostingService dibuat
9. JournalVoidService dibuat
10. JournalLineNormalizer dibuat
11. Requests validation dibuat
12. JournalEntryController dibuat
13. Routes journal dibuat dengan auth:sanctum + company.access
14. Permission middleware granular digunakan
15. Manual journal bisa dibuat
16. Journal number generated via DocumentNumberService
17. Journal lines tersimpan
18. Debit credit balance validation bekerja
19. Minimal 2 lines validation bekerja
20. Account validation bekerja
21. Draft journal bisa posted
22. Posted journal masuk status posted
23. Void journal status void
24. No delete route tersedia
25. System-generated journal tidak bisa diedit langsung
26. Void hidden dari index default
27. Audit log integration dilakukan jika tersedia
28. Revision integration dilakukan jika tersedia
29. Date guard/policy integration dilakukan jika tersedia
30. Tests dibuat
31. Dokumentasi Phase 6 dibuat
32. Tidak ada GL/Trial Balance dibuat
33. Tidak ada Sales/Purchase/Cash/Inventory module dibuat
34. Tidak ada frontend UI besar dibuat
35. Tidak ada public tenant/company management endpoint dibuat
36. Tidak ada SQLite-specific logic dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah
- tenant migrations dibuat
- models dibuat
- relationships dibuat
- services dibuat
- endpoints ditambahkan
- permissions digunakan
- tests dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 6 hanya Journal Entry Engine
- catatan bahwa GL/Trial Balance belum dibuat
- catatan bahwa Sales/Purchase/Cash/Inventory belum dibuat
- catatan bahwa system-generated journal support hanya struktur/foundation

COMMIT MESSAGE:
add journal entry engine

COMMIT BODY:
Phase 6: add tenant journal entry engine with journal entries, journal lines, validation, posting, voiding, manual journal APIs, source link fields, lifecycle integration, permission guards, tests, and documentation. This enables balanced manual journals without adding general ledger, trial balance, sales, purchase, cash bank, inventory, or frontend UI modules.