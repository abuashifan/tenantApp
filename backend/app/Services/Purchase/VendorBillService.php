<?php

namespace App\Services\Purchase;

use App\Exceptions\ApiException;
use App\Models\Tenant\AccountMapping;
use App\Models\Tenant\GoodsReceipt;
use App\Models\Tenant\GoodsReceiptLine;
use App\Models\Tenant\JournalEntry;
use App\Models\Tenant\PurchaseOrder;
use App\Models\Tenant\PurchaseOrderLine;
use App\Models\Tenant\VendorBill;
use App\Models\Tenant\VendorDeposit;
use App\Models\Tenant\VendorDepositAllocation;
use App\Models\Tenant\VendorPayment;
use App\Models\Tenant\PurchaseReturn;
use App\Services\Audit\AuditLogService;
use App\Services\DocumentNumbering\DocumentNumberService;
use App\Services\Inventory\InventoryPurchaseIntegrationService;
use App\Services\Purchase\Concerns\HandlesPurchaseDocuments;
use App\Services\Tenant\TenantContext;
use App\Services\Transactions\TransactionDateGuardService;
use App\Services\Transactions\TransactionVoidEffectService;
use App\Support\DocumentNumbering\DocumentType;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class VendorBillService
{
    use HandlesPurchaseDocuments;

    public function __construct(
        private readonly TenantContext $tenantContext,
        private readonly DocumentNumberService $documentNumberService,
        private readonly PurchaseCalculationService $calculationService,
        private readonly TransactionDateGuardService $dateGuardService,
        private readonly VendorDepositService $depositService,
        private readonly InventoryPurchaseIntegrationService $inventoryIntegration,
        private readonly TransactionVoidEffectService $voidEffectService,
        private readonly ?AuditLogService $auditLogService = null,
    ) {
    }

    public function list(array $filters = []): Collection
    {
        $query = VendorBill::query()->with('vendor');
        if (! empty($filters['status'])) $query->where('status', (string) $filters['status']);
        if (! empty($filters['vendor_id'])) $query->where('vendor_id', (int) $filters['vendor_id']);
        return $query->orderByDesc('bill_date')->orderByDesc('id')->get();
    }

    public function find(int $id): VendorBill
    {
        return VendorBill::query()->with('lines.product', 'vendor', 'purchaseOrder', 'goodsReceipt')->findOrFail($id);
    }

    public function create(array $data): VendorBill
    {
        $company = $this->tenantContext->company();
        if (! $company) throw ApiException::make('COMPANY_NOT_FOUND', 'Company context not resolved.', 422);
        $this->ensureVendorExists((int) $data['vendor_id']);

        return DB::connection('tenant')->transaction(function () use ($company, $data) {
            $lines = $this->normalizePurchaseLines((array) $data['lines'], fn (array $line): array => [
                'purchase_order_line_id' => $line['purchase_order_line_id'] ?? null,
                'goods_receipt_line_id' => $line['goods_receipt_line_id'] ?? null,
            ]);
            $totals = $this->calculationService->calculateDocument($lines, $data);
            $headerTotals = $totals; unset($headerTotals['lines']);
            $appliedDeposit = min((float) ($data['applied_vendor_deposit_amount'] ?? 0), (float) $headerTotals['grand_total']);

            $bill = VendorBill::query()->create(array_merge($this->guardedPurchaseHeader($data), $headerTotals, [
                'bill_number' => $this->documentNumberService->generate($company, DocumentType::VENDOR_BILL, (string) $data['bill_date']),
                'status' => 'draft',
                'applied_vendor_deposit_amount' => $appliedDeposit,
                'paid_amount' => 0,
                'balance_due' => (float) $headerTotals['grand_total'],
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]));
            $bill->lines()->createMany($totals['lines']);
            $bill = $bill->refresh()->load('lines', 'vendor');
            $this->auditPurchase($this->auditLogService, 'vendor_bill.created', $bill, 'bill_number');
            return $bill;
        });
    }

    public function update(VendorBill $bill, array $data): VendorBill
    {
        if ($bill->status !== 'draft') throw ApiException::make('VENDOR_BILL_NOT_EDITABLE', 'Vendor bill status is not editable.', 422);
        return DB::connection('tenant')->transaction(function () use ($bill, $data) {
            $lines = $this->normalizePurchaseLines((array) ($data['lines'] ?? $bill->lines()->get()->toArray()), fn (array $line): array => [
                'purchase_order_line_id' => $line['purchase_order_line_id'] ?? null,
                'goods_receipt_line_id' => $line['goods_receipt_line_id'] ?? null,
            ]);
            $totals = $this->calculationService->calculateDocument($lines, array_merge($bill->toArray(), $data));
            $headerTotals = $totals; unset($headerTotals['lines']);
            $appliedDeposit = min((float) ($data['applied_vendor_deposit_amount'] ?? $bill->applied_vendor_deposit_amount), (float) $headerTotals['grand_total']);
            $bill->fill(array_merge($this->guardedPurchaseHeader($data), $headerTotals, [
                'applied_vendor_deposit_amount' => $appliedDeposit,
                'balance_due' => (float) $headerTotals['grand_total'],
                'updated_by' => auth()->id(),
                'revision_no' => (int) $bill->revision_no + 1,
            ]))->save();
            $bill->lines()->delete();
            $bill->lines()->createMany($totals['lines']);
            $bill = $bill->refresh()->load('lines', 'vendor');
            $this->auditPurchase($this->auditLogService, 'vendor_bill.updated', $bill, 'bill_number');
            return $bill;
        });
    }

    public function createFromPurchaseOrder(PurchaseOrder $order, array $overrides = []): VendorBill
    {
        $order->loadMissing('lines');
        $data = array_merge([
            'bill_date' => now()->toDateString(),
            'vendor_id' => $order->vendor_id,
            'purchase_order_id' => $order->id,
            'buyer_id' => $order->buyer_id,
            'currency_code' => $order->currency_code,
            'exchange_rate' => $order->exchange_rate,
            'is_taxable' => $order->is_taxable,
            'tax_included' => $order->tax_included,
            'header_discount_type' => $order->header_discount_type,
            'header_discount_value' => $order->header_discount_value,
            'source_type' => 'purchase_order',
            'source_id' => $order->id,
            'source_number' => $order->order_number,
            'source_revision' => $order->revision_no,
            'lines' => $order->lines->map(fn ($line) => array_merge($line->only(['product_id','product_code','description','quantity','unit_id','unit_price','discount_type','discount_value','tax_id','tax_rate','warehouse_id','department_id','project_id','expense_account_id','sort_order','metadata']), [
                'purchase_order_line_id' => $line->id,
                'source_line_type' => 'purchase_order_line',
                'source_line_id' => $line->id,
            ]))->toArray(),
        ], $overrides);

        if (! array_key_exists('applied_vendor_deposit_amount', $data)) {
            $data['applied_vendor_deposit_amount'] = min($this->depositService->calculateAvailableForPurchaseOrder($order), $this->previewGrandTotal($data));
        }

        return $this->create($data);
    }

    public function createFromGoodsReceipt(GoodsReceipt $goodsReceipt, array $overrides = []): VendorBill
    {
        $goodsReceipt->loadMissing('lines');
        return $this->create(array_merge([
            'bill_date' => now()->toDateString(),
            'vendor_id' => $goodsReceipt->vendor_id,
            'purchase_order_id' => $goodsReceipt->purchase_order_id,
            'goods_receipt_id' => $goodsReceipt->id,
            'source_type' => 'goods_receipt',
            'source_id' => $goodsReceipt->id,
            'source_number' => $goodsReceipt->receipt_number,
            'source_revision' => $goodsReceipt->revision_no,
            'lines' => $goodsReceipt->lines->map(function ($line) {
                $orderLine = $line->purchase_order_line_id ? PurchaseOrderLine::query()->find($line->purchase_order_line_id) : null;
                return [
                    'purchase_order_line_id' => $line->purchase_order_line_id,
                    'goods_receipt_line_id' => $line->id,
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
                    'expense_account_id' => $line->expense_account_id,
                    'source_line_type' => 'goods_receipt_line',
                    'source_line_id' => $line->id,
                    'sort_order' => $line->sort_order,
                ];
            })->toArray(),
        ], $overrides));
    }

    public function approve(VendorBill $bill): VendorBill
    {
        if ($bill->status !== 'draft') throw ApiException::make('INVALID_VENDOR_BILL_STATUS', 'Invalid vendor bill status transition.', 422);
        $bill->status = 'approved'; $bill->approved_by = auth()->id(); $bill->approved_at = now(); $bill->save();
        return $bill->refresh()->load('lines', 'vendor');
    }

    public function post(VendorBill $bill, ?float $appliedVendorDepositAmount = null): VendorBill
    {
        if (! in_array($bill->status, ['draft', 'approved'], true)) throw ApiException::make('INVALID_VENDOR_BILL_STATUS', 'Vendor bill cannot be posted from current status.', 422);
        $this->guardDate((string) $bill->bill_date);

        return DB::connection('tenant')->transaction(function () use ($bill, $appliedVendorDepositAmount) {
            $bill->load('lines');
            if ($appliedVendorDepositAmount !== null) $bill->applied_vendor_deposit_amount = min($appliedVendorDepositAmount, (float) $bill->grand_total);
            $journal = $this->createBillJournal($bill);
            $bill->journal_entry_id = $journal->id;
            $bill->paid_amount = 0;
            $bill->balance_due = (float) $bill->grand_total;
            $bill->status = 'posted';
            $bill->posted_by = auth()->id();
            $bill->posted_at = now();
            $bill->save();
            $this->updateSourceProgress($bill);

            $this->inventoryIntegration->createPurchaseInFromVendorBill($bill);

            if ((float) $bill->applied_vendor_deposit_amount > 0) {
                $this->applyAvailableVendorDeposit($bill);
            }

            $bill = $bill->refresh()->load('lines', 'vendor');
            $this->auditPurchase($this->auditLogService, 'vendor_bill.posted', $bill, 'bill_number');
            return $bill;
        });
    }

    public function void(VendorBill $bill, ?string $reason = null): VendorBill
    {
        if ($bill->status === 'void') throw ApiException::make('VENDOR_BILL_ALREADY_VOID', 'Vendor bill already void.', 422);
        $reason = $this->voidEffectService->requireReason($reason);
        $this->guardDate((string) $bill->bill_date, 'void');
        if (VendorPayment::query()->where('vendor_bill_id', $bill->id)->where('status', 'posted')->exists()) {
            throw ApiException::make('VENDOR_BILL_HAS_PAYMENT', 'Void posted vendor payments before voiding this bill.', 422);
        }
        if (PurchaseReturn::query()->where('vendor_bill_id', $bill->id)->where('status', 'posted')->exists()) {
            throw ApiException::make('VENDOR_BILL_HAS_RETURN', 'Void posted purchase returns before voiding this bill.', 422);
        }
        return DB::connection('tenant')->transaction(function () use ($bill, $reason) {
            $bill->load('lines');
            $journalIds = $this->voidEffectService->voidJournalsForSource('vendor_bill', (int) $bill->id, $reason);
            $movementIds = $this->voidEffectService->voidStockMovementsForSource('vendor_bill', (int) $bill->id, $reason);
            $allocations = VendorDepositAllocation::query()->where('vendor_bill_id', $bill->id)->where('status', 'posted')->get();
            foreach ($allocations as $allocation) {
                $deposit = VendorDeposit::query()->lockForUpdate()->find($allocation->vendor_deposit_id);
                if ($deposit) {
                    $deposit->allocated_amount = max(0, (float) $deposit->allocated_amount - (float) $allocation->allocated_amount);
                    $deposit->remaining_amount = (float) $deposit->remaining_amount + (float) $allocation->allocated_amount;
                    $deposit->status = 'posted';
                    $deposit->save();
                }
                $this->voidEffectService->voidJournalById((int) $allocation->journal_entry_id, $reason);
                $allocation->status = 'void'; $allocation->voided_by = auth()->id(); $allocation->voided_at = now(); $allocation->void_reason = $reason; $allocation->save();
            }
            foreach ($bill->lines as $line) {
                if ($line->purchase_order_line_id && ($orderLine = PurchaseOrderLine::query()->lockForUpdate()->find($line->purchase_order_line_id))) {
                    $orderLine->billed_quantity = max(0, (float) $orderLine->billed_quantity - (float) $line->quantity);
                    $orderLine->save();
                }
                if ($line->goods_receipt_line_id && ($receiptLine = GoodsReceiptLine::query()->lockForUpdate()->find($line->goods_receipt_line_id))) {
                    $receiptLine->billed_quantity = max(0, (float) $receiptLine->billed_quantity - (float) $line->quantity);
                    $receiptLine->save();
                }
            }
            $bill->status = 'void'; $bill->voided_by = auth()->id(); $bill->voided_at = now(); $bill->void_reason = $reason; $bill->save();
            $this->auditPurchase($this->auditLogService, 'vendor_bill.voided', $bill, 'bill_number', ['reason' => $reason, 'voided_journal_ids' => $journalIds, 'reversed_stock_movement_ids' => $movementIds, 'voided_allocation_ids' => $allocations->pluck('id')->all()]);
            return $bill->refresh()->load('lines', 'vendor');
        });
    }

    public function applyAvailableVendorDeposit(VendorBill $bill): VendorBill
    {
        if (! $bill->purchase_order_id || (float) $bill->applied_vendor_deposit_amount <= 0) return $bill;
        $remaining = (float) $bill->applied_vendor_deposit_amount;
        $deposits = VendorDeposit::query()->where('purchase_order_id', $bill->purchase_order_id)->whereIn('status', ['posted', 'partially_allocated'])->where('remaining_amount', '>', 0)->orderBy('deposit_date')->get();
        foreach ($deposits as $deposit) {
            if ($remaining <= 0) break;
            $amount = min($remaining, (float) $deposit->remaining_amount, (float) $bill->balance_due);
            $this->depositService->allocateToBill($deposit, $bill->refresh(), $amount);
            $remaining -= $amount;
        }
        if ($remaining > 0.0001) throw ApiException::make('VENDOR_DEPOSIT_INSUFFICIENT', 'Available vendor deposit is insufficient.', 422);
        return $bill->refresh();
    }

    private function createBillJournal(VendorBill $bill): JournalEntry
    {
        $journal = $this->createJournal($bill, 'Vendor bill '.$bill->bill_number);
        $expenseAccount = $this->requiredMapping('purchase.expense');
        $ap = $this->requiredMapping('purchase.accounts_payable');
        $lines = [
            ['account_id' => $expenseAccount, 'description' => 'Purchase Expense', 'debit' => $bill->subtotal_after_discount, 'credit' => 0, 'line_order' => 1],
        ];
        if ((float) $bill->tax_total > 0) {
            $lines[] = ['account_id' => $this->requiredMapping('purchase.tax_input'), 'description' => 'Input Tax', 'debit' => $bill->tax_total, 'credit' => 0, 'line_order' => 2];
        }
        $lines[] = ['account_id' => $ap, 'description' => 'Accounts Payable', 'debit' => 0, 'credit' => $bill->grand_total, 'line_order' => 3];
        $journal->lines()->createMany($lines);
        return $journal->refresh();
    }

    private function createJournal(VendorBill $bill, string $description): JournalEntry
    {
        $company = $this->tenantContext->company();
        if (! $company) throw ApiException::make('COMPANY_NOT_FOUND', 'Company context not resolved.', 422);
        return JournalEntry::query()->create([
            'journal_number' => $this->documentNumberService->generate($company, DocumentType::JOURNAL_ENTRY, (string) $bill->bill_date),
            'journal_date' => $bill->bill_date,
            'description' => $description,
            'status' => 'posted',
            'revision_no' => 1,
            'source_type' => 'vendor_bill',
            'source_id' => $bill->id,
            'source_number' => $bill->bill_number,
            'source_revision' => $bill->revision_no,
            'source_module' => 'purchase',
            'is_system_generated' => true,
            'created_by' => auth()->id(),
            'posted_by' => auth()->id(),
            'posted_at' => now(),
        ]);
    }

    private function updateSourceProgress(VendorBill $bill): void
    {
        foreach ($bill->lines as $line) {
            if ($line->purchase_order_line_id && ($orderLine = PurchaseOrderLine::query()->find($line->purchase_order_line_id))) {
                $orderLine->billed_quantity = (float) $orderLine->billed_quantity + (float) $line->quantity;
                $orderLine->save();
            }
            if ($line->goods_receipt_line_id && ($receiptLine = GoodsReceiptLine::query()->find($line->goods_receipt_line_id))) {
                $receiptLine->billed_quantity = (float) $receiptLine->billed_quantity + (float) $line->quantity;
                $receiptLine->save();
            }
        }
    }

    private function requiredMapping(string $key): int
    {
        $mapping = AccountMapping::query()->where('mapping_key', $key)->where('is_active', true)->first();
        if (! $mapping?->account_id) throw ApiException::make('ACCOUNT_MAPPING_MISSING', 'Required account mapping is missing: '.$key, 422);
        return (int) $mapping->account_id;
    }

    private function guardDate(string $date, string $action = 'post'): void
    {
        $check = $this->dateGuardService->check($date, $action, 'purchase');
        if ($check->denied()) {
            $arr = $check->toArray();
            throw ApiException::make((string) $arr['code'], (string) $arr['message'], 422, (array) $arr['reasons'], (array) $arr['meta']);
        }
    }

    private function previewGrandTotal(array $data): float
    {
        $lines = $this->normalizePurchaseLines((array) $data['lines']);
        return (float) $this->calculationService->calculateDocument($lines, $data)['grand_total'];
    }
}
