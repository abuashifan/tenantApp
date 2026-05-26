# Prompt Codex — Point 5: Tambah AR/AP Ledger Detail Pages

## TASK TITLE
Implement AR/AP Ledger Detail Pages in Vue Frontend and Verify Backend Integration

## PROJECT
TenantAppDevelopment / tenantApp

## FOCUS POINT
Point 5 — Tambah AR/AP ledger detail pages

## MAIN GOAL
Tambahkan halaman/detail workspace untuk **Accounts Receivable Ledger Detail** dan **Accounts Payable Ledger Detail** agar user bisa melihat rincian mutasi piutang per customer/invoice dan rincian mutasi hutang per vendor/bill berdasarkan endpoint backend yang sudah tersedia.

Audit sebelumnya menunjukkan:

- Backend sudah memiliki endpoint AR/AP report/ledger.
- Beberapa AR/AP summary/open/aging/reconciliation sudah generic connected.
- Tetapi **AR ledger detail** dan **AP ledger detail** masih belum punya surface Vue yang jelas.
- Gap yang perlu ditutup: halaman/menu/detail page untuk melihat ledger detail customer/vendor dan invoice/bill.

Task ini fokus pada:

1. Mengecek endpoint AR/AP ledger detail backend yang sudah aktif.
2. Menambahkan service frontend Vue yang tepat jika belum ada.
3. Menambahkan route/page Vue untuk AR/AP ledger detail.
4. Menambahkan menu/sidebar atau action link dari halaman AR/AP terkait.
5. Menampilkan ledger detail dalam workspace/table yang konsisten.
6. Menjaga pagination/filter/sort tetap aman sesuai response backend.
7. Tidak merusak workspace, virtual tabs, form, dan modul lain yang sudah fix.

---

# STRICT GUARDRAILS — DO NOT BREAK EXISTING FIXED AREAS

## DO NOT

- Do not redesign AppShell.
- Do not redesign sidebar globally.
- Do not change virtual tabs behavior.
- Do not change secondary virtual tabs behavior.
- Do not change workspace table visual style.
- Do not change generic workspace architecture unless strictly necessary.
- Do not change Sales/Purchase transaction lifecycle.
- Do not change source conversion workflow.
- Do not change bulk void wiring in this task.
- Do not change Fiscal Closing / Period Locking workspace if already implemented.
- Do not change Product History location.
- Do not move Product History back to Product Category.
- Do not change auth token storage.
- Do not remove Authorization Bearer handling.
- Do not remove X-Company-ID handling.
- Do not change tenant architecture.
- Do not hardcode customer ID, vendor ID, invoice ID, bill ID, or company ID.
- Do not create fake data if backend endpoint exists.
- Do not add heavy UI libraries.
- Do not run destructive commands.

## PRESERVE

- Existing login flow.
- Existing company selection flow.
- Existing permission-aware sidebar logic.
- Existing workspace shell.
- Existing reusable table/list style.
- Existing report pages.
- Existing Sales/Purchase pages.
- Existing API client behavior.
- Existing route guard behavior.
- Existing virtual tabs and secondary tabs.
- Existing error handling patterns.

## REGRESSION CHECK REQUIRED

After implementation, verify:

- Login still works.
- Company selection still works.
- API requests still include Authorization Bearer token.
- API requests still include X-Company-ID.
- Master Data pages still open.
- Journal pages still open.
- Sales/Purchase/Cash Bank/Inventory menus still open.
- Fiscal Closing workspace, if already implemented, still opens.
- Virtual tabs still work.
- Secondary tabs still work.
- Product History remains under Products.
- Workspace list design remains consistent.

---

# READ FIRST

Before editing, read these files:

## Docs

- `docs/frontend-audit-gap-report.md`
- `docs/update-roadmap.md`
- `docs/phase-9-sales-workflow-and-ar.md` if exists
- `docs/phase-10-purchase-workflow-and-ap.md` if exists
- `docs/phase-14-sales-frontend-mvp.md` if exists
- `docs/phase-15-purchase-frontend-mvp.md` if exists
- `.copilot/project-context.md` if exists
- `project-plan.md` if exists

## Backend

- `backend/routes/api.php`
- `backend/config/permissions.php`
- `backend/app/Http/Controllers/Api/Sales/*`
- `backend/app/Http/Controllers/Api/Purchase/*`
- `backend/app/Services/Sales/*`
- `backend/app/Services/Purchase/*`
- `backend/app/Services/Reports/*` if relevant
- `backend/app/Models/Tenant/*Sales*`
- `backend/app/Models/Tenant/*Purchase*`
- `backend/app/Models/Tenant/Contact.php`
- `backend/app/Models/Tenant/JournalEntry.php`
- `backend/app/Models/Tenant/JournalEntryLine.php`

