import { apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { AccountMapping, MasterDataRecord } from '@/types/accounting';

export async function listMasterData(path: string) {
  return apiRequest<ApiResponse<MasterDataRecord[]>>(path);
}

export async function createMasterData(path: string, payload: Record<string, unknown>) {
  return apiRequest<ApiResponse<MasterDataRecord>>(path, {
    method: 'POST',
    body: payload,
  });
}

export async function updateMasterData(
  path: string,
  id: number | string,
  payload: Record<string, unknown>,
) {
  return apiRequest<ApiResponse<MasterDataRecord>>(`${path}/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function activateMasterData(path: string, id: number | string) {
  return apiRequest<ApiResponse<MasterDataRecord>>(`${path}/${id}/activate`, {
    method: 'PATCH',
  });
}

export async function deactivateMasterData(path: string, id: number | string) {
  return apiRequest<ApiResponse<MasterDataRecord>>(`${path}/${id}/deactivate`, {
    method: 'PATCH',
  });
}

export async function listAccountMappings() {
  return apiRequest<ApiResponse<AccountMapping[]>>('/master-data/account-mappings');
}

export async function updateAccountMapping(mappingKey: string, accountId: number | null) {
  return apiRequest<ApiResponse<AccountMapping>>(
    `/master-data/account-mappings/${encodeURIComponent(mappingKey)}`,
    {
      method: 'PATCH',
      body: { account_id: accountId },
    },
  );
}
