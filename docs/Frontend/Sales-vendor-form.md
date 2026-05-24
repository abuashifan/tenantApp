TASK TITLE:
Build Integrated Reusable Transaction Forms for Sales & AR and Purchase & AP Submenus

PROJECT:
TenantAppDevelopment

TARGET FRONTEND:
frontend-vue

STACK:

- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router
- Axios
- TailwindCSS
- TanStack Table
- VeeValidate
- Zod

BACKEND:

- Laravel API
- Sanctum Bearer token
- Multi-tenant with X-Company-ID
- Backend already provides Sales & AR and Purchase & AP endpoints from Phase 9 and Phase 10 or equivalent modules.
- Do not change backend API contracts unless absolutely required and documented.

MAIN OBJECTIVE:
Create integrated input forms for all Sales & AR and Purchase & AP transaction submenus shown in the sidebar.

The forms must be:

- integrated with backend APIs
- integrated with virtual tabs
- reusable through general form components
- flexible per document type
- not created as isolated one-off forms
- able to create documents directly
- able to create documents from source documents when supported

IMPORTANT BUSINESS RULE:
Do not create every form as a completely separate hardcoded layout.
Build a reusable transaction form system, but do not make it too rigid.

Use reusable components for:

- form shell
- document header
- customer/vendor selector
- date fields
- status banner
- source document selector
- line item table
- product selector
- quantity/price/discount/tax fields
- totals panel
- notes/internal notes
- action buttons
- attachment placeholder if needed
- validation error summary
- unsaved dirty state
- confirmation dialog
- void/cancel/post/approve actions

But allow each document form to define:

- its own fields
- its own line columns
- its own source document options
- its own lifecycle actions
- its own validation schema
- its own API service
- its own totals behavior
- its own special sections such as deposit allocation, payment allocation, delivery info, receipt info, or return reason

DO NOT:

- Do not hardcode all forms into one giant component with many if/else blocks.
- Do not create 20 unrelated forms from scratch.
- Do not use dummy data as the main source after API integration.
- Do not break virtual tabs state.
- Do not use router.push only if it causes form state loss.
- Do not implement hard delete.
- Do not create stock movement in frontend.
- Do not create COGS journal in frontend.
- Do not create fake backend endpoints.
- Do not skip any submenu from Sales & AR or Purchase & AP.
- Do not make Sales Invoice only from Sales Order; it must also support direct creation.
- Do not make Vendor Bill only from Purchase Order; it must also support direct creation.

SUBMENUS THAT MUST BE COVERED:

SALES & AR:

1. Sales Quotations
2. Sales Orders
3. Delivery Orders
4. Proforma Invoices
5. Sales Invoices
6. Billing Invoices
7. Customer Deposits
8. Sales Receipts
9. Sales Returns
10. Customer Summary
11. Open Invoices
12. AR Aging
13. AR Reconciliation

PURCHASE & AP:

1. Purchase Requests
2. Purchase Orders
3. Goods Receipts
4. Vendor Bills
5. Vendor Deposits
6. Vendor Payments
7. Purchase Returns
8. Vendor Summary
9. Open Bills
10. AP Aging
11. AP Reconciliation

CLASSIFY SUBMENUS:

A. Transaction input forms:
Sales:

- Sales Quotations
- Sales Orders
- Delivery Orders
- Proforma Invoices
- Sales Invoices
- Billing Invoices
- Customer Deposits
- Sales Receipts
- Sales Returns

Purchase:

- Purchase Requests
- Purchase Orders
- Goods Receipts
- Vendor Bills
- Vendor Deposits
- Vendor Payments
- Purchase Returns

B. Read-only / report / reconciliation pages:
Sales:

- Customer Summary
- Open Invoices
- AR Aging
- AR Reconciliation

Purchase:

- Vendor Summary
- Open Bills
- AP Aging
- AP Reconciliation

For group B, do not create transaction input form.
Create filterable read-only pages or reconciliation action pages if backend supports them.

REQUIRED FILE STRUCTURE:

Create reusable form components:

