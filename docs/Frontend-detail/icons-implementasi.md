TASK:
Implement varied submenu icons for ERP sidebar, floating submenu panel, and submenu cards.

PROJECT CONTEXT:
Repository: abuashifan/tenantApp
Frontend path: frontend/
Stack:

- Next.js
- React
- TypeScript
- TailwindCSS
- Existing ERP layout uses AppShell, Sidebar, FloatingSubmenuPanel, Primary/Secondary Virtual Tabs
- Current icon package target: lucide-react

GOAL:
Saat submenu ditampilkan, baik di:

1. inline submenu pada full sidebar
2. floating submenu panel pada minimal sidebar
3. submenu card grid / module landing page

setiap submenu harus memakai icon berbeda yang sesuai dengan judul/menu-nya.

Jangan lagi memakai icon module utama yang sama untuk semua submenu dalam satu module.

CONTOH MASALAH YANG HARUS DIPERBAIKI:
Jika user membuka module "Sales & AR", sebelumnya semua submenu seperti:

- Sales Quotations
- Sales Orders
- Delivery Orders
- Sales Invoices
- Customer Deposits
- Sales Receipts
- Sales Returns
- AR Aging

masih memakai icon Sales & AR yang sama.

Setelah task ini, setiap submenu harus punya icon berbeda dan relevan.

DEPENDENCY:
Pastikan package berikut tersedia:

npm install lucide-react

Jika `lucide-react` sudah ada di package.json, jangan install ulang dan jangan duplikasi dependency.

IMPORTANT IMPORT RULE:
Import semua icon lucide-react hanya sekali dalam satu import block.
Jangan duplicate import identifier.

Contoh benar:

import {
Activity,
ArrowLeftRight,
Banknote,
BarChart3,
BookOpen,
Boxes,
Building2,
CalendarDays,
ClipboardList,
Clock3,
CreditCard,
FileBarChart,
FileCheck2,
FileInput,
FileLock2,
FileText,
FolderKanban,
HandCoins,
Landmark,
Layers,
ListTree,
NotebookPen,
PackageSearch,
ReceiptText,
RotateCcw,
Scale,
Settings,
ShieldCheck,
ShoppingBag,
SlidersHorizontal,
Tags,
TrendingUp,
Truck,
Users,
Warehouse,
} from "lucide-react";

Contoh salah:

- import CalendarDays dua kali
- import icon yang sama di import block berbeda
- import semua icon dengan wildcard jika tidak diperlukan
- membuat variable dengan nama yang sama seperti imported icon

FILES TO CHECK / MODIFY:
Prioritaskan file layout/navigation yang sudah ada, misalnya:

- frontend/components/layout/navigation.ts
- frontend/components/layout/Sidebar.tsx
- frontend/components/layout/FloatingSubmenuPanel.tsx
- frontend/components/layout/AppShell.tsx
- frontend/components/layout/types.ts

Jika project saat ini masih menyimpan navigation di AppShell, boleh refactor kecil ke:

- frontend/components/layout/navigation.ts

Tapi jangan refactor besar di luar scope.

DO NOT:

- Jangan ubah backend
- Jangan ubah API contract
- Jangan ubah route path
- Jangan ubah permission filtering
- Jangan buat page baru
- Jangan buat form baru
- Jangan ubah virtual tabs behavior
- Jangan hapus auth guard
- Jangan hapus X-Company-ID flow
- Jangan menambah icon package selain lucide-react
- Jangan duplicate import icon

IMPLEMENTATION REQUIREMENT:

1. Buat helper function:

getSubmenuIcon(itemKey: string, label: string): LucideIcon

Function ini harus menerima:

- itemKey
- label

Lalu mengembalikan icon lucide-react yang sesuai.

2. Import type LucideIcon jika TypeScript membutuhkan:

import type { LucideIcon } from "lucide-react";

3. Semua submenu item boleh tetap punya data seperti:

{
key: "journal-entries",
label: "Journal Entries",
href: "/accounting/journal-entries",
permission: "journal.entries.view"
}

Tidak wajib menambahkan `icon` langsung ke setiap item jika helper function sudah cukup.

4. Jika lebih rapi, boleh tambahkan icon langsung ke normalized nav item:

{
key: "journal-entries",
label: "Journal Entries",
href: "/accounting/journal-entries",
icon: NotebookPen,
permission: "journal.entries.view"
}

Tetapi pastikan permission filtering tetap berjalan.

RECOMMENDED APPROACH:
Gunakan helper mapping agar data navigation tetap bersih:

