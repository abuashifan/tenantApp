<?php

namespace App\Http\Requests\CashBank;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankReconciliationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'cash_bank_account_id' => ['required', 'exists:tenant.chart_of_accounts,id'],
            'statement_start_date' => ['required', 'date'],
            'statement_end_date' => ['required', 'date', 'after_or_equal:statement_start_date'],
            'statement_opening_balance' => ['nullable', 'numeric'],
            'statement_ending_balance' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}

