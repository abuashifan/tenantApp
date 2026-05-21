# Update Roadmap — TenantAppDevelopment

Dokumen ini berisi roadmap ringkas terbaru project TenantAppDevelopment.

Format dokumen ini hanya berisi:

```text
- status phase
- subphase list
- scope list ringkas
```

Dokumen ini tidak berisi prompt teknis, script, potongan kode, atau instruksi detail untuk Codex.

---

## Status Ringkas Saat Ini

```text
[✓] Phase 0  — Setup Project Foundation
[✓] Phase 1  — Central Database Schema + Demo Foundation
[✓] Phase 2  — Authentication & Company Access
[✓] Phase 3  — Internal Tenant Generator & Tenant Isolation
[✓] Phase 4  — System Policy & Accounting Foundation
[✓] Phase 5  — Master Data Akuntansi
[✓] Phase 6  — Journal Entry Engine
[✓] Phase 6A — Analytical Dimensions Foundation
[✓] Phase 7  — General Ledger & Trial Balance
[✓] Phase 8  — Financial Statements & Closing
[✓] Phase 9  — Sales Workflow & Accounts Receivable Backend
[✓] Phase 10 — Purchase Workflow & Accounts Payable Backend
[✓] Phase 11 — Cash Bank Backend
[✓] Phase 12 — Inventory Backend
[ ] Phase 13 — Accounting Frontend MVP
[ ] Phase 14 — Sales Frontend MVP
[ ] Phase 15 — Purchase Frontend MVP
[ ] Phase 16 — Cash Bank Frontend MVP
[ ] Phase 17 — Inventory Frontend MVP
[ ] Phase 18 — Role, Permission & User Management Advanced
[ ] Phase 19 — Reports Advanced, Export PDF/Excel, Print View
[ ] Phase 20 — Audit Log Advanced UI
[ ] Phase 21 — Backup & Restore Tools
[ ] Phase 22 — Advanced Accounting & Operational Modules
[ ] Phase 23 — Fixed Asset
[ ] Phase 24 — Testing Hardening
[ ] Phase 25 — Deployment to VPS & Production Hardening
```

Keterangan:

```text
[✓] Selesai
[>] Fase aktif / fase berikutnya
[ ] Belum dimulai
```

---

# Stage 1 — Foundation

## Phase 0 — Setup Project Foundation

Status:

```text
[✓] Selesai
```

Scope:

```text
[✓] Laravel API foundation
[✓] Next.js frontend foundation
[✓] TailwindCSS foundation
[✓] SQLite central database
[✓] Tenant database directory
[✓] Health check API
[✓] CORS setup
[✓] Sanctum foundation
[✓] Git ignore and environment foundation
```

---

## Phase 1 — Central Database Schema + Demo Foundation

Status:

```text
[✓] Selesai
```

Scope:

```text
[✓] Users
[✓] Companies
[✓] Company users
[✓] Tenant databases
[✓] Plans
[✓] Subscriptions
[✓] Company invitations
[✓] Activity logs
[✓] Demo user
[✓] Demo company and tenant database
```

---

## Phase 2 — Authentication & Company Access

Status:

```text
[✓] Selesai
```

Subphase:

```text
[✓] Phase 2A — Backend Authentication & Company Access
[✓] Phase 2B — Minimal Frontend Auth & Company Selection
```

Scope:

```text
[✓] Register
[✓] Login
[✓] Logout
[✓] Current user API
[✓] User company list
[✓] Select active company
[✓] X-Company-ID tenant context
[✓] Company access middleware
[✓] Minimal login frontend
[✓] Minimal select company frontend
[✓] Minimal tenant dashboard frontend
```

---

## Phase 3 — Internal Tenant Generator & Tenant Isolation

Status:

```text
[✓] Selesai
```

Subphase:

```text
[✓] Phase 3A — Tenant Create Command
[✓] Phase 3B — Tenant Migration Command
[✓] Phase 3C — Tenant User Assignment & Demo Seed Command
[✓] Phase 3D — Tenant Isolation Testing
```

