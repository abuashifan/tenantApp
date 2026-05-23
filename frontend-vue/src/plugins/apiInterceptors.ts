import type { Router } from 'vue-router'

import type { AxiosError } from 'axios'

import { api } from '@/api'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'

export function setupApiInterceptors(router: Router) {
  api.interceptors.request.use((config) => {
    const auth = useAuthStore()
    const company = useCompanyStore()

    if (auth.token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${auth.token}`
    }

    if (company.activeCompanyId != null) {
      config.headers = config.headers ?? {}
      config.headers['X-Company-ID'] = String(company.activeCompanyId)
    }

    return config
  })

  api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const status = error.response?.status
      if (status === 401) {
        const auth = useAuthStore()
        const company = useCompanyStore()
        auth.clearAuth()
        company.clearActiveCompany()
        if (router.currentRoute.value.path !== '/login') {
          await router.push('/login')
        }
      }
      return Promise.reject(error)
    },
  )
}
