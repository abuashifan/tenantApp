TASK TITLE:
Connect All Laravel API Endpoints to Frontend Vue and Ensure CRUD/Workflow Actions Work Correctly

PROJECT:
TenantAppDevelopment

TARGET FRONTEND:
frontend-vue

STACK FRONTEND:

- Vue 3
- Vite
- TypeScript
- Vue Router
- Pinia
- Axios
- TailwindCSS
- TanStack Table
- VeeValidate
- Zod

BACKEND:

- Laravel API
- Sanctum Bearer token
- Multi-tenant via X-Company-ID
- Tenant database per company
- All API requests must use:
  Authorization: Bearer TOKEN
  X-Company-ID: ACTIVE_COMPANY_ID

IMPORTANT PROJECT CONTEXT:
Backend phases sudah banyak selesai:

- Phase 5 Master Data
- Phase 6 Journal Entry
- Phase 6A Departments/Projects
- Phase 7 Reports GL/TB
- Phase 8 Financial Statements & Closing
- Phase 9 Sales Backend
- Phase 10 Purchase Backend aktif/berjalan
- Phase 11+ belum tentu lengkap

Frontend Vue sekarang harus mulai menghubungkan seluruh endpoint backend yang sudah tersedia ke UI, service, workspace list, form, dan action workflow.

MAIN GOAL:
Scan backend Laravel routes, map every existing API endpoint, then connect them to frontend-vue using reusable API services, reusable workspace list pages, reusable form patterns, and virtual tabs.

The result must allow users to:

- view/list data
- create data
- edit/update data
- show/detail data
- post/approve/confirm/void/cancel/deactivate according to endpoint availability
- NEVER use hard delete for business transactions
- if a backend endpoint has no DELETE route, do not invent delete
- if delete is requested in UI, replace with void/deactivate/cancel depending on module rules

CRITICAL RULE:
DELETE is not the default action in this accounting ERP.
For transactions:

- Delete must be replaced by Void if backend supports void
- Cancel if document is cancellable but not posted
- Deactivate if master data should no longer be used
- Close if document lifecycle requires close
- Do not hard delete posted/financial documents

BUSINESS ACTION MAPPING:
Use this rule when connecting buttons/actions:

1. Master Data:

- Chart of Accounts: create, edit, deactivate/activate if endpoint exists
- Contacts: create, edit, deactivate/activate if endpoint exists
- Units: create, edit, deactivate/activate if endpoint exists
- Product Categories: create, edit, deactivate/activate if endpoint exists
- Products: create, edit, deactivate/activate if endpoint exists
- Warehouses: create, edit, deactivate/activate if endpoint exists
- Account Mappings: create/update/edit only, deactivate if backend supports

2. Analytical Dimensions:

- Departments: create, edit, deactivate/activate
- Projects: create, edit, deactivate/activate, status handling if available

3. Journal:

- draft create
- edit draft
- approve if available
- post if available
- void if posted and backend supports
- reverse/revision if available
- no hard delete for posted journals

4. Sales:

- Sales Quotation: create, edit, send, approve, accept, reject, cancel
- Sales Order: create, edit, approve, confirm, cancel, close
- Delivery Order: create, edit, ready/ship/deliver/cancel/void depending backend
- Proforma Invoice: create, edit, issue/cancel/convert if available
- Sales Invoice: create, edit draft, approve/post/void
- Billing Invoice: create/edit/void if available
- Sales Receipt: create/post/void
- Customer Deposit: create/post/void/refund if available
- Sales Return: create/approve/post/void
- AR Aging / AR Ledger: read-only report pages

5. Purchase:

- Purchase Request: create, edit, submit, approve, reject, cancel
- Purchase Order: create, edit, approve, confirm, cancel, close
- Goods Receipt: create, edit, receive/cancel/void
- Vendor Bill: create, edit, approve/post/void
- Vendor Payment: create/post/void
- Vendor Deposit: create/post/void/refund if available
- Purchase Return: create/approve/post/void
- AP Aging / AP Ledger: read-only report pages

