import { apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { InventoryListFilters, InventoryProductStock, InventoryValuation, StockAdjustment, StockAdjustmentPayload, StockMovement, StockOpname, StockOpnamePayload, WarehouseStock } from '@/types/inventory';

function query(params: InventoryListFilters = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return search.toString() ? `?${search.toString()}` : '';
}

function get<T>(path: string, params: InventoryListFilters = {}) {
  return apiRequest<ApiResponse<T>>(`/inventory${path}${query(params)}`);
}

function post<T>(path: string, body?: unknown) {
  return apiRequest<ApiResponse<T>>(`/inventory${path}`, { method: 'POST', body });
}

function patch<T>(path: string, body?: unknown) {
  return apiRequest<ApiResponse<T>>(`/inventory${path}`, { method: 'PATCH', body });
}

export const getStockList = (filters: InventoryListFilters = {}) => get<InventoryProductStock[]>('/stock-balances', filters);
export const getProductStockDetail = (productId: string | number, filters: InventoryListFilters = {}) => get<InventoryProductStock[]>(`/stock-balances/product/${productId}`, filters);
export const getWarehouseStock = (warehouseId: string | number, filters: InventoryListFilters = {}) => get<WarehouseStock[]>(`/stock-balances/warehouse/${warehouseId}`, filters);

export const getStockMovements = (filters: InventoryListFilters = {}) => get<StockMovement[]>('/stock-movements', filters);
export const getStockMovementDetail = (id: string | number) => get<StockMovement>(`/stock-movements/${id}`);

export const getStockAdjustments = (filters: InventoryListFilters = {}) => get<StockAdjustment[]>('/stock-adjustments', filters);
export const getStockAdjustmentDetail = (id: string | number) => get<StockAdjustment>(`/stock-adjustments/${id}`);
export const createStockAdjustment = (payload: StockAdjustmentPayload) => post<StockAdjustment>('/stock-adjustments', payload);
export const updateStockAdjustment = (id: string | number, payload: StockAdjustmentPayload) => patch<StockAdjustment>(`/stock-adjustments/${id}`, payload);
export const approveStockAdjustment = (id: string | number) => patch<StockAdjustment>(`/stock-adjustments/${id}/approve`);
export const postStockAdjustment = (id: string | number) => patch<StockAdjustment>(`/stock-adjustments/${id}/post`);
export const voidStockAdjustment = (id: string | number, reason?: string) => patch<StockAdjustment>(`/stock-adjustments/${id}/void`, { reason });

export const getStockOpnameList = (filters: InventoryListFilters = {}) => get<StockOpname[]>('/stock-opnames', filters);
export const getStockOpnameDetail = (id: string | number) => get<StockOpname>(`/stock-opnames/${id}`);
export const createStockOpname = (payload: StockOpnamePayload) => post<StockOpname>('/stock-opnames', payload);
export const generateStockOpnameLines = (id: string | number) => post<StockOpname>(`/stock-opnames/${id}/generate-lines`);
export const updateStockOpnameLine = (id: string | number, lineId: string | number, payload: StockOpnamePayload) => patch<StockOpname>(`/stock-opnames/${id}/lines/${lineId}`, payload);
export const markStockOpnameCounted = (id: string | number) => patch<StockOpname>(`/stock-opnames/${id}/counted`);
export const finalizeStockOpname = (id: string | number) => patch<StockOpname>(`/stock-opnames/${id}/finalize`);

export const getInventoryValuation = (filters: InventoryListFilters = {}) => get<InventoryValuation>('/reports/valuation', filters);
export const getStockCard = (filters: InventoryListFilters = {}) => get<InventoryValuation>('/reports/stock-card', filters);
