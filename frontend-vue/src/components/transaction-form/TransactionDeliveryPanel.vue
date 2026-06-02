<script setup lang="ts">
import { Field } from 'vee-validate'
</script>

<template>
  <div class="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
    <label class="block min-w-0 space-y-1">
      <span class="truncate text-[11px] font-bold leading-4 text-slate-500">Warehouse</span>
      <Field
        name="warehouse_id"
        as="input"
        type="text"
        placeholder="Warehouse id…"
        class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb]"
      />
    </label>
    <label class="block min-w-0 space-y-1">
      <span class="truncate text-[11px] font-bold leading-4 text-slate-500">Shipping Address</span>
      <Field
        name="shipping_address"
        as="input"
        type="text"
        placeholder="Address…"
        class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb]"
      />
    </label>
  </div>
</template>
