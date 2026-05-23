<script setup lang="ts">
import { cn } from '@/utils/cn'

withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  {
    description: '',
  },
)
</script>

<template>
  <div :class="cn('rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center')">
    <p class="text-sm font-bold text-slate-800">{{ title }}</p>
    <p v-if="description" class="mt-2 text-xs leading-5 text-slate-500">
      {{ description }}
    </p>
  </div>
</template>
