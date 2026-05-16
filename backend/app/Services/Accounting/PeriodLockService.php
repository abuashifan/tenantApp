<?php

namespace App\Services\Accounting;

use App\Models\Company;
use App\Models\FiscalYear;
use Carbon\Carbon;

class PeriodLockService
{
    public function __construct(private readonly FiscalYearService $fiscalYearService)
    {
    }

    public function isFiscalYearClosed(Company $company, string $date): bool
    {
        $fy = $this->fiscalYearService->fiscalYearForDate($company, $date);
        return $fy instanceof FiscalYear && $fy->status === 'closed';
    }

    public function isPeriodClosed(Company $company, string $date): bool
    {
        $d = Carbon::parse($date)->toDateString();

        $period = $company->accountingPeriods()
            ->where('start_date', '<=', $d)
            ->where('end_date', '>=', $d)
            ->first();

        return $period?->status === 'closed';
    }

    public function isDateReadOnly(Company $company, string $date): bool
    {
        // Phase 4F business rule: no monthly transaction blocking.
        // Period lock exists for reporting/structure and future expansion, but only fiscal year closing makes transactions read-only.
        return $this->isFiscalYearClosed($company, $date);
    }

    public function blockingReasonForDate(Company $company, string $date): ?string
    {
        if ($this->isFiscalYearClosed($company, $date)) {
            return 'FISCAL_YEAR_CLOSED';
        }

        return null;
    }
}
