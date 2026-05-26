import type { Router } from 'vue-router'

import { api } from '@/api'
import { applyApiRequestHeaders, clearInvalidAuth, normalizeApiError } from '@/services/api'

export function setupApiInterceptors(router: Router) {
  api.interceptors.request.use(applyApiRequestHeaders)

  api.interceptors.response.use(
    (res) => res,
    async (error: unknown) => {
      const apiError = normalizeApiError(error)
      if (apiError.status === 401) {
        clearInvalidAuth()
        const current = router.currentRoute.value
        const isPublicAuthPage = current.path === '/login' || current.path === '/register'
        if (!isPublicAuthPage) {
          await router.push({ path: '/login', query: { next: current.fullPath } })
        }
      }
      return Promise.reject(apiError)
    },
  )
}