Scope:

```text
[✓] Internal tenant creation
[✓] Internal tenant migration
[✓] Internal user-company assignment
[✓] Demo tenant seed
[✓] Tenant isolation tests
[✓] No public tenant creation API
[✓] No public tenant migration API
[✓] No public company assignment API
```

---

## Phase 4 — System Policy & Accounting Foundation

Status:

```text
[✓] Selesai
```

Subphase:

```text
[✓] Phase 4A — Company Settings Foundation
[✓] Phase 4B — Permission Foundation Basic
[✓] Phase 4C — Transaction Lifecycle Standard
[✓] Phase 4D — Transaction Policy Service
[✓] Phase 4E — Transaction Dependency Foundation
[✓] Phase 4F — Period, Fiscal Year & Lock Foundation
[✓] Phase 4G — Document Numbering Foundation
[✓] Phase 4H — Source Link Standard
[✓] Phase 4I — Revision Tracking Foundation
[✓] Phase 4J — Audit Log Basic
[✓] Phase 4K — Report Visibility Standard
[✓] Phase 4L — Opening Balance Standard
[✓] Phase 4M — Account Mapping Foundation
[✓] Phase 4N — Standard API Error Code
[✓] Phase 4O — Placeholder Desain Fitur Lanjutan
```

Scope:

```text
[✓] Company settings
[✓] Permission foundation
[✓] Transaction lifecycle
[✓] Transaction policy
[✓] Transaction dependency
[✓] Fiscal period and lock foundation
[✓] Document numbering
[✓] Source link standard
[✓] Revision tracking
[✓] Audit log
[✓] Report visibility
[✓] Opening balance
[✓] Account mapping
[✓] Standard API errors
```

---

## Phase 5 — Master Data Akuntansi

Status:

```text
[✓] Selesai
```

Subphase:

```text
[✓] Phase 5A — Chart of Accounts
[✓] Phase 5B — Contacts
[✓] Phase 5C — Units
[✓] Phase 5D — Product Categories
[✓] Phase 5E — Products
[✓] Phase 5F — Warehouses
[✓] Phase 5G — Account Mappings
[✓] Phase 5H — Master Data Tests & Documentation
```

Scope:

```text
[✓] Chart of accounts
[✓] Contacts
[✓] Units
[✓] Product categories
[✓] Products
[✓] Warehouses
[✓] Account mappings
[✓] Master data tests
[✓] Master data documentation
```

---

# Stage 2 — Backend Accounting Core

## Phase 6 — Journal Entry Engine

Status:

```text
[✓] Selesai
```

Subphase:

```text
[✓] Phase 6A — Journal Schema & Models
[✓] Phase 6B — Journal Draft CRUD
[✓] Phase 6C — Journal Validation & Balancing
[✓] Phase 6D — Journal Approval & Posting
[✓] Phase 6E — Journal Void & Revision
[✓] Phase 6F — Journal Tests & Documentation
```

Scope:

```text
[✓] Journal entries
[✓] Journal entry lines
[✓] Draft journal
[✓] Journal validation
[✓] Debit credit balancing
[✓] Approval
[✓] Posting
[✓] Void
[✓] Revision
[✓] Journal tests
[✓] Journal documentation
```

---

## Phase 6A — Analytical Dimensions Foundation

Status:

```text
[✓] Selesai
```

Subphase:

```text
[✓] Department master
[✓] Project master
[✓] Journal line dimension integration
[✓] Dimension validation
[✓] Dimension permissions
[✓] Dimension tests & documentation
```

Scope:

```text
[✓] Departments
[✓] Projects
[✓] Department on journal lines
[✓] Project on journal lines
[✓] Dimension validation
[✓] Dimension permissions
```

---

## Phase 7 — General Ledger & Trial Balance

Status:

```text
[✓] Selesai
```

Subphase:

```text
[✓] Phase 7A — Report Query Foundation
[✓] Phase 7B — General Ledger
[✓] Phase 7C — Account Ledger Detail
[✓] Phase 7D — Trial Balance
[✓] Phase 7E — Ledger Tests & Documentation
```

