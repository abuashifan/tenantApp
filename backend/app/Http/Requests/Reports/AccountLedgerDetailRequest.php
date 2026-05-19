<?php

namespace App\Http\Requests\Reports;

use Illuminate\Foundation\Http\FormRequest;

class AccountLedgerDetailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'department_id' => ['nullable', 'integer'],
            'project_id' => ['nullable', 'integer'],
            'include_opening_balance' => ['nullable', 'boolean'],
            'include_zero_balance' => ['nullable', 'boolean'],
            'include_source_info' => ['nullable', 'boolean'],
            'include_dimensions' => ['nullable', 'boolean'],
            'sort_direction' => ['nullable', 'in:asc,desc'],
        ];
    }
}

