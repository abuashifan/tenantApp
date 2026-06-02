<script setup lang="ts">
import { onMounted, ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import DateInput from '@/components/ui/DateInput.vue'
import { fetchAccessAudit, type AccessAuditLog } from '@/services/access/audit.service'
import { formatDisplayDate } from '@/utils/date'

const logs = ref<AccessAuditLog[]>([])
const userId = ref('')
const roleId = ref('')
const action = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    logs.value = await fetchAccessAudit({
      user_id: userId.value ? Number(userId.value) : undefined,
      role_id: roleId.value ? Number(roleId.value) : undefined,
      action: action.value || undefined,
      date_from: dateFrom.value || undefined,
      date_to: dateTo.value || undefined,
    })
  } catch (reason) {
    error.value = typeof reason === 'object' && reason !== null && 'message' in reason ? String(reason.message) : 'Unable to load audit.'
  } finally { loading.value = false }
}
onMounted(load)
</script>

<template>
  <section class="space-y-4">
    <div><h1 class="text-2xl font-black text-slate-950">Access Audit</h1><p class="mt-1 text-sm text-slate-500">Role, invitation, permission, and company-user access changes.</p></div>
    <form class="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4" @submit.prevent="load">
      <label class="text-sm font-bold text-slate-700">User ID<input v-model="userId" type="number" class="mt-2 block rounded-lg border border-slate-200 px-3 py-2" /></label>
      <label class="text-sm font-bold text-slate-700">Role ID<input v-model="roleId" type="number" class="mt-2 block rounded-lg border border-slate-200 px-3 py-2" /></label>
      <label class="text-sm font-bold text-slate-700">Action<input v-model="action" class="mt-2 block rounded-lg border border-slate-200 px-3 py-2" placeholder="permission, role..." /></label>
      <label class="text-sm font-bold text-slate-700">From<DateInput v-model="dateFrom" class="mt-2" compact /></label>
      <label class="text-sm font-bold text-slate-700">To<DateInput v-model="dateTo" class="mt-2" compact /></label>
      <BaseButton variant="primary" type="submit">Filter</BaseButton>
    </form>
    <p v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ error }}</p>
    <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <p v-if="loading" class="p-5 text-sm text-slate-500">Loading audit...</p>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="px-4 py-3 text-left">Time</th><th class="px-4 py-3 text-left">User</th><th class="px-4 py-3 text-left">Action</th><th class="px-4 py-3 text-left">Detail</th></tr></thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="border-t border-slate-100"><td class="px-4 py-3 text-slate-500">{{ formatDisplayDate(log.created_at) }}</td><td class="px-4 py-3">{{ log.user?.name ?? '-' }}</td><td class="px-4 py-3 font-bold">{{ log.action }}</td><td class="px-4 py-3 text-slate-500">{{ log.description ?? '-' }}</td></tr>
          <tr v-if="logs.length === 0"><td colspan="4" class="px-4 py-8 text-center text-slate-500">No access audit events found.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