src/components/transaction-form/
├── TransactionFormShell.vue
├── TransactionFormHeader.vue
├── TransactionFormSection.vue
├── TransactionSourceSelector.vue
├── TransactionPartnerSelector.vue
├── TransactionDateFields.vue
├── TransactionStatusBanner.vue
├── TransactionLineTable.vue
├── TransactionLineEditor.vue
├── TransactionTotalsPanel.vue
├── TransactionNotesPanel.vue
├── TransactionActionBar.vue
├── TransactionValidationSummary.vue
├── TransactionConfirmDialog.vue
├── TransactionSourceInfoCard.vue
├── TransactionPaymentPanel.vue
├── TransactionDepositPanel.vue
├── TransactionDeliveryPanel.vue
├── TransactionReturnPanel.vue
└── TransactionReadonlySummary.vue

Create form configuration files:

src/features/sales/forms/
├── sales-quotation.form.ts
├── sales-order.form.ts
├── delivery-order.form.ts
├── proforma-invoice.form.ts
├── sales-invoice.form.ts
├── billing-invoice.form.ts
├── customer-deposit.form.ts
├── sales-receipt.form.ts
└── sales-return.form.ts

src/features/purchase/forms/
├── purchase-request.form.ts
├── purchase-order.form.ts
├── goods-receipt.form.ts
├── vendor-bill.form.ts
├── vendor-deposit.form.ts
├── vendor-payment.form.ts
└── purchase-return.form.ts

Create form pages:

src/pages/sales/
├── SalesQuotationFormPage.vue
├── SalesOrderFormPage.vue
├── DeliveryOrderFormPage.vue
├── ProformaInvoiceFormPage.vue
├── SalesInvoiceFormPage.vue
├── BillingInvoiceFormPage.vue
├── CustomerDepositFormPage.vue
├── SalesReceiptFormPage.vue
└── SalesReturnFormPage.vue

src/pages/purchase/
├── PurchaseRequestFormPage.vue
├── PurchaseOrderFormPage.vue
├── GoodsReceiptFormPage.vue
├── VendorBillFormPage.vue
├── VendorDepositFormPage.vue
├── VendorPaymentFormPage.vue
└── PurchaseReturnFormPage.vue

Create read-only pages:

src/pages/sales/
├── CustomerSummaryPage.vue
├── OpenInvoicesPage.vue
├── ArAgingPage.vue
└── ArReconciliationPage.vue

src/pages/purchase/
├── VendorSummaryPage.vue
├── OpenBillsPage.vue
├── ApAgingPage.vue
└── ApReconciliationPage.vue

Create composables:

src/composables/transaction-form/
├── useTransactionForm.ts
├── useTransactionSource.ts
├── useTransactionLines.ts
├── useTransactionTotals.ts
├── useTransactionValidation.ts
├── useTransactionActions.ts
├── useTransactionDraftState.ts
├── usePartnerLookup.ts
├── useProductLookup.ts
├── useDepositAllocation.ts
└── usePaymentAllocation.ts

TRANSACTION FORM CONFIG STANDARD:

Each form config must define:

type TransactionFormConfig = {
moduleKey: string;
documentType: string;
title: string;
numberField: string;
dateField: string;
partnerType: "customer" | "vendor" | "none";
partnerField: string;
apiService: TransactionApiService;
permissions: {
view: string;
create: string;
edit: string;
approve?: string;
confirm?: string;
post?: string;
void?: string;
cancel?: string;
print?: string;
};
sourceOptions: TransactionSourceOption[];
headerFields: TransactionFieldConfig[];
lineColumns: TransactionLineColumnConfig[];
sections: TransactionFormSectionConfig[];
totals: TransactionTotalsConfig;
actions: TransactionActionConfig[];
validationSchema: ZodSchema;
};

SOURCE DOCUMENT RULES:

Sales document source flow:
Sales Quotation
-> Sales Order
-> Delivery Order
-> Sales Invoice
-> Sales Receipt

Additional allowed flows:
Sales Order -> Proforma Invoice
Sales Order -> Sales Invoice
Delivery Order -> Sales Invoice
Sales Invoice -> Billing Invoice if backend supports
Sales Invoice -> Sales Receipt
Customer Deposit -> Sales Invoice allocation
Sales Invoice -> Sales Return

Direct creation must also be supported for:

- Sales Quotation
- Sales Order
- Delivery Order
- Proforma Invoice
- Sales Invoice
- Billing Invoice
- Customer Deposit
- Sales Receipt
- Sales Return

Purchase document source flow:
Purchase Request
-> Purchase Order
-> Goods Receipt
-> Vendor Bill
-> Vendor Payment

