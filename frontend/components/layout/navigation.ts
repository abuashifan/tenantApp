'use client';

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
  LayoutDashboard,
  NotebookPen,
  Package,
  PackageSearch,
  ReceiptText,
  RotateCcw,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Tags,
  TrendingUp,
  Truck,
  Users,
  WalletCards,
  Warehouse,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CASH_BANK_NAV_ITEMS } from '@/features/cash-bank/navigation';
import { MASTER_DATA_RESOURCES } from '@/features/accounting/master-data/config';
import { INVENTORY_NAV_ITEMS } from '@/features/inventory/navigation';
import { PURCHASE_NAV_ITEMS } from '@/features/purchase/navigation';
import { SALES_NAV_ITEMS } from '@/features/sales/navigation';
import { ACCOUNTING_NAV_ITEMS, hasPermission } from '@/lib/permissions';
import type { ModuleNavGroup, ModuleNavItem, PrimaryTab } from './types';

const REPORT_PATH_FRAGMENT = '/reports/';

const submenuIconMap: Record<string, LucideIcon> = {
  'journal-entries': NotebookPen,
  journals: NotebookPen,
  'fiscal-year-status': CalendarDays,
  'fiscal-closing': FileLock2,
  'closing-wizard': FileLock2,
  'period-locks': ShieldCheck,

  'chart-of-accounts': BookOpen,
  contacts: Users,
  products: Boxes,
  'product-categories': Tags,
  units: Scale,
  warehouses: Warehouse,
  departments: Building2,
  projects: FolderKanban,
  'account-mappings': ArrowLeftRight,
  'master-data': Layers,

  'sales-quotations': FileText,
  quotations: FileText,
  'sales-orders': ClipboardList,
  orders: ClipboardList,
  'delivery-orders': Truck,
  proformas: FileInput,
  'sales-invoices': FileCheck2,
  invoices: FileCheck2,
  'customer-deposits': HandCoins,
  deposits: HandCoins,
  'sales-receipts': ReceiptText,
  receipts: ReceiptText,
  'sales-returns': RotateCcw,
  returns: RotateCcw,
  'ar-aging': Clock3,
  'ar-ledger': BookOpen,
  'open-invoices': FileCheck2,
  'ar-reconciliation': Scale,

  'purchase-requests': ShoppingBag,
  requests: ShoppingBag,
  'purchase-orders': ClipboardList,
  'goods-receipts': PackageSearch,
  'vendor-bills': FileCheck2,
  'vendor-deposits': HandCoins,
  'vendor-payments': CreditCard,
  'purchase-returns': RotateCcw,
  'ap-aging': Clock3,
  'ap-ledger': BookOpen,
  'open-bills': FileCheck2,
  'ap-reconciliation': Scale,

  'cash-bank-accounts': Landmark,
  accounts: Landmark,
  'cash-receipts': Banknote,
  'cash-in': Banknote,
  'cash-payments': CreditCard,
  'cash-out': CreditCard,
  'bank-transfers': ArrowLeftRight,
  transfers: ArrowLeftRight,
  'bank-reconciliations': Scale,
  reconciliation: Scale,
  reports: FileBarChart,

  'stock-balances': Layers,
  stocks: Layers,
  'stock-movements': Activity,
  movements: Activity,
  'stock-adjustments': SlidersHorizontal,
  adjustments: SlidersHorizontal,
  'stock-opnames': ClipboardList,
  opname: ClipboardList,
  'inventory-valuation': FileBarChart,
  valuation: FileBarChart,
  'stock-card': FileText,

  'financial-summary': FileBarChart,
  'general-ledger': BookOpen,
  'trial-balance': Scale,
  'profit-loss': TrendingUp,
  'balance-sheet': FileBarChart,
  'cash-flow-report': Banknote,
  'cash-flow': Banknote,
  'financial-statements': FileBarChart,
  'account-ledger': BookOpen,

  'company-settings': Building2,
  'accounting-settings': Settings,
  'module-settings': SlidersHorizontal,
  permissions: ShieldCheck,
};

function deriveItemKey(href: string): string {
  return href.split('?')[0]?.split('/').filter(Boolean).at(-1) ?? href;
}

function toNavItem(item: {
  label: string;
  href: string;
  permission: string | readonly string[];
  description?: string;
}): ModuleNavItem {
  return {
    id: item.href,
    key: deriveItemKey(item.href),
    label: item.label,
    href: item.href,
    permission: item.permission,
    description: item.description,
  };
}

