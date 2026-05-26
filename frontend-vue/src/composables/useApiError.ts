import { normalizeApiError } from '@/services/api'
import type { ApiError as NormalizedApiError } from '@/types/api'

export type ApiError = NormalizedApiError

export function useApiError() {
  function normalize(error: unknown): ApiError {
    return normalizeApiError(error)
  }

  return { normalize }
}
