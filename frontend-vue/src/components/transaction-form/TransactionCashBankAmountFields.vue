<script setup lang="ts">
import { Field } from 'vee-validate'

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
  <div class="grid gap-3 sm:grid-cols-2">
    <label class="block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">{{ cashBankAccountLabel }}</span>
      <Field
        :name="cashBankAccountName"
        as="input"
        type="text"
        placeholder="Cash/Bank account id…"
        :disabled="readonly"
        class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      />
    </label>

    <label class="block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">{{ amountLabel }}</span>
      <Field
        :name="amountName"
        as="input"
        type="number"
        step="0.01"
        inputmode="decimal"
        :disabled="readonly"
        class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      />
    </label>
  </div>
</template>