Additional allowed flows:
Purchase Order -> Vendor Bill
Goods Receipt -> Vendor Bill
Vendor Deposit -> Vendor Bill allocation
Vendor Bill -> Vendor Payment
Vendor Bill -> Purchase Return

Direct creation must also be supported for:

- Purchase Request
- Purchase Order
- Goods Receipt
- Vendor Bill
- Vendor Deposit
- Vendor Payment
- Purchase Return

CRITICAL SOURCE DOCUMENT BEHAVIOR:

Sales Invoice:
Must support:

1. Create directly without Sales Order or Delivery Order.
2. Create from Sales Order.
3. Create from Delivery Order.
4. If created from Sales Order:
   - copy customer
   - copy currency
   - copy tax settings
   - copy discount
   - copy lines
   - link source document
   - allow user to edit final invoice discount/quantity if backend allows
5. If created from Delivery Order:
   - copy customer
   - copy delivered lines
   - link delivery order
   - prevent invoicing more than remaining uninvoiced quantity if backend provides remaining quantity
6. If customer deposit exists:
   - show available deposit
   - allow deposit allocation if backend endpoint supports it
   - do not create new deposit inside Sales Invoice form

Vendor Bill:
Must support:

1. Create directly without Purchase Order or Goods Receipt.
2. Create from Purchase Order.
3. Create from Goods Receipt.
4. If created from Purchase Order:
   - copy vendor
   - copy currency
   - copy tax settings
   - copy discount
   - copy lines
   - link source document
   - allow final bill discount/quantity edit if backend allows
5. If created from Goods Receipt:
   - copy vendor
   - copy received lines
   - link goods receipt
   - prevent billing more than remaining unbilled quantity if backend provides remaining quantity
6. If vendor deposit exists:
   - show available vendor deposit
   - allow deposit allocation if backend endpoint supports it
   - do not create new vendor deposit inside Vendor Bill form

FORM BEHAVIOR:

Create mode:

- open from workspace list Create button
- open in secondary virtual tab
- default label: Data Baru
- initialize empty form
- allow direct input
- optional source document selector shown only when config has sourceOptions
- after save, update tab label to document number

Edit mode:

- open from row Edit action
- open in secondary virtual tab
- do not duplicate same edit tab
- load data from backend
- show current status
- disable fields depending on status
- posted/void/cancelled documents must not be editable unless backend allows correction/revision

Detail mode:

- open from row click/detail action
- read-only by default
- show actions if allowed by permission and status

Dirty state:

- all forms must update workspace tab dirty state
- switching primary or secondary tabs must not lose unsaved data
- closing dirty tab must ask:
  - Simpan
  - Jangan Simpan
  - Batal

Save:

- create mode calls POST endpoint
- edit mode calls PATCH/PUT endpoint based on backend route
- show Laravel 422 validation errors on fields
- after success refresh parent list
- after success clear dirty state

Action buttons:

- Approve
- Confirm
- Post
- Void
- Cancel
- Close
- Print
  Only show actions if:
- endpoint exists
- user has permission
- document status allows action

No hard delete button for transaction forms.

REUSABLE LINE TABLE REQUIREMENTS:

TransactionLineTable must support configurable columns:

- product selector
- description
- quantity
- unit
- unit price
- discount type
- discount value
- tax
- warehouse
- department
- project
- expense account for purchase line if applicable
- line total
- remove row button only if editable

Must support:

- add line
- duplicate line
- remove line
- reorder line if needed
- calculate line gross
- calculate discount
- calculate tax
- calculate total
- validate quantity > 0
- validate price >= 0
- show backend validation errors per line

Sales line standard fields:

- product_id
- product_code
- description
- quantity
- unit_id
- unit_price
- discount_type
- discount_value
- discount_amount
- tax_id
- tax_rate
- tax_amount
- warehouse_id
- department_id
- project_id
- source_line_id

Purchase line standard fields:

- product_id
- product_code
- description
- quantity
- unit_id
- unit_price
- discount_type
- discount_value
- discount_amount
- tax_id
- tax_rate
- tax_amount
- warehouse_id
- department_id
- project_id
- expense_account_id
- source_line_id

TOTALS PANEL REQUIREMENTS:
TransactionTotalsPanel must show:

