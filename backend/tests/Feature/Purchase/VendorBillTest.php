<?php

namespace Tests\Feature\Purchase;

use App\Models\Tenant\StockMovement;
use Illuminate\Support\Facades\DB;

class VendorBillTest extends PurchaseTestCase
{
    public function test_create_bill_directly_and_post_creates_ap_journal(): void
    {
        $ctx = $this->setUpTenant();
        $this->seedPurchaseMappings();

        $bill = $this->postJson('/api/purchase/bills', $this->vendorBillPayload(), $ctx['headers'])
            ->assertStatus(201)
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.grand_total', 222)
            ->json('data');

        $this->patchJson('/api/purchase/bills/'.$bill['id'].'/post', [], $ctx['headers'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'posted');

        $this->assertSame(1, DB::connection('tenant')->table('journal_entries')->where('source_type', 'vendor_bill')->count());
        $this->assertSame(3, DB::connection('tenant')->table('journal_entry_lines')->count());
        $this->assertSame(0, StockMovement::query()->count());

        $this->patchJson('/api/purchase/bills/'.$bill['id'].'/void', ['reason' => 'Incorrect vendor bill'], $ctx['headers'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'void');
        $this->assertSame('void', DB::connection('tenant')->table('journal_entries')->where('source_type', 'vendor_bill')->value('status'));
    }

    public function test_create_bill_from_purchase_order_copies_discount(): void
    {
        $ctx = $this->setUpTenant();
        $order = $this->postJson('/api/purchase/orders', $this->purchaseOrderPayload([
            'is_taxable' => false,
            'header_discount_type' => 'percent',
            'header_discount_value' => 10,
        ]), $ctx['headers'])->assertStatus(201)->json('data');

        $this->postJson('/api/purchase/bills/from-purchase-order/'.$order['id'], [], $ctx['headers'])
            ->assertStatus(201)
            ->assertJsonPath('data.purchase_order_id', $order['id'])
            ->assertJsonPath('data.header_discount_amount', 20);
    }

    public function test_create_bill_from_goods_receipt(): void
    {
        $ctx = $this->setUpTenant();
        $order = $this->postJson('/api/purchase/orders', $this->purchaseOrderPayload(['is_taxable' => false]), $ctx['headers'])->assertStatus(201)->json('data');
        $receipt = $this->postJson('/api/purchase/goods-receipts/from-purchase-order/'.$order['id'], [], $ctx['headers'])->assertStatus(201)->json('data');

        $this->postJson('/api/purchase/bills/from-goods-receipt/'.$receipt['id'], [], $ctx['headers'])
            ->assertStatus(201)
            ->assertJsonPath('data.goods_receipt_id', $receipt['id']);
    }

    public function test_bill_applies_posted_vendor_deposit(): void
    {
        $ctx = $this->setUpTenant();
        $accounts = $this->seedPurchaseMappings();
        $order = $this->postJson('/api/purchase/orders', $this->purchaseOrderPayload([
            'is_taxable' => false,
            'has_down_payment' => true,
            'vendor_deposit' => ['deposit_date' => '2026-05-20', 'cash_bank_account_id' => $accounts['cash'], 'amount' => 50],
        ]), $ctx['headers'])->assertStatus(201)->json('data');
        $depositId = DB::connection('tenant')->table('vendor_deposits')->where('purchase_order_id', $order['id'])->value('id');
        $this->patchJson('/api/purchase/vendor-deposits/'.$depositId.'/post', [], $ctx['headers'])->assertStatus(200);
        $bill = $this->postJson('/api/purchase/bills/from-purchase-order/'.$order['id'], [], $ctx['headers'])->assertStatus(201)->json('data');

        $this->patchJson('/api/purchase/bills/'.$bill['id'].'/post', [], $ctx['headers'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'partially_paid')
            ->assertJsonPath('data.paid_amount', 50);

        $this->patchJson('/api/purchase/bills/'.$bill['id'].'/void', ['reason' => 'Remove bill allocation'], $ctx['headers'])->assertStatus(200);
        $this->assertSame('void', DB::connection('tenant')->table('vendor_deposit_allocations')->value('status'));
        $this->assertSame(50.0, (float) DB::connection('tenant')->table('vendor_deposits')->where('id', $depositId)->value('remaining_amount'));
    }

    public function test_permission_denied_for_viewer(): void
    {
        $ctx = $this->setUpTenant('viewer');
        $this->postJson('/api/purchase/bills', $this->vendorBillPayload(), $ctx['headers'])->assertStatus(403);
    }
}