export function getSubmenuIcon(itemKey: string, label: string): LucideIcon {
const normalized = `${itemKey} ${label}`.toLowerCase();

...
}

ICON MAP DETAIL:

ACCOUNTING MODULE:

- journal-entries / Journal Entries
  Icon: NotebookPen
  Reason: jurnal/manual entry/catatan transaksi

- fiscal-year-status / Fiscal Year Status
  Icon: CalendarDays
  Reason: tahun fiskal/periode

- closing-wizard / Closing Wizard
  Icon: FileLock2
  Reason: closing, lock, fiscal closing

- period-locks / Period Locks
  Icon: ShieldCheck
  Reason: kontrol periode terkunci

- general-ledger / General Ledger
  Icon: BookOpen
  Reason: buku besar

- trial-balance / Trial Balance
  Icon: Scale
  Reason: neraca saldo, balancing debit credit

MASTER DATA MODULE:

- chart-of-accounts / Chart of Accounts
  Icon: BookOpen
  Reason: daftar akun

- contacts / Contacts
  Icon: Users
  Reason: customer/vendor/contact

- products / Products
  Icon: Boxes
  Reason: barang/produk

- product-categories / Product Categories
  Icon: Tags
  Reason: kategori produk

- units / Units
  Icon: Scale
  Reason: satuan/unit pengukuran

- warehouses / Warehouses
  Icon: Warehouse
  Reason: gudang

- departments / Departments
  Icon: Building2
  Reason: departemen/unit organisasi

- projects / Projects
  Icon: FolderKanban
  Reason: project tracking

- account-mappings / Account Mappings
  Icon: ArrowLeftRight
  Reason: mapping akun/integrasi akun

SALES & AR MODULE:

- sales-quotations / Sales Quotations
  Icon: FileText
  Reason: penawaran

- sales-orders / Sales Orders
  Icon: ClipboardList
  Reason: order/pesanan

- delivery-orders / Delivery Orders
  Icon: Truck
  Reason: pengiriman barang

- proformas / Proforma Invoices
  Icon: FileInput
  Reason: invoice sementara/draft billing

- sales-invoices / Sales Invoices
  Icon: FileCheck2
  Reason: invoice resmi/posted document

- customer-deposits / Customer Deposits
  Icon: HandCoins
  Reason: uang muka customer

- sales-receipts / Sales Receipts
  Icon: ReceiptText
  Reason: bukti penerimaan penjualan

- sales-returns / Sales Returns
  Icon: RotateCcw
  Reason: retur penjualan

- ar-aging / AR Aging
  Icon: Clock3
  Reason: umur piutang

PURCHASE & AP MODULE:

- purchase-requests / Purchase Requests
  Icon: ShoppingBag
  Reason: permintaan pembelian

- purchase-orders / Purchase Orders
  Icon: ClipboardList
  Reason: pesanan pembelian

- goods-receipts / Goods Receipts
  Icon: PackageSearch
  Reason: penerimaan barang

- vendor-bills / Vendor Bills
  Icon: FileCheck2
  Reason: tagihan vendor/faktur pembelian

- vendor-deposits / Vendor Deposits
  Icon: HandCoins
  Reason: uang muka vendor

- vendor-payments / Vendor Payments
  Icon: CreditCard
  Reason: pembayaran vendor

- purchase-returns / Purchase Returns
  Icon: RotateCcw
  Reason: retur pembelian

- ap-aging / AP Aging
  Icon: Clock3
  Reason: umur hutang

CASH & BANK MODULE:

- cash-bank-accounts / Cash Bank Accounts
  Icon: Landmark
  Reason: rekening kas/bank

- cash-receipts / Cash Receipts
  Icon: Banknote
  Reason: kas masuk

- cash-payments / Cash Payments
  Icon: CreditCard
  Reason: kas keluar/pembayaran

- bank-transfers / Bank Transfers
  Icon: ArrowLeftRight
  Reason: transfer antar rekening

- bank-reconciliations / Bank Reconciliations
  Icon: Scale
  Reason: rekonsiliasi bank

INVENTORY MODULE:

- stock-balances / Stock Balances
  Icon: Layers
  Reason: saldo stok

- stock-movements / Stock Movements
  Icon: Activity
  Reason: mutasi/pergerakan stok

- stock-adjustments / Stock Adjustments
  Icon: SlidersHorizontal
  Reason: adjustment/koreksi stok

- stock-opnames / Stock Opnames
  Icon: ClipboardList
  Reason: stock opname/checklist fisik

- inventory-valuation / Inventory Valuation
  Icon: FileBarChart
  Reason: nilai persediaan/report valuation

