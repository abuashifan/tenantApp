<script setup lang="ts">
import { Field } from 'vee-validate'
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <label class="block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">Deposit Amount</span>
      <Field
        name="deposit_amount"
        as="input"
        type="number"
        step="0.01"
        inputmode="decimal"
        class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
      />
    </label>
    <label class="block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">Account</span>
      <Field
        name="account_id"
        as="input"
        type="text"
        placeholder="Cash/Bank account id…"
        class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
      />
    </label>
  </div>
</template>