function toStaticNavItem(item: {
  key: string;
  label: string;
  href: string;
  permission?: string | readonly string[];
  description?: string;
}): ModuleNavItem {
  return {
    id: item.href,
    key: item.key,
    label: item.label,
    href: item.href,
    permission: item.permission,
    description: item.description,
  };
}

function filterItems<T extends { permission: string | readonly string[] }>(
  permissions: readonly string[],
  items: readonly T[],
): T[] {
  return items.filter((item) => hasPermission(permissions, item.permission));
}

export function buildModuleNavGroups(permissions: readonly string[]): ModuleNavGroup[] {
  const visibleAccountingItems = filterItems(permissions, ACCOUNTING_NAV_ITEMS).map(toNavItem);
  const accountingWorkItems = visibleAccountingItems.filter(
    (item) =>
      !item.href.includes(REPORT_PATH_FRAGMENT) &&
      item.href !== '/accounting/chart-of-accounts' &&
      item.href !== '/accounting/master-data',
  );
  const reportItems = visibleAccountingItems.filter((item) =>
    item.href.includes(REPORT_PATH_FRAGMENT),
  );
  const chartOfAccountsItem = visibleAccountingItems.find(
    (item) => item.href === '/accounting/chart-of-accounts',
  );
  const masterDataItems = [
    chartOfAccountsItem,
    ...MASTER_DATA_RESOURCES.filter((resource) =>
      hasPermission(permissions, resource.permissions.view),
    ).map((resource) =>
      toStaticNavItem({
        key: resource.key,
        label: resource.title,
        href: resource.route,
        permission: resource.permissions.view,
        description: resource.description,
      }),
    ),
    hasPermission(permissions, 'settings.company.view')
      ? toStaticNavItem({
          key: 'account-mappings',
          label: 'Account Mappings',
          href: '/accounting/master-data/account-mappings',
          permission: 'settings.company.view',
          description: 'Map system posting accounts for operating modules.',
        })
      : null,
  ].filter((item): item is ModuleNavItem => Boolean(item));

  const groups: ModuleNavGroup[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      items: [],
    },
  ];

  if (accountingWorkItems.length > 0) {
    groups.push({
      id: 'accounting',
      label: 'Accounting',
      icon: ReceiptText,
      items: accountingWorkItems,
    });
  }

  if (masterDataItems.length > 0) {
    groups.push({
      id: 'master-data',
      label: 'Master Data',
      icon: Building2,
      items: masterDataItems,
    });
  }

  const salesItems = filterItems(permissions, SALES_NAV_ITEMS).map(toNavItem);
  if (salesItems.length > 0) {
    groups.push({
      id: 'sales',
      label: 'Sales & AR',
      icon: WalletCards,
      items: salesItems,
    });
  }

  const purchaseItems = filterItems(permissions, PURCHASE_NAV_ITEMS).map(toNavItem);
  if (purchaseItems.length > 0) {
    groups.push({
      id: 'purchase',
      label: 'Purchase & AP',
      icon: ShoppingCart,
      items: purchaseItems,
    });
  }

  const cashBankItems = filterItems(permissions, CASH_BANK_NAV_ITEMS).map(toNavItem);
  if (cashBankItems.length > 0) {
    groups.push({
      id: 'cash-bank',
      label: 'Cash & Bank',
      icon: Landmark,
      items: cashBankItems,
    });
  }

  const inventoryItems = filterItems(permissions, INVENTORY_NAV_ITEMS).map(toNavItem);
  if (inventoryItems.length > 0) {
    groups.push({
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      items: inventoryItems,
    });
  }

  if (reportItems.length > 0) {
    groups.push({
      id: 'reports',
      label: 'Reports',
      icon: Building2,
      items: reportItems,
    });
  }

  if (hasPermission(permissions, 'settings.company.view')) {
    groups.push({
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      items: [
        toStaticNavItem({
          key: 'company-settings',
          label: 'Company Settings',
          href: '/select-company',
          permission: 'settings.company.view',
          description: 'Switch or review the active company context.',
        }),
      ],
    });
  }

  return groups;
}

export function createDashboardTab(): PrimaryTab {
  return {
    id: '/dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    moduleId: 'dashboard',
    closable: false,
  };
}

export function createPrimaryTab(item: ModuleNavItem, moduleId: string): PrimaryTab {
  return {
    id: item.href,
    label: item.label,
    href: item.href,
    moduleId,
    closable: true,
  };
}

