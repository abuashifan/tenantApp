<script setup lang="ts">
import { ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import type { AccessCompanyUser } from '@/services/access/company-users.service'

const props = defineProps<{
  open: boolean
  users: AccessCompanyUser[]
  targetUserId?: number
}>()

const emit = defineEmits<{
  close: []
  confirm: [payload: { source_company_user_id: number; copy_role: boolean; copy_overrides: boolean }]
}>()

const sourceCompanyUserId = ref<number | null>(null)
const copyRole = ref(true)
const copyOverrides = ref(true)

watch(
  () => props.open,
  () => {
    sourceCompanyUserId.value = props.users.find((user) => user.id !== props.targetUserId)?.id ?? null
    copyRole.value = true
    copyOverrides.value = true
  },
)

function confirm() {
  if (!sourceCompanyUserId.value) return
  emit('confirm', {
    source_company_user_id: sourceCompanyUserId.value,
    copy_role: copyRole.value,
    copy_overrides: copyOverrides.value,
  })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
    <div class="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
      <h2 class="text-lg font-black text-slate-950">Salin Hak Akses</h2>
      <div class="mt-4 space-y-4">
        <label class="block text-sm font-bold text-slate-700">
          Sumber user
          <select v-model.number="sourceCompanyUserId" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2">
            <option v-for="user in users.filter((item) => item.id !== targetUserId)" :key="user.id" :value="user.id">
              {{ user.name }} - {{ user.email }}
            </option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input v-model="copyRole" type="checkbox" class="h-4 w-4" />
          Copy role preset
        </label>
        <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input v-model="copyOverrides" type="checkbox" class="h-4 w-4" />
          Copy user overrides
        </label>
      </div>
      <div class="mt-5 flex justify-end gap-2">
        <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" @click="confirm">Copy</BaseButton>
      </div>
    </div>
  </div>
</template>
