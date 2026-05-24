TASK TITLE:
Scan Laravel Backend API Endpoints and Align Frontend Sidebar Menu with Real Backend Routes

PROJECT:
TenantAppDevelopment / tenantApp

CONTEXT:
Project ini adalah aplikasi akuntansi multi-tenant dengan:
- Backend: Laravel API
- Frontend: Vue 3 + Vite + TypeScript
- State: Pinia
- Router: Vue Router
- HTTP Client: Axios
- UI shell: AppShell + Sidebar + Floating Submenu + Virtual Tabs
- Backend memakai auth:sanctum + company.access
- Semua request tenant wajib membawa:
    - Authorization: Bearer TOKEN
    - X-Company-ID: ACTIVE_COMPANY_ID

MASALAH:
Sidebar/menu dashboard frontend saat ini tidak sesuai dengan endpoint/API yang benar-benar tersedia di backend Laravel.

Contoh:
- Backend mungkin sudah punya endpoint Sales Order, Sales Invoice, Purchase Order, Vendor Bill, Cash Bank, Inventory, Reports, dan lain-lain.
- Tetapi sidebar frontend masih menampilkan menu yang tidak sinkron, belum lengkap, salah URL, atau belum sesuai permission/backend route.
- Akibatnya user melihat menu yang tidak sesuai dengan kemampuan backend.

TUJUAN:
Lakukan scan menyeluruh terhadap route/API backend Laravel, lalu petakan hasilnya menjadi struktur sidebar frontend yang benar, konsisten, permission-aware, dan sesuai endpoint backend.

HASIL AKHIR YANG DIHARAPKAN:
1. Codex membaca route backend Laravel.
2. Codex membuat daftar endpoint backend yang benar-benar tersedia.
3. Codex mengelompokkan endpoint ke modul ERP:
    - Dashboard
    - Accounting
    - Master Data
    - Sales & AR
    - Purchase & AP
    - Cash & Bank
    - Inventory
    - Reports
    - Settings
    - Admin / User Management jika endpoint tersedia
4. Codex menyesuaikan sidebar frontend berdasarkan endpoint yang ditemukan.
5. Menu yang tidak punya endpoint/page backend/frontend jelas tidak boleh ditampilkan sebagai menu aktif.
6. Sidebar harus tetap support permission.
7. Sidebar harus tetap terhubung dengan virtual tabs.
8. Buat dokumentasi hasil mapping endpoint ke menu.

IMPORTANT RULES:
- Jangan mengubah backend kecuali benar-benar hanya perlu membaca file.
- Jangan membuat endpoint backend baru.
- Jangan membuat API dummy.
- Jangan membuat menu berdasarkan imajinasi.
- Jangan membuat menu Sales/Purchase/Cash Bank/Inventory jika backend endpoint belum ada.
- Jangan menghapus desain AppShell/Sidebar yang sudah ada.
- Jangan mengubah konsep virtual tabs.
- Jangan mengubah API client Axios.
- Jangan mengubah auth flow.
- Jangan mengubah tenant flow.
- Jangan menghapus permission guard.
- Jangan memakai data hardcoded yang tidak berasal dari scan backend.
- Jangan membuat page besar baru di task ini kecuali placeholder ringan diperlukan agar route frontend tidak blank.
- Fokus task ini adalah API route scan + sidebar menu alignment.

BACKEND FILES TO READ:
Baca file backend berikut terlebih dahulu:

1. Route utama:
- backend/routes/api.php
- backend/routes/web.php jika ada route non-api yang relevan

2. Middleware:
- backend/bootstrap/app.php
- backend/app/Http/Middleware/EnsureCompanyAccess.php
- backend/app/Http/Middleware/EnsurePermission.php

3. Permission config:
- backend/config/permissions.php

4. Document numbering / module config jika ada:
- backend/config/document_numbers.php
- backend/config/transaction_lifecycle.php
- backend/config/api_errors.php

