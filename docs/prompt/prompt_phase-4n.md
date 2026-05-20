Kita masuk ke Phase 4N project TenantAppDevelopment.

NAMA PHASE:
Phase 4N — Standard API Error Code

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
- request tenant memakai header X-Company-ID
- backend memakai Laravel API
- frontend Next.js perlu response error yang konsisten

TUJUAN PHASE 4N:
Membuat standar API error code agar semua endpoint backend mengembalikan error/warning dengan format konsisten.

Phase ini penting agar frontend bisa:
- menampilkan pesan error yang jelas
- membedakan permission denied vs validation vs dependency vs fiscal year closed
- menampilkan warning confirmation untuk future date/different period
- menangani error transaksi secara konsisten
- tidak parsing message text secara manual

KEPUTUSAN BISNIS WAJIB:
1. Semua error API harus punya code.
2. Semua warning yang butuh konfirmasi harus punya requires_confirmation = true.
3. Permission denied harus punya code PERMISSION_DENIED.
4. Dependency blocking harus punya code TRANSACTION_HAS_DEPENDENCY.
5. Fiscal year closed harus punya code FISCAL_YEAR_CLOSED.
6. Outside active fiscal year harus punya code TRANSACTION_DATE_OUTSIDE_ACTIVE_FISCAL_YEAR.
7. Date warning harus punya code dan requires_confirmation.
8. Validation error tetap compatible dengan Laravel validation, tetapi formatnya harus distandarkan.
9. Jangan refactor besar semua controller lama jika berisiko.
10. Phase 4N membuat helper/trait/support agar controller berikutnya memakai format yang benar.
11. Phase 4N tidak membuat modul transaksi.
12. Phase 4N tidak membuat frontend UI.

FORMAT RESPONSE STANDAR:

Success:
{
  "success": true,
  "message": "Success",
  "data": {}
}

Error:
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human readable message.",
  "errors": {},
  "meta": {}
}

Warning:
{
  "success": false,
  "code": "WARNING_CODE",
  "message": "Human readable warning.",
  "requires_confirmation": true,
  "errors": {},
  "meta": {}
}

Validation:
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "The given data was invalid.",
  "errors": {
    "field": ["message"]
  },
  "meta": {}
}

SCOPE YANG HARUS DIKERJAKAN:
1. Buat config/api_errors.php.
2. Buat ApiErrorCode support class.
3. Buat ApiWarningCode support class jika diperlukan.
4. Buat ApiResponseBuilder helper.
5. Buat/rapikan ApiResponse trait jika sudah ada.
6. Buat ApiException class optional.
7. Buat tests.
8. Buat dokumentasi docs/phase-4n-standard-api-error-code.md.
9. Update docs Phase 4D/4E/4F jika perlu untuk menyebut code standar.

JANGAN MENGERJAKAN:
- transaksi nyata
- invoice
- journal
- report
- frontend UI
- global exception handler refactor besar yang berisiko
- mengubah semua controller lama secara masif
- create tenant/company public endpoint
- SQLite-specific logic

FILE BARU:
- backend/config/api_errors.php
- backend/app/Support/Api/ApiErrorCode.php
- backend/app/Support/Api/ApiResponseBuilder.php
- backend/app/Exceptions/ApiException.php
- backend/tests/Unit/ApiResponseBuilderTest.php
- docs/phase-4n-standard-api-error-code.md

Opsional jika belum ada:
- backend/app/Traits/ApiResponse.php
  Jika sudah ada, jangan duplikat. Rapikan secara backward-compatible.

Jika folder belum ada:
- backend/app/Support/Api
- backend/tests/Unit

FILE YANG BOLEH DIUBAH:
- backend/app/Traits/ApiResponse.php jika sudah ada
- docs/phase-4d-transaction-policy-service.md
- docs/phase-4e-transaction-dependency-foundation.md
- docs/phase-4f-fiscal-year-period-lock-date-guard.md
- docs/phase-4b-permission-foundation-basic.md

