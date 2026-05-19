<?php

namespace App\Http\Requests\Reports;

use App\Http\Requests\Concerns\HasReportDimensionFilters;
use Illuminate\Foundation\Http\FormRequest;

class ProfitLossRequest extends FormRequest
{
    use HasReportDimensionFilters;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            ...$this->dimensionFilterRules(),
            'include_zero_balance' => ['nullable', 'boolean'],
            'include_inactive_accounts' => ['nullable', 'boolean'],
            'group_by' => ['nullable', 'string', 'in:account_type,none'],
        ];
    }
}