export function findNavItemByHref(
  groups: readonly ModuleNavGroup[],
  href: string | null,
): { group: ModuleNavGroup; item: ModuleNavItem | null } {
  const dashboard = groups[0];
  if (!href || href === '/dashboard') return { group: dashboard, item: null };

  for (const group of groups) {
    const item = group.items.find(
      (entry) => href === entry.href || href.startsWith(`${entry.href}/`),
    );
    if (item) return { group, item };
  }

  return { group: dashboard, item: null };
}

export function getListTabLabel(pageLabel: string): string {
  const lower = pageLabel.toLowerCase();
  if (lower.includes('journal')) return 'Daftar Jurnal';
  if (lower.includes('invoice')) return 'Daftar Invoice';
  if (lower.includes('quotation')) return 'Daftar Quotation';
  if (lower.includes('order')) return 'Daftar Order';
  if (lower.includes('payment') || lower.includes('cash out')) return 'Daftar Pembayaran';
  if (lower.includes('receipt') || lower.includes('cash in')) return 'Daftar Penerimaan';
  if (lower.includes('account')) return 'Daftar Akun';
  if (lower.includes('product')) return 'Daftar Produk';
  if (lower.includes('warehouse')) return 'Daftar Gudang';
  if (lower.includes('balance') || lower.includes('stock')) return 'Daftar Saldo';
  return `Daftar ${pageLabel}`;
}

export function getSubmenuIcon(itemKey: string, label = ''): LucideIcon {
  const key = deriveItemKey(itemKey).toLowerCase();
  const directMatch = submenuIconMap[key] ?? submenuIconMap[itemKey.toLowerCase()];
  if (directMatch) return directMatch;

  const normalized = `${key} ${label}`.toLowerCase();

  if (normalized.includes('cash flow')) return Banknote;
  if (normalized.includes('goods receipt')) return PackageSearch;
  if (normalized.includes('cash receipt') || normalized.includes('cash in')) return Banknote;
  if (normalized.includes('cash payment') || normalized.includes('cash out')) return CreditCard;
  if (normalized.includes('product categor')) return Tags;
  if (normalized.includes('account mapping')) return ArrowLeftRight;

  if (normalized.includes('journal')) return NotebookPen;
  if (normalized.includes('fiscal') && !normalized.includes('closing')) return CalendarDays;
  if (normalized.includes('closing')) return FileLock2;
  if (normalized.includes('period') || normalized.includes('lock')) return ShieldCheck;

  if (normalized.includes('chart of accounts')) return BookOpen;
  if (normalized.includes('contact')) return Users;
  if (normalized.includes('product')) return Boxes;
  if (normalized.includes('unit')) return Scale;
  if (normalized.includes('warehouse')) return Warehouse;
  if (normalized.includes('department')) return Building2;
  if (normalized.includes('project')) return FolderKanban;

  if (normalized.includes('quotation')) return FileText;
  if (normalized.includes('delivery')) return Truck;
  if (normalized.includes('proforma')) return FileInput;
  if (normalized.includes('order')) return ClipboardList;
  if (normalized.includes('invoice') || normalized.includes('bill')) return FileCheck2;
  if (normalized.includes('deposit')) return HandCoins;
  if (normalized.includes('receipt')) return ReceiptText;
  if (normalized.includes('return')) return RotateCcw;
  if (normalized.includes('aging')) return Clock3;
  if (normalized.includes('request')) return ShoppingBag;
  if (normalized.includes('payment')) return CreditCard;

  if (normalized.includes('cash bank account')) return Landmark;
  if (normalized.includes('transfer')) return ArrowLeftRight;
  if (normalized.includes('reconciliation')) return Scale;

  if (normalized.includes('stock balance') || normalized.includes('product stock')) return Layers;
  if (normalized.includes('stock movement')) return Activity;
  if (normalized.includes('stock adjustment')) return SlidersHorizontal;
  if (normalized.includes('opname')) return ClipboardList;
  if (normalized.includes('valuation')) return FileBarChart;
  if (normalized.includes('stock card')) return FileText;

  if (normalized.includes('financial summary')) return FileBarChart;
  if (normalized.includes('general ledger')) return BookOpen;
  if (normalized.includes('trial balance')) return Scale;
  if (normalized.includes('profit')) return TrendingUp;
  if (normalized.includes('balance sheet')) return FileBarChart;
  if (normalized.includes('report')) return BarChart3;

  if (normalized.includes('company setting')) return Building2;
  if (normalized.includes('accounting setting')) return Settings;
  if (normalized.includes('module setting')) return SlidersHorizontal;
  if (normalized.includes('permission')) return ShieldCheck;

  return FileInput;
}
