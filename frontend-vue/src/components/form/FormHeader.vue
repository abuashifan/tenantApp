<script setup lang="ts">
import { cn } from '@/utils/cn'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
  }>(),
  {
    subtitle: '',
  },
)
</script>

<template>
  <header :class="cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between')">
    <div>
      <h1 class="text-xl font-extrabold tracking-tight text-slate-950">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-xs leading-5 text-slate-500">{{ subtitle }}</p>
      <slot name="meta" />
    </div>
    <div class="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
      <slot name="actions" />
    </div>
  </header>
</template>
