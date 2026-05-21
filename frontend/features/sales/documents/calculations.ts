import type { SalesLineItem, SalesTotals } from '@/features/sales/types';

export function calculateSalesLine(line: SalesLineItem): SalesLineItem {
  const quantity = Number(line.quantity ?? 0);
  const unitPrice = Number(line.unit_price ?? 0);
  const taxRate = Number(line.tax_rate ?? 0);
  const gross = round(quantity * unitPrice);
  const discountAmount = calculateDiscount(line.discount_type, Number(line.discount_value ?? 0), gross);
  const afterDiscount = round(gross - discountAmount);
  const taxAmount = round(afterDiscount * (taxRate / 100));
  const lineTotal = round(afterDiscount + taxAmount);

  return {
    ...line,
    gross_amount: gross,
    discount_amount: discountAmount,
    subtotal_after_discount: afterDiscount,
    tax_amount: taxAmount,
    line_total: lineTotal,
  };
}

export function calculateSalesTotals(
  lines: SalesLineItem[],
  headerDiscountType?: string | null,
  headerDiscountValue?: number | string | null,
): SalesTotals & {
  subtotal_before_discount: number;
  line_discount_total: number;
  header_discount_amount: number;
  subtotal_after_discount: number;
  tax_total: number;
} {
  const calculated = lines.map(calculateSalesLine);
  const subtotalBeforeDiscount = round(sum(calculated, 'gross_amount'));
  const lineDiscountTotal = round(sum(calculated, 'discount_amount'));
  const subtotalAfterLineDiscount = round(subtotalBeforeDiscount - lineDiscountTotal);
  const headerDiscountAmount = calculateDiscount(
    headerDiscountType,
    Number(headerDiscountValue ?? 0),
    subtotalAfterLineDiscount,
  );
  const subtotalAfterDiscount = round(subtotalAfterLineDiscount - headerDiscountAmount);
  const lineTaxBase = round(sum(calculated, 'subtotal_after_discount'));
  const lineTaxTotal = round(sum(calculated, 'tax_amount'));
  const taxTotal = lineTaxBase > 0 ? round(lineTaxTotal * (subtotalAfterDiscount / lineTaxBase)) : 0;
  const grandTotal = round(subtotalAfterDiscount + taxTotal);

  return {
    subtotal: subtotalBeforeDiscount,
    discount_total: round(lineDiscountTotal + headerDiscountAmount),
    tax_total: taxTotal,
    grand_total: grandTotal,
    subtotal_before_discount: subtotalBeforeDiscount,
    line_discount_total: lineDiscountTotal,
    header_discount_amount: headerDiscountAmount,
    subtotal_after_discount: subtotalAfterDiscount,
  };
}

function calculateDiscount(type: string | null | undefined, value: number, base: number): number {
  if (!type || value <= 0) return 0;
  if (type === 'percent') return round(base * (value / 100));
  if (type === 'fixed_amount') return round(value);
  return 0;
}

function sum(lines: SalesLineItem[], key: keyof SalesLineItem): number {
  return lines.reduce((total, line) => total + Number(line[key] ?? 0), 0);
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
