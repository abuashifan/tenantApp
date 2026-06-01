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
    compact?: boolean
  }>(),
  {
    modelValue: '',
    id: undefined,
    name: undefined,
    disabled: false,
    readonly: false,
    placeholder: undefined,
    compact: false,
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
    :class="[
      'w-full border border-slate-200 bg-white text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50',
      compact ? 'h-9 rounded-lg px-2.5 text-xs' : 'h-10 rounded-xl px-3 text-sm',
    ]"
    @blur="$emit('blur', $event)"
  />
</template>