## Frontend Vue

- `frontend-vue/src/router/index.ts`
- `frontend-vue/src/navigation/sidebar.ts`
- `frontend-vue/src/services/api.ts`
- `frontend-vue/src/services/sales*` if exists
- `frontend-vue/src/services/purchase*` if exists
- `frontend-vue/src/features/workspace/backend-resource/*`
- `frontend-vue/src/components/workspace/*`
- `frontend-vue/src/pages/sales/*`
- `frontend-vue/src/pages/purchase/*`
- `frontend-vue/src/pages/reports/*` if exists
- `frontend-vue/src/workspace/registry.ts`
- `frontend-vue/src/stores/workspaceTabsStore.ts`

## Search Terms

Search these terms:

- `AccountsReceivableController`
- `AccountsPayableController`
- `customer-summary`
- `customer ledger`
- `invoice ledger`
- `open-invoices`
- `aging`
- `reconciliation`
- `vendor-summary`
- `vendor ledger`
- `bill ledger`
- `open-bills`
- `ar ledger`
- `ap ledger`
- `accounts receivable`
- `accounts payable`
- `ledger detail`
- `sales.ar`
- `purchase.ap`

---

# PROBLEM TO FIX

The backend already exposes AR/AP ledger/report endpoints, but Vue does not yet provide proper detail pages for:

- AR ledger per customer.
- AR ledger per invoice, if endpoint supports it.
- AP ledger per vendor.
- AP ledger per bill, if endpoint supports it.

The result: user may see AR/AP aging or summary, but cannot drill into detailed transaction ledger clearly.

Expected:

- User can open AR ledger detail from Sales/AR menu or from customer/invoice context.
- User can open AP ledger detail from Purchase/AP menu or from vendor/bill context.
- Ledger detail table shows beginning balance, debit/credit or increase/decrease, payment/allocation/return, and running balance if backend provides it.
- Filters are available for date range, customer/vendor, invoice/bill, status, and include void if backend supports it.
- UI must use real backend endpoint, not dummy state.

---

# BACKEND VERIFICATION REQUIREMENTS

First verify existing backend endpoints with:

```bash
php artisan route:list --path=api
```

Expected endpoint groups may include:

## AR

- `GET /api/sales/ar/customer-summary`
- `GET /api/sales/ar/customers/{customer}/ledger`
- `GET /api/sales/ar/invoices/{invoice}/ledger`
- `GET /api/sales/ar/open-invoices`
- `GET /api/sales/ar/aging`
- `GET /api/sales/ar/reconciliation`

## AP

- `GET /api/purchase/ap/vendor-summary`
- `GET /api/purchase/ap/vendors/{vendor}/ledger`
- `GET /api/purchase/ap/bills/{bill}/ledger`
- `GET /api/purchase/ap/open-bills`
- `GET /api/purchase/ap/aging`
- `GET /api/purchase/ap/reconciliation`

Use actual route names from backend. Do not invent endpoints if route already differs.

If some ledger detail endpoint is missing but controller/service exists:

- wire the route only if method is clearly implemented and safe.
- protect with `auth:sanctum`, `company.access`, and permission middleware.

If endpoint is missing entirely:

- do not build fake backend logic unless minimal and consistent with existing service pattern.
- document as follow-up.

---

# BACKEND RULES

AR/AP ledger detail must be read-only.

Do not mutate transactions from ledger pages.

Backend response should ideally include:

- customer/vendor info.
- invoice/bill info if detail by document.
- date range/filter metadata.
- opening balance.
- transaction rows.
- debit/credit or increase/decrease columns.
- payment/return/allocation references.
- running balance if supported.
- ending balance.
- reconciliation summary if supported.

If backend response format differs, adapt frontend mapping without changing backend unnecessarily.

Permissions:

- AR pages should use existing `sales.ar.view` or equivalent.
- AP pages should use existing `purchase.ap.view` or equivalent.
- Do not rename existing permissions.
- Add missing permission keys only if backend config clearly lacks them and they are needed.

---

# FRONTEND IMPLEMENTATION REQUIREMENTS

## 1. Services

Create or fix frontend services, reusing existing API client.

Recommended files if not already present:

- `frontend-vue/src/services/sales/ar.service.ts`
- `frontend-vue/src/services/purchase/ap.service.ts`

Or use existing sales/purchase service structure if already present.

Required service methods:

## AR

- `getCustomerSummary(params?)`
- `getCustomerLedger(customerId, params?)`
- `getInvoiceLedger(invoiceId, params?)` if endpoint exists
- `getOpenInvoices(params?)`
- `getAging(params?)`
- `getReconciliation(params?)`

## AP

