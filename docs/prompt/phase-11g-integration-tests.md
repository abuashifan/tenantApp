# Phase 11G — Integration Tests & Documentation

Phase 11G memfinalisasi Phase 11 (Cash Bank Backend) dengan integration tests lintas modul cash/bank.

## Integration test

- `backend/tests/Feature/CashBank/CashBankIntegrationTest.php`

Menguji konsistensi flow:
- Cash In (cash receipt) → post (jurnal tercatat)
- Cash Out (cash payment) → post (jurnal tercatat)
- Bank transfer → post (jurnal tercatat)
- Cash/bank account statement ending balance sesuai mutasi jurnal
- Bank reconciliation draft menghasilkan lines dari jurnal posted cash/bank dalam periode statement

## Commands

```bash
cd backend
php artisan test --filter=CashBankIntegrationTest
```

