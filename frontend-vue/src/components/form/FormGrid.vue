<script setup lang="ts">
import { cn } from '@/utils/cn'

withDefaults(
  defineProps<{
    cols?: 1 | 2 | 3 | 4
  }>(),
  {
    cols: 2,
  },
)
</script>

<template>
  <div
    :class="
      cn(
        'grid min-w-0 gap-4 tablet-form-gap',
        cols === 1 ? 'grid-cols-1' : '',
        cols === 2 ? 'grid-cols-1 md:grid-cols-2' : '',
        cols === 3 ? 'grid-cols-1 md:grid-cols-3' : '',
        cols === 4 ? 'grid-cols-1 md:grid-cols-4' : '',
      )
    "
  >
    <slot />
  </div>
</template>
