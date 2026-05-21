export type PurchaseModuleNavItem = {
  label: string;
  href: string;
  permission: string;
  description: string;
};

export type PurchaseQueryParams = Record<string, string | number | boolean | null | undefined>;

export type PurchaseDocument = Record<string, unknown> & {
  id: number;
  status?: string | null;
  vendor_id?: number | null;
  vendor?: { id: number; name?: string | null; contact_code?: string | null } | null;
  lines?: PurchaseLineItem[];
  subtotal_before_discount?: number | string | null;
  line_discount_total?: number | string | null;
  header_discount_amount?: number | string | null;
  subtotal_after_discount?: number | string | null;
  tax_total?: number | string | null;
  grand_total?: number | string | null;
  total_amount?: number | string | null;
  balance_due?: number | string | null;
  source_type?: string | null;
  source_id?: number | null;
  source_number?: string | null;
  source_revision?: number | null;
};

export type PurchaseLineItem = Record<string, unknown> & {
  id?: number;
  purchase_request_line_id?: number | null;
  purchase_order_line_id?: number | null;
  goods_receipt_line_id?: number | null;
  vendor_bill_line_id?: number | null;
  product_id?: number | null;
  product_code?: string | null;
  description?: string | null;
  quantity?: number | string | null;
  unit_id?: number | null;
  unit_price?: number | string | null;
  estimated_unit_price?: number | string | null;
  discount_amount?: number | string | null;
  tax_amount?: number | string | null;
  line_total?: number | string | null;
  warehouse_id?: number | null;
  department_id?: number | null;
  project_id?: number | null;
  expense_account_id?: number | null;
};

export type PurchaseEndpointConfig = {
  key: string;
  label: string;
  singular: string;
  href: string;
  apiPath: string;
  permissionPrefix: string;
  numberKeys: string[];
  dateKeys: string[];
  sourceCreate?: {
    segment: string;
    path: (id: string) => string;
    sourceLabel: string;
  };
};
