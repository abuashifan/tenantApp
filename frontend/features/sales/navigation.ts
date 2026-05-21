import type { SalesModuleNavItem } from './types';

export const SALES_NAV_ITEMS: SalesModuleNavItem[] = [
  {
    label: 'Quotations',
    href: '/sales/quotations',
    permission: 'sales.quotations.view',
    description: 'Prepare and track customer sales quotations.',
  },
  {
    label: 'Sales Orders',
    href: '/sales/orders',
    permission: 'sales.orders.view',
    description: 'Manage confirmed customer orders and source conversions.',
  },
  {
    label: 'Delivery Orders',
    href: '/sales/delivery-orders',
    permission: 'sales.delivery_orders.view',
    description: 'Track delivery documents without stock movement UI.',
  },
  {
    label: 'Proformas',
    href: '/sales/proformas',
    permission: 'sales.proformas.view',
    description: 'Issue non-accounting proforma invoices.',
  },
  {
    label: 'Sales Invoices',
    href: '/sales/invoices',
    permission: 'sales.invoices.view',
    description: 'Review sales invoices and posting workflow.',
  },
  {
    label: 'Customer Deposits',
    href: '/sales/deposits',
    permission: 'sales.deposits.view',
    description: 'Track customer down payments and deposit actions.',
  },
  {
    label: 'Sales Receipts',
    href: '/sales/receipts',
    permission: 'sales.receipts.view',
    description: 'Manage customer invoice receipts.',
  },
  {
    label: 'Sales Returns',
    href: '/sales/returns',
    permission: 'sales.returns.view',
    description: 'Handle sales return documents and posting flow.',
  },
  {
    label: 'AR Ledger',
    href: '/sales/ar-ledger',
    permission: 'sales.ar.view',
    description: 'Read accounts receivable subsidiary ledger views.',
  },
  {
    label: 'AR Aging',
    href: '/sales/ar-aging',
    permission: 'sales.ar.view',
    description: 'Read open receivables by aging bucket.',
  },
  {
    label: 'Open Invoices',
    href: '/sales/open-invoices',
    permission: 'sales.ar.view',
    description: 'Review unpaid sales invoices ready for collection.',
  },
  {
    label: 'AR Reconciliation',
    href: '/sales/ar-reconciliation',
    permission: 'sales.ar.reconcile',
    description: 'Compare AR subsidiary ledger to general ledger balance.',
  },
];
