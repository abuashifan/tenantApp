<?php

namespace App\Services\MasterData;

use App\Exceptions\ApiException;
use App\Models\Tenant\ChartOfAccount;
use App\Models\Tenant\Product;
use App\Models\Tenant\ProductCategory;
use App\Models\Tenant\Unit;

class ProductService
{
    public function list(array $filters = [])
    {
        $query = Product::query();

        if (array_key_exists('is_active', $filters)) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        if (! empty($filters['product_type'])) {
            $query->where('product_type', (string) $filters['product_type']);
        }

        return $query->orderBy('product_name')->get();
    }

    public function create(array $data): Product
    {
        $this->validateBusinessRules($data);

        if (! empty($data['product_code']) && Product::query()->where('product_code', (string) $data['product_code'])->exists()) {
            throw ApiException::make('DUPLICATE_PRODUCT_CODE', 'product_code already exists.', 422);
        }

        $this->validateRelations($data);

        return Product::query()->create($data);
    }

    public function update(Product $product, array $data): Product
    {
        $merged = array_merge($product->toArray(), $data);
        $this->validateBusinessRules($merged);

        if (! empty($data['product_code']) && $data['product_code'] !== $product->product_code) {
            if (Product::query()->where('product_code', (string) $data['product_code'])->exists()) {
                throw ApiException::make('DUPLICATE_PRODUCT_CODE', 'product_code already exists.', 422);
            }
        }

        $this->validateRelations($data);

        $product->fill($data);
        $product->save();

        return $product->refresh();
    }

    public function deactivate(Product $product): Product
    {
        $product->is_active = false;
        $product->save();

        return $product->refresh();
    }

    public function activate(Product $product): Product
    {
        $product->is_active = true;
        $product->save();

        return $product->refresh();
    }

    private function validateBusinessRules(array $data): void
    {
        $isStockItem = (bool) ($data['is_stock_item'] ?? false);
        $unitId = $data['unit_id'] ?? null;

        if ($isStockItem && empty($unitId)) {
            throw ApiException::make('UNIT_REQUIRED_FOR_STOCK_ITEM', 'unit_id is required for stock items.', 422);
        }

        $productType = (string) ($data['product_type'] ?? 'goods');
        if ($productType === 'service' && $isStockItem) {
            throw ApiException::make('SERVICE_CANNOT_BE_STOCK_ITEM', 'Service product cannot be stock item.', 422);
        }
    }

    private function validateRelations(array $data): void
    {
        if (array_key_exists('product_category_id', $data) && $data['product_category_id'] !== null) {
            if (! ProductCategory::query()->whereKey((int) $data['product_category_id'])->exists()) {
                throw ApiException::make('PRODUCT_CATEGORY_NOT_FOUND', 'Product category not found.', 422);
            }
        }

        if (array_key_exists('unit_id', $data) && $data['unit_id'] !== null) {
            if (! Unit::query()->whereKey((int) $data['unit_id'])->exists()) {
                throw ApiException::make('UNIT_NOT_FOUND', 'Unit not found.', 422);
            }
        }

        foreach (['sales_account_id', 'purchase_account_id', 'inventory_account_id', 'cogs_account_id'] as $key) {
            if (array_key_exists($key, $data) && $data[$key] !== null) {
                if (! ChartOfAccount::query()->whereKey((int) $data[$key])->exists()) {
                    throw ApiException::make('ACCOUNT_NOT_FOUND', $key.' not found.', 422);
                }
            }
        }
    }
}

