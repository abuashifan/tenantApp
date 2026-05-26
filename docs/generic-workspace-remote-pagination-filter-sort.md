# Generic Workspace Remote Pagination, Filter, and Sort

Tanggal update: 2026-05-26

## Problem From Audit

Audit point 8 menemukan generic backend workspace sudah punya plumbing untuk mengirim query params remote, tetapi `resourceCapability()` masih default `paginationMode: 'local'` dan belum ada resource yang jelas mengaktifkan remote mode.

Akibatnya beberapa workspace masih berisiko mengambil semua rows lalu filter/sort/paginate di frontend.

## Local vs Remote Mode

- `local`: endpoint dipanggil tanpa kontrak pagination. Frontend tetap memakai fallback lokal dan tidak crash jika metadata tidak ada.
- `remote`: generic workspace mengirim `page`, `per_page`, `search`, filter, dan sort params. Backend mengembalikan payload paginated hanya jika `page` atau `per_page` dikirim.

Kontrak lama tetap dipertahankan: request list tanpa `page/per_page` masih mengembalikan array biasa di `data`.

## Query Parameter Mapping

Default generic workspace mapping:

| Behavior | Query Param |
| --- | --- |
| Page | `page` |
| Per page | `per_page` |
| Search | `search` |
| Status | `status` |
| Start date | `start_date` |
| End date | `end_date` |
| Sort field | `sort_by` |
| Sort direction | `sort_direction` |

Compatibility aliases accepted by backend list response helper:

| Alias | Maps To |
| --- | --- |
| `date_from` | start date |
| `date_to` | end date |
| `sort` | sort field |
| `direction` | sort direction |

## Pagination Metadata Shape

Remote-enabled generic list responses return:

```json
{
  "success": true,
  "message": "Rows retrieved successfully",
  "data": {
    "data": [],
    "current_page": 1,
    "per_page": 10,
    "total": 0,
    "last_page": 1,
    "from": null,
    "to": null
  },
  "meta": []
}
```

`backendResource.service.ts` normalizes `current_page`, `per_page`, `total`, `last_page`, `from`, and `to` from nested or top-level metadata shapes.

## Remote-Enabled Resources

These resources are explicitly marked with `paginationMode: 'remote'`, `remoteSearch: true`, `remoteFilters: true`, and `remoteSort: true` in `backendResource.config.ts`.

| Module | Resource Key | Endpoint |
| --- | --- | --- |
| Master Data | `/master-data/contacts` | `GET /api/master-data/contacts` |
| Master Data | `/master-data/units` | `GET /api/master-data/units` |
| Master Data | `/master-data/product-categories` | `GET /api/master-data/product-categories` |
| Master Data | `/master-data/products` | `GET /api/master-data/products` |
| Master Data | `/master-data/warehouses` | `GET /api/master-data/warehouses` |
| Master Data | `/master-data/departments` | `GET /api/master-data/departments` |
| Master Data | `/master-data/projects` | `GET /api/master-data/projects` |
| Sales | `/sales/quotations` | `GET /api/sales/quotations` |
| Sales | `/sales/orders` | `GET /api/sales/orders` |
| Sales | `/sales/delivery-orders` | `GET /api/sales/delivery-orders` |
| Sales | `/sales/proformas` | `GET /api/sales/proformas` |
| Sales | `/sales/invoices` | `GET /api/sales/invoices` |
| Sales | `/sales/billings` | `GET /api/sales/billings` |
| Sales | `/sales/customer-deposits` | `GET /api/sales/customer-deposits` |
| Sales | `/sales/receipts` | `GET /api/sales/receipts` |
| Sales | `/sales/returns` | `GET /api/sales/returns` |
| Purchase | `/purchase/requests` | `GET /api/purchase/requests` |
| Purchase | `/purchase/orders` | `GET /api/purchase/orders` |
| Purchase | `/purchase/goods-receipts` | `GET /api/purchase/goods-receipts` |
| Purchase | `/purchase/bills` | `GET /api/purchase/bills` |
| Purchase | `/purchase/vendor-deposits` | `GET /api/purchase/vendor-deposits` |
| Purchase | `/purchase/payments` | `GET /api/purchase/payments` |
| Purchase | `/purchase/returns` | `GET /api/purchase/returns` |
| Cash Bank | `/cash-bank/cash-receipts` | `GET /api/cash-bank/cash-receipts` |
| Cash Bank | `/cash-bank/cash-payments` | `GET /api/cash-bank/cash-payments` |
| Cash Bank | `/cash-bank/bank-transfers` | `GET /api/cash-bank/bank-transfers` |
| Cash Bank | `/cash-bank/bank-reconciliations` | `GET /api/cash-bank/bank-reconciliations` |
| Inventory | `/inventory/stock-movements` | `GET /api/inventory/stock-movements` |
| Inventory | `/inventory/stock-adjustments` | `GET /api/inventory/stock-adjustments` |
| Inventory | `/inventory/stock-opnames` | `GET /api/inventory/stock-opnames` |

