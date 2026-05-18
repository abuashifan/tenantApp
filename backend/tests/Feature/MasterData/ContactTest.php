<?php

namespace Tests\Feature\MasterData;

class ContactTest extends MasterDataTestCase
{
    public function test_create_customer_and_supplier_and_deactivate(): void
    {
        $ctx = $this->setUpTenant();

        $customer = $this->postJson('/api/master-data/contacts', [
            'name' => 'Customer A',
            'contact_type' => 'customer',
            'is_customer' => true,
        ], $ctx['headers'])->assertStatus(201)->json('data');

        $supplier = $this->postJson('/api/master-data/contacts', [
            'name' => 'Supplier A',
            'contact_type' => 'supplier',
            'is_supplier' => true,
        ], $ctx['headers'])->assertStatus(201)->json('data');

        $both = $this->postJson('/api/master-data/contacts', [
            'name' => 'Both A',
            'is_customer' => true,
            'is_supplier' => true,
        ], $ctx['headers'])->assertStatus(201)->json('data');

        $this->patchJson('/api/master-data/contacts/'.$customer['id'], [
            'phone' => '081234',
        ], $ctx['headers'])->assertStatus(200);

        $this->patchJson('/api/master-data/contacts/'.$supplier['id'].'/deactivate', [], $ctx['headers'])
            ->assertStatus(200)
            ->assertJsonPath('data.is_active', false);
    }
}