- subtotal before discount
- line discount total
- header discount type
- header discount value
- header discount amount
- subtotal after discount
- tax total
- deposit applied if applicable
- amount paid if applicable
- grand total
- outstanding amount if applicable

Sales Invoice totals:

- subtotal
- discount
- tax
- customer deposit applied
- grand total
- amount due

Vendor Bill totals:

- subtotal
- discount
- tax
- vendor deposit applied
- grand total
- amount payable

Receipt/payment forms:

- invoice/bill selected
- amount paid
- payment account
- payment date
- remaining outstanding

CUSTOMER DEPOSIT FORM:
Must support:

- customer selector
- deposit date
- sales order selector optional
- cash/bank account selector
- amount
- notes
- status actions:
  - save draft if backend supports
  - post
  - void
  - refund if endpoint exists

VENDOR DEPOSIT FORM:
Must support:

- vendor selector
- deposit date
- purchase order selector optional
- cash/bank account selector
- amount
- notes
- status actions:
  - save draft if backend supports
  - post
  - void
  - refund if endpoint exists

SALES RECEIPT FORM:
Must support:

- customer selector
- receipt date
- cash/bank account selector
- selectable open invoices
- allocation table:
  - invoice number
  - invoice date
  - outstanding
  - amount applied
- support direct receipt if backend allows
- post action
- void action

VENDOR PAYMENT FORM:
Must support:

- vendor selector
- payment date
- cash/bank account selector
- selectable open bills
- allocation table:
  - bill number
  - bill date
  - outstanding
  - amount applied
- support direct payment if backend allows
- post action
- void action

SALES RETURN FORM:
Must support:

- customer selector
- return date
- source sales invoice optional
- source delivery order optional if backend supports
- line table
- return quantity
- reason
- approve/post/void actions if backend supports

PURCHASE RETURN FORM:
Must support:

- vendor selector
- return date
- source vendor bill optional
- source goods receipt optional if backend supports
- line table
- return quantity
- reason
- approve/post/void actions if backend supports

DELIVERY ORDER FORM:
Must support:

- customer selector
- delivery date
- sales order source optional
- warehouse selector
- shipping address
- line table
- delivered quantity
- ready/ship/deliver/cancel/void actions if backend supports
- no stock movement created in frontend

GOODS RECEIPT FORM:
Must support:

- vendor selector
- receipt date
- purchase order source optional
- warehouse selector
- line table
- received quantity
- receive/cancel/void actions if backend supports
- no stock movement created in frontend

PROFORMA INVOICE FORM:
Must support:

- customer selector
- proforma date
- sales order source optional
- line table
- totals
- issue/cancel/convert actions if backend supports
- no AR journal unless backend explicitly does it

BILLING INVOICE FORM:
Must support:

- customer selector
- billing date
- sales invoice source optional
- line/summary from invoices if backend supports
- totals
- post/void actions if backend supports

READ-ONLY SALES PAGES:

Customer Summary:

- customer filter
- date range
- summary cards:
  - total sales
  - total receipts
  - outstanding
  - deposits
- table if backend supports

Open Invoices:

- customer filter
- date range
- overdue filter
- invoice list
- outstanding amount
- open receipt action if allowed

AR Aging:

- date as of
- customer filter
- aging buckets
- export/print if endpoint exists

AR Reconciliation:

- date range
- compare AR subsidiary vs GL
- show difference
- action refresh/recalculate if backend supports
- no manual journal creation unless backend supports

READ-ONLY PURCHASE PAGES:

Vendor Summary:

- vendor filter
- date range
- total bills
- total payments
- outstanding
- deposits

Open Bills:

- vendor filter
- date range
- overdue filter
- bill list
- outstanding amount
- open payment action if allowed

AP Aging:

- date as of
- vendor filter
- aging buckets
- export/print if endpoint exists

AP Reconciliation:

- date range
- compare AP subsidiary vs GL
- show difference
- action refresh/recalculate if backend supports
- no manual journal creation unless backend supports

SERVICE INTEGRATION:
Use existing or create services:

src/services/sales/
├── quotations.service.ts
├── orders.service.ts
├── delivery-orders.service.ts
├── proformas.service.ts
├── invoices.service.ts
├── billing-invoices.service.ts
├── deposits.service.ts
├── receipts.service.ts
├── returns.service.ts
└── ar.service.ts

