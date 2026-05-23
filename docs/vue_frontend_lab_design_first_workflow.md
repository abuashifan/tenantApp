# Vue Frontend Lab — Design-First Workflow

## Prinsip Utama

Frontend VueJS untuk project TenantAppDevelopment harus dibuat dengan pendekatan **design-first**, bukan langsung coding.

Codex **tidak boleh** membuat sendiri layout dashboard, sidebar, form, virtual tabs, warna, spacing, komponen UI, atau pola interaksi sebelum desain disetujui.

Design harus dibuat dan divalidasi dulu di canvas/prototype. Setelah desain final, baru Codex boleh mengimplementasikan desain tersebut ke Vue.

---

# Aturan Wajib untuk Codex

## 1. Codex Tidak Boleh Mendesain Sendiri

Codex tidak boleh:

```text
[ ] Membuat layout dashboard sendiri
[ ] Membuat desain sidebar sendiri
[ ] Membuat desain form sendiri
[ ] Membuat desain table sendiri
[ ] Membuat warna sendiri
[ ] Membuat typography sendiri
[ ] Membuat virtual tabs pattern sendiri
[ ] Membuat UX flow sendiri tanpa desain final
[ ] Mengubah konsep UI dari canvas
[ ] Menambahkan komponen visual besar yang tidak ada di desain
```

Codex hanya boleh:

```text
[ ] Membaca design spec yang sudah disetujui
[ ] Mengubah desain menjadi komponen Vue
[ ] Menjaga layout sesuai prototype
[ ] Menjaga spacing, warna, typography sesuai design token
[ ] Menjaga behavior sesuai interaction notes
[ ] Membuat komponen reusable sesuai desain
[ ] Menulis kode yang rapi dan scalable
```

---

# Workflow Resmi

## Step 1 — Design Exploration di Canvas

Sebelum Codex coding, desain dibuat dulu untuk:

```text
[ ] Login page
[ ] Select company page
[ ] Main AppShell
[ ] Sidebar full mode
[ ] Sidebar collapsed mode
[ ] Floating submenu
[ ] Topbar
[ ] Primary virtual tabs
[ ] Secondary virtual tabs
[ ] Dashboard layout
[ ] Journal entry form
[ ] Reusable table layout
[ ] Reusable form layout
[ ] Modal/dialog pattern
[ ] Mobile layout
```

Output dari tahap ini:

```text
[ ] Visual prototype
[ ] Design tokens
[ ] Component list
[ ] Interaction rules
[ ] Responsive behavior
[ ] UI acceptance criteria
```

---

## Step 2 — Design Spec Lock

Setelah desain disetujui, buat dokumen:

```text
docs/frontend-vue-design-system.md
```

Isi minimal:

```text
[ ] Color palette
[ ] Typography scale
[ ] Border radius
[ ] Shadow system
[ ] Spacing scale
[ ] Layout grid
[ ] Sidebar rules
[ ] Virtual tabs rules
[ ] Form pattern
[ ] Table pattern
[ ] Button pattern
[ ] Badge/status pattern
[ ] Modal/dialog pattern
[ ] Empty/loading/error states
[ ] Mobile behavior
```

---

## Step 3 — Codex Implementasi Design System

Codex baru boleh mulai implementasi setelah design spec tersedia.

Scope awal:

```text
[ ] Setup Vue project
[ ] Install TailwindCSS
[ ] Install Axios
[ ] Install Pinia
[ ] Install Vue Router
[ ] Install TanStack Table
[ ] Install VeeValidate + Zod
[ ] Buat design tokens di Tailwind/CSS variables
[ ] Buat base UI components sesuai desain
```

Codex tidak boleh membuat halaman bisnis besar di tahap ini.

---

## Step 4 — Codex Implementasi Layout Shell

Setelah design system selesai, Codex implementasi:

```text
[ ] AuthLayout
[ ] AppShell
[ ] Sidebar
[ ] FloatingSubmenu
[ ] Topbar
[ ] UserMenu
[ ] CompanySwitcher
[ ] PrimaryTabs
[ ] SecondaryTabs
[ ] ContentArea
```

Syarat:

```text
[ ] Harus sesuai desain canvas
[ ] Tidak boleh mengubah warna/spacing sendiri
[ ] Tidak boleh mengganti pola interaksi
[ ] Tidak boleh menambahkan dashboard widget sendiri
```

---

