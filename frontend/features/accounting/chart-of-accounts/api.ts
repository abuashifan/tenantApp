import { apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type {
  ChartOfAccount,
  ChartOfAccountPayload,
} from '@/types/accounting';

const BASE_PATH = '/master-data/chart-of-accounts';

export type ChartOfAccountFilters = {
  account_type?: string;
  is_active?: string;
  is_cash_bank?: string;
};

export async function listChartOfAccounts(filters: ChartOfAccountFilters = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      params.set(key, value);
    }
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ApiResponse<ChartOfAccount[]>>(`${BASE_PATH}${suffix}`);
}

export async function getChartOfAccount(id: string | number) {
  return apiRequest<ApiResponse<ChartOfAccount>>(`${BASE_PATH}/${id}`);
}

export async function createChartOfAccount(payload: ChartOfAccountPayload) {
  return apiRequest<ApiResponse<ChartOfAccount>>(BASE_PATH, {
    method: 'POST',
    body: payload,
  });
}

export async function updateChartOfAccount(
  id: string | number,
  payload: ChartOfAccountPayload,
) {
  return apiRequest<ApiResponse<ChartOfAccount>>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deactivateChartOfAccount(id: string | number) {
  return apiRequest<ApiResponse<ChartOfAccount>>(`${BASE_PATH}/${id}/deactivate`, {
    method: 'PATCH',
  });
}

export async function activateChartOfAccount(id: string | number) {
  return apiRequest<ApiResponse<ChartOfAccount>>(`${BASE_PATH}/${id}/activate`, {
    method: 'PATCH',
  });
}

