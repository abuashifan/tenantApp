<script setup lang="ts">
import { Field } from 'vee-validate'
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <label class="block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">Payment Date</span>
      <Field
        name="payment_date"
        as="input"
        type="date"
        class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
      />
    </label>
    <label class="block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">Amount Paid</span>
      <Field
        name="amount_paid"
        as="input"
        type="number"
        step="0.01"
        inputmode="decimal"
        class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
      />
    </label>
  </div>
</template>
