<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useField } from 'vee-validate'

import { formatIntegerNumber, parseFormattedInteger } from '@/utils/numberFormat'

const props = withDefaults(
  defineProps<{
    name: string
    readonly?: boolean
    disabled?: boolean
    textAlign?: 'left' | 'right'
    compact?: boolean
  }>(),
  {
    readonly: false,
    disabled: false,
    textAlign: 'right',
    compact: true,
  },
)

const field = useField<number | string | null>(() => props.name)
const focused = ref(false)
const displayValue = ref(formatIntegerNumber(field.value.value))

const isDisabled = computed(() => props.disabled || props.readonly)
const inputClass = computed(() => [
  'w-full min-w-0 border border-slate-200 bg-white font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50',
  props.compact ? 'h-8 rounded-lg px-2 text-xs leading-none' : 'h-10 rounded-xl px-3 text-sm',
  props.textAlign === 'right' ? 'text-right tabular-nums' : 'text-left',
])

watch(
  () => field.value.value,
  (value) => {
    if (!focused.value) displayValue.value = formatIntegerNumber(value)
  },
)

function onFocus() {
  focused.value = true
  displayValue.value = String(field.value.value ?? '')
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  displayValue.value = target.value
  field.setValue(parseFormattedInteger(target.value))
}

function onBlur() {
  focused.value = false
  displayValue.value = formatIntegerNumber(field.value.value)
  field.handleBlur()
}
</script>

<template>
  <input
    :value="displayValue"
    type="text"
    inputmode="numeric"
    :disabled="isDisabled"
    :class="inputClass"
    @focus="onFocus"
    @input="onInput"
    @blur="onBlur"
  />
</template>
