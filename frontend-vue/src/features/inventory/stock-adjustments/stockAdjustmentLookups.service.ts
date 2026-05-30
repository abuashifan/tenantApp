import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'

export type StockAdjustmentLookupOption = {
  id: number
  code: string
  name: string
  label: string
  currentQuantity?: number
  averageCost?: number
}

export type StockAdjustmentBalance = {
  productId: number
  warehouseId: number
  quantityOnHand: number
  averageCost: number
}

export type StockAdjustmentLookups = {
  products: StockAdjustmentLookupOption[]
  warehouses: StockAdjustmentLookupOption[]
  departments: StockAdjustmentLookupOption[]
  projects: StockAdjustmentLookupOption[]
  balances: StockAdjustmentBalance[]
  balancesLoaded: boolean
}

type ApiRecord = Record<string, unknown>

function asRecord(value: unknown): ApiRecord {
  return value != null && typeof value === 'object' && !Array.isArray(value) ? (value as ApiRecord) : {}
}

function asArray(value: unknown): ApiRecord[] {
  if (Array.isArray(value)) return value.map(asRecord)
  const record = asRecord(value)
  for (const key of ['data', 'items', 'records']) {
    if (Array.isArray(record[key])) return (record[key] as unknown[]).map(asRecord)
  }
  return []
}

function stringValue(value: unknown) {
  return value == null ? '' : String(value)
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function optionFrom(record: ApiRecord, codeKeys: string[], nameKeys: string[]): StockAdjustmentLookupOption | null {
  const id = numberValue(record.id, NaN)
  if (!Number.isFinite(id)) return null
  const code = stringValue(codeKeys.map((key) => record[key]).find((value) => value != null && value !== ''))
  const name = stringValue(nameKeys.map((key) => record[key]).find((value) => value != null && value !== ''))
  const label = code && name ? `${code} - ${name}` : name || code || String(id)
  return {
    id,
    code,
    name,
    label,
    currentQuantity: numberValue(record.current_quantity ?? record.quantity_on_hand ?? record.stock_quantity, 0),
    averageCost: numberValue(record.average_cost, 0),
  }
}

async function getRecords(endpoint: string, params?: Record<string, unknown>) {
  const response = await api.get<ApiResponse<unknown>>(endpoint, { params })
  return asArray(unwrap(response.data))
}

async function safeRecords(endpoint: string, params?: Record<string, unknown>) {
  try {
    return await getRecords(endpoint, params)
  } catch {
    return []
  }
}

export async function loadStockAdjustmentLookups(): Promise<StockAdjustmentLookups> {
  const [products, warehouses, departments, projects, balances] = await Promise.all([
    safeRecords('/master-data/products'),
    safeRecords('/master-data/warehouses'),
    safeRecords('/master-data/departments'),
    safeRecords('/master-data/projects'),
    getRecords('/inventory/stock-balances').then(
      (rows) => ({ loaded: true, rows }),
      () => ({ loaded: false, rows: [] }),
    ),
  ])

  return {
    products: products
      .map((record) => optionFrom(record, ['product_code', 'code'], ['product_name', 'name']))
      .filter((option): option is StockAdjustmentLookupOption => option != null),
    warehouses: warehouses
      .map((record) => optionFrom(record, ['code', 'warehouse_code'], ['name', 'warehouse_name']))
      .filter((option): option is StockAdjustmentLookupOption => option != null),
    departments: departments
      .map((record) => optionFrom(record, ['code', 'department_code'], ['name', 'department_name']))
      .filter((option): option is StockAdjustmentLookupOption => option != null),
    projects: projects
      .map((record) => optionFrom(record, ['code', 'project_code'], ['name', 'project_name']))
      .filter((option): option is StockAdjustmentLookupOption => option != null),
    balances: balances.rows
      .map((record) => ({
        productId: numberValue(record.product_id, NaN),
        warehouseId: numberValue(record.warehouse_id, NaN),
        quantityOnHand: numberValue(record.quantity_on_hand, 0),
        averageCost: numberValue(record.average_cost, 0),
      }))
      .filter((balance) => Number.isFinite(balance.productId) && Number.isFinite(balance.warehouseId)),
    balancesLoaded: balances.loaded,
  }
}
