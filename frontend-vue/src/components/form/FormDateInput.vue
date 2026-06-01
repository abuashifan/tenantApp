<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'

import FormField from '@/components/form/FormField.vue'
import DateInput from '@/components/ui/DateInput.vue'

const props = withDefaults(
  defineProps<{
    name: string
    label?: string
    disabled?: boolean
    compact?: boolean
  }>(),
  {
    label: '',
    disabled: false,
    compact: false,
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
    <DateInput
      v-model="model"
      :name="name"
      :disabled="disabled"
      :compact="compact"
      @blur="handleBlur"
    />
  </FormField>
</template>