Scope:

```text
[✓] Report query foundation
[✓] General ledger
[✓] Account ledger detail
[✓] Trial balance
[✓] Posted-only report rule
[✓] Ledger tests
[✓] Ledger documentation
```

---

## Phase 8 — Financial Statements & Closing

Status:

```text
[✓] Selesai
```

Subphase:

```text
[✓] Phase 8A — Profit & Loss Statement API
[✓] Phase 8B — Balance Sheet API
[✓] Phase 8C — Simple Cash Flow API
[✓] Phase 8D — Financial Statement Integration & Consistency Tests
[✓] Phase 8E — Fiscal Closing Foundation
[✓] Phase 8F — Closing Wizard & Period Locking API/UI ringan
```

Scope:

```text
[✓] Profit and loss
[✓] Balance sheet
[✓] Simple cash flow
[✓] Financial summary
[✓] Report consistency tests
[✓] Fiscal closing
[✓] Period locking
[✓] Closing wizard basic
```

---

# Stage 3 — Backend Business Modules

## Phase 9 — Sales Workflow & Accounts Receivable Backend

Status:

```text
[✓] Selesai
```

Subphase:

```text
[✓] Phase 9A — Sales Workflow Foundation
[✓] Phase 9B — Sales Quotation
[✓] Phase 9C — Sales Order + Down Payment Entry
[✓] Phase 9D — Delivery Order
[✓] Phase 9E — Proforma Invoice
[✓] Phase 9F — Sales Invoice
[✓] Phase 9G — Billing Invoice Optional
[✓] Phase 9H — Sales Receipt, Customer Payment & Customer Deposit
[✓] Phase 9I — Sales Return
[✓] Phase 9J — AR Subsidiary Ledger & Aging
[✓] Phase 9K — Integration Tests & Final Documentation
```

Scope:

```text
[✓] Sales workflow foundation
[✓] Sales quotation
[✓] Sales order
[✓] Customer deposit
[✓] Delivery order
[✓] Proforma invoice
[✓] Sales invoice
[✓] Billing invoice optional
[✓] Sales receipt
[✓] Sales return
[✓] AR subsidiary ledger
[✓] AR aging
[✓] AR reconciliation
[✓] Sales integration tests
[✓] Sales documentation
```

Batasan:

```text
[✓] No frontend sales
[✓] No stock movement
[✓] No COGS journal
[✓] No inventory valuation
```

---

## Phase 10 — Purchase Workflow & Accounts Payable Backend

Status:

```text
[>] Fase aktif berikutnya
```

Subphase:

```text
[ ] Phase 10A — Purchase Workflow Foundation
[ ] Phase 10B — Purchase Request
[ ] Phase 10C — Purchase Order + Vendor Deposit Entry
[ ] Phase 10D — Goods Receipt
[ ] Phase 10E — Vendor Bill / Purchase Invoice
[ ] Phase 10F — Vendor Payment & Vendor Deposit
[ ] Phase 10G — Purchase Return
[ ] Phase 10H — AP Subsidiary Ledger & Aging
[ ] Phase 10I — Integration Tests & Documentation
```

Scope:

```text
[ ] Purchase workflow foundation
[ ] Purchase request
[ ] Purchase order
[ ] Vendor deposit
[ ] Goods receipt
[ ] Vendor bill / purchase invoice
[ ] Vendor payment
[ ] Purchase return
[ ] AP subsidiary ledger
[ ] AP aging
[ ] AP reconciliation
[ ] Purchase integration tests
[ ] Purchase documentation
```

Batasan:

```text
[ ] No frontend purchase
[ ] No stock movement
[ ] No inventory valuation
[ ] No warehouse stock update
[ ] No stock card
[ ] No landed cost
[ ] No FIFO / moving average costing
```

---

