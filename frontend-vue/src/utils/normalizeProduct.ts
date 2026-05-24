export type NormalizedProduct = {
  id: number | string
  code: string
  name: string
  label: string
  unit_id?: number | string | null
  unit_name?: string | null
  selling_price: number
  purchase_price: number
  raw: unknown
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function firstString(raw: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = raw[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function firstValue(raw: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = raw[key]
    if (value !== null && value !== undefined && value !== '') return value as number | string
  }
  return null
}

function firstNumber(raw: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = raw[key]
    if (value === null || value === undefined || value === '') continue
    const numberValue = Number(value)
    if (Number.isFinite(numberValue)) return numberValue
  }
  return 0
}

export function normalizeProduct(raw: unknown): NormalizedProduct {
  const product = isRecord(raw) ? raw : {}
  const id = firstValue(product, ['id', 'product_id']) ?? ''
  const code = firstString(product, ['product_code', 'code', 'sku', 'item_code'])
  const name = firstString(product, ['product_name', 'name', 'item_name', 'description'])
  const label = code && name ? `${code} - ${name}` : name || code || '(Unnamed product)'

  return {
    id,
    code,
    name,
    label,
    unit_id: firstValue(product, ['unit_id']),
    unit_name: firstString(product, ['unit_name']) || null,
    selling_price: firstNumber(product, ['selling_price', 'default_selling_price', 'price', 'unit_price']),
    purchase_price: firstNumber(product, ['purchase_price', 'default_purchase_price', 'cost_price', 'unit_cost']),
    raw,
  }
}

function extractProductArray(response: unknown): unknown[] {
  if (Array.isArray(response)) return response
  if (!isRecord(response)) return []

  if (Array.isArray(response.items)) return response.items
  if (Array.isArray(response.data)) return response.data
  if ('data' in response) return extractProductArray(response.data)

  return []
}

export function normalizeProductList(response: unknown): NormalizedProduct[] {
  return extractProductArray(response)
    .map(normalizeProduct)
    .filter((product) => product.id !== '')
}
