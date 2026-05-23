import { defineStore } from 'pinia'

export type AuthUser = {
  id: string | number
  name: string
  email: string
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
    loadFromStorage() {
      const token = localStorage.getItem('ta_token') ?? ''
      const userRaw = localStorage.getItem('ta_user')
      const permsRaw = localStorage.getItem('ta_permissions')

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
    setPermissions(permissions: string[]) {
      this.permissions = permissions
      this.persist()
    },
    clearAuth() {
      this.token = ''
      this.user = null
      this.permissions = []
      localStorage.removeItem('ta_token')
      localStorage.removeItem('ta_user')
      localStorage.removeItem('ta_permissions')
    },
  },
})
