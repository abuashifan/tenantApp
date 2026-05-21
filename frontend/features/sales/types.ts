export type SalesDocumentStatus =
  | 'draft'
  | 'sent'
  | 'approved'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted'
  | 'confirmed'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'issued'
  | 'posted'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'void'
  | 'closed';

export type SalesDocument = Record<string, unknown> & {
  id: number;
  document_number?: string;
  quotation_number?: string;
  order_number?: string;
  delivery_order_number?: string;
  proforma_number?: string;
  invoice_number?: string;
  receipt_number?: string;
  return_number?: string;
  document_date?: string;
  customer_id?: number | null;
  customer_name?: string | null;
  status?: SalesDocumentStatus | string;
  grand_total?: number | string;
  total_amount?: number | string;
  balance_due?: number | string;
  source_type?: string | null;
  source_id?: number | null;
  source_number?: string | null;
  source_revision?: number | null;
};

export type SalesLineItem = {
  id?: number;
  quotation_line_id?: number | null;
  product_id?: number | null;
  product_code?: string | null;
  description?: string | null;
  quantity?: number;
  unit_id?: number | null;
  unit_price?: number;
  discount_type?: 'percent' | 'fixed_amount' | string | null;
  discount_value?: number;
  discount_amount?: number;
  gross_amount?: number;
  subtotal_after_discount?: number;
  tax_rate?: number;
  tax_amount?: number;
  line_total?: number;
  delivered_quantity?: number | string;
  invoiced_quantity?: number | string;
  returned_quantity?: number | string;
  warehouse_id?: number | null;
  department_id?: number | null;
  project_id?: number | null;
};

export type SalesTotals = {
  subtotal?: number;
  discount_total?: number;
  tax_total?: number;
  grand_total?: number;
  paid_amount?: number;
  balance_due?: number;
};

export type SalesModuleNavItem = {
  label: string;
  href: string;
  permission: string;
  description: string;
};

export type SalesQuotation = SalesDocument & {
  quotation_number: string;
  quotation_date: string;
  valid_until?: string | null;
  quotation_for?: string | null;
  customer?: { id: number; name: string; contact_code?: string | null };
  lines?: SalesLineItem[];
  subtotal_before_discount?: number | string;
  line_discount_total?: number | string;
  header_discount_type?: string | null;
  header_discount_value?: number | string | null;
  header_discount_amount?: number | string;
  subtotal_after_discount?: number | string;
  tax_total?: number | string;
  grand_total?: number | string;
};

export type SalesOrder = SalesDocument & {
  order_number: string;
  order_date: string;
  quotation_id?: number | null;
  customer?: { id: number; name: string; contact_code?: string | null };
  quotation?: SalesQuotation | null;
  deposits?: Array<Record<string, unknown>>;
  lines?: SalesLineItem[];
  has_down_payment?: boolean;
  subtotal_before_discount?: number | string;
  line_discount_total?: number | string;
  header_discount_type?: string | null;
  header_discount_value?: number | string | null;
  header_discount_amount?: number | string;
  subtotal_after_discount?: number | string;
  tax_total?: number | string;
  grand_total?: number | string;
};
