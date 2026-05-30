<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

import FormActionBar from '@/components/form/FormActionBar.vue'
import FormDirtyIndicator from '@/components/form/FormDirtyIndicator.vue'
import FormGrid from '@/components/form/FormGrid.vue'
import FormHeader from '@/components/form/FormHeader.vue'
import FormInput from '@/components/form/FormInput.vue'
import FormSection from '@/components/form/FormSection.vue'
import FormSelect from '@/components/form/FormSelect.vue'
import FormValidationSummary from '@/components/form/FormValidationSummary.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { ChartOfAccountRow } from '@/features/accounting/chart-of-accounts/chartOfAccounts.service'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

type ChartOfAccountDraft = {
  accountCode: string
  accountName: string
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  parentAccountId: string
  normalBalance: 'debit' | 'credit'
  isActive: boolean
}

const props = defineProps<{
  mode: 'create' | 'edit'
  account?: ChartOfAccountRow | null
  accounts: ChartOfAccountRow[]
  secondaryTabId: string
  saving?: boolean
  serverErrors?: string[]
}>()

const emit = defineEmits<{
  cancel: []
  save: [payload: Record<string, unknown>]
}>()

const accountTypeOptions = [
  { label: 'Asset', value: 'asset' },
  { label: 'Liability', value: 'liability' },
  { label: 'Equity', value: 'equity' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Expense', value: 'expense' },
]

const normalBalanceOptions = [
  { label: 'Debit', value: 'debit' },
  { label: 'Credit', value: 'credit' },
]

const tabs = useWorkspaceTabsStore()
const parentOptions = computed(() => [
  { label: 'No parent account', value: '' },
  ...props.accounts
    .filter((account) => account.id !== props.account?.id)
    .map((account) => ({ label: `${account.code} - ${account.name}`, value: account.id })),
])

function defaultDraft(): ChartOfAccountDraft {
  return {
    accountCode: props.account?.code ?? '',
    accountName: props.account?.name ?? '',
    accountType: props.account?.type ?? 'asset',
    parentAccountId: props.account?.parentId ?? '',
    normalBalance: props.account?.normalBalance ?? 'debit',
    isActive: props.account?.isActive ?? true,
  }
}

function draftSnapshot(value: Partial<ChartOfAccountDraft> = {}): ChartOfAccountDraft {
  const fallback = defaultDraft()
  return {
    accountCode: String(value.accountCode ?? fallback.accountCode),
    accountName: String(value.accountName ?? fallback.accountName),
    accountType: value.accountType ?? fallback.accountType,
    parentAccountId: String(value.parentAccountId ?? fallback.parentAccountId),
    normalBalance: value.normalBalance ?? fallback.normalBalance,
    isActive: typeof value.isActive === 'boolean' ? value.isActive : fallback.isActive,
  }
}

const dirty = computed(() => {
  const tab = Object.values(tabs.secondaryTabsByPrimaryId)
    .flat()
    .find((item) => item.id === props.secondaryTabId)
  return tab?.dirty ?? false
})

const schema = toTypedSchema(
  z.object({
    accountCode: z.string().trim().min(1, 'Account code is required'),
    accountName: z.string().trim().min(1, 'Account name is required'),
    accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
    parentAccountId: z.string(),
    normalBalance: z.enum(['debit', 'credit']),
    isActive: z.boolean(),
  }),
)

const form = useForm<ChartOfAccountDraft>({
  validationSchema: schema,
  initialValues: currentDraft(),
})
const { value: isActive } = useField<boolean>('isActive')
const hydrating = ref(false)

function currentDraft() {
  const raw = tabs.draftStateBySecondaryTabId[props.secondaryTabId]
  if (raw && typeof raw === 'object') return draftSnapshot(raw as Partial<ChartOfAccountDraft>)
  return draftSnapshot()
}

function sameDraft(a: ChartOfAccountDraft, b: ChartOfAccountDraft) {
  return JSON.stringify(a) === JSON.stringify(b)
}

watch(
  () => props.secondaryTabId,
  () => {
    hydrating.value = true
    form.resetForm({ values: currentDraft() })
    setTimeout(() => {
      hydrating.value = false
    }, 0)
  },
  { immediate: true },
)

watch(
  () => props.account?.id,
  () => {
    if (tabs.draftStateBySecondaryTabId[props.secondaryTabId]) return
    hydrating.value = true
    form.resetForm({ values: defaultDraft() })
    setTimeout(() => {
      hydrating.value = false
    }, 0)
  },
)

watch(
  () => form.values,
  (values) => {
    if (hydrating.value || !props.secondaryTabId) return
    const nextDraft = draftSnapshot(values as Partial<ChartOfAccountDraft>)
    tabs.updateDraftState(props.secondaryTabId, nextDraft)
    tabs.setSecondaryDirty(props.secondaryTabId, !sameDraft(nextDraft, defaultDraft()))
  },
  { deep: true },
)

const title = computed(() => (props.mode === 'create' ? 'Add Account' : 'Edit Account'))
const subtitle = computed(() =>
  props.mode === 'create'
    ? 'Create an account in the chart of accounts hierarchy.'
    : `Update account ${props.account?.code ?? ''}.`,
)

const onSubmit = form.handleSubmit((values) => {
  const draft = draftSnapshot(values)
  if (props.secondaryTabId) {
    tabs.updateDraftState(props.secondaryTabId, draft)
    tabs.setSecondaryDirty(props.secondaryTabId, !sameDraft(draft, defaultDraft()))
  }

  emit('save', {
    account_code: draft.accountCode,
    account_name: draft.accountName,
    account_type: draft.accountType,
    parent_account_id: draft.parentAccountId ? Number(draft.parentAccountId) : null,
    normal_balance: draft.normalBalance,
    is_active: draft.isActive,
  })
})

defineExpose({
  submit: onSubmit,
})
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <FormHeader :title="title" :subtitle="subtitle">
      <template #meta>
        <div class="mt-3">
          <FormDirtyIndicator :dirty="dirty" />
        </div>
      </template>
    </FormHeader>

    <FormValidationSummary :errors="props.serverErrors ?? []" />

    <FormSection title="Account Details" description="Maintain the account classification and hierarchy.">
      <FormGrid :cols="2">
        <FormInput
          name="accountCode"
          label="Account Code"
          placeholder="e.g. 111.101-03"
          :disabled="props.mode === 'edit'"
        />
        <FormInput name="accountName" label="Account Name" placeholder="e.g. Cash" />
        <FormSelect name="accountType" label="Account Type" :options="accountTypeOptions" />
        <FormSelect name="normalBalance" label="Normal Balance" :options="normalBalanceOptions" />
        <FormSelect name="parentAccountId" label="Parent Account" :options="parentOptions" />

        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Status</span>
          <span class="flex h-10 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3">
            <input
              v-model="isActive"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-[#24a1db] focus:ring-[#e9f6fb]"
            />
            <span class="text-sm font-semibold text-slate-700">Active</span>
          </span>
        </label>
      </FormGrid>
    </FormSection>

    <FormActionBar>
      <BaseButton variant="secondary" type="button" :disabled="props.saving" @click="emit('cancel')">Cancel</BaseButton>
      <BaseButton variant="primary" type="submit" :loading="props.saving">Save Account</BaseButton>
    </FormActionBar>
  </form>
</template>
