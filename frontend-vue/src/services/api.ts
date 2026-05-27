import axios, { AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'
import type { ApiError, ValidationErrors } from '@/types/api'

const PUBLIC_API_ENDPOINTS = new Set([
  '/auth/login',
  '/api/auth/login',
  '/auth/register',
  '/api/auth/register',
  '/health',
  '/api/health',
])

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
    return auth.token || localStorage.getItem('ta_token') || localStorage.getItem('auth_token') || ''
  } catch {
    return localStorage.getItem('ta_token') || localStorage.getItem('auth_token') || ''
  }
}

function activeCompanyId() {
  try {
    const company = useCompanyStore()
    return (
      company.activeCompanyId ??
      safeJson<string | number>(
        localStorage.getItem('ta_active_company_id') ?? localStorage.getItem('active_company_id'),
      )
    )
  } catch {
    return safeJson<string | number>(
      localStorage.getItem('ta_active_company_id') ?? localStorage.getItem('active_company_id'),
    )
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

function requestPath(url: string | undefined): string {
  if (!url) return ''
  try {
    return new URL(url, 'http://tenant-app.local').pathname
  } catch {
    const path = url.split('?')[0] ?? ''
    return path.startsWith('/') ? path : `/${path}`
  }
}

function hasRequestBody(config: InternalAxiosRequestConfig) {
  return config.data != null && typeof config.data !== 'undefined'
}

function isFormData(value: unknown) {
  return typeof FormData !== 'undefined' && value instanceof FormData
}

export function isPublicApiEndpoint(url: string | undefined) {
  return PUBLIC_API_ENDPOINTS.has(requestPath(url))
}

export function applyApiRequestHeaders(config: InternalAxiosRequestConfig) {
  const headers = AxiosHeaders.from(config.headers)
  const token = authToken()
  const companyId = activeCompanyId()

  headers.set('Accept', 'application/json')

  if (hasRequestBody(config) && !isFormData(config.data) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  } else {
    headers.delete('Authorization')
  }

  if (!isPublicApiEndpoint(config.url) && companyId != null && companyId !== '') {
    headers.set('X-Company-ID', String(companyId))
  } else {
    headers.delete('X-Company-ID')
  }

  config.headers = headers
  return config
}

export function clearInvalidAuth() {
  try {
    useAuthStore().clearAuth()
  } catch {
    localStorage.removeItem('ta_token')
    localStorage.removeItem('ta_user')
    localStorage.removeItem('ta_permissions')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_permissions')
  }

  try {
    useCompanyStore().clearCompanyState()
  } catch {
    localStorage.removeItem('ta_active_company_id')
    localStorage.removeItem('ta_active_company')
    localStorage.removeItem('ta_companies')
    localStorage.removeItem('active_company_id')
    localStorage.removeItem('active_company')
  }
}

export function clearInvalidCompany() {
  try {
    useCompanyStore().clearCompanyState()
  } catch {
    localStorage.removeItem('ta_active_company_id')
    localStorage.removeItem('ta_active_company')
    localStorage.removeItem('ta_companies')
    localStorage.removeItem('active_company_id')
    localStorage.removeItem('active_company')
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    const existing = error as Partial<ApiError> | undefined
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : typeof existing?.message === 'string'
            ? existing.message
            : 'Request failed.'

    return {
      status: existing?.status,
      code: typeof existing?.code === 'string' ? existing.code : undefined,
      message,
      errors: normalizeValidationErrors(existing?.errors),
      meta:
        existing?.meta && typeof existing.meta === 'object'
          ? (existing.meta as Record<string, unknown>)
          : undefined,
      raw: error,
    }
  }

  const status = error.response?.status ?? 0
  const payload = error.response?.data as Record<string, unknown> | undefined
  const fallbackMessage = !error.response
    ? 'Unable to reach the server. Check your network connection and try again.'
    : status === 401
      ? 'Your session has expired. Please sign in again.'
      : status === 403
        ? 'You do not have permission to perform this action.'
        : status === 404
          ? 'The requested data was not found.'
          : status === 409
            ? 'The request conflicts with the current data state.'
            : status === 422
              ? 'The submitted data is invalid.'
              : status >= 500
                ? 'The server could not process the request.'
                : error.message || 'Request failed.'

  return {
    status,
    code: typeof payload?.code === 'string' ? payload.code : undefined,
    message: typeof payload?.message === 'string' ? payload.message : fallbackMessage,
    errors: normalizeValidationErrors(payload?.errors),
    meta:
      payload?.meta && typeof payload.meta === 'object'
        ? (payload.meta as Record<string, unknown>)
        : undefined,
    raw: error,
  }
}

export const axiosApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    Accept: 'application/json',
  },
})

export const api: AxiosInstance = axiosApi

export default api
