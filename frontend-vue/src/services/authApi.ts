import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'
import type { AuthUser } from '@/stores/authStore'

export type LoginResponseData = {
  user: AuthUser
  token: string
  token_type: 'Bearer'
}

export async function login(payload: { email: string; password: string }) {
  const res = await api.post<ApiResponse<LoginResponseData>>('/auth/login', payload)
  return unwrap(res.data)
}

export async function logout() {
  const res = await api.post<ApiResponse<null>>('/auth/logout')
  return unwrap(res.data)
}
