<script setup lang="ts">
import { Field } from 'vee-validate'

defineProps<{
  name: string
  readonly?: boolean
}>()
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <label class="block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">Description</span>
      <Field
        :name="`${name}.description`"
        as="input"
        type="text"
        :disabled="readonly"
        class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      />
    </label>
  </div>
</template>