## Step 5 — Codex Implementasi Form Prototype

Form pertama untuk pembanding:

```text
Journal Entry Form Prototype
```

Scope:

```text
[ ] Header form
[ ] Date input
[ ] Journal number field
[ ] Description field
[ ] Dynamic journal lines
[ ] Account selector placeholder/API ready
[ ] Department selector placeholder/API ready
[ ] Project selector placeholder/API ready
[ ] Debit/credit input
[ ] Total debit
[ ] Total credit
[ ] Balance indicator
[ ] Draft state per tab
[ ] Dirty state
```

Codex harus mengikuti form design canvas.

---

# Library Decision

## Core Stack

```text
Vue 3 latest
Vite latest
TypeScript
Vue Router
Pinia
TailwindCSS
Axios
TanStack Table
VeeValidate
Zod
```

## Pembagian Fungsi

```text
Axios          = HTTP client ke Laravel API
TanStack Table = Data table reusable
VeeValidate   = Form handling utama
Zod           = Schema validation
Pinia         = Auth, company, permission, workspace, virtual tabs, draft state
Vue Router    = Routing halaman
TailwindCSS   = Styling sesuai design token
```

---

# Design System Modules

## 1. Layout Components

```text
AppShell
AuthLayout
Sidebar
FloatingSubmenu
Topbar
UserMenu
CompanySwitcher
ContentContainer
```

## 2. Navigation Components

```text
PrimaryVirtualTabs
SecondaryVirtualTabs
SidebarMenuItem
SidebarSubmenuCard
Breadcrumb
```

## 3. Data Display Components

```text
DataTable
StatusBadge
AmountDisplay
DateDisplay
EmptyState
LoadingState
ErrorState
```

## 4. Form Components

```text
TextInput
NumberInput
CurrencyInput
DateInput
SelectInput
SearchableSelect
TextareaInput
CheckboxInput
FormSection
FormActions
FormErrorSummary
```

## 5. Dialog Components

```text
ConfirmDialog
UnsavedChangesDialog
DrawerPanel
ModalPanel
```

---

# Codex Prompt Guardrail

Gunakan prompt ini setiap kali meminta Codex implementasi frontend Vue:

```text
IMPORTANT DESIGN-FIRST RULE:
Do not invent UI design.
Do not redesign layout.
Do not create dashboard/sidebar/form/table styles by yourself.
You must implement only the approved design from the canvas/design spec.

Before coding, read:
- docs/frontend-vue-design-system.md
- docs/frontend-vue-interaction-rules.md if exists
- the specific phase prompt

If a layout, component, color, spacing, or interaction is not specified, do not invent a new one.
Use minimal placeholder and add TODO comment asking for design clarification.

The goal is implementation fidelity, not creative redesign.
```

---

# Acceptance Criteria Global

Codex implementation dianggap valid jika:

```text
[ ] Layout sama dengan desain canvas
[ ] Warna sesuai design token
[ ] Sidebar behavior sesuai interaction rule
[ ] Virtual tabs behavior sesuai design rule
[ ] Form spacing sesuai prototype
[ ] Table layout sesuai prototype
[ ] Mobile behavior tidak merusak desain
[ ] Tidak ada komponen UI besar yang dibuat tanpa desain
[ ] Tidak ada dashboard widget karangan Codex
[ ] Tidak ada perubahan backend
[ ] API contract Laravel tetap sama
```

---

# Catatan Penting

Vue frontend ini dimulai sebagai **lab pembanding yang serius**, tetapi tidak dibatasi hanya sebagai eksperimen.

Jika setelah proses desain, prototype, uji performa, uji mobile, dan evaluasi developer experience hasilnya Vue terbukti lebih cocok daripada Next.js untuk kebutuhan aplikasi akuntansi ini, maka Vue dapat dipilih menjadi **frontend utama** project TenantAppDevelopment.

Backend tetap Laravel API:

```text
Laravel API
Authorization Bearer token
X-Company-ID
Tenant database per company
```

Tujuan awal Vue frontend:

```text
[ ] Membandingkan pengalaman development dengan Next.js
[ ] Menguji performa form dan table besar
[ ] Menguji virtual tabs dan draft state
[ ] Menguji akses mobile
[ ] Menentukan apakah Vue lebih cocok menjadi frontend utama
```

Keputusan final frontend utama akan diambil setelah hasil evaluasi teknis, bukan berdasarkan asumsi awal.

