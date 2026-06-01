<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div class="border-b border-slate-100 bg-slate-50/70 px-3 py-2">
      <h2 class="text-sm font-semibold text-slate-900">{{ title }}</h2>
      <p v-if="description" class="mt-0.5 text-xs leading-5 text-slate-500">{{ description }}</p>
    </div>
    <div class="px-3 py-3">
      <slot />
    </div>
  </section>
</template>
