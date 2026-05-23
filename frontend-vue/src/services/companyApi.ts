import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'
import type { Company } from '@/stores/companyStore'

export type BackendCompany = {
  id: string | number
  name: string
  legal_name?: string | null
  slug?: string | null
  code?: string | null
  status?: string
  user_role?: string
  tenant_database?: {
    database_name?: string
    database_path?: string
    status?: string
  } | null
}

export type SelectCompanyResponseData = {
  active_company: BackendCompany
}

export type PermissionsResponseData = {
  role: string
  permission_mode: string
  permissions: string[]
}

export function normalizeCompany(company: BackendCompany): Company {
  return {
    id: company.id,
    name: company.name,
    legal_name: company.legal_name ?? undefined,
    slug: company.slug ?? undefined,
    code: company.code ?? undefined,
    status: company.status,
    user_role: company.user_role,
    tenant_database: company.tenant_database
      ? {
          database_name: company.tenant_database.database_name,
          database_path: company.tenant_database.database_path,
          status: company.tenant_database.status,
        }
      : null,
  }
}

export async function fetchCompanies() {
  const res = await api.get<ApiResponse<BackendCompany[]>>('/companies')
  return unwrap(res.data).map(normalizeCompany)
}

export async function selectCompany(companyId: string | number) {
  const res = await api.post<ApiResponse<SelectCompanyResponseData>>('/companies/select', {
    company_id: companyId,
  })
  return normalizeCompany(unwrap(res.data).active_company)
}

export async function fetchPermissions() {
  const res = await api.get<ApiResponse<PermissionsResponseData>>('/auth/permissions')
  return unwrap(res.data)
}
