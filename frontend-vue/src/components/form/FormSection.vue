<script setup lang="ts">
import { cn } from '@/utils/cn'

withDefaults(
  defineProps<{
    title?: string
    description?: string
    plain?: boolean
  }>(),
  {
    title: '',
    description: '',
    plain: false,
  },
)
</script>

<template>
  <section :class="cn('min-w-0', !plain && 'tablet-form-card rounded-2xl border border-slate-200 bg-white p-4')">
    <header v-if="!plain && (title || description)" class="mb-3">
      <h2 v-if="title" class="text-sm font-semibold text-slate-900">{{ title }}</h2>
      <p v-if="description" class="mt-1 text-xs leading-5 text-slate-500">{{ description }}</p>
    </header>
    <slot />
  </section>
</template>
