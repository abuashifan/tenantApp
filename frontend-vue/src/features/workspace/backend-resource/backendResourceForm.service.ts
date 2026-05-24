import type { AxiosError } from 'axios'

import { api } from '@/api'
import type { ApiErrorResponse, ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'

export type LaravelFieldErrors = Record<string, string[]>

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

export function normalizePayload(payload: unknown): Record<string, unknown> {
  const record = asRecord(payload)
  if (!record) return {}
  for (const key of ['data', 'item', 'record', 'resource']) {
    const nested = asRecord(record[key])
    if (nested) return nested
  }
  return record
}

export function extractLaravelErrors(error: unknown) {
  const axiosError = error as AxiosError<ApiErrorResponse>
  const payload = axiosError.response?.data
  const fieldErrors: LaravelFieldErrors = {}
  const messages: string[] = []

  if (payload?.message) messages.push(payload.message)
  const errors = payload?.errors
  if (errors && !Array.isArray(errors) && typeof errors === 'object') {
    for (const [key, value] of Object.entries(errors)) {
      const list = Array.isArray(value) ? value.map(String) : [String(value)]
      fieldErrors[key] = list
      messages.push(...list)
    }
  }

  if (messages.length === 0 && error instanceof Error) messages.push(error.message)
  if (messages.length === 0) messages.push('Request failed.')

  return { fieldErrors, messages }
}

export async function showBackendResource(endpoint: string, id: string | number) {
  const response = await api.get<ApiResponse<unknown>>(`${endpoint}/${id}`)
  return normalizePayload(unwrap(response.data))
}

export async function createBackendResource(endpoint: string, payload: Record<string, unknown>) {
  const response = await api.post<ApiResponse<unknown>>(endpoint, payload)
  return normalizePayload(unwrap(response.data))
}

export async function updateBackendResource(endpoint: string, id: string | number, payload: Record<string, unknown>) {
  const response = await api.patch<ApiResponse<unknown>>(`${endpoint}/${id}`, payload)
  return normalizePayload(unwrap(response.data))
}

export async function runBackendResourceAction(
  endpoint: string,
  id: string | number,
  suffix: string,
  method: 'post' | 'patch',
  payload: Record<string, unknown> = {},
) {
  const url = `${endpoint}/${id}/${suffix}`
  const response = method === 'post'
    ? await api.post<ApiResponse<unknown>>(url, payload)
    : await api.patch<ApiResponse<unknown>>(url, payload)
  return normalizePayload(unwrap(response.data))
}
