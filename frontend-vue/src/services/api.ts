import axios, { AxiosError, type AxiosInstance } from 'axios'

import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'
import type { ApiError, ValidationErrors } from '@/types/api'

function safeJson<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return value as T
  }
}

function authToken() {
  try {
    const auth = useAuthStore()
    return auth.token || localStorage.getItem('ta_token') || ''
  } catch {
    return localStorage.getItem('ta_token') || ''
  }
}

function activeCompanyId() {
  try {
    const company = useCompanyStore()
    return company.activeCompanyId ?? safeJson<string | number>(localStorage.getItem('ta_active_company_id'))
  } catch {
    return safeJson<string | number>(localStorage.getItem('ta_active_company_id'))
  }
}

function clearAuthAndRedirect() {
  try {
    useAuthStore().clearAuth()
  } catch {
    localStorage.removeItem('ta_token')
    localStorage.removeItem('ta_user')
    localStorage.removeItem('ta_permissions')
  }

  if (window.location.pathname !== '/login') {
    window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
  }
}

function normalizeValidationErrors(errors: unknown): ValidationErrors | undefined {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return undefined
  const normalized: ValidationErrors = {}
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    normalized[key] = Array.isArray(value) ? value.map(String) : [String(value)]
  }
  return normalized
}

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0
  const payload = error.response?.data as Record<string, unknown> | undefined
  const fallbackMessage =
    status === 403
      ? 'You do not have permission to perform this action.'
      : status === 404
        ? 'The requested data was not found.'
        : status >= 500
          ? 'The server could not process the request.'
          : error.message || 'Request failed.'

  return {
    status,
    code: typeof payload?.code === 'string' ? payload.code : undefined,
    message: typeof payload?.message === 'string' ? payload.message : fallbackMessage,
    errors: normalizeValidationErrors(payload?.errors),
    meta: payload?.meta && typeof payload.meta === 'object' ? (payload.meta as Record<string, unknown>) : undefined,
  }
}

export const axiosApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

axiosApi.interceptors.request.use((config) => {
  const token = authToken()
  const companyId = activeCompanyId()

  config.headers.Accept = 'application/json'
  config.headers['Content-Type'] = 'application/json'
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (companyId != null && companyId !== '') config.headers['X-Company-ID'] = String(companyId)

  return config
})

axiosApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = toApiError(error)
    if (apiError.status === 401) clearAuthAndRedirect()
    return Promise.reject(apiError)
  },
)

export const api: AxiosInstance = axiosApi

export default api
