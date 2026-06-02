<script setup lang="ts">
import { ref, watch } from 'vue'
import { CalendarDays } from 'lucide-vue-next'

import { parseDateDisplayValue, toDateDisplayValue, toDateInputValue } from '@/utils/date'

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

const displayValue = ref(toDateDisplayValue(props.modelValue))
const nativeDateInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.modelValue,
  (value) => {
    displayValue.value = toDateDisplayValue(value)
  },
)

function updateValue(value: string) {
  displayValue.value = value
  if (!value.trim()) {
    emit('update:modelValue', '')
    return
  }

  const parsed = parseDateDisplayValue(value)
  if (parsed) emit('update:modelValue', parsed)
}

function handleBlur(event: FocusEvent) {
  const parsed = parseDateDisplayValue(displayValue.value)
  displayValue.value = parsed ? toDateDisplayValue(parsed) : toDateDisplayValue(toDateInputValue(props.modelValue))
  emit('blur', event)
}

function openPicker() {
  if (props.disabled || props.readonly) return
  const input = nativeDateInput.value
  if (!input) return
  if (typeof input.showPicker === 'function') {
    input.showPicker()
    return
  }
  input.focus()
  input.click()
}
</script>

<template>
  <span class="relative block w-full">
    <input
      :id="id"
      :value="displayValue"
      :name="name"
      type="text"
      inputmode="numeric"
      :disabled="disabled"
      :readonly="readonly"
      :placeholder="placeholder ?? 'dd/mm/yyyy'"
      :class="[
        'w-full border border-slate-200 bg-white text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50',
        compact ? 'h-9 rounded-lg py-0 pl-2.5 pr-9 text-xs' : 'h-10 rounded-xl py-0 pl-3 pr-10 text-sm',
      ]"
      @click="openPicker"
      @input="updateValue(($event.target as HTMLInputElement).value)"
      @blur="handleBlur"
    />
    <button
      type="button"
      class="absolute right-1 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-50"
      :class="compact ? 'h-7 w-7' : 'h-8 w-8'"
      :disabled="disabled || readonly"
      aria-label="Choose date"
      @click="openPicker"
    >
      <CalendarDays :class="compact ? 'h-3.5 w-3.5' : 'h-4 w-4'" />
    </button>
    <input
      ref="nativeDateInput"
      class="pointer-events-none absolute right-0 top-0 h-full w-9 opacity-0"
      tabindex="-1"
      type="date"
      :value="toDateInputValue(modelValue)"
      :disabled="disabled || readonly"
      aria-hidden="true"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </span>
</template>
