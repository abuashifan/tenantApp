import { api } from '@/services/api'
import type { ApiActionResult, ApiListParams, ApiResponse } from '@/types/api'

export type ResourceServiceOptions = {
  endpoint: string
  actions?: Record<string, { method: 'post' | 'patch' | 'put'; path: string }>
}

export function createResourceService<TList = unknown, TDetail = TList>(options: ResourceServiceOptions) {
  return {
    list(params?: ApiListParams) {
      return api.get<ApiResponse<TList>>(options.endpoint, { params })
    },
    get(id: string | number) {
      return api.get<ApiResponse<TDetail>>(`${options.endpoint}/${id}`)
    },
    create(payload: unknown) {
      return api.post<ApiResponse<TDetail>>(options.endpoint, payload)
    },
    update(id: string | number, payload: unknown) {
      return api.patch<ApiResponse<TDetail>>(`${options.endpoint}/${id}`, payload)
    },
    action<T = unknown>(key: string, id: string | number, payload?: unknown) {
      const action = options.actions?.[key]
      if (!action) throw new Error(`Unsupported action: ${key}`)
      const url = action.path.replace('{id}', encodeURIComponent(String(id)))
      return api[action.method]<ApiActionResult<T>>(`${options.endpoint}/${url}`, payload ?? {})
    },
    activate(id: string | number, payload?: unknown) {
      return this.action('activate', id, payload)
    },
    deactivate(id: string | number, payload?: unknown) {
      return this.action('deactivate', id, payload)
    },
    approve(id: string | number, payload?: unknown) {
      return this.action('approve', id, payload)
    },
    post(id: string | number, payload?: unknown) {
      return this.action('post', id, payload)
    },
    void(id: string | number, payload?: unknown) {
      return this.action('void', id, payload)
    },
    cancel(id: string | number, payload?: unknown) {
      return this.action('cancel', id, payload)
    },
    confirm(id: string | number, payload?: unknown) {
      return this.action('confirm', id, payload)
    },
    close(id: string | number, payload?: unknown) {
      return this.action('close', id, payload)
    },
  }
}

export const masterDataActions = {
  activate: { method: 'patch' as const, path: '{id}/activate' },
  deactivate: { method: 'patch' as const, path: '{id}/deactivate' },
}

export const postVoidActions = {
  post: { method: 'patch' as const, path: '{id}/post' },
  void: { method: 'patch' as const, path: '{id}/void' },
}
