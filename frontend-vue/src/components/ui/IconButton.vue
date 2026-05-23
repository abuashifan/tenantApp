<script setup lang="ts">
import { computed } from 'vue'

import { cn } from '@/utils/cn'

type Variant = 'ghost' | 'soft' | 'danger'
type Size = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'ghost',
    size: 'md',
    disabled: false,
    type: 'button',
  },
)

const variantClass = computed(() => {
  if (props.disabled) return 'cursor-not-allowed text-slate-300'
  const variants: Record<Variant, string> = {
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
    soft: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
    danger: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
  }
  return variants[props.variant]
})

const sizeClass = computed(() => {
  const sizes: Record<Size, string> = {
    sm: 'h-9 w-9 rounded-xl',
    md: 'h-10 w-10 rounded-2xl',
  }
  return sizes[props.size]
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="cn('inline-grid place-items-center transition', variantClass, sizeClass)"
  >
    <slot />
  </button>
</template>