6. Reports:

- General Ledger: read-only
- Trial Balance: read-only
- Profit Loss: read-only
- Balance Sheet: read-only
- Cash Flow: read-only
- Financial Summary: read-only
- No create/edit/void buttons on report pages

7. Fiscal Closing / Period Locking:

- status/checklist/preview read
- close fiscal year action
- reopen fiscal year action if backend supports
- update period lock if backend supports
- must display warnings/errors clearly

ABSOLUTE DO NOT:

- Do not change backend API contracts.
- Do not create fake endpoints.
- Do not hardcode endpoint responses.
- Do not keep temporary Pinia dummy data after API integration works.
- Do not use dummy state as main source of truth once backend API exists.
- Do not implement hard delete for transactions.
- Do not add Redux/Zustand/Jotai.
- Do not bypass auth/company/permission guards.
- Do not remove existing design system/theme.
- Do not rebuild UI design from scratch.
- Do not create separate one-off table layouts for every module.
- Do not create one giant unreadable WorkspaceComponent with business logic for all modules.
- Do not use router.push only for create/edit forms if it breaks virtual tabs state.

REQUIRED FIRST STEP:
Scan backend routes carefully.

Run/read:

- backend/routes/api.php
- backend/config/permissions.php
- backend/config/document_numbers.php if exists
- backend/config/transaction_lifecycle.php if exists
- backend/app/Http/Controllers/Api/\*\*
- backend/app/Http/Requests/\*\*
- backend/app/Services/\*\*
- backend/app/Models/Tenant/\*\*

Do not blindly relist the whole repo in final output.
Use route:list if environment allows:
php artisan route:list --path=api

Generate an endpoint map document:
docs/frontend-vue-api-endpoint-map.md

The endpoint map must include:

- module
- endpoint method
- endpoint path
- backend controller/action
- required permission if visible
- frontend page route
- frontend service method name
- supported actions
- notes whether action is create/edit/post/void/cancel/deactivate/read-only

FRONTEND API FOUNDATION:
Create/update API client:

src/services/api.ts

Requirements:

- Axios instance
- baseURL from VITE_API_URL
- automatically attach Bearer token from auth store/localStorage
- automatically attach X-Company-ID from company store/localStorage
- Accept: application/json
- Content-Type: application/json
- handle 401 by clearing auth and redirecting to login
- handle 403 with permission error message
- handle 422 validation error in Laravel format
- handle 404 and 500 cleanly
- expose typed api helper methods:
  api.get
  api.post
  api.patch
  api.put
  api.delete only for non-business endpoints if actually needed
- Prefer PATCH for status actions.

REQUIRED TYPES:
Create/update:

src/types/api.ts

- ApiResponse<T>
- ApiError
- ValidationErrors
- PaginatedResponse<T>
- ApiListParams
- ApiActionResult

src/types/workspace.ts

- WorkspaceModuleKey
- WorkspaceListConfig
- WorkspaceAction
- WorkspaceColumn
- WorkspaceFilter
- WorkspaceStatusOption

src/types/lifecycle.ts

- TransactionStatus
- MasterDataStatus
- DocumentActionKey

API SERVICES STRUCTURE:
Create module services. Keep them thin. Business lifecycle decisions must be controlled by module config, not hidden randomly.

Suggested structure:

