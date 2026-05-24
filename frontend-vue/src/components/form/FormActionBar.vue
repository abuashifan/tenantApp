<script setup lang="ts">
import { cn } from '@/utils/cn'
</script>

<template>
  <div
    :class="
      cn(
        'sticky bottom-0 z-10 -mx-6 mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur',
      )
    "
  >
    <slot />
  </div>
</template>
