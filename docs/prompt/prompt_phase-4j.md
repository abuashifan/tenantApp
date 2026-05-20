Kita masuk ke Phase 4J project TenantAppDevelopment.

NAMA PHASE:
Phase 4J — Audit Log Basic

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
- Data transaksi antar company tidak boleh dicampur dalam satu tenant database yang sama
- Data transaksi, transaction revisions, dan tenant audit log harus berada di tenant database

PENTING TENTANG DATABASE:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat logic yang hanya bergantung pada SQLite.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- Phase 4J tidak membuat invoice, journal, purchase, cash bank, inventory, COA, atau stock movement table.
- Phase 4J hanya membuat fondasi audit log basic.
- Audit log advanced viewer/export/filter akan dibuat nanti di Phase 17.

STATUS SEBELUM PHASE 4J:
Phase 1 sudah/akan membuat:
- central activity_logs
- central users
- central companies
- central company_users

Phase 4A sudah/akan membuat:
- company_accounting_settings
- company_module_settings
- CompanySettingService
- company setting update endpoints

Phase 4B sudah/akan membuat:
- config/permissions.php granular
- PermissionService
- EnsurePermission middleware
- permission denied response

Phase 4C sudah/akan membuat:
- TransactionStatus
- TransactionLifecycle
- lifecycle draft/approved/posted/void
- void hidden by default
- posted editable secara lifecycle
- void terminal/read-only
- report normal exclude void/obsolete

Phase 4D sudah/akan membuat:
- TransactionPolicyService
- TransactionPolicyResult
- TransactionAction
- TransactionModule

Phase 4E sudah/akan membuat:
- TransactionDependencyService
- DependencyCheckResult
- checker placeholder per module

Phase 4F sudah/akan membuat:
- fiscal_years
- accounting_periods
- FiscalYearService
- TransactionDateGuardService
- annual closing gate
- fiscal year closed read-only

Phase 4H sudah/akan membuat:
- SourceType
- SourceModule
- SourceLink
- SourceLinkFactory
- HasSourceLink
- source_type/source_id/source_number/source_revision/source_module/source_batch_id
- is_system_generated
- is_obsolete

Phase 4I sudah/akan membuat:
- transaction_revisions tenant table
- TransactionRevision model
- TransactionRevisionService
- RevisionSnapshot
- HasRevisionTracking
- revision history untuk edit/void transaction

TUJUAN PHASE 4J:
Membuat fondasi audit log basic untuk mencatat aktivitas user dan sistem.

Audit log basic harus bisa mencatat:
- siapa melakukan apa
- kapan
- di company mana
- module apa
- record apa
- result success/failed/denied/warning
- IP address
- user agent
- source link jika ada
- revision_id jika ada
- metadata tambahan jika ada

BEDA AUDIT LOG DAN REVISION TRACKING:
Revision Tracking:
- fokus pada perubahan isi data transaksi
- contoh: qty lama 10, qty baru 12
- disimpan di transaction_revisions
- berada di tenant database

Audit Log:
- fokus pada aktivitas user/sistem
- contoh: user Ahmad mengedit Sales Invoice SI-2026-000015
- menyimpan event, action, result, user_id, ip_address, user_agent
- bisa menyimpan revision_id sebagai referensi
- tenant activity disimpan di tenant_audit_logs
- central activity disimpan di central activity_logs jika tersedia