JANGAN UBAH:
- frontend/*
- routes/api.php kecuali tidak perlu
- transaction modules
- tenant/company public management endpoints

CONFIG api_errors.php:
Buat backend/config/api_errors.php

Isi minimal mapping:

return [
    'codes' => [
        'VALIDATION_ERROR' => 'The given data was invalid.',
        'UNAUTHENTICATED' => 'Unauthenticated.',
        'FORBIDDEN' => 'Forbidden.',
        'PERMISSION_DENIED' => 'You do not have permission to perform this action.',
        'COMPANY_ACCESS_DENIED' => 'You do not have access to this company.',
        'X_COMPANY_ID_REQUIRED' => 'X-Company-ID wajib dikirim.',
        'TENANT_DATABASE_NOT_ACTIVE' => 'Tenant database is not active.',
        'TRANSACTION_HAS_DEPENDENCY' => 'Transaction has related records and cannot be modified.',
        'TRANSACTION_STATUS_NOT_EDITABLE' => 'Transaction status is not editable.',
        'TRANSACTION_STATUS_NOT_VOIDABLE' => 'Transaction status is not voidable.',
        'TRANSACTION_ALREADY_VOID' => 'Transaction is already void.',
        'TRANSACTION_ALREADY_POSTED' => 'Transaction is already posted.',
        'COMPANY_SETTING_EDIT_DISABLED' => 'Editing transactions is disabled in company settings.',
        'COMPANY_SETTING_EDIT_POSTED_DISABLED' => 'Editing posted transactions is disabled in company settings.',
        'COMPANY_SETTING_VOID_DISABLED' => 'Voiding transactions is disabled in company settings.',
        'FISCAL_YEAR_CLOSED' => 'Fiscal year is closed. Transaction is read-only.',
        'ACCOUNTING_PERIOD_CLOSED' => 'Accounting period is closed. Transaction is read-only.',
        'TRANSACTION_DATE_OUTSIDE_ACTIVE_FISCAL_YEAR' => 'Transaction date is outside the active fiscal year.',
        'PREVIOUS_FISCAL_YEAR_NOT_CLOSED' => 'Previous fiscal year must be closed before entering transactions in the next fiscal year.',
        'BACKDATED_TRANSACTION_NOT_ALLOWED' => 'Backdated transaction is not allowed.',
        'BACKDATED_TRANSACTION_TOO_FAR' => 'Backdated transaction is too far.',
        'FUTURE_TRANSACTION_NOT_ALLOWED' => 'Future transaction is not allowed.',
        'FUTURE_TRANSACTION_TOO_FAR' => 'Future transaction is too far.',
        'DOCUMENT_NUMBER_DUPLICATE' => 'Document number already exists.',
        'DOCUMENT_NUMBERING_INACTIVE' => 'Document numbering setting is inactive.',
        'UNKNOWN_DOCUMENT_TYPE' => 'Unknown document type.',
        'ACCOUNT_MAPPING_MISSING' => 'Required account mapping is missing.',
        'OPENING_BALANCE_UNBALANCED' => 'Opening balance must be balanced.',
        'UNKNOWN_ERROR' => 'Unknown error.',
    ],

    'warnings' => [
        'FUTURE_TRANSACTION_DATE_WARNING' => 'Transaction date is in the future.',
        'DIFFERENT_PERIOD_DATE_WARNING' => 'Transaction date is in a different period.',
        'BACKDATED_TRANSACTION_WARNING' => 'Transaction date is backdated.',
    ],
];

API ERROR CODE CLASS:
Buat backend/app/Support/Api/ApiErrorCode.php

Constants minimal:
- VALIDATION_ERROR
- UNAUTHENTICATED
- FORBIDDEN
- PERMISSION_DENIED
- COMPANY_ACCESS_DENIED
- X_COMPANY_ID_REQUIRED
- TENANT_DATABASE_NOT_ACTIVE
- TRANSACTION_HAS_DEPENDENCY
- TRANSACTION_STATUS_NOT_EDITABLE
- TRANSACTION_STATUS_NOT_VOIDABLE
- TRANSACTION_ALREADY_VOID
- TRANSACTION_ALREADY_POSTED
- COMPANY_SETTING_EDIT_DISABLED
- COMPANY_SETTING_EDIT_POSTED_DISABLED
- COMPANY_SETTING_VOID_DISABLED
- FISCAL_YEAR_CLOSED
- ACCOUNTING_PERIOD_CLOSED
- TRANSACTION_DATE_OUTSIDE_ACTIVE_FISCAL_YEAR
- PREVIOUS_FISCAL_YEAR_NOT_CLOSED
- BACKDATED_TRANSACTION_NOT_ALLOWED
- BACKDATED_TRANSACTION_TOO_FAR
- FUTURE_TRANSACTION_NOT_ALLOWED
- FUTURE_TRANSACTION_TOO_FAR
- FUTURE_TRANSACTION_DATE_WARNING
- DIFFERENT_PERIOD_DATE_WARNING
- BACKDATED_TRANSACTION_WARNING
- DOCUMENT_NUMBER_DUPLICATE
- DOCUMENT_NUMBERING_INACTIVE
- UNKNOWN_DOCUMENT_TYPE
- ACCOUNT_MAPPING_MISSING
- OPENING_BALANCE_UNBALANCED
- UNKNOWN_ERROR

Methods:
- all(): array
- exists(string $code): bool
- message(string $code): string
- isWarning(string $code): bool

API RESPONSE BUILDER:
Buat backend/app/Support/Api/ApiResponseBuilder.php

Methods:
- success(mixed $data = null, string $message = 'Success', int $status = 200, array $meta = [])
- error(string $code, ?string $message = null, array $errors = [], int $status = 400, array $meta = [])
- warning(string $code, ?string $message = null, array $errors = [], array $meta = [], int $status = 409)
- validation(array $errors, string $message = 'The given data was invalid.', array $meta = [])
- fromPolicyResult($policyResult, int $denyStatus = 403)

Behavior:
- success returns success true.
- error returns success false, code, message, errors, meta.
- warning returns success false, code, message, requires_confirmation true, errors, meta.
- validation code VALIDATION_ERROR and status 422.
- fromPolicyResult:
  - if allowed => success
  - if warning => warning
  - if denied => error

API RESPONSE TRAIT:
Jika backend/app/Traits/ApiResponse.php sudah ada:
- Tambahkan method yang memanggil ApiResponseBuilder.
- Jangan hapus method lama jika sudah dipakai controller.
- Backward-compatible.

Methods recommended:
- successResponse()
- errorResponse()
- warningResponse()
- validationErrorResponse()
- policyResponse()

API EXCEPTION:
Buat backend/app/Exceptions/ApiException.php

Properties:
- string $codeName
- array $errors
- array $meta
- int $status

Static:
- make(string $code, ?string $message = null, int $status = 400, array $errors = [], array $meta = [])

render():
- return ApiResponseBuilder::error(...)

Jika tidak ingin menyentuh global exception flow, ApiException tetap boleh dibuat untuk future use.

TEST:
Buat backend/tests/Unit/ApiResponseBuilderTest.php

Test minimal:
1. success response has success true
2. error response has success false and code
3. warning response has requires_confirmation true
4. validation response uses VALIDATION_ERROR and status 422
5. unknown code still returns message
6. ApiErrorCode exists returns true for PERMISSION_DENIED
7. ApiErrorCode isWarning true for FUTURE_TRANSACTION_DATE_WARNING
8. fromPolicyResult returns warning when policy warning
9. fromPolicyResult returns error when policy denied
10. fromPolicyResult returns success when policy allowed if easy to test

DOKUMENTASI:
Buat docs/phase-4n-standard-api-error-code.md

Isi wajib:
- tujuan Phase 4N
- format success response
- format error response
- format warning response
- format validation response
- daftar error code
- daftar warning code
- cara frontend menangani requires_confirmation
- integrasi dengan TransactionPolicyResult
- integrasi dengan PermissionService/middleware
- integrasi dengan DateGuard warning
- backward-compatible dengan ApiResponse trait lama
- batasan scope
- command test
- notes commit

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan test --filter=ApiResponseBuilderTest

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4N selesai jika:
1. config/api_errors.php dibuat
2. ApiErrorCode dibuat
3. ApiResponseBuilder dibuat
4. ApiException dibuat
5. ApiResponse trait dirapikan backward-compatible jika ada
6. ApiResponseBuilderTest dibuat
7. Dokumentasi Phase 4N dibuat
8. error response punya code
9. warning response punya requires_confirmation true
10. validation response punya VALIDATION_ERROR
11. warning date code tersedia
12. permission/dependency/fiscal year codes tersedia
13. Tidak ada modul transaksi dibuat
14. Tidak ada frontend dibuat
15. Tidak ada route API baru wajib dibuat
16. Tidak ada public tenant/company management endpoint dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah jika ada
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4N hanya API error code foundation
- catatan bahwa controller lama tidak direfactor besar

COMMIT MESSAGE:
add standard api error codes

COMMIT BODY:
Phase 4N: add standard API error and warning code foundation with response builder, error code helpers, optional API exception, tests, and documentation. This standardizes success, error, validation, and confirmation-warning responses without adding business modules or frontend UI.