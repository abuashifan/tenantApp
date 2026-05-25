export type TransactionCalculationLine = Record<string, unknown> & {
  quantity?: number | string | null
  unit_price?: number | string | null
  estimated_unit_price?: number | string | null
  amount?: number | string | null
  discount_type?: string | null
  discount_value?: number | string | null
  discount_amount?: number | string | null
  tax_rate?: number | string | null
  tax_amount?: number | string | null
  line_total?: number | string | null
}

export type TransactionCalculatedLine = TransactionCalculationLine & {
  gross_amount: number
  discount_amount: number
  subtotal_after_discount: number
  tax_amount: number
  line_total: number
}

export type TransactionTotals = {
  subtotal_before_discount: number
  line_discount_total: number
  header_discount_amount: number
  subtotal_after_discount: number
  tax_total: number
  grand_total: number
}

export type TransactionCalculationOptions = {
  priceField?: 'unit_price' | 'estimated_unit_price' | 'amount'
  headerDiscountType?: unknown
  headerDiscountValue?: unknown
  taxIncluded?: unknown
}

export function toTransactionNumber(value: unknown) {
  const numberValue = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : 0
  return Number.isFinite(numberValue) ? numberValue : 0
}

function roundMoney(value: number) {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100
}

function clampNonNegative(value: number) {
  return Math.max(0, Number.isFinite(value) ? value : 0)
}

export function calculateDiscountAmount(type: unknown, value: unknown, fallbackAmount: unknown, base: number) {
  const normalizedType = typeof type === 'string' && type ? type : null
  const numericValue = clampNonNegative(toTransactionNumber(value))
  const fallback = clampNonNegative(toTransactionNumber(fallbackAmount))

  if (normalizedType === 'percent') return roundMoney(Math.min(base, base * (Math.min(numericValue, 100) / 100)))
  if (normalizedType === 'fixed_amount') return roundMoney(Math.min(base, numericValue))
  return roundMoney(Math.min(base, fallback || numericValue))
}

export function calculateTransactionLine(
  line: TransactionCalculationLine,
  options: TransactionCalculationOptions = {},
): TransactionCalculatedLine {
  const priceField = options.priceField ?? 'unit_price'
  const quantity = clampNonNegative(toTransactionNumber(line.quantity))
  const unitPrice = clampNonNegative(toTransactionNumber(line[priceField]))
  const grossAmount = roundMoney(quantity * unitPrice)
  const discountAmount = calculateDiscountAmount(line.discount_type, line.discount_value, line.discount_amount, grossAmount)
  const taxableBase = roundMoney(Math.max(0, grossAmount - discountAmount))
  const hasTaxRate = line.tax_rate !== null && line.tax_rate !== undefined && line.tax_rate !== ''
  const taxAmount = hasTaxRate
    ? roundMoney(taxableBase * (clampNonNegative(toTransactionNumber(line.tax_rate)) / 100))
    : roundMoney(clampNonNegative(toTransactionNumber(line.tax_amount)))
  const lineTotal = roundMoney(taxableBase + taxAmount)

  return {
    ...line,
    discount_type: line.discount_type || 'fixed_amount',
    discount_value: line.discount_value ?? (discountAmount > 0 ? discountAmount : 0),
    discount_amount: discountAmount,
    tax_rate: line.tax_rate ?? 0,
    tax_amount: taxAmount,
    gross_amount: grossAmount,
    subtotal_after_discount: taxableBase,
    line_total: lineTotal,
  }
}

export function calculateTransactionTotals(
  lines: TransactionCalculationLine[],
  options: TransactionCalculationOptions = {},
): TransactionTotals & { lines: TransactionCalculatedLine[] } {
  const calculatedLines = lines.map((line) => calculateTransactionLine(line, options))
  const subtotalBeforeDiscount = roundMoney(calculatedLines.reduce((sum, line) => sum + line.gross_amount, 0))
  const lineDiscountTotal = roundMoney(calculatedLines.reduce((sum, line) => sum + line.discount_amount, 0))
  const subtotalAfterLineDiscount = roundMoney(subtotalBeforeDiscount - lineDiscountTotal)
  const headerDiscountAmount = calculateDiscountAmount(
    options.headerDiscountType,
    options.headerDiscountValue,
    null,
    subtotalAfterLineDiscount,
  )
  const subtotalAfterDiscount = roundMoney(Math.max(0, subtotalAfterLineDiscount - headerDiscountAmount))
  const lineTaxBase = roundMoney(calculatedLines.reduce((sum, line) => sum + line.subtotal_after_discount, 0))
  const lineTaxTotal = roundMoney(calculatedLines.reduce((sum, line) => sum + line.tax_amount, 0))
  const taxTotal = lineTaxBase > 0 ? roundMoney(lineTaxTotal * (subtotalAfterDiscount / lineTaxBase)) : 0
  const grandTotal = roundMoney(subtotalAfterDiscount + taxTotal)

  return {
    lines: calculatedLines,
    subtotal_before_discount: subtotalBeforeDiscount,
    line_discount_total: lineDiscountTotal,
    header_discount_amount: headerDiscountAmount,
    subtotal_after_discount: subtotalAfterDiscount,
    tax_total: taxTotal,
    grand_total: grandTotal,
  }
}
