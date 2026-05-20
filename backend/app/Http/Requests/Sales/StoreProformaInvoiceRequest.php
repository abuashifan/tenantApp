<?php

namespace App\Http\Requests\Sales;

class StoreProformaInvoiceRequest extends StoreSalesQuotationRequest
{
    public function rules(): array { $rules = parent::rules(); unset($rules['quotation_date'], $rules['quotation_for']); $rules['proforma_date'] = ['required', 'date']; $rules['valid_until'] = ['nullable', 'date', 'after_or_equal:proforma_date']; $rules['sales_quotation_id'] = ['nullable', 'integer']; $rules['sales_order_id'] = ['nullable', 'integer']; return $rules; }
}