## Local-Only Resources

These remain local because they are small lookup/settings/report surfaces, custom workspaces, or response shapes are not list-table pagination candidates.

| Resource Key | Reason |
| --- | --- |
| `/master-data/account-mappings` | Small settings list; no remote pagination needed. |
| `/accounting/period-locks` | Settings/action surface, not generic paginated list. |
| `/reports/profit-loss` | Financial statement payload, not row-list endpoint. |
| `/reports/balance-sheet` | Financial statement payload, not row-list endpoint. |
| `/reports/cash-flow` | Financial statement payload, not row-list endpoint. |
| `/reports/financial-summary` | Summary payload, not row-list endpoint. |
| `/sales/ar/*` | Dedicated AR pages, not generic backend resource workspace. |
| `/purchase/ap/*` | Dedicated AP pages, not generic backend resource workspace. |
| `/cash-bank/accounts` | Lookup list used by account statement; kept array-compatible. |
| `/inventory/stock-balances` | Inventory summary/list shape remains local until dedicated backend pagination is verified. |
| `/inventory/valuation` | Valuation report shape remains local. |
| `/inventory/reports/*` | Report payload shapes remain local. |
| `/settings/company` | Dedicated settings page. |
| `/settings/account-mappings` | Small settings list. |

## Backend Compatibility

Controllers using `listResponse()` now return paginated payloads only when `page` or `per_page` is present. The helper applies safe in-memory:

- search across scalar serialized item fields,
- status matching on `status`, `state`, or `is_active`,
- date range matching common document/date columns,
- sort on serialized item keys.

Existing callers that do not send pagination params still receive the previous array payload.

## Manual QA Checklist

- [ ] Open Contacts generic workspace; confirm request includes `page=1&per_page=10`.
- [ ] Change page; confirm a new API request includes updated `page`.
- [ ] Change rows per page; confirm `per_page` changes and page resets to 1.
- [ ] Search Contacts; confirm `search` is sent and selected rows clear.
- [ ] Sort a column; confirm `sort_by` and `sort_direction` are sent.
- [ ] Apply status filter on a document workspace; confirm `status` is sent.
- [ ] Apply date filter on a document workspace; confirm `start_date` and `end_date` are sent.
- [ ] Verify pagination total uses backend `total`, not current page row count.
- [ ] Open Account Mappings; confirm local fallback still works.
- [ ] Open Profit & Loss / Balance Sheet / Cash Flow; confirm local/report flow still works.
- [ ] Open Products detail and confirm Product History remains under Products only.

## Known Limitations / Follow-up

- Backend generic `listResponse()` paginates after service-level query execution. This preserves compatibility and reduces frontend payload size, but high-volume endpoints should later move pagination/search/sort into database queries.
- `include_void` is not globally enabled in the capability map because support differs per service and report visibility policy.
- Dedicated AR/AP, dashboard, fiscal closing, cash bank account statement, company settings, and access pages keep their own service/page logic.