- `getVendorSummary(params?)`
- `getVendorLedger(vendorId, params?)`
- `getBillLedger(billId, params?)` if endpoint exists
- `getOpenBills(params?)`
- `getAging(params?)`
- `getReconciliation(params?)`

Ensure:

- API client baseURL is reused.
- Do not prefix `/api` twice.
- Bearer token still sent.
- X-Company-ID still sent.
- 401/403/422 handled consistently.

## 2. Routes

Add/fix Vue routes only for pages that exist.

Recommended routes:

## AR

- `/sales/ar/customers/:customerId/ledger`
- `/sales/ar/invoices/:invoiceId/ledger` if endpoint exists

## AP

- `/purchase/ap/vendors/:vendorId/ledger`
- `/purchase/ap/bills/:billId/ledger` if endpoint exists

Optional route aliases if current navigation pattern prefers reports:

- `/reports/ar/customers/:customerId/ledger`
- `/reports/ap/vendors/:vendorId/ledger`

Use project’s current route grouping style. Do not create duplicate confusing routes if one pattern already exists.

## 3. Pages

Create pages if missing:

- `frontend-vue/src/pages/sales/ar/CustomerLedgerDetailPage.vue`
- `frontend-vue/src/pages/sales/ar/InvoiceLedgerDetailPage.vue` if endpoint exists
- `frontend-vue/src/pages/purchase/ap/VendorLedgerDetailPage.vue`
- `frontend-vue/src/pages/purchase/ap/BillLedgerDetailPage.vue` if endpoint exists

If project uses a different page folder structure, follow it.

## 4. Navigation / Drilldown Links

Add links without cluttering sidebar.

Preferred:

- Keep sidebar menu for AR Aging / AR Summary / AP Aging / AP Summary if already exists.
- Add drilldown action buttons/links from AR summary/open invoices to ledger detail.
- Add drilldown action buttons/links from AP summary/open bills to ledger detail.

If summary pages do not exist yet but generic pages exist:

- add minimal menu item:
  - `AR Customer Ledger`
  - `AP Vendor Ledger`

But avoid adding menu items that require selecting ID with no UI.

Better UX:

- Add ledger detail links on rows where customer/vendor/invoice/bill ID is available.
- If no row context exists, create a filter page with customer/vendor selector only if selector components already exist.

## 5. Page UI Requirements

Each ledger detail page must include:

- title and subtitle.
- customer/vendor or invoice/bill identity card.
- date range filter.
- refresh button.
- loading state.
- empty state.
- error state.
- summary cards:
  - opening balance.
  - total increase/debit.
  - total decrease/credit.
  - ending balance.
- ledger table.

Recommended ledger table columns:

- Date
- Document Type
- Document Number
- Source / Reference
- Description
- Debit / Increase
- Credit / Decrease
- Balance / Running Balance
- Status

For AR:

- Debit may represent invoice/receivable increase.
- Credit may represent receipt/return/deposit allocation.

For AP:

- Credit may represent bill/payable increase.
- Debit may represent payment/return/vendor deposit allocation.

Use labels that match the backend response and accounting convention.

Do not hardcode accounting math in frontend if backend already returns values.

## 6. Filters

Support filters if backend accepts them:

- start_date
- end_date
- include_void / include_voided if backend supports
- document_type if backend supports
- status if backend supports

If backend does not support some filter:

- do not fake it incorrectly.
- keep UI filter minimal.
- document follow-up.

---

# PERMISSION-AWARE BEHAVIOR

Ledger detail pages must require permission:

- AR: `sales.ar.view` or existing equivalent.
- AP: `purchase.ap.view` or existing equivalent.

Frontend should:

- hide links/buttons if user lacks permission.
- show forbidden message if route is accessed directly and backend returns 403.

Backend should:

- protect routes with permission middleware.

---

# API RESPONSE MAPPING

Do not assume one exact response shape.

Inspect actual API response/service resource pattern.

Support common shapes:

```ts
{
  success: true,
  data: {
    customer: {},
    vendor: {},
    invoice: {},
    bill: {},
    summary: {},
    rows: [],
    ledger: [],
    items: [],
    meta: {}
  }
}
```

If backend uses `data.items`, map it.
If backend uses `data.rows`, map it.
If backend uses pagination meta, preserve it.

Do not break existing generic API response handling.

---

# ERROR HANDLING

Handle:

- 401 unauthenticated.
- 403 forbidden.
- 404 customer/vendor/invoice/bill not found.
- 422 validation error.
- network error.

UI must show clear message, not blank page.

---

# TESTING REQUIREMENTS

## Backend tests if needed

If route was added/fixed, add/update tests:

