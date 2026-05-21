import type { PurchaseModuleNavItem } from './types';

export const PURCHASE_NAV_ITEMS: PurchaseModuleNavItem[] = [
  {
    label: 'Requests',
    href: '/purchase/requests',
    permission: 'purchase.requests.view',
    description: 'Capture internal purchase requests before ordering.',
  },
  {
    label: 'Orders',
    href: '/purchase/orders',
    permission: 'purchase.orders.view',
    description: 'Manage vendor purchase orders and conversion flow.',
  },
  {
    label: 'Goods Receipts',
    href: '/purchase/goods-receipts',
    permission: 'purchase.goods_receipts.view',
    description: 'Receive vendor documents without inventory movement UI.',
  },
  {
    label: 'Vendor Bills',
    href: '/purchase/vendor-bills',
    permission: 'purchase.bills.view',
    description: 'Review vendor bills and AP posting workflow.',
  },
  {
    label: 'Vendor Deposits',
    href: '/purchase/vendor-deposits',
    permission: 'purchase.deposits.view',
    description: 'Track vendor advances and deposit posting actions.',
  },
  {
    label: 'Vendor Payments',
    href: '/purchase/vendor-payments',
    permission: 'purchase.payments.view',
    description: 'Record vendor bill payments through cash/bank accounts.',
  },
  {
    label: 'Purchase Returns',
    href: '/purchase/returns',
    permission: 'purchase.returns.view',
    description: 'Manage purchase returns linked to bills or goods receipts.',
  },
  {
    label: 'AP Ledger',
    href: '/purchase/ap-ledger',
    permission: 'purchase.ap.view',
    description: 'Read vendor AP subsidiary ledger balances.',
  },
  {
    label: 'AP Aging',
    href: '/purchase/ap-aging',
    permission: 'purchase.ap.view',
    description: 'Analyze open vendor payables by aging bucket.',
  },
  {
    label: 'Open Bills',
    href: '/purchase/open-bills',
    permission: 'purchase.ap.view',
    description: 'Review unpaid vendor bills ready for payment.',
  },
  {
    label: 'AP Reconciliation',
    href: '/purchase/ap-reconciliation',
    permission: 'purchase.ap.reconcile',
    description: 'Compare AP subsidiary ledger with general ledger.',
  },
];
