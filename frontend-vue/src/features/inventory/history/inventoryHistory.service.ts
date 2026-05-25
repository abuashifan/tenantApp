import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'

export type InventoryHistoryParams = {
  product_id: string | number
  warehouse_id?: string | number
  start_date: string
  end_date: string
}

export type StockCardMovement = {
  id: number
  date: string
  number: string
  type: string
  description: string | null
  document_number: string | null
  qty_in: number
  qty_out: number
  running_quantity: number
  unit_cost: number
  warehouse_name: string | null
  department_name: string | null
  project_name: string | null
}

export type StockCardResult = {
  opening_quantity: number
  movements: StockCardMovement[]
  ending_quantity: number
}

type Warehouse = {
  id: number | string
  name: string
}

export type WarehouseOption = {
  id: string
  name: string
}

export async function getInventoryHistory(params: InventoryHistoryParams) {
  const response = await api.get<ApiResponse<StockCardResult>>('/inventory/reports/stock-card', { params })
  return unwrap(response.data)
}

export async function listInventoryHistoryWarehouses() {
  const response = await api.get<ApiResponse<Warehouse[]>>('/master-data/warehouses', {
    params: { is_active: true },
  })
  return unwrap(response.data).map((warehouse) => ({ id: String(warehouse.id), name: warehouse.name }))
}
