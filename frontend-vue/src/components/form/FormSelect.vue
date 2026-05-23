<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'

import FormField from '@/components/form/FormField.vue'

export type SelectOption = { label: string; value: string }

const props = withDefaults(
  defineProps<{
    name: string
    label?: string
    placeholder?: string
    options: SelectOption[]
    disabled?: boolean
  }>(),
  {
    label: '',
    placeholder: 'Select…',
    disabled: false,
  },
)

const { value, handleBlur, setValue } = useField<string>(() => props.name)

const model = computed({
  get: () => value.value ?? '',
  set: (v: string) => setValue(v),
})
</script>

<template>
  <FormField :name="name" :label="label">
    <select
      v-model="model"
      :disabled="disabled"
      class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      @blur="handleBlur"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </FormField>
</template>
