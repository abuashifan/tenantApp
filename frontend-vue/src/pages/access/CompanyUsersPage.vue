<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import { usePermission } from '@/composables/usePermission'
import {
  deactivateCompanyUser,
  fetchCompanyUsers,
  reactivateCompanyUser,
  removeCompanyUser,
  type AccessCompanyUser,
} from '@/services/access/company-users.service'

const { can } = usePermission()
const users = ref<AccessCompanyUser[]>([])
const loading = ref(false)
const error = ref('')
const notice = ref('')

function errorText(reason: unknown) {
  return typeof reason === 'object' && reason !== null && 'message' in reason ? String(reason.message) : 'Request failed.'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    users.value = await fetchCompanyUsers()
  } catch (reason) {
    error.value = errorText(reason)
  } finally {
    loading.value = false
  }
}

async function changeStatus(user: AccessCompanyUser, action: 'deactivate' | 'reactivate' | 'remove') {
  if (!window.confirm(`${action} access for ${user.email}?`)) return
  error.value = ''
  try {
    if (action === 'deactivate') await deactivateCompanyUser(user.id)
    if (action === 'reactivate') await reactivateCompanyUser(user.id)
    if (action === 'remove') await removeCompanyUser(user.id)
    notice.value = `Company user ${action} completed.`
    await load()
  } catch (reason) {
    error.value = errorText(reason)
  }
}

onMounted(load)
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-950">Company Users</h1>
        <p class="mt-1 text-sm text-slate-500">User access is scoped to the active company.</p>
      </div>
      <RouterLink v-if="can('access.invitations.create')" to="/access/invitations">
        <BaseButton variant="primary">Invite User</BaseButton>
      </RouterLink>
    </div>
    <p v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ error }}</p>
    <p v-if="notice" class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{{ notice }}</p>
    <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <p v-if="loading" class="p-5 text-sm text-slate-500">Loading company users...</p>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500">
          <tr><th class="px-4 py-3 text-left">User</th><th class="px-4 py-3 text-left">Role</th><th class="px-4 py-3 text-left">Status</th><th class="px-4 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-t border-slate-100">
            <td class="px-4 py-3"><p class="font-bold text-slate-900">{{ user.name }}</p><p class="text-xs text-slate-500">{{ user.email }}</p></td>
            <td class="px-4 py-3">{{ user.role_name ?? user.role }}</td>
            <td class="px-4 py-3"><span class="rounded-full px-2 py-1 text-xs font-bold" :class="user.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'">{{ user.status }}</span></td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <RouterLink v-if="can('access.permissions.view')" :to="`/access/users/${user.id}`"><BaseButton variant="secondary" size="sm">Access</BaseButton></RouterLink>
                <BaseButton v-if="user.status === 'active' && can('access.users.deactivate')" variant="secondary" size="sm" @click="changeStatus(user, 'deactivate')">Deactivate</BaseButton>
                <BaseButton v-if="user.status !== 'active' && can('access.users.manage')" variant="secondary" size="sm" @click="changeStatus(user, 'reactivate')">Reactivate</BaseButton>
                <BaseButton v-if="can('access.users.remove')" variant="danger" size="sm" @click="changeStatus(user, 'remove')">Remove</BaseButton>
              </div>
            </td>
          </tr>
          <tr v-if="users.length === 0"><td colspan="4" class="px-4 py-8 text-center text-slate-500">No company users found.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
