<script setup lang="ts">
import { Field } from 'vee-validate'

defineProps<{
  name: string
  readonly?: boolean
}>()
</script>

<template>
  <div class="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
    <label class="block min-w-0 space-y-1">
      <span class="truncate text-[11px] font-bold leading-4 text-slate-500">Description</span>
      <Field
        :name="`${name}.description`"
        as="input"
        type="text"
        :disabled="readonly"
        class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      />
    </label>
  </div>
</template>
