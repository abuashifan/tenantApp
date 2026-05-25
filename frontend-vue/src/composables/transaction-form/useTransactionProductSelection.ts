import type { TransactionLineProductConfig } from '@/composables/transaction-form/types'
import type { NormalizedProduct } from '@/utils/normalizeProduct'

type TransactionProductLine = Record<string, unknown> & {
  description?: unknown
}

function shouldSetDescription(line: TransactionProductLine, previousProductDescription?: string) {
  const description = typeof line.description === 'string' ? line.description.trim() : ''
  return !description || (!!previousProductDescription && description === previousProductDescription)
}

function applyProductToLine(
  line: TransactionProductLine,
  product: NormalizedProduct,
  config: TransactionLineProductConfig,
  previousProductDescription?: string,
) {
  const priceField = config.priceField ?? 'unit_price'
  const price = config.priceMode === 'sales' ? product.selling_price : config.priceMode === 'purchase' ? product.purchase_price : undefined
  const isSameProduct = String((line as Record<string, unknown>).product_id ?? '') === String(product.id)
  const next: Record<string, unknown> = {
    ...line,
    product_id: product.id,
    product_code: product.code,
    unit_id: product.unit_id ?? null,
    unit_name: product.unit_name ?? null,
  }

  if (shouldSetDescription(line, previousProductDescription)) next.description = product.name || product.label
  if (price !== undefined && !isSameProduct) next[priceField] = price

  return next
}

export function applySalesProductToLine(
  line: TransactionProductLine,
  product: NormalizedProduct,
  priceField: TransactionLineProductConfig['priceField'] = 'unit_price',
  previousProductDescription?: string,
) {
  return applyProductToLine(line, product, { priceMode: 'sales', priceField }, previousProductDescription)
}

export function applyPurchaseProductToLine(
  line: TransactionProductLine,
  product: NormalizedProduct,
  priceField: TransactionLineProductConfig['priceField'] = 'unit_price',
  previousProductDescription?: string,
) {
  return applyProductToLine(line, product, { priceMode: 'purchase', priceField }, previousProductDescription)
}

export function applyConfiguredProductToLine(
  line: TransactionProductLine,
  product: NormalizedProduct,
  config: TransactionLineProductConfig,
  previousProductDescription?: string,
) {
  return applyProductToLine(line, product, config, previousProductDescription)
}
