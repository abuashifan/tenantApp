import { defineStore } from 'pinia'

export type AuthUser = {
  id: string | number
  name: string
  email: string
}

const AUTH_STORAGE_KEYS = [
  'ta_token',
  'ta_user',
  'ta_permissions',
  'auth_token',
  'auth_user',
  'auth_permissions',
]

const TENANT_STORAGE_KEYS = [
  'ta_active_company_id',
  'ta_active_company',
  'ta_companies',
  'active_company_id',
  'active_company',
  'current_company_cache_generation',
]

function removeStorageKeys(keys: string[]) {
  for (const key of keys) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }
}

function removeTenantScopedStorage() {
  removeStorageKeys([...AUTH_STORAGE_KEYS, ...TENANT_STORAGE_KEYS])

  for (const storage of [localStorage, sessionStorage]) {
    for (let i = storage.length - 1; i >= 0; i -= 1) {
      const key = storage.key(i)
      if (!key) continue
      const normalized = key.toLowerCase()
      if (
        normalized.includes('workspace') ||
        normalized.includes('virtual_tab') ||
        normalized.includes('virtual-tabs') ||
        normalized.includes('tenant') ||
        normalized.includes('company_cache')
      ) {
        storage.removeItem(key)
      }
    }
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    user: null as AuthUser | null,
    permissions: [] as string[],
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    initializeAuthFromStorage() {
      this.loadFromStorage()
    },

    loadFromStorage() {
      const token = localStorage.getItem('ta_token') ?? localStorage.getItem('auth_token') ?? ''
      const userRaw = localStorage.getItem('ta_user') ?? localStorage.getItem('auth_user')
      const permsRaw = localStorage.getItem('ta_permissions') ?? localStorage.getItem('auth_permissions')

      this.token = token
      this.user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null
      this.permissions = permsRaw ? (JSON.parse(permsRaw) as string[]) : []
    },

    persist() {
      localStorage.setItem('ta_token', this.token)
      localStorage.setItem('ta_user', this.user ? JSON.stringify(this.user) : '')
      localStorage.setItem('ta_permissions', JSON.stringify(this.permissions ?? []))
    },

    setAuth(payload: { token: string; user: AuthUser; permissions?: string[] }) {
      this.token = payload.token
      this.user = payload.user
      this.permissions = payload.permissions ?? []
      this.persist()
    },
    async login(payload: { email: string; password: string }) {
      const { login } = await import('@/services/authApi')
      const data = await login(payload)
      this.setAuth({ token: data.token, user: data.user })
      return data
    },
    setPermissions(permissions: string[]) {
      this.permissions = permissions
      this.persist()
    },
    clearAuth() {
      this.token = ''
      this.user = null
      this.permissions = []
      removeStorageKeys(AUTH_STORAGE_KEYS)
    },
    async logout() {
      const hadToken = Boolean(this.token || localStorage.getItem('ta_token') || localStorage.getItem('auth_token'))
      if (hadToken) {
        try {
          const { logout } = await import('@/services/authApi')
          await logout()
        } catch {
          // Local session cleanup must still complete if the backend session is already gone.
        }
      }

      this.clearAuth()
      try {
        const { useCompanyStore } = await import('@/stores/companyStore')
        useCompanyStore().clearCompanyState()
      } catch {
        removeStorageKeys(TENANT_STORAGE_KEYS)
      }
      try {
        const { invalidateTenantScopedState } = await import('@/services/tenantWorkspaceState')
        invalidateTenantScopedState()
      } catch {
        removeTenantScopedStorage()
      }
      removeTenantScopedStorage()
    },
  },
})
