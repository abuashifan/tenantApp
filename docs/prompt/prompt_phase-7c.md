Kita masuk ke Phase 7C project TenantAppDevelopment.

NAMA PHASE:
Phase 7C — Trial Balance

TUJUAN PHASE 7C:
Membuat Trial Balance / Neraca Saldo berdasarkan jurnal yang sudah posted dan tidak obsolete.

Endpoint:
- GET `/api/reports/trial-balance`

Files:
- backend/app/Data/Reports/TrialBalanceFilter.php
- backend/app/Data/Reports/TrialBalanceAccountData.php
- backend/app/Services/Reports/TrialBalanceCalculator.php
- backend/app/Services/Reports/TrialBalanceService.php
- backend/app/Http/Requests/Reports/TrialBalanceRequest.php
- backend/app/Http/Controllers/Api/Reports/TrialBalanceController.php
- backend/tests/Unit/Reports/TrialBalanceServiceTest.php
- backend/tests/Feature/Reports/TrialBalanceApiTest.php
- docs/phase-7c-trial-balance.md
- docs/progress-list/phase-7c-done.md