src/services/
├── api.ts
├── auth.service.ts
├── company.service.ts
├── permissions.service.ts
├── master-data/
│ ├── chart-of-accounts.service.ts
│ ├── contacts.service.ts
│ ├── units.service.ts
│ ├── product-categories.service.ts
│ ├── products.service.ts
│ ├── warehouses.service.ts
│ └── account-mappings.service.ts
├── accounting/
│ ├── journals.service.ts
│ ├── departments.service.ts
│ ├── projects.service.ts
│ ├── fiscal-years.service.ts
│ └── period-locks.service.ts
├── reports/
│ ├── general-ledger.service.ts
│ ├── trial-balance.service.ts
│ ├── profit-loss.service.ts
│ ├── balance-sheet.service.ts
│ ├── cash-flow.service.ts
│ └── financial-summary.service.ts
├── sales/
│ ├── quotations.service.ts
│ ├── orders.service.ts
│ ├── delivery-orders.service.ts
│ ├── proformas.service.ts
│ ├── invoices.service.ts
│ ├── billing-invoices.service.ts
│ ├── receipts.service.ts
│ ├── deposits.service.ts
│ ├── returns.service.ts
│ └── ar.service.ts
├── purchase/
│ ├── requests.service.ts
│ ├── orders.service.ts
│ ├── goods-receipts.service.ts
│ ├── vendor-bills.service.ts
│ ├── payments.service.ts
│ ├── deposits.service.ts
│ ├── returns.service.ts
│ └── ap.service.ts
├── cash-bank/
│ └── cash-bank.service.ts if endpoints exist
└── inventory/
└── inventory.service.ts if endpoints exist

SERVICE METHOD STANDARD:
For list/detail CRUD-like resources:

list(params?: ApiListParams)
get(id: string | number)
create(payload)
update(id, payload)

For lifecycle action:
approve(id, payload?)
post(id, payload?)
confirm(id, payload?)
send(id, payload?)
accept(id, payload?)
reject(id, payload?)
cancel(id, payload?)
void(id, payload?)
deactivate(id, payload?)
activate(id, payload?)
close(id, payload?)
reopen(id, payload?)

IMPORTANT:
Only implement methods for endpoints that actually exist.
If endpoint does not exist, do not create fake service method.
If UI action needs endpoint but endpoint is missing:

- hide the button
- document it in docs/frontend-vue-api-endpoint-map.md as missing/not implemented

REUSABLE WORKSPACE LIST:
Create/update components:

src/components/workspace/
├── WorkspaceListPage.vue
├── WorkspaceToolbar.vue
├── WorkspaceFilterPanel.vue
├── WorkspaceDateRangeFilter.vue
├── WorkspaceSearchBar.vue
├── WorkspaceActionBar.vue
├── WorkspaceDataTable.vue
├── WorkspaceStatusBadge.vue
├── WorkspaceEmptyState.vue
├── WorkspaceLoadingState.vue
├── WorkspaceErrorState.vue
├── WorkspaceConfirmDialog.vue
└── WorkspacePagination.vue

WorkspaceListPage must be config-driven:

- title
- subtitle
- moduleKey
- permissionPrefix
- service
- columns
- filters
- status options
- row actions
- bulk actions
- create action
- refresh action
- void/deactivate/cancel action
- custom slots if needed

REUSABLE FORM:
Create/update:

src/components/form/
├── FormShell.vue
├── FormSection.vue
├── FormActions.vue
├── FormErrorSummary.vue
├── FormFieldWrapper.vue
├── FormUnsavedGuard.vue
└── FormStatusBanner.vue

Form requirements:

- VeeValidate + Zod
- Laravel 422 validation errors mapped to fields
- Dirty state tracked to virtual tabs store
- Save button calls create/update API
- Cancel button returns active secondary tab to list after confirmation if dirty
- After successful create, convert tab label from Data Baru to document number/name if response contains it
- After successful edit, keep edit tab open and update clean state

VIRTUAL TABS INTEGRATION:
Connect create/edit/detail actions to Pinia workspace/virtual tabs store.

Required store:
src/stores/workspace.store.ts

Store must support:

- primary tabs
- secondary tabs per primary tab
- active primary tab
- active secondary tab per primary tab
- dirty state per secondary tab
- draft snapshot per secondary tab
- openPrimaryTab()
- openCreateSecondaryTab()
- openEditSecondaryTab()
- openDetailSecondaryTab()
- closeSecondaryTab()
- closePrimaryTab()
- setSecondaryDirty()
- updateSecondaryDraftState()
- closeAllTabsWithDirtyCheck()

