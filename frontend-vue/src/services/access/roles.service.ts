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
