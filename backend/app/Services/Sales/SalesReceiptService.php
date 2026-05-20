<?php

namespace App\Services\Sales;

use App\Exceptions\ApiException;
use App\Models\Tenant\AccountMapping;
use App\Models\Tenant\JournalEntry;
use App\Models\Tenant\SalesInvoice;
use App\Models\Tenant\SalesReceipt;
use App\Services\DocumentNumbering\DocumentNumberService;
use App\Services\Sales\Concerns\HandlesSalesDocuments;
use App\Services\Tenant\TenantContext;
use App\Services\Transactions\TransactionDateGuardService;
use App\Support\DocumentNumbering\DocumentType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SalesReceiptService
{
    use HandlesSalesDocuments;

    public function __construct(private readonly TenantContext $tenantContext, private readonly DocumentNumberService $documentNumberService, private readonly TransactionDateGuardService $dateGuardService) {}
    public function list(array $filters = []): Collection { $q = SalesReceipt::query()->with('customer', 'salesInvoice'); if (! empty($filters['status'])) $q->where('status', (string) $filters['status']); return $q->orderByDesc('receipt_date')->orderByDesc('id')->get(); }
    public function find(int $id): SalesReceipt { return SalesReceipt::query()->with('lines', 'customer', 'salesInvoice')->findOrFail($id); }

    public function create(array $data): SalesReceipt
    {
        $company = $this->tenantContext->company(); if (! $company) throw ApiException::make('COMPANY_NOT_FOUND', 'Company context not resolved.', 422);
        $this->ensureCustomerExists((int) $data['customer_id']);
        return DB::connection('tenant')->transaction(function () use ($company, $data) {
            $receipt = SalesReceipt::query()->create(array_merge($data, ['receipt_number' => $this->documentNumberService->generate($company, DocumentType::SALES_RECEIPT, (string) $data['receipt_date']), 'status' => 'draft', 'created_by' => auth()->id()]));
            $receipt->lines()->createMany($data['lines'] ?? [['sales_invoice_id' => $data['sales_invoice_id'] ?? null, 'billing_invoice_id' => $data['billing_invoice_id'] ?? null, 'amount' => $data['amount'], 'description' => $data['notes'] ?? null]]);
            return $receipt->refresh()->load('lines', 'customer', 'salesInvoice');
        });
    }

    public function post(SalesReceipt $receipt): SalesReceipt
    {
        if ($receipt->status === 'posted') return $receipt;
        $this->guardDate((string) $receipt->receipt_date);
        $invoice = $receipt->sales_invoice_id ? SalesInvoice::query()->findOrFail($receipt->sales_invoice_id) : null;
        if (! $invoice || ! in_array($invoice->status, ['posted', 'partially_paid'], true)) throw ApiException::make('SALES_INVOICE_NOT_PAYABLE', 'Sales invoice must be posted before payment.', 422);
        if ((float) $receipt->amount > (float) $invoice->balance_due) throw ApiException::make('OVERPAYMENT_NOT_ALLOWED', 'Overpayment is blocked for MVP.', 422);
        return DB::connection('tenant')->transaction(function () use ($receipt, $invoice) {
            $journal = $this->journal($receipt, $invoice);
            $receipt->status = 'posted'; $receipt->journal_entry_id = $journal->id; $receipt->posted_by = auth()->id(); $receipt->posted_at = now(); $receipt->save();
            $this->applyToInvoice($receipt, $invoice);
            return $receipt->refresh()->load('lines', 'customer', 'salesInvoice');
        });
    }

    public function void(SalesReceipt $receipt, ?string $reason = null): SalesReceipt
    {
        $receipt->status = 'void'; $receipt->voided_by = auth()->id(); $receipt->voided_at = now(); $receipt->void_reason = $reason; $receipt->save();
        return $receipt->refresh();
    }

    public function applyToInvoice(SalesReceipt $receipt, SalesInvoice $invoice): void
    {
        $invoice->paid_amount = (float) $invoice->paid_amount + (float) $receipt->amount;
        $invoice->balance_due = max(0, (float) $invoice->balance_due - (float) $receipt->amount);
        $invoice->status = $invoice->balance_due <= 0 ? 'paid' : 'partially_paid';
        $invoice->save();
    }

    public function updateInvoicePaymentStatus(SalesInvoice $invoice): SalesInvoice { $invoice->status = (float) $invoice->balance_due <= 0 ? 'paid' : ((float) $invoice->paid_amount > 0 ? 'partially_paid' : $invoice->status); $invoice->save(); return $invoice->refresh(); }
    private function mapping(string $key): int { $mapping = AccountMapping::query()->where('mapping_key', $key)->where('is_active', true)->first(); if (! $mapping?->account_id) throw ApiException::make('ACCOUNT_MAPPING_MISSING', 'Required account mapping is missing: '.$key, 422); return (int) $mapping->account_id; }
    private function guardDate(string $date): void { $check = $this->dateGuardService->check($date, 'post', 'sales'); if ($check->denied()) { $arr = $check->toArray(); throw ApiException::make((string) $arr['code'], (string) $arr['message'], 422, (array) $arr['reasons'], (array) $arr['meta']); } }
    private function journal(SalesReceipt $receipt, SalesInvoice $invoice): JournalEntry { $company = $this->tenantContext->company(); if (! $company) throw ApiException::make('COMPANY_NOT_FOUND', 'Company context not resolved.', 422); $journal = JournalEntry::query()->create(['journal_number' => $this->documentNumberService->generate($company, DocumentType::JOURNAL_ENTRY, (string) $receipt->receipt_date), 'journal_date' => $receipt->receipt_date, 'description' => 'Sales receipt '.$receipt->receipt_number, 'status' => 'posted', 'revision_no' => 1, 'source_type' => 'sales_receipt', 'source_id' => $receipt->id, 'source_number' => $receipt->receipt_number, 'source_revision' => 1, 'source_module' => 'sales', 'is_system_generated' => true, 'created_by' => auth()->id(), 'posted_by' => auth()->id(), 'posted_at' => now()]); $journal->lines()->createMany([['account_id' => $receipt->cash_bank_account_id, 'description' => 'Cash/Bank', 'debit' => $receipt->amount, 'credit' => 0, 'line_order' => 1], ['account_id' => $this->mapping('sales.accounts_receivable'), 'description' => 'Accounts Receivable', 'debit' => 0, 'credit' => $receipt->amount, 'line_order' => 2]]); return $journal->refresh(); }
}
