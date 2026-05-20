# Phase 5 — Master Data Akuntansi

Phase 5 mulai membuat **tabel bisnis nyata** di **tenant database** (1 company = 1 tenant DB) untuk master data akuntansi. Phase ini belum membuat transaksi (journal/sales/purchase/cash/inventory movement), GL, Trial Balance, atau laporan keuangan.

## Tujuan

Menyiapkan master data agar phase berikutnya (Journal Entry Engine, Sales, Purchase, Cash Bank, Inventory, GL) punya data dasar yang valid:
- Chart of Accounts (COA)
- Contacts
- Units
- Product Categories
- Products
- Warehouses
- Account Mappings (implementasi awal setelah COA tersedia)

## Tenant Database Tables

Migrations ada di `backend/database/migrations/tenant`:
- `chart_of_accounts`
- `contacts`
- `units`
- `product_categories`
- `products`
- `warehouses`
- `account_mappings`

Catatan:
- Master data **tidak** disimpan di central DB.
- Delete hard tidak dipakai di Phase 5 → pakai `deactivate` agar histori tetap konsisten.

## Chart of Accounts (COA)

Tabel: `chart_of_accounts`
- `account_type`: `asset|liability|equity|revenue|expense`
- `normal_balance`: `debit|credit` (auto-default berdasarkan account_type jika tidak dikirim)
- `is_cash_bank`: hanya boleh `true` jika `account_type = asset`
- Parent/child sederhana via `parent_account_id`

## Contacts

Tabel: `contacts`
- Satu contact bisa `customer` dan `supplier` sekaligus (`is_customer`, `is_supplier`).
- Inactive tidak muncul untuk transaksi baru (future), tetapi tetap valid untuk histori.

## Units / Products / Warehouses

- Units: `code` unique, `precision` untuk quantity.
- Products: `product_type = goods|service|non_inventory`
  - `is_stock_item = true` wajib punya `unit_id`
  - `service` tidak boleh stock item
- Warehouses: support `is_default` (service memastikan hanya satu default).

## Account Mappings (Tenant)

Tabel: `account_mappings`
- `mapping_key` mengikuti config Phase 4M (`backend/config/account_mappings.php`)
- `account_id` menunjuk `chart_of_accounts` tenant
- Required mapping harus lengkap sebelum module terkait bisa post (enforcement penuh ada di phase transaksi).

## API Endpoints

Semua endpoint Phase 5 wajib:
- `auth:sanctum`
- `company.access` (header `X-Company-ID`)
- permission granular via middleware `permission:*`

Prefix: `/api/master-data`

Chart of Accounts:
- `GET /chart-of-accounts` (`coa.view`)
- `POST /chart-of-accounts` (`coa.create`)
- `GET /chart-of-accounts/{id}` (`coa.view`)
- `PATCH /chart-of-accounts/{id}` (`coa.edit`)
- `PATCH /chart-of-accounts/{id}/deactivate` (`coa.deactivate`)
- `PATCH /chart-of-accounts/{id}/activate` (`coa.edit`)

Contacts:
- `GET /contacts` (`contacts.view`)
- `POST /contacts` (`contacts.create`)
- `GET /contacts/{id}` (`contacts.view`)
- `PATCH /contacts/{id}` (`contacts.edit`)
- `PATCH /contacts/{id}/deactivate` (`contacts.deactivate`)
- `PATCH /contacts/{id}/activate` (`contacts.edit`)

Units:
- `GET /units` (`units.view`)
- `POST /units` (`units.create`)
- `GET /units/{id}` (`units.view`)
- `PATCH /units/{id}` (`units.edit`)
- `PATCH /units/{id}/deactivate` (`units.deactivate`)
- `PATCH /units/{id}/activate` (`units.edit`)

Product Categories:
- `GET /product-categories` (`products.view`)
- `POST /product-categories` (`products.create`)
- `GET /product-categories/{id}` (`products.view`)
- `PATCH /product-categories/{id}` (`products.edit`)
- `PATCH /product-categories/{id}/deactivate` (`products.deactivate`)
- `PATCH /product-categories/{id}/activate` (`products.edit`)

Products:
- `GET /products` (`products.view`)
- `POST /products` (`products.create`)
- `GET /products/{id}` (`products.view`)
- `PATCH /products/{id}` (`products.edit`)
- `PATCH /products/{id}/deactivate` (`products.deactivate`)
- `PATCH /products/{id}/activate` (`products.edit`)

Warehouses:
- `GET /warehouses` (`warehouses.view`)
- `POST /warehouses` (`warehouses.create`)
- `GET /warehouses/{id}` (`warehouses.view`)
- `PATCH /warehouses/{id}` (`warehouses.edit`)
- `PATCH /warehouses/{id}/deactivate` (`warehouses.deactivate`)
- `PATCH /warehouses/{id}/activate` (`warehouses.edit`)

Account Mappings:
- `GET /account-mappings` (`settings.company.view`)
- `PATCH /account-mappings/{mappingKey}` (`settings.company.edit`)

## Batasan Scope

Phase 5 tidak membuat:
- journal engine (`journal_entries`, `journal_entry_lines`)
- sales/purchase/cash bank/inventory transactions
- GL / Trial Balance / Financial statements
- opening balance UI (opening balance tetap lewat opening journal di phase journal engine)

## Commands

Tenant migrations:
- `cd backend`
- `php artisan tenant:migrate --company-id=<company_id>`

Testing:
- `cd backend`
- `php artisan test --filter=ChartOfAccountTest`
- `php artisan test --filter=ContactTest`
- `php artisan test --filter=UnitTest`
- `php artisan test --filter=ProductTest`
- `php artisan test --filter=WarehouseTest`
- `php artisan test --filter=AccountMappingTest`

