import type { SalesDocument, SalesLineItem, SalesOrder, SalesQuotation } from '@/features/sales/types';

export function salesDocumentNumber(document: SalesDocument): string {
  return String(
    document.quotation_number ??
      document.order_number ??
      document.delivery_number ??
    document.delivery_order_number ??
    document.proforma_number ??
    document.invoice_number ??
    document.receipt_number ??
      document.return_number ??
      document.document_number ??
      `#${document.id}`,
  );
}

export function salesDocumentDate(document: SalesDocument): string {
  return String(
    document.quotation_date ??
      document.order_date ??
      document.delivery_date ??
      document.proforma_date ??
      document.invoice_date ??
      document.document_date ??
      '-',
  ).slice(0, 10);
}

export function customerName(document: SalesQuotation | SalesOrder | SalesDocument): string {
  const customer = document.customer as { name?: string; contact_code?: string | null } | undefined;
  return customer?.name ?? document.customer_name ?? (document.customer_id ? `Customer #${document.customer_id}` : '-');
}

export function normalizeSalesLines(lines?: SalesLineItem[]): SalesLineItem[] {
  return (lines ?? []).map((line) => ({
    ...line,
    quantity: Number(line.quantity ?? 0),
    unit_price: Number(line.unit_price ?? 0),
    discount_value: Number(line.discount_value ?? 0),
    tax_rate: Number(line.tax_rate ?? 0),
  }));
}

export function isQuotationEditable(status?: string | null): boolean {
  return !['cancelled', 'rejected', 'expired', 'converted'].includes(String(status ?? ''));
}

export function isOrderEditable(status?: string | null): boolean {
  return ['draft', 'approved'].includes(String(status ?? ''));
}

export function isDeliveryOrderEditable(status?: string | null): boolean {
  return ['draft', 'ready'].includes(String(status ?? ''));
}

export function isDraftEditable(status?: string | null): boolean {
  return String(status ?? 'draft') === 'draft';
}
