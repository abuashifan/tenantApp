<script setup lang="ts">
import { computed } from 'vue'

import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'soft' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
  },
)

const variantClass = computed(() => {
  if (props.disabled || props.loading) {
    return 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
  }

  const variants: Record<Variant, string> = {
    primary: 'bg-[#06131e] text-white hover:bg-[#091c2a] shadow-lg shadow-slate-900/10',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    soft: 'border border-[#e1f1a7] bg-[#f7fbe9] text-[#48580e] hover:bg-[#f0f8d3]',
    danger: 'bg-rose-600 text-white shadow-lg shadow-rose-600/15 hover:bg-rose-700',
  }

  return variants[props.variant]
})

const sizeClass = computed(() => {
  const sizes: Record<Size, string> = {
    sm: 'h-9 rounded-xl px-3 text-xs',
    md: 'h-10 rounded-xl px-4 text-sm',
    lg: 'h-12 rounded-2xl px-5 text-sm',
  }

  return sizes[props.size]
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="
      cn(
        'inline-flex items-center justify-center gap-2 font-bold transition disabled:pointer-events-none',
        variantClass,
        sizeClass,
      )
    "
  >
    <span v-if="loading" class="inline-flex items-center gap-2">
      <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      <slot name="loading">Loading</slot>
    </span>
    <slot v-else />
  </button>
</template>
