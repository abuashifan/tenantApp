<script setup lang="ts">
import { cn } from '@/utils/cn'

withDefaults(
  defineProps<{
    dirty: boolean
  }>(),
  {
  },
)
</script>

<template>
  <span
    :class="
      cn(
        'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ring-1',
        dirty ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-slate-50 text-slate-600 ring-slate-200',
      )
    "
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="dirty ? 'bg-amber-500' : 'bg-slate-400'" />
    {{ dirty ? 'Unsaved changes' : 'Saved' }}
  </span>
</template>
