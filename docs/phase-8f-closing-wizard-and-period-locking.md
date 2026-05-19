# Phase 8F — Closing Wizard & Period Locking UI/API Integration

Phase 8F menambahkan layer operasional untuk workflow closing yang usable:
- Closing checklist (wajib sebelum close)
- Period locking management (lock_until) untuk mem-block transaksi pada tanggal tertentu
- Visibility status closing/locking
- Refinement transaction blocking (message lebih jelas & konsisten)
- Audit events untuk close/lock workflow
- Frontend UI lightweight untuk menjalankan closing workflow

Tidak termasuk:
- Closing wizard advanced multi-step
- Fiscal closing yang kompleks (di luar fondasi Phase 8E)
- Inventory/tax/fixed asset closing
- Export PDF/Excel
- Frontend dashboard analytics besar

## Closing wizard flow (MVP)
1. Ambil active fiscal year status
2. Load closing checklist
3. Load closing preview (retained earnings)
4. Close fiscal year (hanya jika checklist passed dan preview sudah dilakukan)
5. Reopen fiscal year (role tertentu + reason)

## Closing checklist
Endpoint:
- `GET /api/accounting/fiscal-years/{id}/closing-checklist`

Response minimal:
```json
{
  "can_close": true,
  "errors": {},
  "warnings": [],
  "checks": [
    { "key": "trial_balance_balanced", "status": "passed", "message": "Trial balance is balanced." }
  ]
}
```

Closing akan diblok jika checklist gagal atau preview belum pernah dilakukan.

## Period locking
Endpoint:
- `GET /api/accounting/period-locks/status`
- `PATCH /api/accounting/period-locks`

Field:
- `lock_until` (nullable date)
- `override_reason` (nullable string)

Behavior:
- Lock affects journal mutation only (create/edit/void), reports tetap readable.

## Transaction blocking (refinement)
Transaction guard akan menolak transaksi jika:
- fiscal year status `closed`, atau
- `locked_until` aktif dan transaksi berada di tanggal yang terkunci.

Contoh response error:
```json
{
  "success": false,
  "code": "TRANSACTION_PERIOD_LOCKED",
  "message": "Transactions for this fiscal period are locked.",
  "errors": {
    "transaction_date": ["Transactions for this fiscal period are locked."]
  }
}
```

## Audit events
Events minimal:
- `fiscal_year.lock_updated`
- `fiscal_year.close_attempted`
- `fiscal_year.close_blocked`

## Permissions
Menggunakan permission fiscal year:
- `fiscal_year.closing_wizard`
- `fiscal_year.lock_manage`
- (reuse) `fiscal_year.view`, `fiscal_year.close`, `fiscal_year.reopen`

## Frontend UI
Page:
- `frontend/app/accounting/fiscal-closing/page.tsx`

UI minimal menampilkan:
- current fiscal year status
- checklist (errors/warnings)
- preview retained earnings
- close action (disabled kalau tidak bisa close)
- reopen action (jika allowed)
- lock status + update lock

## Tests
Backend feature tests:
- `backend/tests/Feature/Accounting/ClosingWizardTest.php`
- `backend/tests/Feature/Accounting/PeriodLockingApiTest.php`

## Commands
Jika environment memungkinkan:
- `cd backend`
- `php artisan test --filter=ClosingWizardTest`
- `php artisan test --filter=PeriodLockingApiTest`
- `php artisan route:list`

