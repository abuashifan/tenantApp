<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import type { ChartOfAccountRow } from '@/features/accounting/chart-of-accounts/chartOfAccounts.service'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  account?: ChartOfAccountRow | null
}>()

const emit = defineEmits<{
  close: []
  save: [payload: Record<string, unknown>]
}>()

const title = computed(() => (props.mode === 'create' ? 'Add Account' : 'Edit Account'))

const accountCode = ref('')
const accountName = ref('')
const accountType = ref('asset')
const parentAccountId = ref<string | null>(null)
const normalBalance = ref<'debit' | 'credit'>('debit')
const isActive = ref(true)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    const account = props.account
    accountCode.value = account?.code ?? ''
    accountName.value = account?.name ?? ''
    accountType.value = account?.type ?? 'asset'
    parentAccountId.value = account?.parentId ?? null
    normalBalance.value = account?.normalBalance ?? 'debit'
    isActive.value = account?.isActive ?? true
  },
  { immediate: true },
)

function submit() {
  emit('save', {
    account_code: accountCode.value,
    account_name: accountName.value,
    account_type: accountType.value,
    parent_account_id: parentAccountId.value,
    normal_balance: normalBalance.value,
    is_active: isActive.value,
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="emit('close')" />

      <div class="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 class="text-base font-extrabold text-slate-950">{{ title }}</h2>
            <p class="mt-1 text-sm text-slate-500">Workspace-ready drawer (backend save TODO if needed).</p>
          </div>
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            @click="emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div class="grid gap-4">
            <label class="block space-y-1.5">
              <span class="text-xs font-bold text-slate-500">Account Code</span>
              <input
                v-model="accountCode"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
                placeholder="e.g. 1101"
              />
            </label>

            <label class="block space-y-1.5">
              <span class="text-xs font-bold text-slate-500">Account Name</span>
              <input
                v-model="accountName"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
                placeholder="e.g. Cash"
              />
            </label>

            <label class="block space-y-1.5">
              <span class="text-xs font-bold text-slate-500">Account Type</span>
              <select
                v-model="accountType"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
              >
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </label>

            <label class="block space-y-1.5">
              <span class="text-xs font-bold text-slate-500">Parent Account</span>
              <input
                v-model="parentAccountId"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
                placeholder="(optional) parent account id"
              />
            </label>

            <label class="block space-y-1.5">
              <span class="text-xs font-bold text-slate-500">Normal Balance</span>
              <select
                v-model="normalBalance"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </label>

            <label class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <input
                v-model="isActive"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-[#24a1db] focus:ring-[#e9f6fb]"
              />
              <span class="text-sm font-semibold text-slate-700">Active</span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-5">
          <BaseButton variant="secondary" size="md" @click="emit('close')">Cancel</BaseButton>
          <BaseButton variant="primary" size="md" @click="submit">Save</BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

