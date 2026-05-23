<script setup lang="ts">
import { cn } from '@/utils/cn'

withDefaults(
  defineProps<{
    show?: boolean
  }>(),
  {
    show: true,
  },
)
</script>

<template>
  <div v-if="show" :class="cn('fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 p-3 backdrop-blur lg:hidden')">
    <div class="mx-auto flex max-w-7xl gap-2">
      <slot />
    </div>
  </div>
</template>
