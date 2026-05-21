import { apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

export type SalesQueryParams = Record<string, string | number | boolean | null | undefined>;

export function buildSalesQuery(params: SalesQueryParams = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return search.toString() ? `?${search.toString()}` : '';
}

export async function salesGet<T>(path: string, params: SalesQueryParams = {}) {
  return apiRequest<ApiResponse<T>>(`/sales${path}${buildSalesQuery(params)}`);
}

export async function salesPost<T>(path: string, body?: unknown) {
  return apiRequest<ApiResponse<T>>(`/sales${path}`, {
    method: 'POST',
    body,
  });
}

export async function salesPatch<T>(path: string, body?: unknown) {
  return apiRequest<ApiResponse<T>>(`/sales${path}`, {
    method: 'PATCH',
    body,
  });
}
