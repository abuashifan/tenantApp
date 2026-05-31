<script setup lang="ts">
import { Field } from 'vee-validate'

import FormDateInput from '@/components/form/FormDateInput.vue'
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <FormDateInput name="payment_date" label="Payment Date" />
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
