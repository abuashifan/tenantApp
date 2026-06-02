<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div class="border-b border-slate-100 bg-slate-50/70 px-2.5 py-1.5">
      <h2 class="text-xs font-semibold text-slate-900">{{ title }}</h2>
      <p v-if="description" class="mt-0.5 text-xs leading-5 text-slate-500">{{ description }}</p>
    </div>
    <div class="px-2.5 py-2">
      <slot />
    </div>
  </section>
</template>