## Phase 11 — Cash Bank Backend

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 11A — Cash Bank Foundation
[ ] Phase 11B — Cash In Transaction
[ ] Phase 11C — Cash Out Transaction
[ ] Phase 11D — Bank Transfer
[ ] Phase 11E — Bank Reconciliation Foundation
[ ] Phase 11F — Cash Bank Reports
[ ] Phase 11G — Integration Tests & Documentation
```

Scope:

```text
[ ] Cash bank foundation
[ ] Cash in
[ ] Cash out
[ ] Bank transfer
[ ] Bank reconciliation basic
[ ] Cash bank reports
[ ] Cash bank integration tests
[ ] Cash bank documentation
```

---

## Phase 12 — Inventory Backend

Status:

```text
[✓] Completed
```

Subphase:

```text
[✓] Phase 12A — Inventory Foundation
[✓] Phase 12B — Stock Movement Engine
[✓] Phase 12C — Stock Balance
[✓] Phase 12D — Average Cost / Valuation Foundation
[✓] Phase 12E — Sales & Purchase Stock Integration
[✓] Phase 12F — Stock Adjustment
[✓] Phase 12G — Stock Opname Basic
[✓] Phase 12H — Inventory Reports Backend
[✓] Phase 12I — Integration Tests & Documentation
```

Scope:

```text
[✓] Inventory foundation
[✓] Stock movement engine
[✓] Stock balance
[✓] Average cost / valuation
[✓] Sales stock integration
[✓] Purchase stock integration
[✓] Stock adjustment
[✓] Stock opname
[✓] Inventory reports
[✓] Inventory integration tests
[✓] Inventory documentation
```

---

# Stage 4 — Frontend Application

## Phase 13 — Accounting Frontend MVP

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 13A — Accounting Frontend Foundation
[ ] Phase 13B — Chart of Accounts UI
[ ] Phase 13C — Master Data Accounting UI
[ ] Phase 13D — Journal Entry UI
[ ] Phase 13E — Ledger & Trial Balance UI
[ ] Phase 13F — Financial Statements UI
[ ] Phase 13G — Fiscal Closing UI Refinement
[ ] Phase 13H — Accounting Frontend Tests & Documentation
```

Scope:

```text
[ ] Accounting frontend foundation
[ ] COA UI
[ ] Master data UI
[ ] Journal UI
[ ] Ledger UI
[ ] Trial balance UI
[ ] Financial statement UI
[ ] Closing UI
[ ] Accounting frontend tests
[ ] Accounting frontend documentation
```

---

## Phase 14 — Sales Frontend MVP

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 14A — Sales Frontend Foundation
[ ] Phase 14B — Sales Quotation UI
[ ] Phase 14C — Sales Order UI
[ ] Phase 14D — Delivery Order UI
[ ] Phase 14E — Proforma & Sales Invoice UI
[ ] Phase 14F — Customer Deposit & Sales Receipt UI
[ ] Phase 14G — Sales Return UI
[ ] Phase 14H — AR Ledger & Aging UI
[ ] Phase 14I — Sales Frontend Tests & Documentation
```

Scope:

```text
[ ] Sales frontend foundation
[ ] Quotation UI
[ ] Sales order UI
[ ] Delivery order UI
[ ] Proforma UI
[ ] Sales invoice UI
[ ] Customer deposit UI
[ ] Sales receipt UI
[ ] Sales return UI
[ ] AR ledger UI
[ ] AR aging UI
[ ] Sales frontend tests
[ ] Sales frontend documentation
```

---

## Phase 15 — Purchase Frontend MVP

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 15A — Purchase Frontend Foundation
[ ] Phase 15B — Purchase Request UI
[ ] Phase 15C — Purchase Order UI
[ ] Phase 15D — Goods Receipt UI
[ ] Phase 15E — Vendor Bill UI
[ ] Phase 15F — Vendor Deposit & Vendor Payment UI
[ ] Phase 15G — Purchase Return UI
[ ] Phase 15H — AP Ledger & Aging UI
[ ] Phase 15I — Purchase Frontend Tests & Documentation
```

Scope:

