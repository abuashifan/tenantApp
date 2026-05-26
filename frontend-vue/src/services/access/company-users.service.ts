import { api } from '@/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'

export type AccessCompanyUser = {
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

export async function fetchCompanyUsers() {
  const response = await api.get<ApiResponse<AccessCompanyUser[]>>('/access/company-users')
  return unwrap(response.data)
}

export async function fetchCompanyUser(companyUserId: number) {
  const response = await api.get<ApiResponse<AccessCompanyUser>>(`/access/company-users/${companyUserId}`)
  return unwrap(response.data)
}

export async function updateCompanyUserRole(
  companyUserId: number,
  payload: { role_id?: number | null; role?: string; reset_overrides?: boolean },
) {
  const response = await api.patch<ApiResponse<unknown>>(`/access/company-users/${companyUserId}/role`, payload)
  return unwrap(response.data)
}

export async function deactivateCompanyUser(companyUserId: number) {
  const response = await api.patch<ApiResponse<AccessCompanyUser>>(`/access/company-users/${companyUserId}/deactivate`)
  return unwrap(response.data)
}

export async function reactivateCompanyUser(companyUserId: number) {
  const response = await api.patch<ApiResponse<AccessCompanyUser>>(`/access/company-users/${companyUserId}/reactivate`)
  return unwrap(response.data)
}

export async function removeCompanyUser(companyUserId: number) {
  const response = await api.patch<ApiResponse<AccessCompanyUser>>(`/access/company-users/${companyUserId}/remove`)
  return unwrap(response.data)
}
