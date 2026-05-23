<script setup lang="ts">
import { cn } from '@/utils/cn'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '',
    description: '',
  },
)
</script>

<template>
  <section :class="cn('rounded-3xl border border-slate-200 bg-white p-6 shadow-sm')">
    <header v-if="title || description" class="mb-5">
      <h2 v-if="title" class="text-sm font-extrabold text-slate-900">{{ title }}</h2>
      <p v-if="description" class="mt-1 text-xs leading-5 text-slate-500">{{ description }}</p>
    </header>
    <slot />
  </section>
</template>
