<script setup lang="ts">
import { cn } from '@/utils/cn'

withDefaults(
  defineProps<{
    sticky?: boolean
  }>(),
  {
    sticky: false,
  },
)
</script>

<template>
  <div
    :class="
      cn(
        'mt-6 border-t border-slate-200 bg-white/80 px-6 py-4 backdrop-blur',
        sticky ? 'sticky bottom-0' : '',
      )
    "
  >
    <slot />
  </div>
</template>
