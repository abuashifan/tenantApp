import { defineStore } from 'pinia'

import {
  copyUserAccess,
  fetchPermissionCatalog,
  fetchUserPermissions,
  resetUserPermissions,
  updateUserPermissions,
  type EffectivePermissionPayload,
  type PermissionCatalog,
} from '@/services/access/permissions.service'
import { fetchCompanyUsers, updateCompanyUserRole, type AccessCompanyUser } from '@/services/access/company-users.service'
import { fetchRoles, type AccessRole } from '@/services/access/roles.service'

type OverrideEffect = 'allow' | 'deny'

export const useAccessStore = defineStore('access', {
  state: () => ({
    companyUsers: [] as AccessCompanyUser[],
    selectedCompanyUser: null as AccessCompanyUser | null,
    roles: [] as AccessRole[],
    permissionCatalog: null as PermissionCatalog | null,
    effectivePermissions: null as EffectivePermissionPayload | null,
    overrides: [] as Array<{ permission_key: string; effect: OverrideEffect }>,
    loading: false,
    saving: false,
    error: '' as string,
  }),

  getters: {
    rolePermissionSet(state) {
      return new Set(state.effectivePermissions?.role_permission_keys ?? [])
    },
    allowOverrideSet(state) {
      return new Set(state.overrides.filter((item) => item.effect === 'allow').map((item) => item.permission_key))
    },
    denyOverrideSet(state) {
      return new Set(state.overrides.filter((item) => item.effect === 'deny').map((item) => item.permission_key))
    },
  },

  actions: {
    clearTenantState() {
      this.companyUsers = []
      this.selectedCompanyUser = null
      this.roles = []
      this.permissionCatalog = null
      this.effectivePermissions = null
      this.overrides = []
      this.loading = false
      this.saving = false
      this.error = ''
    },
    async fetchCompanyUsers() {
      this.companyUsers = await fetchCompanyUsers()
      if (!this.selectedCompanyUser && this.companyUsers[0]) this.selectedCompanyUser = this.companyUsers[0]
    },
    async fetchRoles() {
      this.roles = await fetchRoles()
    },
    async fetchPermissionCatalog() {
      this.permissionCatalog = await fetchPermissionCatalog()
    },
    async fetchUserPermissions(companyUserId: number) {
      this.effectivePermissions = await fetchUserPermissions(companyUserId)
      this.selectedCompanyUser = this.effectivePermissions.company_user
      this.overrides = this.effectivePermissions.overrides.map((item) => ({
        permission_key: item.permission_key,
        effect: item.effect,
      }))
    },
    computeLocalOverrideChange(permissionKey: string, desiredChecked: boolean) {
      const roleHasPermission = this.rolePermissionSet.has(permissionKey)
      this.overrides = this.overrides.filter((item) => item.permission_key !== permissionKey)

      if (desiredChecked && !roleHasPermission) {
        this.overrides.push({ permission_key: permissionKey, effect: 'allow' })
      }

      if (!desiredChecked && roleHasPermission) {
        this.overrides.push({ permission_key: permissionKey, effect: 'deny' })
      }
    },
    async updateUserPermissions(companyUserId: number, roleId?: number | null) {
      this.saving = true
      try {
        this.effectivePermissions = await updateUserPermissions(companyUserId, {
          role_id: roleId,
          overrides: this.overrides,
        })
        this.selectedCompanyUser = this.effectivePermissions.company_user
        this.overrides = this.effectivePermissions.overrides.map((item) => ({
          permission_key: item.permission_key,
          effect: item.effect,
        }))
      } finally {
        this.saving = false
      }
    },
    async copyAccess(targetCompanyUserId: number, payload: { source_company_user_id: number; copy_role: boolean; copy_overrides: boolean }) {
      this.effectivePermissions = await copyUserAccess(targetCompanyUserId, payload)
      this.selectedCompanyUser = this.effectivePermissions.company_user
      this.overrides = this.effectivePermissions.overrides.map((item) => ({
        permission_key: item.permission_key,
        effect: item.effect,
      }))
    },
    async resetPermissions(companyUserId: number) {
      this.effectivePermissions = await resetUserPermissions(companyUserId)
      this.selectedCompanyUser = this.effectivePermissions.company_user
      this.overrides = []
    },
    async updateRole(companyUserId: number, roleId: number | null, resetOverrides: boolean) {
      await updateCompanyUserRole(companyUserId, { role_id: roleId, reset_overrides: resetOverrides })
      await this.fetchUserPermissions(companyUserId)
    },
  },
})