KEPUTUSAN BISNIS WAJIB:
1. Audit log basic harus tersedia sebelum modul transaksi besar dibuat.
2. Tenant audit log disimpan di tenant database.
3. Central audit log memakai activity_logs jika sudah ada dari Phase 1.
4. Jangan membuat tabel central audit baru jika activity_logs sudah tersedia dan bisa dipakai.
5. Audit log advanced viewer/filter/export tidak dibuat di Phase 4J.
6. Permission denied harus bisa dicatat.
7. Company setting update harus bisa dicatat.
8. Transaction edit/void nanti bisa dicatat dengan referensi revision_id.
9. Audit log boleh menyimpan old_values/new_values opsional.
10. Untuk transaksi, detail perubahan utama tetap di transaction_revisions.
11. Audit log tidak menggantikan revision tracking.
12. Audit log harus support source link fields.
13. Audit log harus bisa dipakai dari controller, service, middleware, dan CLI command.
14. Jika request context tersedia, audit log boleh otomatis membaca IP/user agent.
15. Jika request context tidak tersedia, service tetap harus bisa dipakai.
16. Hard delete transaksi tidak ada; transaksi memakai void.
17. Audit log harus menyiapkan event void, bukan delete, untuk transaksi.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat tenant migration tenant_audit_logs.
2. Buat model TenantAuditLog dengan connection tenant.
3. Buat AuditEvent support class.
4. Buat AuditAction support class.
5. Buat AuditResult support class.
6. Buat AuditLogService.
7. Buat helper/trait optional HasAuditLog jika berguna.
8. Integrasi ringan ke permission middleware jika aman:
   - log permission.denied saat permission ditolak
   - jangan sampai logging error membuat request utama crash
9. Integrasi ringan ke company setting update jika aman:
   - log company_setting.updated ke central audit/activity_logs
   - jangan refactor besar controller settings
10. Buat tests.
11. Buat dokumentasi docs/phase-4j-audit-log-basic.md.

JANGAN MENGERJAKAN:
- audit viewer UI
- audit filter UI
- audit export
- sales invoice table
- purchase invoice table
- journal entry table
- cash bank transaction table
- stock movement table
- chart of accounts
- actual transaction edit endpoint
- actual transaction void endpoint
- generated journal implementation
- generated stock movement implementation
- closing wizard
- closing journal generation
- opening balance journal generation
- frontend UI
- create company endpoint public
- create tenant endpoint public
- migrate tenant endpoint public
- assign user endpoint public
- archive database
- SQLite-specific archive logic
- custom role UI
- permission override UI

FILE BARU:
- backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_tenant_audit_logs_table.php
- backend/app/Models/Tenant/TenantAuditLog.php
- backend/app/Support/Audit/AuditEvent.php
- backend/app/Support/Audit/AuditAction.php
- backend/app/Support/Audit/AuditResult.php
- backend/app/Services/Audit/AuditLogService.php
- backend/tests/Unit/AuditLogServiceTest.php
- docs/phase-4j-audit-log-basic.md

Opsional jika berguna:
- backend/app/Traits/HasAuditLog.php

Jika folder belum ada, buat:
- backend/app/Support/Audit
- backend/app/Services/Audit
- backend/app/Models/Tenant
- backend/tests/Unit

FILE YANG BOLEH DIUBAH:
- backend/app/Http/Middleware/EnsurePermission.php
  Hanya untuk log permission.denied jika middleware sudah ada dan integrasi aman.
- backend/app/Http/Controllers/Api/Settings/CompanySettingController.php
  Hanya untuk log company_setting.updated jika controller sudah ada dan integrasi aman.
- backend/app/Services/Settings/CompanySettingService.php
  Hanya jika lebih aman audit dilakukan di service setting.
- backend/app/Models/ActivityLog.php jika sudah ada dan perlu fillable/casts ringan.
- docs/phase-4b-permission-foundation-basic.md
- docs/phase-4i-revision-tracking-foundation.md

