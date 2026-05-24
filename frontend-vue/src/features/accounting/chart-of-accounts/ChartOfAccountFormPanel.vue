<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

import FormActions from '@/components/form/FormActions.vue'
import FormDirtyIndicator from '@/components/form/FormDirtyIndicator.vue'
import FormGrid from '@/components/form/FormGrid.vue'
import FormHeader from '@/components/form/FormHeader.vue'
import FormInput from '@/components/form/FormInput.vue'
import FormSection from '@/components/form/FormSection.vue'
import FormSelect from '@/components/form/FormSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useWorkspaceDraft } from '@/composables/useWorkspaceDraft'
import type { MockChartOfAccount, MockChartOfAccountType, MockNormalBalance } from '@/stores/mockAccountingDataStore'

type ChartOfAccountDraft = {
  accountCode: string
  accountName: string
  accountType: MockChartOfAccountType
  parentCode: string
  normalBalance: MockNormalBalance
  isActive: boolean
}

const props = defineProps<{
  mode: 'create' | 'edit'
  account?: MockChartOfAccount | null
  accounts: MockChartOfAccount[]
}>()

const emit = defineEmits<{
  cancel: []
  save: [payload: Record<string, unknown>]
}>()

const accountTypeOptions = [
  { label: 'Kas & Bank', value: 'Kas & Bank' },
  { label: 'Piutang', value: 'Piutang' },
  { label: 'Persediaan', value: 'Persediaan' },
  { label: 'Aset Tetap', value: 'Aset Tetap' },
  { label: 'Hutang', value: 'Hutang' },
  { label: 'Modal', value: 'Modal' },
  { label: 'Pendapatan', value: 'Pendapatan' },
  { label: 'Beban', value: 'Beban' },
]

const normalBalanceOptions = [
  { label: 'Debit', value: 'Debit' },
  { label: 'Credit', value: 'Credit' },
]

const parentOptions = computed(() => [
  { label: 'No parent account', value: '' },
  ...props.accounts
    .filter((account) => account.id !== props.account?.id)
    .map((account) => ({ label: `${account.code} - ${account.name}`, value: account.code })),
])

function defaultDraft(): ChartOfAccountDraft {
  return {
    accountCode: props.account?.code ?? '',
    accountName: props.account?.name ?? '',
    accountType: props.account?.type ?? 'Kas & Bank',
    parentCode: props.account?.parentCode ?? '',
    normalBalance: props.account?.normalBalance ?? 'Debit',
    isActive: props.account?.isActive ?? true,
  }
}

const { draft, setDraft, dirty, setDirty, secondaryTabId } = useWorkspaceDraft<ChartOfAccountDraft>({
  defaultDraft,
})

const schema = toTypedSchema(
  z.object({
    accountCode: z.string().trim().min(1, 'Account code is required'),
    accountName: z.string().trim().min(1, 'Account name is required'),
    accountType: z.enum(['Kas & Bank', 'Piutang', 'Persediaan', 'Aset Tetap', 'Hutang', 'Modal', 'Pendapatan', 'Beban']),
    parentCode: z.string(),
    normalBalance: z.enum(['Debit', 'Credit']),
    isActive: z.boolean(),
  }),
)

const form = useForm<ChartOfAccountDraft>({
  validationSchema: schema,
  initialValues: draft.value,
})
const { value: isActive } = useField<boolean>('isActive')
const hydrating = ref(false)

watch(
  () => secondaryTabId.value,
  () => {
    hydrating.value = true
    form.resetForm({ values: draft.value })
    setTimeout(() => {
      hydrating.value = false
    }, 0)
  },
  { immediate: true },
)

watch(
  () => form.values,
  (values) => {
    if (hydrating.value) return
    setDraft(values as ChartOfAccountDraft)
    setDirty(form.meta.value.dirty)
  },
  { deep: true },
)

watch(
  () => form.meta.value.dirty,
  (value) => {
    if (!hydrating.value) setDirty(value)
  },
)

const title = computed(() => (props.mode === 'create' ? 'Add Account' : 'Edit Account'))
const subtitle = computed(() =>
  props.mode === 'create'
    ? 'Create an account in the chart of accounts hierarchy.'
    : `Update account ${props.account?.code ?? ''}.`,
)

const onSubmit = form.handleSubmit((values) => {
  emit('save', {
    account_code: values.accountCode,
    account_name: values.accountName,
    account_type: values.accountType,
    parent_code: values.parentCode || null,
    normal_balance: values.normalBalance,
    is_active: values.isActive,
  })
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

      <template #actions>
        <BaseButton variant="secondary" type="button" @click="emit('cancel')">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit">Save</BaseButton>
      </template>
    </FormHeader>

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
        <FormSelect name="parentCode" label="Parent Account" :options="parentOptions" />

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

    <FormActions>
      <BaseButton variant="secondary" type="button" @click="emit('cancel')">Cancel</BaseButton>
      <BaseButton variant="primary" type="submit">Save Account</BaseButton>
    </FormActions>
  </form>
</template>
