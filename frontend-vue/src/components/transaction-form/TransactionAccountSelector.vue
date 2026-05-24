<script setup lang="ts">
import { onMounted, ref } from 'vue'

import TransactionSearchableSelect from '@/components/transaction-form/TransactionSearchableSelect.vue'
import { listChartOfAccounts, type ChartOfAccountsListParams } from '@/features/accounting/chart-of-accounts/chartOfAccounts.service'

type AccountOption = { value: string; label: string }

const props = withDefaults(
  defineProps<{
    name: string
    label?: string
    placeholder?: string
    readonly?: boolean
    params?: ChartOfAccountsListParams
  }>(),
  {
    label: 'Account',
    placeholder: 'Select account...',
    readonly: false,
    params: () => ({ is_active: true }),
  },
)

const loading = ref(false)
const error = ref<string | null>(null)
const options = ref<AccountOption[]>([])

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const rows = await listChartOfAccounts(props.params ?? { is_active: true })
    options.value = rows.map((row) => ({ value: row.id, label: `${row.code} - ${row.name}` }))
  } catch (cause) {
    const message = (cause as { message?: unknown } | null)?.message
    error.value = typeof message === 'string' ? message : 'Unable to load accounts.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <TransactionSearchableSelect
    :name="name"
    :label="label"
    :placeholder="placeholder"
    :options="options"
    :readonly="readonly"
    :loading="loading"
    :error="error"
    empty-text="Akun tidak ditemukan"
    loading-text="Memuat akun..."
  />
</template>