src/services/purchase/
├── requests.service.ts
├── orders.service.ts
├── goods-receipts.service.ts
├── vendor-bills.service.ts
├── deposits.service.ts
├── payments.service.ts
├── returns.service.ts
└── ap.service.ts

Each service must expose only methods supported by backend endpoint map:

- list
- get
- create
- update
- approve
- confirm
- post
- void
- cancel
- close
- sourceCandidates if endpoint exists
- createFromSource if endpoint exists
- getOpenDocuments if endpoint exists

If backend does not have createFromSource endpoint:

- frontend may call GET source document
- then prefill create form
- final save still uses normal POST create endpoint with source fields included if backend supports them

SOURCE SELECTOR REQUIREMENTS:
TransactionSourceSelector must support:

- source type dropdown
- source document search
- source document preview
- import/copy lines button
- clear source button
- prevent source if form already has unsaved lines unless user confirms replace lines

For Sales Invoice source options:

- Direct
- From Sales Order
- From Delivery Order

For Vendor Bill source options:

- Direct
- From Purchase Order
- From Goods Receipt

For Sales Order:

- Direct
- From Sales Quotation

For Delivery Order:

- Direct
- From Sales Order

For Purchase Order:

- Direct
- From Purchase Request

For Goods Receipt:

- Direct
- From Purchase Order

ROUTER:
Add form routes if needed, but prefer virtual tabs integration.

Possible routes:

- /sales/quotations
- /sales/orders
- /sales/delivery-orders
- /sales/proforma-invoices
- /sales/invoices
- /sales/billing-invoices
- /sales/customer-deposits
- /sales/receipts
- /sales/returns
- /sales/customer-summary
- /sales/open-invoices
- /sales/ar-aging
- /sales/ar-reconciliation

- /purchase/requests
- /purchase/orders
- /purchase/goods-receipts
- /purchase/vendor-bills
- /purchase/vendor-deposits
- /purchase/vendor-payments
- /purchase/returns
- /purchase/vendor-summary
- /purchase/open-bills
- /purchase/ap-aging
- /purchase/ap-reconciliation

VIRTUAL TABS:
Workspace list pages must open forms via virtual tabs.

Required:

- Create button opens create secondary tab.
- Edit button opens edit secondary tab.
- Detail button opens detail secondary tab.
- Source-created document can open create tab with source payload.
- Unsaved state persists when switching to another module.
- Multiple create tabs are allowed.
- Same edit document tab should not duplicate.

Example:
User opens Sales Invoices.
Clicks Create.
Secondary tab "Data Baru" opens.
User chooses Source Type = Sales Order.
User selects SO-2026-0001.
Lines copied.
User switches to Purchase Orders.
Then returns to Sales Invoices.
The unsaved Sales Invoice form must still be there.

VALIDATION:
Use VeeValidate + Zod.

Each form config must have validation schema.

Common validation:

- date required
- partner required for customer/vendor docs
- line array min 1 where applicable
- quantity > 0
- price >= 0
- discount >= 0
- percent discount <= 100
- payment/deposit amount > 0
- source quantity cannot exceed remaining if data available

Laravel 422 errors:

- map header errors
- map line errors
- show error summary

PERMISSION:
Every form and action must check permission.

Examples:

- sales.invoices.create
- sales.invoices.edit
- sales.invoices.post
- sales.invoices.void
- purchase.bills.create
- purchase.bills.edit
- purchase.bills.post
- purchase.bills.void

If permission missing:

- hide action button
- route guard prevents opening form if no view/create permission
- backend still remains source of truth

STATUS-BASED FIELD LOCKING:
Draft:

- editable

Approved/Confirmed:

- limited edit or read-only depending backend

Posted:

- read-only
- only void/reversal actions if supported

Void/Cancelled:

- read-only
- no edit

Delivered/Received:

- read-only for source-sensitive lines unless backend allows correction

PRINT:
Add print button only if backend endpoint or frontend print view exists.
If not available, hide or mark TODO.

API ENDPOINT MAP:
Before coding forms, create/update:

docs/frontend-vue-sales-purchase-form-endpoint-map.md

Must include:

- submenu name
- page route
- form page
- service file
- list endpoint
- detail endpoint
- create endpoint
- update endpoint
- source endpoints
- action endpoints
- permission keys
- status lifecycle
- notes

DOCUMENTATION:
Create/update:

