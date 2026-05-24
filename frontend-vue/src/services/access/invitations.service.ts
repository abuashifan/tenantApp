import { api } from '@/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'

export type AccessInvitation = {
  id: number
  email: string
  role: string
  status: string
  expires_at?: string | null
}

export async function fetchInvitations() {
  const response = await api.get<ApiResponse<AccessInvitation[]>>('/access/invitations')
  return unwrap(response.data)
}

export async function inviteCompanyUser(payload: { email: string; role?: string; role_id?: number | null; expires_at?: string | null }) {
  const response = await api.post<ApiResponse<AccessInvitation>>('/access/invitations', payload)
  return unwrap(response.data)
}

export async function resendInvitation(id: number) {
  const response = await api.post<ApiResponse<AccessInvitation>>(`/access/invitations/${id}/resend`)
  return unwrap(response.data)
}

export async function revokeInvitation(id: number) {
  const response = await api.post<ApiResponse<AccessInvitation>>(`/access/invitations/${id}/revoke`)
  return unwrap(response.data)
}
