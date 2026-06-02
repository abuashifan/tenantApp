<script setup lang="ts">
import { computed } from 'vue'
import { Field } from 'vee-validate'

export type TransactionSourceOption = {
  key: string
  label: string
}

const props = defineProps<{
  sourceTypeName: string
  options: TransactionSourceOption[]
  readonly?: boolean
}>()

const hasOptions = computed(() => props.options?.length > 0)
</script>

<template>
  <div v-if="hasOptions" class="min-w-0 space-y-1">
    <span class="block truncate text-[11px] font-bold leading-4 text-slate-500">Source Type</span>
    <Field
      :name="sourceTypeName"
      as="select"
      :disabled="readonly"
      class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50"
    >
      <option value="">Direct</option>
      <option v-for="opt in options" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
    </Field>
    <slot />
  </div>
</template>
