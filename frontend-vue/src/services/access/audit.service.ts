import { api } from '@/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'

export type AccessAuditLog = {
  id: number
  action: string
  description?: string | null
  created_at: string
  properties?: Record<string, unknown> | null
  user?: { name: string; email: string } | null
}

export async function fetchAccessAudit(params: { user_id?: number; role_id?: number; action?: string; date_from?: string; date_to?: string } = {}) {
  const response = await api.get<ApiResponse<AccessAuditLog[]>>('/access/audit', { params })
  return unwrap(response.data)
}
