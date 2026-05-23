<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'

import FormField from '@/components/form/FormField.vue'

const props = withDefaults(
  defineProps<{
    name: string
    label?: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    label: '',
    placeholder: '',
    disabled: false,
  },
)

const { value, handleBlur, setValue } = useField<number | null>(() => props.name)

const model = computed({
  get: () => (value.value ?? '') as unknown as string,
  set: (v: string) => setValue(v === '' ? null : Number(v)),
})
</script>

<template>
  <FormField :name="name" :label="label">
    <input
      v-model="model"
      type="number"
      step="0.01"
      inputmode="decimal"
      :placeholder="placeholder"
      :disabled="disabled"
      class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      @blur="handleBlur"
    />
  </FormField>
</template>
