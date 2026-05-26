<script setup lang="ts">
import { onMounted, ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import { usePermission } from '@/composables/usePermission'
import { fetchRoles, type AccessRole } from '@/services/access/roles.service'
import { fetchInvitations, inviteCompanyUser, resendInvitation, revokeInvitation, type AccessInvitation } from '@/services/access/invitations.service'

const { can } = usePermission()
const invitations = ref<AccessInvitation[]>([])
const roles = ref<AccessRole[]>([])
const email = ref('')
const roleId = ref<number | null>(null)
const loading = ref(false)
const error = ref('')
const notice = ref('')

function errorText(reason: unknown) {
  return typeof reason === 'object' && reason !== null && 'message' in reason ? String(reason.message) : 'Request failed.'
}
async function load() {
  loading.value = true
  try {
    ;[invitations.value, roles.value] = await Promise.all([fetchInvitations(), fetchRoles()])
    roleId.value ??= roles.value.find((role) => role.slug === 'viewer')?.id ?? null
  } catch (reason) { error.value = errorText(reason) } finally { loading.value = false }
}
async function invite() {
  error.value = ''
  try {
    await inviteCompanyUser({ email: email.value, role_id: roleId.value })
    email.value = ''
    notice.value = 'Invitation created.'
    await load()
  } catch (reason) { error.value = errorText(reason) }
}
async function action(invitation: AccessInvitation, operation: 'resend' | 'revoke') {
  try {
    if (operation === 'resend') await resendInvitation(invitation.id)
    else await revokeInvitation(invitation.id)
    notice.value = `Invitation ${operation} completed.`
    await load()
  } catch (reason) { error.value = errorText(reason) }
}
onMounted(load)
</script>

<template>
  <section class="space-y-4">
    <div><h1 class="text-2xl font-black text-slate-950">Invitations</h1><p class="mt-1 text-sm text-slate-500">Invite users into the active company with a role preset.</p></div>
    <p v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ error }}</p>
    <p v-if="notice" class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{{ notice }}</p>
    <form v-if="can('access.invitations.create')" class="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4" @submit.prevent="invite">
      <label class="min-w-64 flex-1 text-sm font-bold text-slate-700">Email<input v-model="email" type="email" required class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
      <label class="min-w-52 text-sm font-bold text-slate-700">Role<select v-model.number="roleId" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"><option v-for="role in roles.filter((item) => item.is_active)" :key="role.id" :value="role.id">{{ role.name }}</option></select></label>
      <BaseButton variant="primary" type="submit">Send Invite</BaseButton>
    </form>
    <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <p v-if="loading" class="p-5 text-sm text-slate-500">Loading invitations...</p>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-4 py-3 text-left">Email</th><th class="px-4 py-3 text-left">Role</th><th class="px-4 py-3 text-left">Expires</th><th class="px-4 py-3 text-left">Status</th><th class="px-4 py-3 text-right">Actions</th></tr></thead>
        <tbody>
          <tr v-for="invitation in invitations" :key="invitation.id" class="border-t border-slate-100">
            <td class="px-4 py-3 font-bold">{{ invitation.email }}</td><td class="px-4 py-3">{{ invitation.role }}</td><td class="px-4 py-3">{{ invitation.expires_at ?? '-' }}</td><td class="px-4 py-3">{{ invitation.status }}</td>
            <td class="px-4 py-3"><div class="flex justify-end gap-2"><BaseButton v-if="can('access.invitations.resend') && invitation.status !== 'accepted'" variant="secondary" size="sm" @click="action(invitation, 'resend')">Resend</BaseButton><BaseButton v-if="can('access.invitations.revoke') && invitation.status === 'pending'" variant="danger" size="sm" @click="action(invitation, 'revoke')">Revoke</BaseButton></div></td>
          </tr>
          <tr v-if="invitations.length === 0"><td colspan="5" class="px-4 py-8 text-center text-slate-500">No invitations found.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