```text
[ ] Purchase frontend foundation
[ ] Purchase request UI
[ ] Purchase order UI
[ ] Goods receipt UI
[ ] Vendor bill UI
[ ] Vendor deposit UI
[ ] Vendor payment UI
[ ] Purchase return UI
[ ] AP ledger UI
[ ] AP aging UI
[ ] Purchase frontend tests
[ ] Purchase frontend documentation
```

---

## Phase 16 — Cash Bank Frontend MVP

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 16A — Cash Bank Frontend Foundation
[ ] Phase 16B — Cash In UI
[ ] Phase 16C — Cash Out UI
[ ] Phase 16D — Bank Transfer UI
[ ] Phase 16E — Bank Reconciliation UI Basic
[ ] Phase 16F — Cash Bank Reports UI
[ ] Phase 16G — Cash Bank Frontend Tests & Documentation
```

Scope:

```text
[ ] Cash bank frontend foundation
[ ] Cash in UI
[ ] Cash out UI
[ ] Bank transfer UI
[ ] Bank reconciliation UI
[ ] Cash bank reports UI
[ ] Cash bank frontend tests
[ ] Cash bank frontend documentation
```

---

## Phase 17 — Inventory Frontend MVP

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 17A — Inventory Frontend Foundation
[ ] Phase 17B — Product Stock & Warehouse Pages
[ ] Phase 17C — Stock Movement Frontend
[ ] Phase 17D — Stock Adjustment Frontend
[ ] Phase 17E — Stock Opname Frontend Basic
[ ] Phase 17F — Inventory Valuation & Stock Card Frontend
[ ] Phase 17G — Inventory Frontend Integration Tests & Documentation
```

Scope:

```text
[ ] Inventory frontend foundation
[ ] Product stock page
[ ] Warehouse stock page
[ ] Stock movement page
[ ] Stock adjustment UI
[ ] Stock opname UI
[ ] Inventory valuation UI
[ ] Stock card UI
[ ] Inventory frontend tests
[ ] Inventory frontend documentation
```

---

# Stage 5 — Advanced, Admin, Export, Deployment

## Phase 18 — Role, Permission & User Management Advanced

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 18A — User Management Foundation
[ ] Phase 18B — Role Management
[ ] Phase 18C — Permission Management
[ ] Phase 18D — User Invitation & Access Workflow
[ ] Phase 18E — Role & Permission Audit
[ ] Phase 18F — Integration Tests & Documentation
```

Scope:

```text
[ ] User management
[ ] Role management
[ ] Permission management
[ ] User invitation
[ ] Access workflow
[ ] Role audit
[ ] Permission audit
[ ] Tests and documentation
```

---

## Phase 19 — Reports Advanced, Export PDF/Excel, Print View

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 19A — Sales Reports
[ ] Phase 19B — Purchase Reports
[ ] Phase 19C — Receivable & Payable Reports
[ ] Phase 19D — Inventory Reports
[ ] Phase 19E — Export & Print System
[ ] Phase 19F — Reports Integration Tests
```

Scope:

```text
[ ] Sales reports
[ ] Purchase reports
[ ] AR/AP reports
[ ] Inventory reports
[ ] PDF export
[ ] Excel export
[ ] CSV export
[ ] Print view
[ ] Report tests
```

---

## Phase 20 — Audit Log Advanced UI

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 20A — Audit Viewer Foundation
[ ] Phase 20B — Audit Filters & Search
[ ] Phase 20C — Transaction Revision Viewer
[ ] Phase 20D — Security & System Audit
[ ] Phase 20E — Audit Export & Print
[ ] Phase 20F — Integration Tests & Documentation
```

Scope:

```text
[ ] Audit viewer
[ ] Audit filters
[ ] Audit search
[ ] Revision viewer
[ ] Security audit
[ ] System audit
[ ] Audit export
[ ] Audit print
[ ] Tests and documentation
```

---

## Phase 21 — Backup & Restore Tools

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 21A — Backup Foundation
[ ] Phase 21B — Central & Tenant Backup Commands
[ ] Phase 21C — Restore Tools
[ ] Phase 21D — Scheduled Backup Automation
[ ] Phase 21E — Backup Management UI Basic
[ ] Phase 21F — Integration Tests & Documentation
```

