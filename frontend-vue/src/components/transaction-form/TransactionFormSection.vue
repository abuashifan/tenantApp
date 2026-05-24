<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-100 px-6 py-5">
      <h2 class="text-sm font-extrabold text-slate-900">{{ title }}</h2>
      <p v-if="description" class="mt-1 text-xs leading-5 text-slate-500">{{ description }}</p>
    </div>
    <div class="px-6 py-5">
      <slot />
    </div>
  </section>
</template>