- AR customer ledger requires auth.
- AR customer ledger requires X-Company-ID.
- AR customer ledger requires permission.
- AR customer ledger returns tenant-scoped data.
- AP vendor ledger requires auth.
- AP vendor ledger requires X-Company-ID.
- AP vendor ledger requires permission.
- AP vendor ledger returns tenant-scoped data.

If invoice/bill ledger endpoints exist:

- invoice ledger returns correct invoice rows.
- bill ledger returns correct bill rows.

## Frontend tests if setup exists

- AR ledger detail page calls service.
- AP ledger detail page calls service.
- loading/error/empty states render.
- ledger rows render.
- permission hides drilldown link.

If frontend tests are not set up:

- add manual QA checklist in docs.

---

# DOCUMENTATION

Create or update:

- `docs/point-5-ar-ap-ledger-detail-pages.md`

Content:

- problem from audit.
- backend endpoints verified.
- frontend routes added.
- service mapping.
- AR ledger detail behavior.
- AP ledger detail behavior.
- permissions.
- filters.
- known limitations.
- manual QA checklist.

Also update:

- `docs/frontend-audit-gap-report.md`

Add short note under Point 5 / AR/AP ledger detail gap:

- fixed or partially fixed.
- route/page/service added.
- follow-up if any endpoint missing.

---

# ACCEPTANCE CRITERIA

## Backend

- [ ] AR customer ledger endpoint verified or activated.
- [ ] AP vendor ledger endpoint verified or activated.
- [ ] Invoice ledger endpoint verified or documented as follow-up.
- [ ] Bill ledger endpoint verified or documented as follow-up.
- [ ] AR/AP ledger routes require auth.
- [ ] AR/AP ledger routes require X-Company-ID.
- [ ] AR/AP ledger routes require permission.
- [ ] Tenant isolation preserved.
- [ ] No transaction mutation added to ledger pages.

## Frontend

- [ ] AR customer ledger detail page exists and loads data from backend.
- [ ] AP vendor ledger detail page exists and loads data from backend.
- [ ] Invoice ledger detail page exists if endpoint exists.
- [ ] Bill ledger detail page exists if endpoint exists.
- [ ] AR/AP service methods use existing API client.
- [ ] Bearer token still sent.
- [ ] X-Company-ID still sent.
- [ ] Loading state works.
- [ ] Empty state works.
- [ ] Error state works.
- [ ] Date range filter works if backend supports it.
- [ ] Ledger table renders rows correctly.
- [ ] Summary cards render balances correctly.
- [ ] Drilldown links are permission-aware.
- [ ] Existing sidebar/workspace design not broken.

## Regression

- [ ] Login works.
- [ ] Company selection works.
- [ ] Dashboard opens.
- [ ] Master Data pages open.
- [ ] Journal pages open.
- [ ] Sales/Purchase menus open.
- [ ] Fiscal Closing workspace still works if implemented.
- [ ] Access Management still works if implemented.
- [ ] Virtual tabs still work.
- [ ] Secondary tabs still work.
- [ ] Product History remains under Products.
- [ ] Product Category does not contain Product History.

---

# COMMANDS TO RUN

Before changes:

```bash
git status --short
```

Backend:

```bash
php artisan route:list --path=api
php artisan test --filter=AccountsReceivable
php artisan test --filter=AccountsPayable
php artisan test --filter=Ledger
php artisan test
```

Frontend from `frontend-vue`:

```bash
npm run typecheck
npm run lint
npm run build
```

If `typecheck` script does not exist, report it and continue with available scripts.

Do not run:

- `php artisan migrate:fresh`
- destructive seeders
- commands that wipe tenant databases
- `npm audit fix`
- global prettier write
- global eslint fix

---

# FINAL SUMMARY REQUIRED

At the end, report:

1. Root cause of AR/AP ledger detail gap.
2. Backend endpoints verified/activated.
3. Backend files changed.
4. Frontend services added/changed.
5. Frontend routes added/changed.
6. Frontend pages added/changed.
7. Navigation/drilldown changes.
8. Permission behavior.
9. Filters supported.
10. Tests added/updated.
11. Commands run and results.
12. Regression checklist result.
13. Known limitations/follow-up.
14. Changed files summary.

---

# COMMIT AND PUSH REQUIRED

After implementation and checks:

```bash
git status --short
```

Review changed files. Make sure only relevant Point 5 AR/AP ledger detail files are changed.

Commit:

```bash
git add <relevant files only>
git commit -m "add ar ap ledger detail pages"
```

Push:

```bash
git push origin main
```

If current branch is not `main`:

```bash
git push origin HEAD
```

If push fails:

- do not retry blindly.
- report exact error.
- include whether commit was created successfully.

Final response must include:

- commit hash.
- branch pushed.
- remote push result.
- changed files summary.
- commands executed.
- tests/build result.
