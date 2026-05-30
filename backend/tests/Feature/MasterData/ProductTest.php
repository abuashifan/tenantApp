<?php

namespace Tests\Feature\MasterData;

class ProductTest extends MasterDataTestCase
{
    public function test_create_goods_with_unit_create_service_and_rules_stock_item(): void
    {
        $ctx = $this->setUpTenant();

        $unit = $this->postJson('/api/master-data/units', [
            'code' => 'PCS',
            'name' => 'Pieces',
            'precision' => 0,
        ], $ctx['headers'])->assertStatus(201)->json('data');

        $goods = $this->postJson('/api/master-data/products', [
            'product_name' => 'Product A',
            'product_type' => 'goods',
            'is_stock_item' => true,
            'unit_id' => $unit['id'],
        ], $ctx['headers'])->assertStatus(201)->json('data');

        $this->postJson('/api/master-data/products', [
            'product_name' => 'Stock Without Unit',
            'is_stock_item' => true,
        ], $ctx['headers'])->assertStatus(422);

        $this->postJson('/api/master-data/products', [
            'product_name' => 'Service Bad',
            'product_type' => 'service',
            'is_stock_item' => true,
            'unit_id' => $unit['id'],
        ], $ctx['headers'])->assertStatus(422);

        $service = $this->postJson('/api/master-data/products', [
            'product_name' => 'Service A',
            'product_type' => 'service',
            'is_stock_item' => false,
        ], $ctx['headers'])->assertStatus(201)->json('data');

        $this->patchJson('/api/master-data/products/'.$goods['id'], [
            'description' => 'Updated',
        ], $ctx['headers'])->assertStatus(200);

        $this->patchJson('/api/master-data/products/'.$service['id'].'/deactivate', [], $ctx['headers'])
            ->assertStatus(200)
            ->assertJsonPath('data.is_active', false);
    }
}
