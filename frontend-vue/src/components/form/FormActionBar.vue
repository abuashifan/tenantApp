<script setup lang="ts">
import { cn } from '@/utils/cn'
</script>

<template>
  <div
    :class="
      cn(
        'sticky bottom-0 z-10 mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white/95 pt-3 backdrop-blur',
      )
    "
  >
    <slot />
  </div>
</template>
