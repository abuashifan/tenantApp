export type ValidationErrors = Record<string, string[]>

export type ApiResponse<T> = {
  success: boolean
  message?: string
  data: T
  meta?: Record<string, unknown>
}

export type ApiError = {
  status?: number
  code?: string
  message: string
  errors?: ValidationErrors
  meta?: Record<string, unknown>
  raw?: unknown
}

export type PaginatedResponse<T> = {
  data: T[]
  current_page?: number
  per_page?: number
  total?: number
  last_page?: number
  from?: number
  to?: number
}

export type ApiListParams = {
  search?: string
  status?: string
  date_from?: string
  date_to?: string
  start_date?: string
  end_date?: string
  as_of_date?: string
  page?: number
  per_page?: number
  sort?: string
  direction?: 'asc' | 'desc'
  [key: string]: unknown
}

export type ApiActionResult<T = unknown> = ApiResponse<T>

export type ApiListPayload<T> = T[] | PaginatedResponse<T> | { data?: T[]; items?: T[] }