Rule:

- Create button in WorkspaceListPage must NOT simply router.push to form.
- It must call openCreateSecondaryTab.
- Edit button must call openEditSecondaryTab.
- Detail/open row must call openDetailSecondaryTab.
- Switching to another primary tab must not lose form state.
- Returning to previous primary tab must restore last active secondary tab.
- Unsaved form data must not disappear when opening another list/form.

MODULE PAGE STRUCTURE:
Create pages only for endpoints that exist.

Suggested pages:

src/pages/master-data/
├── ChartOfAccountsPage.vue
├── ContactsPage.vue
├── UnitsPage.vue
├── ProductCategoriesPage.vue
├── ProductsPage.vue
├── WarehousesPage.vue
└── AccountMappingsPage.vue

src/pages/accounting/
├── JournalsPage.vue
├── DepartmentsPage.vue
├── ProjectsPage.vue
├── FiscalClosingPage.vue
└── PeriodLocksPage.vue

src/pages/reports/
├── GeneralLedgerPage.vue
├── TrialBalancePage.vue
├── ProfitLossPage.vue
├── BalanceSheetPage.vue
├── CashFlowPage.vue
└── FinancialSummaryPage.vue

src/pages/sales/
├── SalesQuotationsPage.vue
├── SalesOrdersPage.vue
├── DeliveryOrdersPage.vue
├── ProformaInvoicesPage.vue
├── SalesInvoicesPage.vue
├── BillingInvoicesPage.vue
├── SalesReceiptsPage.vue
├── CustomerDepositsPage.vue
├── SalesReturnsPage.vue
├── ArLedgerPage.vue
└── ArAgingPage.vue

src/pages/purchase/
├── PurchaseRequestsPage.vue
├── PurchaseOrdersPage.vue
├── GoodsReceiptsPage.vue
├── VendorBillsPage.vue
├── VendorPaymentsPage.vue
├── VendorDepositsPage.vue
├── PurchaseReturnsPage.vue
├── ApLedgerPage.vue
└── ApAgingPage.vue

For each page:

- Use WorkspaceListPage where applicable.
- Use read-only report component for reports.
- Do not create separate custom table style unless the reusable table cannot support it.
- Use existing theme colors/design tokens.
- Keep row height compact and viewport-friendly.
- Include loading, error, empty states.

FORM IMPLEMENTATION PRIORITY:
Because connecting all endpoints may be large, implement in prioritized groups but keep endpoint map complete.

Priority 1:

- Chart of Accounts
- Contacts
- Products
- Departments
- Projects
- Journal Entries

Priority 2:

- Sales Quotation
- Sales Order
- Delivery Order
- Sales Invoice
- Sales Receipt
- Customer Deposit
- Sales Return

Priority 3:

- Purchase Request
- Purchase Order
- Goods Receipt
- Vendor Bill
- Vendor Payment
- Vendor Deposit
- Purchase Return

Priority 4:

- Reports read-only
- Fiscal closing/period locking
- AR/AP ledger aging

If time is limited, do not fake completion.
Complete priority 1 fully, then continue.
But still create docs endpoint map for all scanned endpoints.

CRUD/WORKFLOW ACCEPTANCE CRITERIA:
For every connected editable module:

List:

- data loads from backend API
- search/filter/date/status query params work if backend supports them
- pagination works if backend paginates
- loading state appears
- error state appears
- empty state appears
- refresh button works

Create:

- create button opens secondary virtual tab
- form validates client-side with Zod
- Laravel 422 errors shown on fields
- successful save calls backend POST
- list refreshes after save
- tab dirty state resets after save
- created document/data appears in list

Edit:

- edit button opens secondary virtual tab
- edit tab is not duplicated for same entity
- existing data loads from backend GET
- update calls backend PATCH/PUT according to backend route
- successful update refreshes list
- unsaved changes persist when switching tabs

