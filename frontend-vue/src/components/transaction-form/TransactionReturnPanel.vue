<script setup lang="ts">
import { Field } from 'vee-validate'
</script>

<template>
  <label class="block space-y-1.5">
    <span class="text-xs font-bold text-slate-500">Return Reason</span>
    <Field
      name="return_reason"
      as="textarea"
      rows="3"
      class="w-full resize-y rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
    />
  </label>
</template>
