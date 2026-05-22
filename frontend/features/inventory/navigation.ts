export type InventoryNavItem = {
  label: string;
  href: string;
  permission: string;
  description: string;
};

export const INVENTORY_NAV_ITEMS: InventoryNavItem[] = [
  { label: 'Overview', href: '/inventory', permission: 'inventory.stock.view', description: 'Inventory workspace and quick links.' },
  { label: 'Product Stock', href: '/inventory/stocks', permission: 'inventory.stock.view', description: 'Read stock balances by product and warehouse.' },
  { label: 'Stock Movements', href: '/inventory/movements', permission: 'inventory.movements.view', description: 'Read stock movement history and source links.' },
  { label: 'Adjustments', href: '/inventory/adjustments', permission: 'inventory.adjustments.view', description: 'Create and process manual stock adjustments.' },
  { label: 'Stock Opname', href: '/inventory/opname', permission: 'inventory.opname.view', description: 'Basic physical count sessions and finalize flow.' },
  { label: 'Valuation', href: '/inventory/valuation', permission: 'inventory.valuation.view', description: 'Inventory valuation and average cost views.' },
  { label: 'Stock Card', href: '/inventory/stock-card', permission: 'inventory.reports.view', description: 'Product stock card timeline.' },
];