- stock-card / Stock Card
  Icon: FileText
  Reason: kartu stok/detail movement

REPORTS MODULE:

- financial-summary / Financial Summary
  Icon: FileBarChart
  Reason: ringkasan laporan

- general-ledger / General Ledger
  Icon: BookOpen
  Reason: buku besar

- trial-balance / Trial Balance
  Icon: Scale
  Reason: neraca saldo

- profit-loss / Profit & Loss
  Icon: TrendingUp
  Reason: laba rugi/performance

- balance-sheet / Balance Sheet
  Icon: FileBarChart
  Reason: laporan posisi keuangan

- cash-flow-report / Cash Flow
  Icon: Banknote
  Reason: arus kas

SETTINGS MODULE:

- company-settings / Company Settings
  Icon: Building2
  Reason: pengaturan perusahaan

- accounting-settings / Accounting Settings
  Icon: Settings
  Reason: konfigurasi akuntansi

- module-settings / Module Settings
  Icon: SlidersHorizontal
  Reason: konfigurasi modul

- permissions / Permissions
  Icon: ShieldCheck
  Reason: akses dan permission

FALLBACK:
Jika tidak ada match:

- Icon: FileInput

IMPLEMENTATION EXAMPLE:

import type { LucideIcon } from "lucide-react";
import {
Activity,
ArrowLeftRight,
Banknote,
BookOpen,
Boxes,
Building2,
CalendarDays,
ClipboardList,
Clock3,
CreditCard,
FileBarChart,
FileCheck2,
FileInput,
FileLock2,
FileText,
FolderKanban,
HandCoins,
Landmark,
Layers,
NotebookPen,
PackageSearch,
ReceiptText,
RotateCcw,
Scale,
Settings,
ShieldCheck,
ShoppingBag,
SlidersHorizontal,
Tags,
TrendingUp,
Truck,
Users,
Warehouse,
} from "lucide-react";

export function getSubmenuIcon(itemKey: string, label: string): LucideIcon {
const normalized = `${itemKey} ${label}`.toLowerCase();

if (normalized.includes("journal")) return NotebookPen;
if (normalized.includes("fiscal")) return CalendarDays;
if (normalized.includes("closing")) return FileLock2;
if (normalized.includes("period") || normalized.includes("lock")) return ShieldCheck;

if (normalized.includes("chart of accounts")) return BookOpen;
if (normalized.includes("account mapping")) return ArrowLeftRight;
if (normalized.includes("contact")) return Users;
if (normalized.includes("product categor")) return Tags;
if (normalized.includes("product")) return Boxes;
if (normalized.includes("unit")) return Scale;
if (normalized.includes("warehouse")) return Warehouse;
if (normalized.includes("department")) return Building2;
if (normalized.includes("project")) return FolderKanban;

if (normalized.includes("quotation")) return FileText;
if (normalized.includes("delivery")) return Truck;
if (normalized.includes("proforma")) return FileInput;
if (normalized.includes("sales order") || normalized.includes("purchase order")) return ClipboardList;
if (normalized.includes("invoice") || normalized.includes("bill")) return FileCheck2;
if (normalized.includes("customer deposit") || normalized.includes("vendor deposit")) return HandCoins;
if (normalized.includes("receipt")) return ReceiptText;
if (normalized.includes("return")) return RotateCcw;
if (normalized.includes("aging")) return Clock3;
if (normalized.includes("request")) return ShoppingBag;
if (normalized.includes("goods receipt")) return PackageSearch;
if (normalized.includes("payment")) return CreditCard;

if (normalized.includes("cash bank account")) return Landmark;
if (normalized.includes("cash receipt")) return Banknote;
if (normalized.includes("cash payment")) return CreditCard;
if (normalized.includes("transfer")) return ArrowLeftRight;
if (normalized.includes("reconciliation")) return Scale;

if (normalized.includes("stock balance")) return Layers;
if (normalized.includes("stock movement")) return Activity;
if (normalized.includes("stock adjustment")) return SlidersHorizontal;
if (normalized.includes("opname")) return ClipboardList;
if (normalized.includes("valuation")) return FileBarChart;
if (normalized.includes("stock card")) return FileText;

if (normalized.includes("financial summary")) return FileBarChart;
if (normalized.includes("general ledger")) return BookOpen;
if (normalized.includes("trial balance")) return Scale;
if (normalized.includes("profit")) return TrendingUp;
if (normalized.includes("balance sheet")) return FileBarChart;
if (normalized.includes("cash flow")) return Banknote;

if (normalized.includes("company setting")) return Building2;
if (normalized.includes("accounting setting")) return Settings;
if (normalized.includes("module setting")) return SlidersHorizontal;
if (normalized.includes("permission")) return ShieldCheck;

return FileInput;
}

