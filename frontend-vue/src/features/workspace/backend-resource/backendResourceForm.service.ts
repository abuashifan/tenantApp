import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'
import { normalizeApiError } from '@/services/api'

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
  const normalized = normalizeApiError(error)
  const fieldErrors: LaravelFieldErrors = {}
  const messages = new Set<string>()

  if (normalized.message) messages.add(normalized.message)
  if (normalized.errors) {
    for (const [key, value] of Object.entries(normalized.errors)) {
      fieldErrors[key] = value
      value.forEach((message) => messages.add(message))
    }
  }

  if (messages.size === 0) messages.add('Request failed.')

  return { fieldErrors, messages: [...messages] }
}

export async function showBackendResource(endpoint: string, id: string | number) {
  const response = await api.get<ApiResponse<unknown>>(`${endpoint}/${id}`)
  return normalizePayload(unwrap(response.data))
}

export async function createBackendResource(endpoint: string, payload: Record<string, unknown>) {
  const response = await api.post<ApiResponse<unknown>>(endpoint, payload)
  return normalizePayload(unwrap(response.data))
}

export async function updateBackendResource(
  endpoint: string,
  id: string | number,
  payload: Record<string, unknown>,
) {
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
  const response =
    method === 'post'
      ? await api.post<ApiResponse<unknown>>(url, payload)
      : await api.patch<ApiResponse<unknown>>(url, payload)
  return normalizePayload(unwrap(response.data))
}