Void/Cancel/Deactivate:

- button appears only when action is valid for row status
- confirmation dialog appears
- reason field required for void/cancel if backend requires
- action calls backend PATCH/POST action endpoint
- list refreshes after success
- no hard delete used for business transactions

Permissions:

- buttons hidden/disabled if user lacks permission
- routes protected by permission guard if implemented
- unauthorized API response displayed clearly

Tenant:

- all requests include X-Company-ID
- switching company clears/refreshes tenant-specific list data
- no cross-company data is cached incorrectly

ROUTER:
Update src/router/index.ts

Add routes based on endpoint map and page availability.
Every protected route needs:

- requiresAuth
- requiresCompany
- permission if applicable

Navigation/sidebar:
Update menu config so sidebar reflects actual backend-supported modules.
Do not show menu for modules whose endpoint/page is not implemented yet unless marked disabled/coming soon.

PERMISSION INTEGRATION:
Use permissions from backend auth/permissions endpoint if available.
Create/update:
src/stores/permissions.store.ts

Methods:

- fetchPermissions()
- hasPermission(permission)
- canAny(permissions[])
- canAll(permissions[])

Every action button config should accept permission key.

PINIA STORES:
Create/update:
src/stores/auth.store.ts
src/stores/company.store.ts
src/stores/permissions.store.ts
src/stores/workspace.store.ts

Auth store:

- token
- user
- login
- fetchMe
- logout
- restoreFromStorage

Company store:

- companies
- activeCompanyId
- activeCompany
- fetchCompanies
- selectCompany
- switchCompany
- clearCompany

On company switch:

- clear module list caches if any
- reset or warn about dirty tabs
- refresh current active page

DUMMY DATA CLEANUP:
Search for temporary Pinia dummy data used for:

- journal list
- chart of accounts
- general ledger
- products
- sales/purchase temporary records

After API integration:

- remove dummy state as default source
- keep mock only if clearly named dev/mock and not used in production flow
- do not let WorkspaceListPage read dummy data when API service exists

ERROR HANDLING:
Create:
src/composables/useApiError.ts

Must support:

- Laravel 422 validation errors
- 401 unauthenticated
- 403 forbidden
- 404 not found
- 500 server error
- network error

UI must show:

- toast or inline error
- form field errors
- list error state

CONFIRMATION DIALOGS:
For void/cancel/deactivate:

- show modal confirmation
- require reason if configured
- show document number/name
- warn that action cannot be undone if posted/void

Button labels:

- Void for posted financial documents
- Cancel for draft/approved operational documents if backend lifecycle says cancel
- Deactivate for master data
- Close for closing order/lifecycle
- Never display Delete for financial transaction modules

TESTING:
Add tests where project test setup supports it.

Recommended:

- Vitest unit tests for service URL builders if applicable
- Component smoke test for WorkspaceListPage
- Store tests for workspace virtual tabs
- Manual test checklist if automated tests are not configured yet

Create docs:
docs/frontend-vue-api-integration-checklist.md

Checklist must include:

- login
- select company
- endpoint group list
- create test
- edit test
- void/cancel/deactivate test
- report read test
- permission button test
- tenant switch test
- dirty form state test

COMMANDS TO RUN:
Run if environment supports:

cd frontend-vue
npm install
npm run typecheck
npm run lint
npm run build

If backend is available:
cd backend
php artisan route:list --path=api

Manual dev:
cd backend
php artisan serve

cd frontend-vue
npm run dev

FINAL SUMMARY REQUIRED:
When done, report:

1. Endpoint map created/updated
2. Services created
3. Pages connected
4. Workspace components created/updated
5. Forms connected
6. Modules fully working
7. Modules partially connected
8. Missing backend endpoints if any
9. Dummy data removed
10. Commands run and results
11. Known issues
12. Manual test checklist

COMMIT MESSAGE:
connect vue frontend to laravel api endpoints