5. Controller folders:
- backend/app/Http/Controllers/Api
- backend/app/Http/Controllers/Api/MasterData
- backend/app/Http/Controllers/Api/Accounting
- backend/app/Http/Controllers/Api/Reports
- backend/app/Http/Controllers/Api/Sales
- backend/app/Http/Controllers/Api/Purchase
- backend/app/Http/Controllers/Api/CashBank
- backend/app/Http/Controllers/Api/Inventory
- backend/app/Http/Controllers/Api/Settings
- backend/app/Http/Controllers/Api/Auth
- backend/app/Http/Controllers/Api/Companies

6. Models tenant jika diperlukan untuk memahami modul:
- backend/app/Models/Tenant

FRONTEND FILES TO READ:
Baca file frontend berikut:

1. Router:
- frontend-vue/src/router/index.ts
- frontend-vue/src/router/routes.ts jika ada
- frontend-vue/src/router/modules jika ada

2. Sidebar/layout:
- frontend-vue/src/layouts/AppShell.vue
- frontend-vue/src/components/layout/Sidebar.vue
- frontend-vue/src/components/layout/FloatingSubmenu.vue
- frontend-vue/src/components/layout/Topbar.vue
- frontend-vue/src/components/layout/PrimaryVirtualTabs.vue
- frontend-vue/src/components/layout/SecondaryVirtualTabs.vue

3. Navigation config:
- frontend-vue/src/components/navigation
- frontend-vue/src/config/navigation.ts jika ada
- frontend-vue/src/navigation jika ada
- frontend-vue/src/stores/workspace.store.ts
- frontend-vue/src/stores/permissions.store.ts
- frontend-vue/src/stores/auth.store.ts
- frontend-vue/src/stores/company.store.ts

