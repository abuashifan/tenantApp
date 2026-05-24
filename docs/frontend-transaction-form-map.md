# Frontend Transaction Form Map

## Source

Source of truth: `docs/frontend-endpoint-workspace-map.md`, cross-checked with `backend/routes/api.php`.

Forms are rendered by a shared configurable component:

- `frontend-vue/src/features/workspace/backend-resource/BackendResourceForm.vue`
- `frontend-vue/src/features/workspace/backend-resource/backendResource.form.config.ts`
- `frontend-vue/src/features/workspace/backend-resource/backendResourceForm.service.ts`

Create/edit/detail forms open inside secondary virtual tabs. No public backend endpoint or new backend business logic was added.

## Covered Forms

| Module | Endpoint | Form Support | Actions Wired | Permission Basis | Status |
| --- | --- | --- | --- | --- | --- |
| Journal Entries | `/journals` | create, edit, detail | approve, post, void | `journal.*` | Implemented |
| Chart of Accounts | `/master-data/chart-of-accounts` | create, edit | activate/deactivate remain in list/workflow | `coa.*` | Existing dedicated form |
| Contacts | `/master-data/contacts` | create, edit, detail | none | `contacts.*` | Implemented |
| Units | `/master-data/units` | create, edit, detail | none | `units.*` | Implemented |
| Product Categories | `/master-data/product-categories` | create, edit, detail | none | `products.*` | Implemented |
| Products | `/master-data/products` | create, edit, detail | none | `products.*` | Implemented |
| Warehouses | `/master-data/warehouses` | create, edit, detail | none | `warehouses.*` | Implemented |
| Departments | `/master-data/departments` | create, edit, detail | none | `departments.*` | Implemented |
| Projects | `/master-data/projects` | create, edit, detail | none | `projects.*` | Implemented |
| Account Mappings | `/master-data/account-mappings` | edit, detail | none | `settings.company.edit` | Implemented |
| Sales Quotations | `/sales/quotations` | create, edit, detail | send, approve, accept, reject, cancel | `sales.quotations.*` | Implemented |
| Sales Orders | `/sales/orders` | create, edit, detail | approve, confirm, cancel, close | `sales.orders.*` | Implemented |
| Delivery Orders | `/sales/delivery-orders` | create, edit, detail | ready, ship, deliver, cancel, void | `sales.delivery_orders.*` | Implemented |
| Proforma Invoices | `/sales/proformas` | create, edit, detail | issue, accept, cancel | `sales.proformas.*` | Implemented |
| Sales Invoices | `/sales/invoices` | create, edit, detail | approve, post, void | `sales.invoices.*` | Implemented |
| Billing Invoices | `/sales/billings` | create, detail | issue, cancel | `sales.billings.*` | Implemented |
| Customer Deposits | `/sales/customer-deposits` | create, detail | post, void, refund | `sales.deposits.*` | Implemented |
| Sales Receipts | `/sales/receipts` | create, detail | post, void | `sales.receipts.*` | Implemented |
| Sales Returns | `/sales/returns` | create, edit, detail | approve, post, void | `sales.returns.*` | Implemented |
| Purchase Requests | `/purchase/requests` | create, edit, detail | submit, approve, reject, cancel | `purchase.requests.*` | Implemented |
| Purchase Orders | `/purchase/orders` | create, edit, detail | approve, confirm, cancel, close | `purchase.orders.*` | Implemented |
| Goods Receipts | `/purchase/goods-receipts` | create, edit, detail | receive, cancel, void | `purchase.goods_receipts.*` | Implemented |
| Vendor Bills | `/purchase/bills` | create, edit, detail | approve, post, void | `purchase.bills.*` | Implemented |
| Vendor Deposits | `/purchase/vendor-deposits` | create, detail | post, void, refund | `purchase.deposits.*` | Implemented |
| Vendor Payments | `/purchase/payments` | create, detail | post, void | `purchase.payments.*` | Implemented |
| Purchase Returns | `/purchase/returns` | create, edit, detail | approve, post, void | `purchase.returns.*` | Implemented |
| Cash Receipts | `/cash-bank/cash-receipts` | create, detail | post, void | `cash_bank.*` | Implemented |
| Cash Payments | `/cash-bank/cash-payments` | create, detail | post, void | `cash_bank.*` | Implemented |
| Bank Transfers | `/cash-bank/bank-transfers` | create, detail | post, void | `cash_bank.*` | Implemented |
| Bank Reconciliations | `/cash-bank/bank-reconciliations` | create, edit, detail | refresh lines | `cash_bank.*` | Implemented |
| Stock Movements | `/inventory/stock-movements` | create, detail | post, void | `inventory.movements.*` | Implemented |
| Stock Adjustments | `/inventory/stock-adjustments` | create, edit, detail | approve, post, void | `inventory.adjustments.*` | Implemented |
| Stock Opname | `/inventory/stock-opnames` | create, edit, detail | generate lines, counted, finalize, void | `inventory.opname.*` | Implemented |

## Skipped

| Endpoint | Reason |
| --- | --- |
| `/inventory/stock-balances` | List/report-only endpoint; no create/update stock balance endpoint exists. |
| `/cash-bank/accounts` | List-only cash/bank account endpoint; managed through Chart of Accounts/account mapping. |
| Reports, AR/AP aging, valuation, stock-card endpoints | Report or drill-down endpoints only; no input form required. |
| Conversion endpoints such as `from-quotation` or `from-goods-receipt` | Exposed as workflow actions later; the form layer does not invent conversion UI. |

## Behavior

- Create opens a secondary tab labelled `Data Baru` or the configured create label.
- Edit/detail tabs are deduplicated by entity id through `workspaceTabsStore`.
- Draft values are persisted in `draftStateBySecondaryTabId`.
- Dirty state is updated through `setSecondaryDirty`.
- Laravel 422 messages are shown in `FormValidationSummary` and mapped to field errors.
- Action buttons are hidden when the current user lacks the required permission.
- Posted, voided, cancelled, closed and finalized documents render read-only.
