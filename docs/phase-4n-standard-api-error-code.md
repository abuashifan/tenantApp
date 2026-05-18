# Phase 4N — Standard API Error Code

Phase 4N menambahkan standar response error/warning agar frontend bisa menangani error secara konsisten tanpa parsing teks message.

## Format Response

Success:
```json
{ "success": true, "message": "Success", "data": {}, "meta": {} }
```

Error:
```json
{ "success": false, "code": "ERROR_CODE", "message": "Message", "errors": {}, "meta": {} }
```

Warning (requires confirmation):
```json
{ "success": false, "code": "WARNING_CODE", "message": "Warning", "requires_confirmation": true, "errors": {}, "meta": {} }
```

Validation:
```json
{ "success": false, "code": "VALIDATION_ERROR", "message": "The given data was invalid.", "errors": { "field": ["msg"] }, "meta": {} }
```

## Implementasi

Config:
- `backend/config/api_errors.php`

Support:
- `backend/app/Support/Api/ApiErrorCode.php`

Builder:
- `backend/app/Support/Api/ApiResponseBuilder.php`

Optional exception:
- `backend/app/Exceptions/ApiException.php`

Trait:
- `backend/app/Traits/ApiResponse.php` (backward-compatible)

## Integrasi Dengan TransactionPolicyResult

`ApiResponseBuilder::fromPolicyResult()`:
- policy `warning` → response warning + `requires_confirmation=true`
- policy `deny` → response error
- policy `allow` → response success

## Catatan Permission / Middleware

Permission denied harus memakai code `PERMISSION_DENIED` agar frontend bisa membedakan dari validation/dependency/fiscal year closed.

## Batasan Scope

- Tidak refactor besar semua controller lama.
- Foundation ini dipakai bertahap oleh controller/controller baru.

## Testing

Jalankan:
- `cd backend`
- `php artisan test --filter=ApiResponseBuilderTest`

## Notes Commit

Commit message:
`add standard api error codes`

