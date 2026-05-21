<?php

namespace App\Services\Sales;

use App\Exceptions\ApiException;
use App\Models\Tenant\AccountMapping;
use App\Models\Tenant\CustomerDeposit;
use App\Models\Tenant\CustomerDepositAllocation;
use App\Models\Tenant\DeliveryOrder;
use App\Models\Tenant\DeliveryOrderLine;
use App\Models\Tenant\JournalEntry;
use App\Models\Tenant\ProformaInvoice;
use App\Models\Tenant\SalesInvoice;
use App\Models\Tenant\SalesOrder;
use App\Models\Tenant\SalesOrderLine;
use App\Services\Audit\AuditLogService;
use App\Services\DocumentNumbering\DocumentNumberService;
use App\Services\Inventory\InventorySalesIntegrationService;
use App\Services\Sales\Concerns\HandlesSalesDocuments;
use App\Services\Tenant\TenantContext;
use App\Services\Transactions\TransactionDateGuardService;
use App\Support\DocumentNumbering\DocumentType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SalesInvoiceService
{
    use HandlesSalesDocuments;

    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly DocumentNumberService $documentNumberService,
        private readonly SalesCalculationService $calculationService,
        private readonly TransactionDateGuardService $dateGuardService,
        private readonly InventorySalesIntegrationService $inventoryIntegration,
        private readonly ?AuditLogService $auditLogService = null,
    ) {
    }

    public function list(array $filters = []): Collection
    {
        $query = SalesInvoice::query()->with('customer');
        if (! empty($filters['status'])) {
            $query->where('status', (string) $filters['status']);
        }

        return $query->orderByDesc('invoice_date')->orderByDesc('id')->get();
    }

    public function find(int $id): SalesInvoice
    {
        return SalesInvoice::query()->with('lines.product', 'customer', 'salesOrder', 'deliveryOrder', 'proformaInvoice')->findOrFail($id);
    }

    public function create(array $data): SalesInvoice
    {
        $company = $this->tenantContext->company();
        if (! $company) {
            throw ApiException::make('COMPANY_NOT_FOUND', 'Company context not resolved.', 422);
        }

        $this->ensureCustomerExists((int) $data['customer_id']);

        return DB::connection('tenant')->transaction(function () use ($company, $data) {
            $lines = $this->normalizeLines((array) $data['lines'], fn (array $line): array => [
                'sales_order_line_id' => $line['sales_order_line_id'] ?? null,
                'delivery_order_line_id' => $line['delivery_order_line_id'] ?? null,
                'proforma_invoice_line_id' => $line['proforma_invoice_line_id'] ?? null,
            ]);
            $totals = $this->calculationService->calculateDocument($lines, $data);
            $headerTotals = $totals;
            unset($headerTotals['lines']);
            $appliedDp = min((float) ($data['applied_down_payment_amount'] ?? 0), (float) $headerTotals['grand_total']);

            $invoice = SalesInvoice::query()->create(array_merge($this->guardedForHeader($data), $headerTotals, [
                'invoice_number' => $this->documentNumberService->generate($company, DocumentType::SALES_INVOICE, (string) $data['invoice_date']),
                'status' => 'draft',
                'applied_down_payment_amount' => $appliedDp,
                'paid_amount' => 0,
                'balance_due' => max(0, (float) $headerTotals['grand_total'] - $appliedDp),
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]));
            $invoice->lines()->createMany($totals['lines']);

            return $invoice->refresh()->load('lines', 'customer');
        });
    }

    public function update(SalesInvoice $invoice, array $data): SalesInvoice
    {
        if ($invoice->status !== 'draft') {
            throw ApiException::make('SALES_INVOICE_NOT_EDITABLE', 'Sales invoice status is not editable.', 422);
        }

        return DB::connection('tenant')->transaction(function () use ($invoice, $data) {
            $lines = $this->normalizeLines((array) ($data['lines'] ?? $invoice->lines()->get()->toArray()), fn (array $line): array => [
                'sales_order_line_id' => $line['sales_order_line_id'] ?? null,
                'delivery_order_line_id' => $line['delivery_order_line_id'] ?? null,
                'proforma_invoice_line_id' => $line['proforma_invoice_line_id'] ?? null,
            ]);
            $totals = $this->calculationService->calculateDocument($lines, array_merge($invoice->toArray(), $data));
            $headerTotals = $totals;
            unset($headerTotals['lines']);
            $appliedDp = min((float) ($data['applied_down_payment_amount'] ?? $invoice->applied_down_payment_amount), (float) $headerTotals['grand_total']);

            $invoice->fill(array_merge($this->guardedForHeader($data), $headerTotals, [
                'applied_down_payment_amount' => $appliedDp,
                'balance_due' => max(0, (float) $headerTotals['grand_total'] - $appliedDp - (float) $invoice->paid_amount),
                'updated_by' => auth()->id(),
                'revision_no' => (int) $invoice->revision_no + 1,
            ]));
            $invoice->save();
            $invoice->lines()->delete();
            $invoice->lines()->createMany($totals['lines']);

            return $invoice->refresh()->load('lines', 'customer');
        });
    }

    public function createFromSalesOrder(SalesOrder $order, array $overrides = []): SalesInvoice
    {
        $order->loadMissing('lines');
        $data = array_merge([
            'invoice_date' => now()->toDateString(),
            'customer_id' => $order->customer_id,
            'customer_address' => $order->customer_address,
            'sales_order_id' => $order->id,
            'salesperson_id' => $order->salesperson_id,
            'currency_code' => $order->currency_code,
            'exchange_rate' => $order->exchange_rate,
            'is_taxable' => $order->is_taxable,
            'tax_included' => $order->tax_included,
            'header_discount_type' => $order->header_discount_type,
            'header_discount_value' => $order->header_discount_value,
            'source_type' => 'sales_order',
            'source_id' => $order->id,
            'source_number' => $order->order_number,
            'source_revision' => $order->revision_no,
            'lines' => $order->lines->map(fn ($line) => array_merge($line->only([
                'product_id', 'product_code', 'description', 'quantity', 'unit_id', 'unit_price',
                'discount_type', 'discount_value', 'tax_id', 'tax_rate', 'warehouse_id',
                'department_id', 'project_id', 'sort_order', 'metadata',
            ]), [
                'sales_order_line_id' => $line->id,
                'source_line_type' => 'sales_order_line',
                'source_line_id' => $line->id,
            ]))->toArray(),
        ], $overrides);

        if (! array_key_exists('applied_down_payment_amount', $data)) {
            $data['applied_down_payment_amount'] = min($this->availableDownPaymentForOrder($order), $this->previewGrandTotal($data));
        }

        return $this->create($data);
    }

    public function createFromDeliveryOrder(DeliveryOrder $deliveryOrder, array $overrides = []): SalesInvoice
    {
        $deliveryOrder->loadMissing('lines');
        return $this->create(array_merge([
            'invoice_date' => now()->toDateString(),
            'customer_id' => $deliveryOrder->customer_id,
            'delivery_order_id' => $deliveryOrder->id,
            'sales_order_id' => $deliveryOrder->sales_order_id,
            'customer_address' => $deliveryOrder->shipping_address,
            'source_type' => 'delivery_order',
            'source_id' => $deliveryOrder->id,
            'source_number' => $deliveryOrder->delivery_number,
            'source_revision' => $deliveryOrder->revision_no,
            'lines' => $deliveryOrder->lines->map(function ($line) {
                $orderLine = $line->sales_order_line_id ? SalesOrderLine::query()->find($line->sales_order_line_id) : null;

                return [
                    'sales_order_line_id' => $line->sales_order_line_id,
                    'delivery_order_line_id' => $line->id,
                    'product_id' => $line->product_id,
                    'product_code' => $line->product_code,
                    'description' => $line->description,
                    'quantity' => $line->quantity,
                    'unit_id' => $line->unit_id,
                    'unit_price' => $orderLine?->unit_price ?? 0,
                    'discount_type' => $orderLine?->discount_type,
                    'discount_value' => $orderLine?->discount_value,
                    'tax_rate' => $orderLine?->tax_rate,
                    'warehouse_id' => $line->warehouse_id,
                    'department_id' => $line->department_id,
                    'project_id' => $line->project_id,
                    'source_line_type' => 'delivery_order_line',
                    'source_line_id' => $line->id,
                    'sort_order' => $line->sort_order,
                ];
            })->toArray(),
        ], $overrides));
    }

    public function createFromProforma(ProformaInvoice $proforma, array $overrides = []): SalesInvoice
    {
        $proforma->loadMissing('lines');
        return $this->create(array_merge([
            'invoice_date' => now()->toDateString(),
            'customer_id' => $proforma->customer_id,
            'customer_address' => $proforma->customer_address,
            'proforma_invoice_id' => $proforma->id,
            'salesperson_id' => $proforma->salesperson_id,
            'currency_code' => $proforma->currency_code,
            'exchange_rate' => $proforma->exchange_rate,
            'is_taxable' => $proforma->is_taxable,
            'tax_included' => $proforma->tax_included,
            'header_discount_type' => $proforma->header_discount_type,
            'header_discount_value' => $proforma->header_discount_value,
            'source_type' => 'proforma_invoice',
            'source_id' => $proforma->id,
            'source_number' => $proforma->proforma_number,
            'source_revision' => $proforma->revision_no,
            'lines' => $proforma->lines->map(fn ($line) => array_merge($line->only([
                'product_id', 'product_code', 'description', 'quantity', 'unit_id', 'unit_price',
                'discount_type', 'discount_value', 'tax_id', 'tax_rate', 'warehouse_id',
                'department_id', 'project_id', 'sort_order', 'metadata',
            ]), [
                'proforma_invoice_line_id' => $line->id,
                'source_line_type' => 'proforma_invoice_line',
                'source_line_id' => $line->id,
            ]))->toArray(),
        ], $overrides));
    }

    public function approve(SalesInvoice $invoice): SalesInvoice
    {
        if ($invoice->status !== 'draft') {
            throw ApiException::make('INVALID_SALES_INVOICE_STATUS', 'Invalid sales invoice status transition.', 422);
        }

        $invoice->status = 'approved';
        $invoice->approved_by = auth()->id();
        $invoice->approved_at = now();
        $invoice->save();

        return $invoice->refresh()->load('lines', 'customer');
    }

    public function post(SalesInvoice $invoice, ?float $appliedDownPaymentAmount = null): SalesInvoice
    {
        if (! in_array($invoice->status, ['draft', 'approved'], true)) {
            throw ApiException::make('INVALID_SALES_INVOICE_STATUS', 'Invoice cannot be posted from current status.', 422);
        }

        $dateCheck = $this->dateGuardService->check((string) $invoice->invoice_date, 'post', 'sales');
        if ($dateCheck->denied()) {
            $arr = $dateCheck->toArray();
            throw ApiException::make((string) $arr['code'], (string) $arr['message'], 422, (array) $arr['reasons'], (array) $arr['meta']);
        }

        return DB::connection('tenant')->transaction(function () use ($invoice, $appliedDownPaymentAmount) {
            $invoice->load('lines');
            if ($appliedDownPaymentAmount !== null) {
                $invoice->applied_down_payment_amount = min($appliedDownPaymentAmount, (float) $invoice->grand_total);
            }

            $journal = $this->createInvoiceJournal($invoice);
            $invoice->journal_entry_id = $journal->id;

            if ((float) $invoice->applied_down_payment_amount > 0) {
                $allocationJournal = $this->applyAvailableDownPayment($invoice);
                $invoice->deposit_allocation_journal_entry_id = $allocationJournal?->id;
            }

            $invoice->paid_amount = (float) $invoice->applied_down_payment_amount;
            $invoice->balance_due = max(0, (float) $invoice->grand_total - (float) $invoice->paid_amount);
            $invoice->status = $invoice->balance_due <= 0 ? 'paid' : ((float) $invoice->paid_amount > 0 ? 'partially_paid' : 'posted');
            $invoice->posted_by = auth()->id();
            $invoice->posted_at = now();
            $invoice->save();

            $this->updateSourceProgress($invoice);
            $this->inventoryIntegration->createSalesOutFromSalesInvoice($invoice);
            $this->auditSales($this->auditLogService, 'sales_invoice.posted', 'sales', $invoice, 'invoice_number');

            return $invoice->refresh()->load('lines', 'customer');
        });
    }

    public function void(SalesInvoice $invoice, ?string $reason = null): SalesInvoice
    {
        if ($invoice->status === 'void') {
            throw ApiException::make('SALES_INVOICE_ALREADY_VOID', 'Sales invoice already void.', 422);
        }

        $invoice->status = 'void';
        $invoice->voided_by = auth()->id();
        $invoice->voided_at = now();
        $invoice->void_reason = $reason;
        $invoice->save();

        return $invoice->refresh()->load('lines', 'customer');
    }

    public function applyAvailableDownPayment(SalesInvoice $invoice): ?JournalEntry
    {
        if (! $invoice->sales_order_id || (float) $invoice->applied_down_payment_amount <= 0) {
            return null;
        }

        $remainingToApply = (float) $invoice->applied_down_payment_amount;
        $journal = $this->createDepositAllocationJournal($invoice, $remainingToApply);

        $deposits = CustomerDeposit::query()
            ->where('sales_order_id', $invoice->sales_order_id)
            ->whereIn('status', ['posted', 'partially_allocated'])
            ->where('remaining_amount', '>', 0)
            ->orderBy('deposit_date')
            ->get();

        foreach ($deposits as $deposit) {
            if ($remainingToApply <= 0) {
                break;
            }

            $amount = min($remainingToApply, (float) $deposit->remaining_amount);
            CustomerDepositAllocation::query()->create([
                'customer_deposit_id' => $deposit->id,
                'sales_invoice_id' => $invoice->id,
                'allocation_date' => $invoice->invoice_date,
                'allocated_amount' => $amount,
                'journal_entry_id' => $journal->id,
                'status' => 'posted',
                'created_by' => auth()->id(),
            ]);

            $deposit->allocated_amount = (float) $deposit->allocated_amount + $amount;
            $deposit->remaining_amount = (float) $deposit->remaining_amount - $amount;
            $deposit->status = $deposit->remaining_amount <= 0 ? 'fully_allocated' : 'partially_allocated';
            $deposit->save();
            $remainingToApply -= $amount;
        }

        if ($remainingToApply > 0.0001) {
            throw ApiException::make('CUSTOMER_DEPOSIT_INSUFFICIENT', 'Available customer deposit is insufficient.', 422);
        }

        return $journal;
    }

    private function createInvoiceJournal(SalesInvoice $invoice): JournalEntry
    {
        $ar = $this->requiredMapping('sales.accounts_receivable');
        $revenue = $this->requiredMapping('sales.revenue');
        $tax = (float) $invoice->tax_total > 0 ? $this->requiredMapping('sales.tax_output') : null;

        $journal = $this->createJournal($invoice, 'Sales invoice '.$invoice->invoice_number);
        $lines = [
            ['account_id' => $ar, 'description' => 'Accounts Receivable', 'debit' => $invoice->grand_total, 'credit' => 0, 'line_order' => 1],
            ['account_id' => $revenue, 'description' => 'Sales Revenue', 'debit' => 0, 'credit' => $invoice->subtotal_after_discount, 'line_order' => 2],
        ];
        if ($tax && (float) $invoice->tax_total > 0) {
            $lines[] = ['account_id' => $tax, 'description' => 'Output Tax', 'debit' => 0, 'credit' => $invoice->tax_total, 'line_order' => 3];
        }
        $journal->lines()->createMany($lines);

        return $journal->refresh();
    }

    private function createDepositAllocationJournal(SalesInvoice $invoice, float $amount): JournalEntry
    {
        $deposit = $this->requiredMapping('sales.customer_deposit');
        $ar = $this->requiredMapping('sales.accounts_receivable');
        $journal = $this->createJournal($invoice, 'Apply customer deposit '.$invoice->invoice_number);
        $journal->lines()->createMany([
            ['account_id' => $deposit, 'description' => 'Customer Deposit', 'debit' => $amount, 'credit' => 0, 'line_order' => 1],
            ['account_id' => $ar, 'description' => 'Accounts Receivable', 'debit' => 0, 'credit' => $amount, 'line_order' => 2],
        ]);

        return $journal->refresh();
    }

    private function createJournal(SalesInvoice $invoice, string $description): JournalEntry
    {
        $company = $this->tenantContext->company();
        if (! $company) {
            throw ApiException::make('COMPANY_NOT_FOUND', 'Company context not resolved.', 422);
        }

        return JournalEntry::query()->create([
            'journal_number' => $this->documentNumberService->generate($company, DocumentType::JOURNAL_ENTRY, (string) $invoice->invoice_date),
            'journal_date' => $invoice->invoice_date,
            'description' => $description,
            'status' => 'posted',
            'revision_no' => 1,
            'source_type' => 'sales_invoice',
            'source_id' => $invoice->id,
            'source_number' => $invoice->invoice_number,
            'source_revision' => $invoice->revision_no,
            'source_module' => 'sales',
            'is_system_generated' => true,
            'is_obsolete' => false,
            'created_by' => auth()->id(),
            'posted_by' => auth()->id(),
            'posted_at' => now(),
        ]);
    }

    private function requiredMapping(string $key): int
    {
        $mapping = AccountMapping::query()->where('mapping_key', $key)->where('is_active', true)->first();
        if (! $mapping?->account_id) {
            throw ApiException::make('ACCOUNT_MAPPING_MISSING', 'Required account mapping is missing: '.$key, 422);
        }

        return (int) $mapping->account_id;
    }

    private function updateSourceProgress(SalesInvoice $invoice): void
    {
        foreach ($invoice->lines as $line) {
            if ($line->sales_order_line_id) {
                $orderLine = SalesOrderLine::query()->find($line->sales_order_line_id);
                if ($orderLine) {
                    $orderLine->invoiced_quantity = (float) $orderLine->invoiced_quantity + (float) $line->quantity;
                    $orderLine->save();
                }
            }
            if ($line->delivery_order_line_id) {
                $deliveryLine = DeliveryOrderLine::query()->find($line->delivery_order_line_id);
                if ($deliveryLine) {
                    $deliveryLine->invoiced_quantity = (float) $deliveryLine->invoiced_quantity + (float) $line->quantity;
                    $deliveryLine->save();
                }
            }
        }

        if ($invoice->proformaInvoice) {
            $invoice->proformaInvoice->status = 'converted';
            $invoice->proformaInvoice->converted_by = auth()->id();
            $invoice->proformaInvoice->converted_at = now();
            $invoice->proformaInvoice->save();
        }
    }

    private function availableDownPaymentForOrder(SalesOrder $order): float
    {
        return (float) CustomerDeposit::query()
            ->where('sales_order_id', $order->id)
            ->whereIn('status', ['posted', 'partially_allocated'])
            ->sum('remaining_amount');
    }

    private function previewGrandTotal(array $data): float
    {
        $lines = $this->normalizeLines((array) $data['lines']);
        $totals = $this->calculationService->calculateDocument($lines, $data);

        return (float) $totals['grand_total'];
    }
}
