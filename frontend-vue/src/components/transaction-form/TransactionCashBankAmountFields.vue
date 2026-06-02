<script setup lang="ts">
import { Field } from 'vee-validate'

import TransactionAccountSelector from '@/components/transaction-form/TransactionAccountSelector.vue'

withDefaults(
  defineProps<{
    cashBankAccountName?: string
    amountName?: string
    cashBankAccountLabel?: string
    amountLabel?: string
    readonly?: boolean
  }>(),
  {
    cashBankAccountName: 'cash_bank_account_id',
    amountName: 'amount',
    cashBankAccountLabel: 'Cash/Bank Account',
    amountLabel: 'Amount',
    readonly: false,
  },
)
</script>

<template>
  <div class="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
    <TransactionAccountSelector
      :name="cashBankAccountName"
      :label="cashBankAccountLabel"
      :readonly="readonly"
      placeholder="Select cash/bank account…"
      :params="{ is_active: true, is_cash_bank: true }"
    />

    <label class="block min-w-0 space-y-1">
      <span class="truncate text-[11px] font-bold leading-4 text-slate-500">{{ amountLabel }}</span>
      <Field
        :name="amountName"
        as="input"
        type="number"
        step="0.01"
        inputmode="decimal"
        :disabled="readonly"
        class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-right text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      />
    </label>
  </div>
</template>
