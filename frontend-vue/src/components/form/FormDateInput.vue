<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'

import FormField from '@/components/form/FormField.vue'

const props = withDefaults(
  defineProps<{
    name: string
    label?: string
    disabled?: boolean
  }>(),
  {
    label: '',
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
    <input
      v-model="model"
      type="date"
      :disabled="disabled"
      class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      @blur="handleBlur"
    />
  </FormField>
</template>
