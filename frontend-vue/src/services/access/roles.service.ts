import { api } from '@/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'

export type AccessRole = {
  id: number
  name: string
  slug: string
  description?: string | null
  is_system: boolean
  is_active: boolean
  permission_keys?: string[]
  permissions_count?: number
  assigned_users_count?: number
}

export async function fetchRoles() {
  const response = await api.get<ApiResponse<AccessRole[]>>('/access/roles')
  return unwrap(response.data)
}

export async function fetchRole(roleId: number) {
  const response = await api.get<ApiResponse<AccessRole>>(`/access/roles/${roleId}`)
  return unwrap(response.data)
}

export async function updateRolePermissions(roleId: number, permissionKeys: string[]) {
  const response = await api.put<ApiResponse<AccessRole>>(`/access/roles/${roleId}/permissions`, {
    permission_keys: permissionKeys,
  })
  return unwrap(response.data)
}

export async function createRole(payload: { name: string; slug: string; description?: string; permission_keys?: string[] }) {
  const response = await api.post<ApiResponse<AccessRole>>('/access/roles', payload)
  return unwrap(response.data)
}

export async function updateRole(roleId: number, payload: { name?: string; slug?: string; description?: string; is_active?: boolean }) {
  const response = await api.patch<ApiResponse<AccessRole>>(`/access/roles/${roleId}`, payload)
  return unwrap(response.data)
}

export async function cloneRole(roleId: number, payload: { name?: string; slug?: string } = {}) {
  const response = await api.post<ApiResponse<AccessRole>>(`/access/roles/${roleId}/clone`, payload)
  return unwrap(response.data)
}

export async function deactivateRole(roleId: number) {
  const response = await api.patch<ApiResponse<AccessRole>>(`/access/roles/${roleId}/deactivate`)
  return unwrap(response.data)
}

export async function reactivateRole(roleId: number) {
  const response = await api.patch<ApiResponse<AccessRole>>(`/access/roles/${roleId}/reactivate`)
  return unwrap(response.data)
}
