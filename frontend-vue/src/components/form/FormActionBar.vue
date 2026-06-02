<script setup lang="ts">
import { cn } from '@/utils/cn'
</script>

<template>
  <div
    :class="
      cn(
        'mt-3 flex min-w-0 flex-nowrap items-center justify-end gap-2 overflow-x-auto border-t border-slate-200 bg-white pt-3',
      )
    "
  >
    <slot />
  </div>
</template>
