export type InventoryStatus = 'draft' | 'approved' | 'posted' | 'void' | 'counted' | 'finalized' | string;

export type InventoryProductStock = Record<string, unknown> & {
  id?: number;
  product_id?: number;
  product_code?: string | null;
  product_name?: string | null;
  warehouse_id?: number | null;
  quantity_on_hand?: number | string | null;
  available_quantity?: number | string | null;
  average_cost?: number | string | null;
  stock_value?: number | string | null;
};

export type WarehouseStock = InventoryProductStock;

export type StockMovementLine = Record<string, unknown> & {
  id?: number;
  product_id?: number | null;
  quantity_in?: number | string | null;
  quantity_out?: number | string | null;
  unit_cost?: number | string | null;
  line_value?: number | string | null;
};

export type StockMovement = Record<string, unknown> & {
  id: number;
  movement_number?: string | null;
  movement_date?: string | null;
  movement_type?: string | null;
  status?: InventoryStatus | null;
  lines?: StockMovementLine[];
};

export type StockAdjustmentLine = Record<string, unknown> & {
  product_id?: number | null;
  warehouse_id?: number | null;
  adjustment_type?: 'increase' | 'decrease' | string;
  quantity?: number | string | null;
  unit_cost?: number | string | null;
};

export type StockAdjustment = Record<string, unknown> & {
  id: number;
  adjustment_number?: string | null;
  adjustment_date?: string | null;
  status?: InventoryStatus | null;
  lines?: StockAdjustmentLine[];
};

export type StockOpnameLine = Record<string, unknown> & {
  id?: number;
  product_id?: number | null;
  system_quantity?: number | string | null;
  physical_quantity?: number | string | null;
  difference_quantity?: number | string | null;
};

export type StockOpname = Record<string, unknown> & {
  id: number;
  opname_number?: string | null;
  opname_date?: string | null;
  status?: InventoryStatus | null;
  lines?: StockOpnameLine[];
};

export type InventoryValuation = Record<string, unknown>;
export type StockCardEntry = Record<string, unknown>;
export type InventoryListFilters = Record<string, string | number | boolean | null | undefined>;
export type StockAdjustmentPayload = Record<string, unknown>;
export type StockOpnamePayload = Record<string, unknown>;
