<?php

namespace App\Http\Requests\CashBank;

use Illuminate\Foundation\Http\FormRequest;

class CashBankAccountStatementRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'cash_bank_account_id' => ['required', 'exists:tenant.chart_of_accounts,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}

