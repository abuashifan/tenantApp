<?php

namespace App\Http\Requests\Reports;

use App\Http\Requests\Concerns\HasReportDateFilters;
use App\Http\Requests\Concerns\HasReportDimensionFilters;
use Illuminate\Foundation\Http\FormRequest;

class GeneralLedgerRequest extends FormRequest
{
    use HasReportDateFilters;
    use HasReportDimensionFilters;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['nullable', 'integer'],
            ...$this->dateFilterRules(),
            ...$this->dimensionFilterRules(),
            'include_opening_balance' => ['nullable', 'boolean'],
            'include_zero_balance' => ['nullable', 'boolean'],
            'sort_by' => ['nullable', 'in:journal_date,journal_number,account_code'],
            'sort_direction' => ['nullable', 'in:asc,desc'],
        ];
    }
}
