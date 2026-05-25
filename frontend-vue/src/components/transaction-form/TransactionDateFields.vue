<script setup lang="ts">
import { Field } from 'vee-validate'

withDefaults(
  defineProps<{
    dateName: string
    dateLabel?: string
    dueDateName?: string
    dueDateLabel?: string
    readonly?: boolean
  }>(),
  {
    dateLabel: 'Date',
    dueDateLabel: 'Due Date',
    readonly: false,
  },
)
</script>

<template>
  <label class="block space-y-1.5">
    <span class="text-xs font-bold text-slate-500">{{ dateLabel }}</span>
    <Field
      :name="dateName"
      as="input"
      type="date"
      :disabled="readonly"
      class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
    />
  </label>

  <label v-if="dueDateName" class="block space-y-1.5">
    <span class="text-xs font-bold text-slate-500">{{ dueDateLabel }}</span>
    <Field
      :name="dueDateName"
      as="input"
      type="date"
      :disabled="readonly"
      class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
    />
  </label>
</template>