Scope:

```text
[ ] Backup foundation
[ ] Central database backup
[ ] Tenant database backup
[ ] Restore tools
[ ] Scheduled backup
[ ] Backup management UI
[ ] Tests and documentation
```

---

## Phase 22 — Advanced Accounting & Operational Modules

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 22A — Multi Currency Foundation
[ ] Phase 22B — Advanced Tax
[ ] Phase 22C — Credit Note & Debit Note
[ ] Phase 22D — Advanced Payment Allocation
[ ] Phase 22E — Branch / Cost Center / Location
[ ] Phase 22F — External Integration & Import
[ ] Phase 22G — Integration Tests & Documentation
```

Scope:

```text
[ ] Multi currency
[ ] Advanced tax
[ ] Credit note
[ ] Debit note
[ ] Advanced payment allocation
[ ] Branch
[ ] Cost center
[ ] Location
[ ] External integration
[ ] Import tools
[ ] Tests and documentation
```

---

## Phase 23 — Fixed Asset

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 23A — Fixed Asset Foundation
[ ] Phase 23B — Asset Acquisition
[ ] Phase 23C — Depreciation Engine
[ ] Phase 23D — Asset Disposal & Adjustment
[ ] Phase 23E — Fixed Asset Reports
[ ] Phase 23F — Integration Tests & Documentation
```

Scope:

```text
[ ] Fixed asset foundation
[ ] Asset acquisition
[ ] Depreciation engine
[ ] Asset disposal
[ ] Asset adjustment
[ ] Fixed asset reports
[ ] Tests and documentation
```

---

## Phase 24 — Testing Hardening

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 24A — Backend Test Coverage Review
[ ] Phase 24B — Tenant Isolation Regression Tests
[ ] Phase 24C — Accounting Accuracy Regression Tests
[ ] Phase 24D — API Contract Tests
[ ] Phase 24E — Frontend Smoke Tests
[ ] Phase 24F — Performance & Data Volume Tests
[ ] Phase 24G — Final QA Documentation
```

Scope:

```text
[ ] Backend coverage review
[ ] Tenant isolation regression
[ ] Accounting accuracy regression
[ ] API contract tests
[ ] Frontend smoke tests
[ ] Performance tests
[ ] Data volume tests
[ ] Final QA documentation
```

---

## Phase 25 — Deployment to VPS & Production Hardening

Status:

```text
[ ] Belum dimulai
```

Subphase:

```text
[ ] Phase 25A — VPS Preparation
[ ] Phase 25B — Backend Deployment
[ ] Phase 25C — Frontend Deployment
[ ] Phase 25D — Domain, SSL, and Reverse Proxy
[ ] Phase 25E — Environment & Secret Management
[ ] Phase 25F — Backup, Restore, and Monitoring Setup
[ ] Phase 25G — Production Security Hardening
[ ] Phase 25H — Deployment Documentation
```

Scope:

```text
[ ] VPS preparation
[ ] Backend deployment
[ ] Frontend deployment
[ ] Domain setup
[ ] SSL setup
[ ] Reverse proxy
[ ] Environment management
[ ] Secret management
[ ] Backup setup
[ ] Restore setup
[ ] Monitoring setup
[ ] Production security
[ ] Deployment documentation
```

---

# Next Active Phase

```text
Phase 10A — Purchase Workflow Foundation
```

Scope Phase 10A:

```text
[ ] Purchase workflow foundation
[ ] Purchase permissions
[ ] Purchase document numbering
[ ] Purchase calculation helper
[ ] Purchase source chain helper
[ ] Purchase documentation foundation
```

Batasan Phase 10A:

```text
[ ] No frontend
[ ] No stock movement
[ ] No inventory valuation
[ ] No full purchase document CRUD yet
[ ] No vendor bill posting yet
[ ] No AP ledger yet
```
