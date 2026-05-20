<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;

class StoreBillingInvoiceRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'billing_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:billing_date'],
            'customer_id' => ['required', 'exists:tenant.contacts,id'],
            'sales_invoice_id' => ['nullable', 'integer'],
            'notes' => ['nullable', 'string'],
            'internal_notes' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.sales_invoice_line_id' => ['nullable', 'integer'],
            'lines.*.description' => ['required', 'string'],
            'lines.*.amount' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
