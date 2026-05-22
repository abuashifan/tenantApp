export type CashBankNavItem = {
  label: string;
  href: string;
  permission: string;
  description: string;
};

export const CASH_BANK_NAV_ITEMS: CashBankNavItem[] = [
  { label: 'Overview', href: '/cash-bank', permission: 'cash_bank.view', description: 'Cash Bank workspace and quick links.' },
  { label: 'Cash In', href: '/cash-bank/cash-in', permission: 'cash_bank.view', description: 'Record and post cash/bank receipts.' },
  { label: 'Cash Out', href: '/cash-bank/cash-out', permission: 'cash_bank.view', description: 'Record and post cash/bank payments.' },
  { label: 'Transfers', href: '/cash-bank/transfers', permission: 'cash_bank.view', description: 'Move funds between cash/bank accounts.' },
  { label: 'Reconciliation', href: '/cash-bank/reconciliation', permission: 'cash_bank.view', description: 'Basic bank reconciliation sessions.' },
  { label: 'Reports', href: '/cash-bank/reports', permission: 'cash_bank.view', description: 'Cash bank account statement and movement views.' },
];