4. API service:
- frontend-vue/src/services/api.ts
- frontend-vue/src/services/*.service.ts

5. Existing pages:
- frontend-vue/src/pages

Jika nama folder frontend berbeda, cari folder Vue yang sedang digunakan dan sesuaikan.

STEP 1 — SCAN BACKEND ROUTES:
Lakukan scan route dari backend Laravel.

Gunakan:
- backend/routes/api.php sebagai sumber utama
- php artisan route:list jika environment memungkinkan

Jika menjalankan command bisa:
cd backend
php artisan route:list --path=api

Jika command gagal, tetap lanjut dengan membaca routes/api.php secara manual.

Catat informasi untuk setiap endpoint:
- HTTP method
- URI
- Controller
- Action
- Middleware
- Permission middleware jika ada
- Module
- Nama resource
- Apakah endpoint list/index tersedia
- Apakah endpoint create/store tersedia
- Apakah endpoint show/detail tersedia
- Apakah endpoint update tersedia
- Apakah endpoint action tersedia seperti post, approve, void, cancel, close, confirm, receive, pay, reconcile, etc.

Output scan internal harus dipakai untuk membuat mapping menu.

STEP 2 — GROUP ENDPOINTS BY MODULE:
Kelompokkan endpoint backend menjadi struktur seperti ini:

A. Dashboard
- /api/health
- /api/tenant-context-test
- summary endpoint jika ada

B. Authentication
- /api/auth/login
- /api/auth/logout
- /api/auth/me
- /api/auth/permissions
  Catatan:
  Auth endpoint tidak harus masuk sidebar kecuali ada halaman user/profile.

C. Company / Tenant
- /api/companies
- /api/companies/select
  Catatan:
  Company selection tidak perlu masuk sidebar sebagai menu utama jika sudah ada company switcher.

D. Accounting
Contoh endpoint:
- journals
- journal entries
- general ledger
- trial balance
- profit loss
- balance sheet
- cash flow
- financial summary
- fiscal year status
- fiscal closing
- period locks

E. Master Data
Contoh endpoint:
- chart-of-accounts
- contacts
- units
- product-categories
- products
- warehouses
- account-mappings
- departments
- projects

F. Sales & AR
Contoh endpoint:
- sales quotations
- sales orders
- delivery orders
- proforma invoices
- sales invoices
- billing invoices
- sales receipts
- customer deposits
- sales returns
- AR subsidiary ledger
- AR aging
- AR reconciliation

G. Purchase & AP
Contoh endpoint:
- purchase requests
- purchase orders
- goods receipts
- vendor bills
- vendor payments
- vendor deposits
- purchase returns
- AP subsidiary ledger
- AP aging
- AP reconciliation

H. Cash & Bank
Contoh endpoint:
- cash accounts
- cash in
- cash out
- bank transfers
- bank reconciliation
- cash bank reports

I. Inventory
Contoh endpoint:
- stock balances
- stock movements
- stock adjustments
- stock opname
- stock card
- inventory valuation
- warehouse stock

J. Reports
Contoh endpoint:
- accounting reports
- sales reports
- purchase reports
- AR/AP reports
- inventory reports
- export/print endpoint jika ada

K. Settings
Contoh endpoint:
- company settings
- accounting settings
- module settings
- numbering settings
- account mapping settings

L. Admin / User Management
Hanya tampilkan jika backend endpoint benar-benar ada:
- users
- roles
- permissions
- invitations
- company users

STEP 3 — CREATE API ROUTE MAP DOCUMENT:
Buat dokumentasi baru:

docs/frontend-api-sidebar-map.md

Isi minimal:

# Frontend API Sidebar Map

## Backend Route Scan Summary
Tabel:
| Module | Method | Endpoint | Controller | Permission | Sidebar Menu Candidate | Status |

## Sidebar Mapping
Tabel:
| Sidebar Group | Menu Label | Frontend Route | Backend Endpoint | Permission | Notes |

## Hidden / Not Displayed Endpoints
Tabel:
| Endpoint | Reason |
Contoh reason:
- auth-only endpoint
- action endpoint, not list page
- internal endpoint
- no frontend page needed
- API exists but menu should be nested action

## Missing Frontend Pages
Tabel:
| Menu | Backend Endpoint | Suggested Frontend Route | Needed Page |

## Menu Not Supported By Backend
Tabel:
| Current Sidebar Menu | Reason to Remove/Hide |

STEP 4 — DEFINE SIDEBAR STRUCTURE FROM REAL ENDPOINTS:
Buat/update file navigation frontend.

Rekomendasi file:
frontend-vue/src/navigation/sidebar.ts

Atau jika sudah ada:
frontend-vue/src/config/navigation.ts
frontend-vue/src/components/navigation/navigation.ts

Struktur yang diharapkan:

export type SidebarMenuItem = {
key: string
label: string
route: string
icon?: string
permission?: string
endpoint?: string
module: string
openAsPrimaryTab?: boolean
children?: SidebarMenuItem[]
}

export type SidebarMenuGroup = {
key: string
label: string
icon?: string
children: SidebarMenuItem[]
}

Menu harus dibuat dari backend route yang tersedia.

Contoh struktur:

Dashboard:
- Dashboard

Master Data:
- Chart of Accounts
- Contacts
- Products
- Units
- Warehouses
- Product Categories
- Account Mappings
- Departments
- Projects

Accounting:
- Journal Entries
- General Ledger
- Trial Balance
- Profit & Loss
- Balance Sheet
- Cash Flow
- Fiscal Closing
- Period Locks

Sales & AR:
- Sales Quotations
- Sales Orders
- Delivery Orders
- Proforma Invoices
- Sales Invoices
- Billing Invoices
- Sales Receipts
- Customer Deposits
- Sales Returns
- AR Aging
- AR Ledger

Purchase & AP:
- Purchase Requests
- Purchase Orders
- Goods Receipts
- Vendor Bills
- Vendor Payments
- Vendor Deposits
- Purchase Returns
- AP Aging
- AP Ledger

Cash & Bank:
Tampilkan hanya jika endpoint backend sudah ada.

Inventory:
Tampilkan hanya jika endpoint backend sudah ada.

Reports:
Tampilkan hanya jika endpoint backend sudah ada.

Settings:
- Company Settings
- Accounting Settings
- Module Settings
  Tampilkan hanya jika endpoint backend/page tersedia.

IMPORTANT:
Jika endpoint belum ada, jangan tampilkan menu tersebut.
Jika endpoint ada tapi page frontend belum ada, boleh tampilkan sebagai disabled item atau hidden, tetapi dokumentasikan di docs/frontend-api-sidebar-map.md.
Preferensi:
- Untuk MVP, hide menu yang belum punya frontend page.
- Jangan biarkan menu clickable menuju halaman 404.

STEP 5 — PERMISSION-AWARE MENU:
Sidebar harus filter berdasarkan permission user.

Gunakan permission dari existing permission store:
- permissions.store.ts
- auth.store.ts
- atau helper usePermission jika sudah ada

Rules:
1. Jika menu punya permission dan user tidak punya permission, hide menu.
2. Jika group tidak punya child visible, hide group.
3. Dashboard selalu visible.
4. Settings hanya visible jika ada child visible.
5. Jangan hardcode role owner/admin untuk frontend visibility kecuali memang pattern existing begitu.
6. Permission key harus cocok dengan backend/config/permissions.php.
7. Jika endpoint tidak punya permission middleware tapi butuh auth/company access, menu boleh tetap visible untuk user authenticated.

STEP 6 — VIRTUAL TABS INTEGRATION:
Sidebar menu item tidak boleh hanya router.push biasa jika workspace virtual tabs sudah digunakan.

Ketika menu diklik:
1. Buka primary virtual tab sesuai menu.
2. Set active primary tab.
3. Pastikan secondary list tab otomatis tersedia.
4. Navigate/render halaman list sesuai route.
5. Jangan reset tab lain.
6. Jangan hilangkan state form lain.
7. Jika primary tab sudah terbuka, aktifkan tab itu, jangan duplikasi.

Expected behavior:
- Klik Chart of Accounts:
    - primary tab "Chart of Accounts" terbuka
    - secondary list tab icon-only aktif
- Klik Sales Order:
    - primary tab "Sales Orders" terbuka
    - secondary list tab icon-only aktif
- Klik Journal Entries:
    - primary tab "Journal Entries" terbuka
    - state terakhir Journal tetap dipertahankan jika sebelumnya ada form terbuka

STEP 7 — FRONTEND ROUTE ALIGNMENT:
Pastikan route frontend konsisten dengan sidebar.

Contoh route:
- /dashboard
- /master-data/chart-of-accounts
- /master-data/contacts
- /master-data/products
- /accounting/journals
- /accounting/general-ledger
- /accounting/trial-balance
- /accounting/profit-loss
- /accounting/balance-sheet
- /accounting/cash-flow
- /accounting/fiscal-closing
- /sales/quotations
- /sales/orders
- /sales/delivery-orders
- /sales/proforma-invoices
- /sales/invoices
- /sales/receipts
- /sales/customer-deposits
- /sales/returns
- /sales/ar-aging
- /purchase/requests
- /purchase/orders
- /purchase/goods-receipts
- /purchase/vendor-bills
- /purchase/payments
- /purchase/vendor-deposits
- /purchase/returns
- /purchase/ap-aging
- /cash-bank
- /inventory
- /settings/company

Tapi final route harus mengikuti endpoint/backend yang benar-benar ditemukan.
Jangan membuat route untuk modul yang endpoint/page belum ada, kecuali placeholder sengaja dibuat dan didokumentasikan.

STEP 8 — OPTIONAL PLACEHOLDER PAGE RULE:
Jika backend endpoint sudah ada tetapi frontend page belum ada, boleh buat placeholder ringan agar sidebar tidak menuju blank/404.

Placeholder page harus:
- Menampilkan nama modul
- Menampilkan endpoint backend yang akan dipakai
- Menampilkan status "Frontend page belum diimplementasi"
- Tidak membuat form/list palsu kompleks
- Tidak melakukan API call berat
- Tetap memakai AppShell

Contoh placeholder:
"Sales Orders"
"Backend endpoint tersedia: GET /api/sales/orders"
"Halaman frontend list akan dibuat pada fase frontend terkait."

Tapi jika terlalu banyak placeholder, lebih baik hide menu dulu dan dokumentasikan sebagai Missing Frontend Pages.

STEP 9 — REMOVE / HIDE INVALID MENU:
Cari menu sidebar yang sekarang tidak cocok backend.

Untuk setiap menu lama:
- Jika endpoint backend tidak ada: hide/remove.
- Jika permission tidak ada: sesuaikan permission atau dokumentasikan.
- Jika endpoint adalah action endpoint bukan list page: jangan jadikan menu utama.
- Jika frontend route belum ada: hide atau buat placeholder ringan sesuai rule.

STEP 10 — UPDATE SIDEBAR UI:
Sidebar tetap mengikuti desain existing:
- Full sidebar mode
- Collapsed/minimal sidebar mode
- Floating submenu panel
- Active state
- Group/module state
- Permission-aware rendering
- No broken click
- No overlay blocking sidebar
- No hardcoded menu random

Jika struktur menu berubah, pastikan:
- Full sidebar menampilkan group dan submenu.
- Collapsed sidebar menampilkan icon group.
- Floating submenu menampilkan child menu.
- Klik child menu membuka virtual tab.
- Active menu terlihat jelas.

STEP 11 — API SERVICE ALIGNMENT:
Jangan membuat semua API service sekarang kecuali sangat diperlukan.

Tetapi jika sudah ada service lama yang endpoint-nya salah, update path endpoint agar sesuai backend scan.

Contoh:
Jika frontend memakai:
GET /api/sales-order

Tapi backend benar:
GET /api/sales/orders

Maka sesuaikan service menjadi:
/sales/orders

Tetap gunakan Axios instance existing agar Bearer token dan X-Company-ID otomatis terkirim.

STEP 12 — TESTING:
Jalankan jika environment memungkinkan:

Frontend:
cd frontend-vue
npm run typecheck
npm run lint
npm run build
npm run dev

Backend:
cd backend
php artisan route:list --path=api

Manual test:
1. Login.
2. Pilih company.
3. Buka dashboard.
4. Sidebar tampil sesuai endpoint backend.
5. Menu tanpa permission tidak tampil.
6. Group kosong tidak tampil.
7. Klik Chart of Accounts membuka primary virtual tab.
8. Klik Journal Entries membuka primary virtual tab.
9. Klik Sales Order hanya tampil jika endpoint backend ada.
10. Klik Purchase Order hanya tampil jika endpoint backend ada.
11. Tidak ada menu menuju 404.
12. Collapsed sidebar floating submenu tetap benar.
13. Virtual tabs tidak reset saat pindah menu.
14. Logout tetap berjalan.

STEP 13 — ACCEPTANCE CRITERIA:
Task selesai jika:

[ ] Backend routes sudah discan dari routes/api.php dan/atau route:list.
[ ] docs/frontend-api-sidebar-map.md dibuat.
[ ] Sidebar menu hanya menampilkan modul yang didukung backend endpoint/page.
[ ] Menu dikelompokkan ke ERP module yang benar.
[ ] Permission key menu cocok dengan backend/config/permissions.php.
[ ] Group kosong otomatis hidden.
[ ] Menu lama yang tidak punya backend endpoint dihapus/hide.
[ ] Sidebar full mode tetap berjalan.
[ ] Sidebar collapsed mode tetap berjalan.
[ ] Floating submenu tetap berjalan.
[ ] Klik menu membuka primary virtual tab.
[ ] Secondary list tab otomatis tersedia.
[ ] Tidak ada menu clickable menuju route 404.
[ ] Auth, company, permission, dan API client existing tidak rusak.
[ ] Tidak ada perubahan backend API.
[ ] Tidak ada endpoint dummy.
[ ] Tidak ada frontend business form besar baru.
[ ] Build/typecheck/lint dijalankan jika environment memungkinkan.
[ ] Final summary menjelaskan endpoint apa saja yang ditemukan dan menu apa saja yang dibuat/hide.

EXPECTED FINAL SUMMARY FROM CODEX:
Berikan summary dengan format:

1. Backend API scanned
- route files read
- command run
- total endpoint found if available

2. Sidebar groups created/updated
- Dashboard
- Master Data
- Accounting
- Sales & AR
- Purchase & AP
- Cash & Bank
- Inventorys
- Reports
- Settings

3. Menus hidden/removed
- list menu yang di-hide karena endpoint/page belum ada

4. Files created
- list

5. Files changed
- list

6. Tests/commands
- npm run typecheck
- npm run lint
- npm run build
- php artisan route:list --path=api

7. Notes
- no backend endpoint changed
- no API dummy created
- permission-aware menu preserved
- virtual tabs integration preserved

COMMIT MESSAGE:
align frontend sidebar with backend api routes