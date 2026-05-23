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
  throw new Error(payload.message || 'Request failed')
}
