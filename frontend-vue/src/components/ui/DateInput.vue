<script setup lang="ts">
import { computed } from 'vue'

import { toDateInputValue } from '@/utils/date'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null | Date
    id?: string
    name?: string
    disabled?: boolean
    readonly?: boolean
    placeholder?: string
  }>(),
  {
    modelValue: '',
    id: undefined,
    name: undefined,
    disabled: false,
    readonly: false,
    placeholder: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const model = computed({
  get: () => toDateInputValue(props.modelValue),
  set: (value: string) => emit('update:modelValue', toDateInputValue(value)),
})
</script>

<template>
  <input
    :id="id"
    v-model="model"
    :name="name"
    type="date"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="placeholder"
    class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
    @blur="$emit('blur', $event)"
  />
</template>
