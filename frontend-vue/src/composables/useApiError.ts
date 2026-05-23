import type { AxiosError } from 'axios'

export type ApiError = {
  message: string
  status?: number
}

export function useApiError() {
  function normalize(error: unknown): ApiError {
    const axiosError = error as AxiosError<unknown> | undefined

    const status = axiosError?.response?.status
    const message =
      axiosError?.message ??
      (typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Unknown error')

    return { message, status }
  }

  return { normalize }
}
