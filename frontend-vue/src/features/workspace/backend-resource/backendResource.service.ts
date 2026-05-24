import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'

export type BackendResourceRow = {
  id: string
  [key: string]: unknown
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload

  const record = asRecord(payload)
  if (!record) return []

  for (const key of ['data', 'items', 'records', 'results', 'rows', 'lines', 'accounts']) {
    const value = record[key]
    if (Array.isArray(value)) return value
  }

  return [record]
}

function rowId(row: Record<string, unknown>, index: number) {
  for (const key of ['id', 'uuid', 'code', 'account_code', 'document_number', 'number', 'mapping_key']) {
    const value = row[key]
    if (value != null && String(value) !== '') return String(value)
  }

  return `row-${index + 1}`
}

export async function listBackendResource(endpoint: string, params: Record<string, unknown> = {}) {
  const response = await api.get<ApiResponse<unknown>>(endpoint, { params })
  const payload = unwrap(response.data)

  return extractRows(payload)
    .map(asRecord)
    .filter((row): row is Record<string, unknown> => row != null)
    .map((row, index) => ({ ...row, id: rowId(row, index) }) as BackendResourceRow)
}
