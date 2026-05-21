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
  sales_order_line_id?: number | null;
  delivery_order_line_id?: number | null;
  proforma_invoice_line_id?: number | null;
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
  subtotal?: number | string;
  discount_total?: number | string;
  tax_total?: number | string;
  grand_total?: number | string;
  paid_amount?: number | string;
  balance_due?: number | string;
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

export type DeliveryOrder = SalesDocument & {
  delivery_number: string;
  delivery_date: string;
  sales_order_id?: number | null;
  warehouse_id?: number | null;
  shipping_address?: string | null;
  customer?: { id: number; name: string; contact_code?: string | null };
  sales_order?: SalesOrder | null;
  salesOrder?: SalesOrder | null;
  lines?: SalesLineItem[];
  ready_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
};

export type ProformaInvoice = SalesDocument & {
  proforma_number: string;
  proforma_date: string;
  valid_until?: string | null;
  sales_quotation_id?: number | null;
  sales_order_id?: number | null;
  customer?: { id: number; name: string; contact_code?: string | null };
  quotation?: SalesQuotation | null;
  sales_order?: SalesOrder | null;
  salesOrder?: SalesOrder | null;
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

export type SalesInvoice = SalesDocument & {
  invoice_number: string;
  invoice_date: string;
  due_date?: string | null;
  sales_order_id?: number | null;
  delivery_order_id?: number | null;
  proforma_invoice_id?: number | null;
  customer?: { id: number; name: string; contact_code?: string | null };
  sales_order?: SalesOrder | null;
  salesOrder?: SalesOrder | null;
  delivery_order?: DeliveryOrder | null;
  deliveryOrder?: DeliveryOrder | null;
  proforma_invoice?: ProformaInvoice | null;
  proformaInvoice?: ProformaInvoice | null;
  journal_entry_id?: number | null;
  journal_entry?: Record<string, unknown> | null;
  lines?: SalesLineItem[];
  applied_down_payment_amount?: number | string;
  returned_amount?: number | string;
  paid_amount?: number | string;
  balance_due?: number | string;
  subtotal_before_discount?: number | string;
  line_discount_total?: number | string;
  header_discount_type?: string | null;
  header_discount_value?: number | string | null;
  header_discount_amount?: number | string;
  subtotal_after_discount?: number | string;
  tax_total?: number | string;
  grand_total?: number | string;
};

export type CustomerDeposit = SalesDocument & {
  deposit_number: string;
  deposit_date: string;
  sales_order_id?: number | null;
  cash_bank_account_id?: number | null;
  amount?: number | string;
  allocated_amount?: number | string;
  remaining_amount?: number | string;
  customer?: { id: number; name: string; contact_code?: string | null };
  sales_order?: SalesOrder | null;
  salesOrder?: SalesOrder | null;
  allocations?: Array<Record<string, unknown>>;
  journal_entry_id?: number | null;
};

export type SalesReceipt = SalesDocument & {
  receipt_number: string;
  receipt_date: string;
  sales_invoice_id?: number | null;
  cash_bank_account_id?: number | null;
  amount?: number | string;
  applied_amount?: number | string;
  unapplied_amount?: number | string;
  customer?: { id: number; name: string; contact_code?: string | null };
  sales_invoice?: SalesInvoice | null;
  salesInvoice?: SalesInvoice | null;
  lines?: Array<Record<string, unknown>>;
  journal_entry_id?: number | null;
};

export type SalesReturn = SalesDocument & {
  return_number: string;
  return_date: string;
  sales_invoice_id?: number | null;
  delivery_order_id?: number | null;
  reason?: string | null;
  customer?: { id: number; name: string; contact_code?: string | null };
  sales_invoice?: SalesInvoice | null;
  salesInvoice?: SalesInvoice | null;
  delivery_order?: DeliveryOrder | null;
  deliveryOrder?: DeliveryOrder | null;
  lines?: SalesLineItem[];
  subtotal_before_discount?: number | string;
  discount_total?: number | string;
  tax_total?: number | string;
  grand_total?: number | string;
  journal_entry_id?: number | null;
};
