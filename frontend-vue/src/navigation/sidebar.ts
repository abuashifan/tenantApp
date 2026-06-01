import type { Component } from 'vue'

import {
  BookOpen,
  ClipboardList,
  Database,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ShoppingCart,
  WalletCards,
  Warehouse,
} from 'lucide-vue-next'

export type SidebarMenuItem = {
  id: string
  label: string
  href: string
  permission: string
  endpoint: string
  module: string
  openAsPrimaryTab: true
  implemented: boolean
}

export type SidebarMenuGroup = {
  key: string
  label: string
  icon: Component
  href?: string
  endpoint?: string
  items: SidebarMenuItem[]
}

function item(
  module: string,
  id: string,
  label: string,
  href: string,
  endpoint: string,
  permission: string,
  implemented = false,
): SidebarMenuItem {
  return { module, id, label, href, endpoint, permission, implemented, openAsPrimaryTab: true }
}

export const sidebarMenuGroups: SidebarMenuGroup[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    endpoint: '/accounting/fiscal-year/status',
    items: [],
  },
  {
    key: 'master-data',
    label: 'Master Data',
    icon: Database,
    items: [
      item('master-data', 'coa', 'Chart of Accounts', '/accounting/chart-of-accounts', '/master-data/chart-of-accounts', 'coa.view', true),
      item('master-data', 'contacts', 'Contacts', '/master-data/contacts', '/master-data/contacts', 'contacts.view'),
      item('master-data', 'payment-terms', 'Payment Terms', '/master-data/payment-terms', '/master-data/payment-terms', 'payment_terms.view'),
      item('master-data', 'units', 'Units', '/master-data/units', '/master-data/units', 'units.view'),
      item('master-data', 'departments', 'Departments', '/master-data/departments', '/master-data/departments', 'departments.view'),
      item('master-data', 'projects', 'Projects', '/master-data/projects', '/master-data/projects', 'projects.view'),
    ],
  },
  {
    key: 'accounting',
    label: 'Accounting',
    icon: ClipboardList,
    items: [
      item('accounting', 'journals', 'Journal Entries', '/accounting/journals', '/journals', 'journal.view', true),
      item('accounting', 'fiscal-closing', 'Fiscal Closing', '/accounting/fiscal-closing', '/accounting/fiscal-year/status', 'fiscal_year.view', true),
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: BookOpen,
    items: [
      item('reports', 'general-ledger', 'General Ledger', '/reports/general-ledger', '/reports/general-ledger', 'reports.view', true),
      item('reports', 'trial-balance', 'Trial Balance', '/accounting/trial-balance', '/reports/trial-balance', 'reports.view', true),
      item('reports', 'profit-loss', 'Profit & Loss', '/reports/profit-loss', '/reports/profit-loss', 'reports.view', true),
      item('reports', 'balance-sheet', 'Balance Sheet', '/reports/balance-sheet', '/reports/balance-sheet', 'reports.view', true),
      item('reports', 'cash-flow', 'Cash Flow', '/reports/cash-flow', '/reports/cash-flow', 'reports.view', true),
      item('reports', 'financial-summary', 'Financial Summary', '/reports/financial-summary', '/reports/financial-summary', 'reports.view', true),
    ],
  },
  {
    key: 'sales',
    label: 'Sales & AR',
    icon: ShoppingCart,
    items: [
      item('sales', 'sales-quotations', 'Sales Quotations', '/sales/quotations', '/sales/quotations', 'sales.quotations.view'),
      item('sales', 'sales-orders', 'Sales Orders', '/sales/orders', '/sales/orders', 'sales.orders.view'),
      item('sales', 'proforma-invoices', 'Proforma Invoices', '/sales/proformas', '/sales/proformas', 'sales.proformas.view'),
      item('sales', 'delivery-orders', 'Delivery Orders', '/sales/delivery-orders', '/sales/delivery-orders', 'sales.delivery_orders.view'),
      item('sales', 'sales-invoices', 'Sales Invoices', '/sales/invoices', '/sales/invoices', 'sales.invoices.view'),
      item('sales', 'billing-invoices', 'Billing Invoices', '/sales/billings', '/sales/billings', 'sales.billings.view'),
      item('sales', 'customer-deposits', 'Customer Deposits', '/sales/customer-deposits', '/sales/customer-deposits', 'sales.deposits.view'),
      item('sales', 'sales-receipts', 'Sales Receipts', '/sales/receipts', '/sales/receipts', 'sales.receipts.view'),
      item('sales', 'sales-returns', 'Sales Returns', '/sales/returns', '/sales/returns', 'sales.returns.view'),
      item('sales', 'customer-summary', 'Customer Summary', '/sales/ar/customer-summary', '/sales/ar/customer-summary', 'sales.ar.view'),
      item('sales', 'open-invoices', 'Open Invoices', '/sales/ar/open-invoices', '/sales/ar/open-invoices', 'sales.ar.view'),
      item('sales', 'ar-aging', 'AR Aging', '/sales/ar/aging', '/sales/ar/aging', 'sales.ar.view'),
      item('sales', 'ar-reconciliation', 'AR Reconciliation', '/sales/ar/reconciliation', '/sales/ar/reconciliation', 'sales.ar.reconcile'),
    ],
  },
  {
    key: 'purchase',
    label: 'Purchase & AP',
    icon: ShoppingCart,
    items: [
      item('purchase', 'purchase-requests', 'Purchase Requests', '/purchase/requests', '/purchase/requests', 'purchase.requests.view'),
      item('purchase', 'purchase-orders', 'Purchase Orders', '/purchase/orders', '/purchase/orders', 'purchase.orders.view'),
      item('purchase', 'goods-receipts', 'Goods Receipts', '/purchase/goods-receipts', '/purchase/goods-receipts', 'purchase.goods_receipts.view'),
      item('purchase', 'vendor-bills', 'Vendor Bills', '/purchase/bills', '/purchase/bills', 'purchase.bills.view'),
      item('purchase', 'vendor-deposits', 'Vendor Deposits', '/purchase/vendor-deposits', '/purchase/vendor-deposits', 'purchase.deposits.view'),
      item('purchase', 'vendor-payments', 'Vendor Payments', '/purchase/payments', '/purchase/payments', 'purchase.payments.view'),
      item('purchase', 'purchase-returns', 'Purchase Returns', '/purchase/returns', '/purchase/returns', 'purchase.returns.view'),
      item('purchase', 'vendor-summary', 'Vendor Summary', '/purchase/ap/vendor-summary', '/purchase/ap/vendor-summary', 'purchase.ap.view'),
      item('purchase', 'open-bills', 'Open Bills', '/purchase/ap/open-bills', '/purchase/ap/open-bills', 'purchase.ap.view'),
      item('purchase', 'ap-aging', 'AP Aging', '/purchase/ap/aging', '/purchase/ap/aging', 'purchase.ap.view'),
      item('purchase', 'ap-reconciliation', 'AP Reconciliation', '/purchase/ap/reconciliation', '/purchase/ap/reconciliation', 'purchase.ap.reconcile'),
    ],
  },
  {
    key: 'cash-bank',
    label: 'Cash & Bank',
    icon: WalletCards,
    items: [
      item('cash-bank', 'cash-bank-accounts', 'Cash & Bank Accounts', '/cash-bank/accounts', '/cash-bank/accounts', 'cash_bank.view'),
      item('cash-bank', 'cash-receipts', 'Cash Receipts', '/cash-bank/cash-receipts', '/cash-bank/cash-receipts', 'cash_bank.view'),
      item('cash-bank', 'cash-payments', 'Cash Payments', '/cash-bank/cash-payments', '/cash-bank/cash-payments', 'cash_bank.view'),
      item('cash-bank', 'bank-transfers', 'Bank Transfers', '/cash-bank/bank-transfers', '/cash-bank/bank-transfers', 'cash_bank.view'),
      item('cash-bank', 'bank-reconciliation', 'Bank Reconciliation', '/cash-bank/bank-reconciliations', '/cash-bank/bank-reconciliations', 'cash_bank.view'),
      item('cash-bank', 'cash-bank-account-statement', 'Account Statement', '/cash-bank/account-statement', '/cash-bank/reports/account-statement', 'cash_bank.view', true),
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: Warehouse,
    items: [
      item('inventory', 'product-categories', 'Product Categories', '/master-data/product-categories', '/master-data/product-categories', 'products.view'),
      item('inventory', 'products', 'Products', '/master-data/products', '/master-data/products', 'products.view'),
      item('inventory', 'warehouses', 'Warehouses', '/master-data/warehouses', '/master-data/warehouses', 'warehouses.view'),
      item('inventory', 'stock-balances', 'Stock Balances', '/inventory/stock-balances', '/inventory/stock-balances', 'inventory.stock.view'),
      item('inventory', 'stock-movements', 'Stock Movements', '/inventory/stock-movements', '/inventory/stock-movements', 'inventory.movements.view'),
      item('inventory', 'stock-adjustments', 'Stock Adjustments', '/inventory/stock-adjustments', '/inventory/stock-adjustments', 'inventory.adjustments.view'),
      item('inventory', 'stock-opnames', 'Stock Opname', '/inventory/stock-opnames', '/inventory/stock-opnames', 'inventory.opname.view'),
      item('inventory', 'inventory-valuation', 'Inventory Valuation', '/inventory/valuation', '/inventory/valuation', 'inventory.valuation.view'),
    ],
  },
  {
    key: 'inventory-reports',
    label: 'Inventory Reports',
    icon: BookOpen,
    items: [
      item('inventory-reports', 'stock-balance-report', 'Stock Balance Report', '/inventory/reports/stock-balances', '/inventory/reports/stock-balances', 'inventory.reports.view'),
      item('inventory-reports', 'stock-movement-report', 'Stock Movement Report', '/inventory/reports/stock-movements', '/inventory/reports/stock-movements', 'inventory.reports.view'),
      item('inventory-reports', 'valuation-report', 'Valuation Report', '/inventory/reports/valuation', '/inventory/reports/valuation', 'inventory.reports.view'),
      item('inventory-reports', 'low-stock-report', 'Low Stock Report', '/inventory/reports/low-stock', '/inventory/reports/low-stock', 'inventory.reports.view'),
      item('inventory-reports', 'negative-stock-report', 'Negative Stock Report', '/inventory/reports/negative-stock', '/inventory/reports/negative-stock', 'inventory.reports.view'),
    ],
  },
  {
    key: 'access',
    label: 'Access Management',
    icon: ShieldCheck,
    items: [
      item('access', 'access-company-users', 'Company Users', '/access/company-users', '/access/company-users', 'access.users.view', true),
      item('access', 'access-user-permissions', 'Permission Matrix', '/access/permissions', '/access/permission-catalog', 'access.permissions.view', true),
      item('access', 'access-roles', 'Roles', '/access/roles', '/access/roles', 'access.roles.view', true),
      item('access', 'access-invitations', 'Invitations', '/access/invitations', '/access/invitations', 'access.invitations.view', true),
      item('access', 'access-audit', 'Access Audit', '/access/audit', '/access/audit', 'access.audit.view', true),
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      item('settings', 'company-settings', 'Company Settings', '/settings/company', '/settings/company', 'settings.company.view', true),
      item('settings', 'settings-account-mappings', 'Account Mappings', '/settings/account-mappings', '/master-data/account-mappings', 'settings.company.view'),
    ],
  },
]

export const sidebarItems = sidebarMenuGroups.flatMap((group) => group.items)
export const sidebarPlaceholderItems = sidebarItems.filter((menuItem) => !menuItem.implemented)

export function findSidebarMenuItem(href: string) {
  return sidebarItems.find((menuItem) => menuItem.href === href)
}
