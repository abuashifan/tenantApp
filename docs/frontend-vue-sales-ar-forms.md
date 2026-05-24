# frontend-vue Sales & AR Forms

Sales & AR submenus are split into:

- **Input forms (transaction pages)**: implemented via `TransactionWorkspacePage`
- **Read-only/report pages**: currently use `BackendResourceWorkspaceContent` until dedicated report UI is built

## Implemented input forms

- Sales Quotations: `frontend-vue/src/pages/sales/SalesQuotationFormPage.vue`
- Sales Orders: `frontend-vue/src/pages/sales/SalesOrderFormPage.vue`
- Delivery Orders: `frontend-vue/src/pages/sales/DeliveryOrderFormPage.vue`
- Proforma Invoices: `frontend-vue/src/pages/sales/ProformaInvoiceFormPage.vue`
- Sales Invoices: `frontend-vue/src/pages/sales/SalesInvoiceFormPage.vue`
- Billing Invoices: `frontend-vue/src/pages/sales/BillingInvoiceFormPage.vue`
- Customer Deposits: `frontend-vue/src/pages/sales/CustomerDepositFormPage.vue`
- Sales Receipts: `frontend-vue/src/pages/sales/SalesReceiptFormPage.vue`
- Sales Returns: `frontend-vue/src/pages/sales/SalesReturnFormPage.vue`

Form configs:
- `frontend-vue/src/features/sales/forms/*`

## Read-only / reports

- Customer Summary: `frontend-vue/src/pages/sales/CustomerSummaryPage.vue`
- Open Invoices: `frontend-vue/src/pages/sales/OpenInvoicesPage.vue`
- AR Aging: `frontend-vue/src/pages/sales/ArAgingPage.vue`
- AR Reconciliation: `frontend-vue/src/pages/sales/ArReconciliationPage.vue`

## Notes / limitations (current)

- Source-document creation flows (e.g., Invoice from Sales Order/Delivery Order) are scaffolded via `sourceOptions` in configs but not yet wired end-to-end in UI.
- Billing Invoice line structure (`amount`) is not yet rendered with a dedicated line table.

