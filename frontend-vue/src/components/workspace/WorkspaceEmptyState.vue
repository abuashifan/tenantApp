<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
    <p class="text-sm font-bold text-slate-700">{{ title ?? 'No data' }}</p>
    <p class="mt-1 text-sm text-slate-500">
      {{ description ?? 'Try adjusting your filters or date range.' }}
    </p>
  </div>
</template>
