<script setup lang="ts">
import { Field } from 'vee-validate'
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <label class="block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">Warehouse</span>
      <Field
        name="warehouse_id"
        as="input"
        type="text"
        placeholder="Warehouse id…"
        class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
      />
    </label>
    <label class="block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">Shipping Address</span>
      <Field
        name="shipping_address"
        as="input"
        type="text"
        placeholder="Address…"
        class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
      />
    </label>
  </div>
</template>
