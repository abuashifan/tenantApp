import type { Router } from 'vue-router'

import { api } from '@/api'
import { applyApiRequestHeaders, clearInvalidAuth, clearInvalidCompany, normalizeApiError } from '@/services/api'

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
      } else if (
        ['COMPANY_NOT_FOUND', 'COMPANY_ACCESS_DENIED', 'TENANT_DATABASE_NOT_ACTIVE'].includes(apiError.code ?? '')
      ) {
        clearInvalidCompany()
        const current = router.currentRoute.value
        if (current.path !== '/login' && current.path !== '/select-company') {
          await router.push({ path: '/select-company', query: { next: current.fullPath } })
        }
      }
      return Promise.reject(apiError)
    },
  )
}