IMPORTANT ORDERING RULE:
Urutan kondisi penting.
Contoh:

- "cash receipt" harus dicek sebelum "receipt" jika ingin icon khusus Banknote.
- "goods receipt" harus dicek sebelum "receipt" jika ingin icon PackageSearch.
- "product categories" harus dicek sebelum "product".
- "account mappings" harus dicek sebelum generic "account".
- "cash flow" harus dicek sebelum generic cash/cash receipt logic jika ada konflik.

RECOMMENDED FINAL ORDER:

1. very specific keys
2. specific labels
3. generic keywords
4. fallback

PREFERRED VERSION:
Gunakan switch/map by itemKey lebih aman daripada keyword includes.

Implementasi yang lebih aman:

const submenuIconMap: Record<string, LucideIcon> = {
"journal-entries": NotebookPen,
"fiscal-year-status": CalendarDays,
"closing-wizard": FileLock2,
"period-locks": ShieldCheck,

"chart-of-accounts": BookOpen,
"contacts": Users,
"products": Boxes,
"product-categories": Tags,
"units": Scale,
"warehouses": Warehouse,
"departments": Building2,
"projects": FolderKanban,
"account-mappings": ArrowLeftRight,

"sales-quotations": FileText,
"sales-orders": ClipboardList,
"delivery-orders": Truck,
"proformas": FileInput,
"sales-invoices": FileCheck2,
"customer-deposits": HandCoins,
"sales-receipts": ReceiptText,
"sales-returns": RotateCcw,
"ar-aging": Clock3,

"purchase-requests": ShoppingBag,
"purchase-orders": ClipboardList,
"goods-receipts": PackageSearch,
"vendor-bills": FileCheck2,
"vendor-deposits": HandCoins,
"vendor-payments": CreditCard,
"purchase-returns": RotateCcw,
"ap-aging": Clock3,

"cash-bank-accounts": Landmark,
"cash-receipts": Banknote,
"cash-payments": CreditCard,
"bank-transfers": ArrowLeftRight,
"bank-reconciliations": Scale,

"stock-balances": Layers,
"stock-movements": Activity,
"stock-adjustments": SlidersHorizontal,
"stock-opnames": ClipboardList,
"inventory-valuation": FileBarChart,
"stock-card": FileText,

"financial-summary": FileBarChart,
"general-ledger": BookOpen,
"trial-balance": Scale,
"profit-loss": TrendingUp,
"balance-sheet": FileBarChart,
"cash-flow-report": Banknote,

"company-settings": Building2,
"accounting-settings": Settings,
"module-settings": SlidersHorizontal,
"permissions": ShieldCheck,
};

export function getSubmenuIcon(itemKey: string, label?: string): LucideIcon {
return submenuIconMap[itemKey] ?? FileInput;
}

USE THIS MAP FIRST.
Use keyword fallback only if needed for unknown future submenu.

UPDATE UI USAGE:

In Sidebar inline submenu:
Replace bullet dot or parent module icon with:

const ItemIcon = getSubmenuIcon(item.key, item.label);

<ItemIcon className="h-4 w-4" />

In FloatingSubmenuPanel:
Replace module icon with:

const ItemIcon = getSubmenuIcon(item.key, item.label);

<ItemIcon className="h-7 w-7" style={{ color: theme.icon }} />

In ModulePage / submenu card grid:
Do not use parent section icon for every card.
Use:

const ItemIcon = getSubmenuIcon(route.key, route.label);

<ItemIcon className="h-6 w-6" style={{ color: theme.icon }} />

ACCEPTANCE CRITERIA:

1. npm run lint passes.
2. npm run build passes.
3. No duplicate import identifier.
4. No unused import.
5. No `CalendarDays has already been declared` error.
6. Sidebar full mode inline submenu icons are varied.
7. Minimal sidebar floating submenu icons are varied.
8. Module landing submenu cards icons are varied.
9. Icons roughly match submenu purpose.
10. Existing permission filtering still works.
11. Existing navigation href/endpoint still works.
12. No backend files changed.
13. No API contract changed.
14. No page route changed.

FINAL SUMMARY REQUIRED:
After implementation, report:

- Files changed
- Icons added
- Icon mapping strategy used
- Commands run
- Any command that failed
- Confirmation no backend/API changes were made

COMMIT MESSAGE:
feat(frontend): add contextual icons for submenu navigation
