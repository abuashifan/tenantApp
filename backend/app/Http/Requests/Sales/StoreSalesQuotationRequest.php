<?php

namespace App\Http\Requests\Sales;

use Illuminate\Foundation\Http\FormRequest;

class StoreSalesQuotationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:tenant.contacts,id'],
            'quotation_date' => ['required', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:quotation_date'],
            'customer_address' => ['nullable', 'string'],
            'quotation_for' => ['nullable', 'string', 'max:255'],
            'salesperson_id' => ['nullable', 'integer'],
            'currency_code' => ['nullable', 'string', 'size:3'],
            'exchange_rate' => ['nullable', 'numeric', 'gt:0'],
            'is_taxable' => ['nullable', 'boolean'],
            'tax_included' => ['nullable', 'boolean'],
            'header_discount_type' => ['nullable', 'in:percent,fixed_amount'],
            'header_discount_value' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'internal_notes' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.product_id' => ['nullable', 'integer'],
            'lines.*.product_code' => ['nullable', 'string', 'max:100'],
            'lines.*.description' => ['required', 'string'],
            'lines.*.quantity' => ['required', 'numeric', 'gt:0'],
            'lines.*.unit_id' => ['nullable', 'integer'],
            'lines.*.unit_price' => ['required', 'numeric', 'min:0'],
            'lines.*.discount_type' => ['nullable', 'in:percent,fixed_amount'],
            'lines.*.discount_value' => ['nullable', 'numeric', 'min:0'],
            'lines.*.tax_rate' => ['nullable', 'numeric', 'min:0'],
            'lines.*.warehouse_id' => ['nullable', 'integer'],
            'lines.*.department_id' => ['nullable', 'integer'],
            'lines.*.project_id' => ['nullable', 'integer'],
        ];
    }
}
