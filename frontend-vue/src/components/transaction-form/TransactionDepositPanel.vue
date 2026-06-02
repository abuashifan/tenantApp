<script setup lang="ts">
import { Field } from 'vee-validate'
</script>

<template>
  <div class="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
    <label class="block min-w-0 space-y-1">
      <span class="truncate text-[11px] font-bold leading-4 text-slate-500">Deposit Amount</span>
      <Field
        name="deposit_amount"
        as="input"
        type="number"
        step="0.01"
        inputmode="decimal"
        class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-right text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb]"
      />
    </label>
    <label class="block min-w-0 space-y-1">
      <span class="truncate text-[11px] font-bold leading-4 text-slate-500">Account</span>
      <Field
        name="account_id"
        as="input"
        type="text"
        placeholder="Cash/Bank account id…"
        class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb]"
      />
    </label>
  </div>
</template>
