import { api } from '@/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'

export type PermissionCatalogItem = {
  key: string
  module: string
  feature: string
  action: string
  label: string
  description?: string | null
  matrix_column?: string | null
  is_special: boolean
}

export type PermissionCatalogFeature = {
  key: string
  label: string
  permissions: Record<string, PermissionCatalogItem>
}

export type PermissionCatalogModule = {
  key: string
  label: string
  features: PermissionCatalogFeature[]
  special_permissions: PermissionCatalogItem[]
}

export type PermissionCatalog = {
  matrix_columns: string[]
  modules: PermissionCatalogModule[]
}

export type EffectivePermissionPayload = {
  company_user: {
    id: number
    company_id: number
    user_id: number
    name: string
    email: string
    role: string
    role_id: number | null
    role_name: string | null
    status: string
  }
  role_permission_keys: string[]
  allow_override_keys: string[]
  deny_override_keys: string[]
  effective_permission_keys: string[]
  overrides: Array<{ permission_key: string; effect: 'allow' | 'deny'; reason?: string | null }>
}

export async function fetchPermissionCatalog() {
  const response = await api.get<ApiResponse<PermissionCatalog>>('/access/permission-catalog')
  return unwrap(response.data)
}

export async function fetchUserPermissions(companyUserId: number) {
  const response = await api.get<ApiResponse<EffectivePermissionPayload>>(`/access/users/${companyUserId}/permissions`)
  return unwrap(response.data)
}

export async function updateUserPermissions(
  companyUserId: number,
  payload: { role_id?: number | null; overrides: Array<{ permission_key: string; effect: 'allow' | 'deny' }> },
) {
  const response = await api.put<ApiResponse<EffectivePermissionPayload>>(`/access/users/${companyUserId}/permissions`, payload)
  return unwrap(response.data)
}

export async function copyUserAccess(
  companyUserId: number,
  payload: { source_company_user_id: number; copy_role: boolean; copy_overrides: boolean },
) {
  const response = await api.post<ApiResponse<EffectivePermissionPayload>>(`/access/users/${companyUserId}/copy-access`, payload)
  return unwrap(response.data)
}

export async function resetUserPermissions(companyUserId: number) {
  const response = await api.post<ApiResponse<EffectivePermissionPayload>>(`/access/users/${companyUserId}/reset-permissions`)
  return unwrap(response.data)
}