docs/frontend-vue-transaction-form-system.md
docs/frontend-vue-sales-ar-forms.md
docs/frontend-vue-purchase-ap-forms.md

Docs must explain:

- reusable form architecture
- why forms are config-driven
- how direct creation works
- how source document creation works
- how Sales Invoice from Sales Order/Delivery Order works
- how Vendor Bill from Purchase Order/Goods Receipt works
- how deposit/payment allocation works
- how virtual tabs preserve draft state
- which submenus are forms and which are read-only reports

IMPLEMENTATION ORDER:
Do in this order to avoid confusion:

1. Scan backend endpoints and create endpoint map.
2. Create reusable transaction-form components.
3. Create shared composables.
4. Create Sales form configs.
5. Create Purchase form configs.
6. Create service methods for all available endpoints.
7. Implement Sales forms:
   - Sales Quotations
   - Sales Orders
   - Delivery Orders
   - Proforma Invoices
   - Sales Invoices
   - Billing Invoices
   - Customer Deposits
   - Sales Receipts
   - Sales Returns
8. Implement Sales read-only pages:
   - Customer Summary
   - Open Invoices
   - AR Aging
   - AR Reconciliation
9. Implement Purchase forms:
   - Purchase Requests
   - Purchase Orders
   - Goods Receipts
   - Vendor Bills
   - Vendor Deposits
   - Vendor Payments
   - Purchase Returns
10. Implement Purchase read-only pages:

- Vendor Summary
- Open Bills
- AP Aging
- AP Reconciliation

11. Connect all pages to sidebar and virtual tabs.
12. Run build/typecheck.
13. Update docs and final summary.

ACCEPTANCE CRITERIA:

General:
[ ] No submenu from Sales & AR is skipped.
[ ] No submenu from Purchase & AP is skipped.
[ ] Every transaction submenu has a form or documented reason if backend endpoint missing.
[ ] Every summary/report submenu has a read-only page.
[ ] Forms use reusable transaction form components.
[ ] Forms are flexible through config/slots, not rigid one-template-only.
[ ] Forms are not duplicated one-by-one with unrelated layout code.
[ ] All API requests use Bearer token and X-Company-ID.
[ ] Laravel validation errors display properly.
[ ] Permission checks apply to actions.
[ ] No hard delete is implemented.

Sales Invoice:
[ ] Can create directly.
[ ] Can create from Sales Order.
[ ] Can create from Delivery Order.
[ ] Can copy source lines.
[ ] Can edit draft invoice.
[ ] Can post if backend supports.
[ ] Can void if backend supports.
[ ] Can apply customer deposit if backend supports.

Vendor Bill:
[ ] Can create directly.
[ ] Can create from Purchase Order.
[ ] Can create from Goods Receipt.
[ ] Can copy source lines.
[ ] Can edit draft bill.
[ ] Can post if backend supports.
[ ] Can void if backend supports.
[ ] Can apply vendor deposit if backend supports.

Virtual tabs:
[ ] Create opens secondary tab.
[ ] Edit opens secondary tab.
[ ] Switching modules does not remove unsaved form.
[ ] Closing dirty tab asks confirmation.
[ ] Same edit document does not duplicate tab.

Reports:
[ ] Customer Summary loads from backend if endpoint exists.
[ ] Open Invoices loads from backend if endpoint exists.
[ ] AR Aging loads from backend if endpoint exists.
[ ] AR Reconciliation loads from backend if endpoint exists.
[ ] Vendor Summary loads from backend if endpoint exists.
[ ] Open Bills loads from backend if endpoint exists.
[ ] AP Aging loads from backend if endpoint exists.
[ ] AP Reconciliation loads from backend if endpoint exists.

COMMANDS TO RUN:
cd frontend-vue
npm install
npm run typecheck
npm run lint
npm run build

If backend route check is possible:
cd backend
php artisan route:list --path=api

FINAL SUMMARY REQUIRED:
At the end, report:

1. Reusable components created
2. Composables created
3. Sales forms completed
4. Sales report/read-only pages completed
5. Purchase forms completed
6. Purchase report/read-only pages completed
7. Services created/updated
8. Endpoint map created
9. Submenus covered
10. Submenus not fully functional because backend endpoint missing
11. Commands run and result
12. Known limitations
13. Next recommended task

COMMIT MESSAGE:
add reusable integrated sales and purchase transaction forms
