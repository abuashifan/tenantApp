# frontend-vue Purchase & AP Forms

Purchase & AP submenus are split into:

- **Input forms (transaction pages)**: implemented via `TransactionWorkspacePage`
- **Read-only/report pages**: currently use `BackendResourceWorkspaceContent` until dedicated report UI is built

## Implemented input forms

- Purchase Requests: `frontend-vue/src/pages/purchase/PurchaseRequestFormPage.vue`
- Purchase Orders: `frontend-vue/src/pages/purchase/PurchaseOrderFormPage.vue`
- Goods Receipts: `frontend-vue/src/pages/purchase/GoodsReceiptFormPage.vue`
- Vendor Bills: `frontend-vue/src/pages/purchase/VendorBillFormPage.vue`
- Vendor Deposits: `frontend-vue/src/pages/purchase/VendorDepositFormPage.vue`
- Vendor Payments: `frontend-vue/src/pages/purchase/VendorPaymentFormPage.vue`
- Purchase Returns: `frontend-vue/src/pages/purchase/PurchaseReturnFormPage.vue`

Form configs:
- `frontend-vue/src/features/purchase/forms/*`

## Read-only / reports

- Vendor Summary: `frontend-vue/src/pages/purchase/VendorSummaryPage.vue`
- Open Bills: `frontend-vue/src/pages/purchase/OpenBillsPage.vue`
- AP Aging: `frontend-vue/src/pages/purchase/ApAgingPage.vue`
- AP Reconciliation: `frontend-vue/src/pages/purchase/ApReconciliationPage.vue`

## Notes / limitations (current)

- Source-document creation flows (Vendor Bill from PO/GR, etc.) are scaffolded via `sourceOptions` in configs but not yet wired end-to-end in UI.