JANGAN UBAH:
- frontend/*
- backend/routes/api.php kecuali tidak perlu
- endpoint tenant/company management public
- migration transaksi nyata
- journal/invoice/purchase/inventory module
- fiscal year/date guard services kecuali tidak perlu
- revision tracking service kecuali tidak perlu

TENANT MIGRATION: tenant_audit_logs
Buat migration di:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_tenant_audit_logs_table.php

Table:
tenant_audit_logs

Fields:
- id
- event string
- action string nullable
- module string nullable
- record_type string nullable
- record_id string nullable
- record_number string nullable

Source link fields:
- source_type string nullable
- source_id string nullable
- source_number string nullable
- source_revision unsignedInteger nullable
- source_module string nullable
- source_batch_id string nullable

Revision reference:
- revision_id unsignedBigInteger nullable

User/company fields:
- user_id unsignedBigInteger nullable
- company_id unsignedBigInteger nullable

Result:
- result string default success
- message text nullable

Values:
- old_values json/text nullable
- new_values json/text nullable

Metadata/context:
- metadata json/text nullable
- ip_address string nullable
- user_agent text nullable

Timestamps:
- created_at
- updated_at

Indexes:
- event
- action
- module
- record_type + record_id
- record_number
- source_type + source_id
- source_number
- source_module
- revision_id
- user_id
- company_id
- result
- created_at

Catatan:
- Gunakan json column jika style project/database mendukung.
- Jika SQLite compatibility lebih aman dengan text, gunakan text dan cast array di model.
- Jangan foreign key ke central users/companies dari tenant database.
- user_id dan company_id cukup disimpan sebagai unsignedBigInteger nullable.
- tenant_audit_logs berada di tenant database.

MODEL: TenantAuditLog
Buat backend/app/Models/Tenant/TenantAuditLog.php

Connection:
- protected $connection = 'tenant';

Table:
- protected $table = 'tenant_audit_logs';

Fillable:
- event
- action
- module
- record_type
- record_id
- record_number
- source_type
- source_id
- source_number
- source_revision
- source_module
- source_batch_id
- revision_id
- user_id
- company_id
- result
- message
- old_values
- new_values
- metadata
- ip_address
- user_agent

Casts:
- source_revision integer
- revision_id integer
- user_id integer
- company_id integer
- old_values array
- new_values array
- metadata array

Helpers:
- isSuccess(): bool
- isFailed(): bool
- isDenied(): bool
- isWarning(): bool

AUDIT EVENT:
Buat backend/app/Support/Audit/AuditEvent.php

Constants minimal:
Auth/Central:
- AUTH_LOGIN = 'auth.login'
- AUTH_LOGOUT = 'auth.logout'
- AUTH_LOGIN_FAILED = 'auth.login_failed'
- COMPANY_SWITCHED = 'company.switched'
- COMPANY_SETTING_UPDATED = 'company_setting.updated'
- PERMISSION_DENIED = 'permission.denied'

Settings:
- SETTINGS_COMPANY_UPDATED = 'settings.company.updated'
- SETTINGS_MODULES_UPDATED = 'settings.modules.updated'

Journal:
- JOURNAL_CREATED = 'journal.created'
- JOURNAL_UPDATED = 'journal.updated'
- JOURNAL_APPROVED = 'journal.approved'
- JOURNAL_POSTED = 'journal.posted'
- JOURNAL_VOIDED = 'journal.voided'

Sales:
- SALES_INVOICE_CREATED = 'sales_invoice.created'
- SALES_INVOICE_UPDATED = 'sales_invoice.updated'
- SALES_INVOICE_POSTED = 'sales_invoice.posted'
- SALES_INVOICE_VOIDED = 'sales_invoice.voided'

Purchase:
- PURCHASE_INVOICE_CREATED = 'purchase_invoice.created'
- PURCHASE_INVOICE_UPDATED = 'purchase_invoice.updated'
- PURCHASE_INVOICE_POSTED = 'purchase_invoice.posted'
- PURCHASE_INVOICE_VOIDED = 'purchase_invoice.voided'

Fiscal/Closing:
- FISCAL_YEAR_CLOSING_STARTED = 'fiscal_year.closing_started'
- FISCAL_YEAR_CLOSED = 'fiscal_year.closed'
- CLOSING_JOURNAL_GENERATED = 'closing_journal.generated'
- OPENING_BALANCE_GENERATED = 'opening_balance.generated'

Generic:
- RECORD_VIEWED = 'record.viewed'
- RECORD_CREATED = 'record.created'
- RECORD_UPDATED = 'record.updated'
- RECORD_VOIDED = 'record.voided'
- RECORD_EXPORTED = 'record.exported'

Methods:
- all(): array
- exists(string $event): bool

AUDIT ACTION:
Buat backend/app/Support/Audit/AuditAction.php

Constants:
- VIEW = 'view'
- CREATE = 'create'
- UPDATE = 'update'
- EDIT = 'edit'
- VOID = 'void'
- APPROVE = 'approve'
- POST = 'post'
- LOGIN = 'login'
- LOGOUT = 'logout'
- SWITCH = 'switch'
- EXPORT = 'export'
- IMPORT = 'import'
- CLOSE = 'close'
- REOPEN = 'reopen'
- DENY = 'deny'
- SYSTEM = 'system'

Catatan:
- DELETE tidak digunakan untuk transaksi.
- Jika ingin menyediakan DELETE untuk non-transaction/admin internal, boleh constant DELETE, tapi dokumentasi harus menyebut transaksi tidak memakai delete.
- Untuk Phase 4J, lebih aman jangan gunakan delete sebagai action utama.

Methods:
- all(): array
- exists(string $action): bool

AUDIT RESULT:
Buat backend/app/Support/Audit/AuditResult.php

Constants:
- SUCCESS = 'success'
- FAILED = 'failed'
- DENIED = 'denied'
- WARNING = 'warning'

Methods:
- all(): array
- exists(string $result): bool

AUDIT LOG SERVICE:
Buat backend/app/Services/Audit/AuditLogService.php

Responsibilities:
- log tenant activity
- log central activity
- log success/failed/denied/warning
- attach request context if available
- support source link fields
- support revision_id
- support old/new values
- fail safely if logging error occurs where appropriate

Methods minimal:
- logTenant(array $data): ?TenantAuditLog
- logCentral(array $data): mixed
- logSuccess(array $data, bool $tenant = true): mixed
- logFailed(array $data, bool $tenant = true): mixed
- logDenied(array $data, bool $tenant = true): mixed
- logWarning(array $data, bool $tenant = true): mixed
- withRequestContext(array $data): array
- normalizeData(array $data): array

Expected data keys:
- event
- action
- module
- record_type
- record_id
- record_number
- source_type
- source_id
- source_number
- source_revision
- source_module
- source_batch_id
- revision_id
- user_id
- company_id
- result
- message
- old_values
- new_values
- metadata
- ip_address
- user_agent

Behavior:
1. logTenant:
   - normalize data
   - add request context if available
   - create TenantAuditLog on tenant connection
   - return TenantAuditLog or null
   - if tenant connection not available, either throw or return null depending context
   - For Phase 4J, prefer safe handling: catch exception and report/log internally if possible, but do not crash permission middleware logging.

2. logCentral:
   - Use existing ActivityLog model/table if available.
   - If ActivityLog model exists, create central activity log using closest compatible fields.
   - If no ActivityLog model/table shape is incompatible, return null and document limitation.
   - Do not create new central audit table in Phase 4J.
   - Do not break existing central activity_logs.

3. logSuccess/logFailed/logDenied/logWarning:
   - Set result accordingly.
   - Call logTenant or logCentral based on $tenant.

4. withRequestContext:
   - If request() available:
     - ip_address = request()->ip()
     - user_agent = request()->userAgent()
   - If auth user available and user_id not provided:
     - user_id = auth()->id()
   - If TenantContext active company available and company_id not provided:
     - company_id = active company id
   - Must not fail in CLI.

5. normalizeData:
   - Ensure result default success.
   - Ensure metadata/old_values/new_values arrays if null.
   - Ensure event present.

CENTRAL ACTIVITY LOG INTEGRATION:
Check existing ActivityLog model/table from Phase 1.

If ActivityLog model exists:
- Use it.
- Map fields conservatively.

Possible field mapping:
- user_id
- company_id
- action/event
- module
- record_type
- record_id
- old_value/old_values
- new_value/new_values
- ip_address
- user_agent

If exact field names differ:
- Adapt to existing model.
- Do not rename columns.
- Do not break existing migration.
- Document mapping.

If ActivityLog model does not exist or is incompatible:
- logCentral returns null.
- Document that central audit writer is pending integration.

TENANT AUDIT LOG USAGE EXAMPLES:
Example transaction edit:
logTenant([
  'event' => AuditEvent::SALES_INVOICE_UPDATED,
  'action' => AuditAction::EDIT,
  'module' => 'sales',
  'record_type' => 'sales_invoice',
  'record_id' => 15,
  'record_number' => 'SI-2026-000015',
  'source_type' => 'sales_invoice',
  'source_id' => 15,
  'source_number' => 'SI-2026-000015',
  'source_revision' => 2,
  'source_module' => 'sales',
  'revision_id' => 10,
  'message' => 'Sales invoice updated.',
]);

Example void:
logTenant([
  'event' => AuditEvent::SALES_INVOICE_VOIDED,
  'action' => AuditAction::VOID,
  'module' => 'sales',
  'record_type' => 'sales_invoice',
  'record_id' => 15,
  'record_number' => 'SI-2026-000015',
  'message' => 'Sales invoice voided.',
  'metadata' => [
    'void_reason' => 'Input salah.'
  ],
]);

Example permission denied:
logTenant([
  'event' => AuditEvent::PERMISSION_DENIED,
  'action' => AuditAction::DENY,
  'module' => 'sales',
  'result' => AuditResult::DENIED,
  'message' => 'User does not have permission sales.void.',
  'metadata' => [
    'permission' => 'sales.void'
  ],
]);

INTEGRASI PERMISSION MIDDLEWARE:
Jika EnsurePermission middleware sudah ada:
- Tambahkan audit log denied secara aman.
- Jangan membuat middleware gagal hanya karena audit logging gagal.
- Gunakan try/catch.
- Log event:
  - event = permission.denied
  - action = deny
  - result = denied
  - module = ambil dari permission prefix jika mudah, contoh sales.void => sales
  - metadata.permission = permission string
- Jika tenant connection belum aktif, boleh logCentral atau skip dengan aman.
- Jangan refactor besar middleware.

INTEGRASI COMPANY SETTING UPDATE:
Jika CompanySettingController/Service dari Phase 4A sudah ada:
- Tambahkan audit log central untuk company setting update jika aman.
- Event:
  - company_setting.updated atau settings.company.updated
- Karena company settings berada di central database, gunakan logCentral().
- Jika old_values/new_values mudah diambil, simpan.
- Jika sulit tanpa refactor besar, simpan metadata sederhana.
- Jangan refactor besar controller/service.
- Jika belum aman, dokumentasikan pending integration.

HAS AUDIT LOG TRAIT OPSIONAL:
Jika dibuat backend/app/Traits/HasAuditLog.php:

Methods:
- auditRecordType(): string
- auditRecordId(): int|string|null
- auditRecordNumber(): ?string
- auditContext(): array

Trait ini optional.
Jangan dipaksakan ke model karena model transaksi belum ada.

TEST:
Buat backend/tests/Unit/AuditLogServiceTest.php

Test minimal:
1. AuditResult contains success/failed/denied/warning
2. AuditAction contains create/update/void/post/deny
3. AuditEvent contains permission.denied
4. logTenant creates tenant audit log with event/action/result
5. logTenant stores source link fields
6. logTenant stores revision_id
7. logTenant stores old_values/new_values metadata as arrays
8. logDenied sets result denied
9. logWarning sets result warning
10. withRequestContext does not fail without request context
11. logCentral returns null or creates ActivityLog depending existing ActivityLog compatibility
12. permission denied logging does not throw if tenant logging fails, if middleware integration is added

Testing notes:
- Tenant audit log requires tenant connection and tenant migration.
- If test environment has tenant connection setup, test database insert.
- If tenant connection is difficult, test normalizeData/support classes and document limitation.
- Do not create invoice/journal/cashbank tables.
- Do not depend only on demo admin@example.com.
- Avoid brittle tests tied to exact IP/user agent unless request context is mocked.

DOKUMENTASI:
Buat docs/phase-4j-audit-log-basic.md

Isi wajib:
- tujuan Phase 4J
- beda audit log vs revision tracking
- central audit vs tenant audit
- tenant_audit_logs schema
- event naming standard
- action standard
- result standard
- source link fields in audit
- revision_id relation
- old_values/new_values optional
- permission denied logging
- company setting update logging
- transaction edit audit example
- transaction void audit example
- fiscal closing audit events prepared for Phase 8A
- relationship with Phase 4I Revision Tracking
- relationship with Phase 4H Source Link
- relationship with Phase 4B Permission
- relationship with Phase 17 Audit Log Advanced
- limitations/scope
- command test
- notes commit

Jelaskan secara eksplisit:
- Phase 4J belum membuat audit viewer UI.
- Phase 4J belum membuat export audit.
- Phase 4J belum membuat transaksi nyata.
- Audit log untuk transaksi nanti dipanggil oleh modul transaksi.
- For edit transaction, detail perubahan ada di transaction_revisions.
- Audit log menyimpan aktivitas dan referensi revision_id.
- Tenant audit logs berada di tenant database.
- Central logs memakai activity_logs jika kompatibel.
- Permission denied logging harus aman dan tidak boleh membuat request crash.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan migrate --path=database/migrations/tenant
  atau command tenant migration sesuai project jika sudah ada
- php artisan test --filter=AuditLogServiceTest
- php artisan test --filter=PermissionTest jika EnsurePermission diubah

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4J selesai jika:
1. Tenant migration tenant_audit_logs dibuat
2. TenantAuditLog model dibuat dengan connection tenant
3. AuditEvent support class dibuat
4. AuditAction support class dibuat
5. AuditResult support class dibuat
6. AuditLogService dibuat
7. logTenant tersedia
8. logCentral tersedia dan memakai ActivityLog jika kompatibel atau return null dengan dokumentasi
9. logSuccess/logFailed/logDenied/logWarning tersedia
10. request context helper tersedia dan aman untuk CLI
11. tenant audit log support source link fields
12. tenant audit log support revision_id
13. tenant audit log support old_values/new_values metadata
14. permission denied logging terintegrasi jika aman
15. company setting update logging terintegrasi jika aman atau didokumentasikan pending
16. Unit test AuditLogServiceTest dibuat
17. Dokumentasi Phase 4J dibuat
18. Tidak ada audit viewer UI dibuat
19. Tidak ada transaction table dibuat
20. Tidak ada route API baru dibuat kecuali tidak diperlukan
21. Tidak ada frontend dibuat
22. Tidak ada invoice/journal/purchase/cash_bank/inventory module dibuat
23. Tidak ada SQLite-specific logic dibuat
24. Tidak ada public tenant/company management endpoint dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah jika ada
- tenant migration dibuat
- integrasi permission middleware jika dilakukan
- integrasi company settings audit jika dilakukan
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4J hanya audit log basic
- catatan bahwa audit viewer/export/filter akan dibuat di Phase 17
- catatan bahwa transaction detail changes tetap di transaction_revisions
- catatan bahwa tenant audit log berada di tenant database

COMMIT MESSAGE:
add audit log foundation

COMMIT BODY:
Phase 4J: add audit log foundation with tenant audit log table, audit event/action/result helpers, AuditLogService, request context support, optional permission/settings integration, tests, and documentation. This records basic tenant and central activities without adding transaction modules, audit UI, or public tenant/company management endpoints.