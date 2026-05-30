import { normalizeApiError } from '@/services/api'

export type ApiSuccessResponse<TData> = {
  success: true
  message: string
  data: TData
  meta?: unknown
}

export type ApiErrorResponse = {
  success: false
  code?: string
  message: string
  errors?: Record<string, unknown> | unknown[]
  meta?: unknown
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse

export function unwrap<TData>(payload: ApiResponse<TData>): TData {
  if (payload.success) return payload.data
  const normalized = normalizeApiError(payload)
  throw Object.assign(new Error(normalized.message), normalized)
}
