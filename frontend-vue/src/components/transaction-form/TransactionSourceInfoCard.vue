<script setup lang="ts">
defineProps<{
  sourceType?: string | null
  sourceNumber?: string | null
}>()
</script>

<template>
  <div v-if="sourceType || sourceNumber" class="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm shadow-sm">
    <p class="text-xs font-extrabold uppercase tracking-wide text-slate-500">Source</p>
    <p class="mt-1 font-bold text-slate-900">
      {{ sourceType ?? 'Source' }} <span v-if="sourceNumber" class="font-black">{{ sourceNumber }}</span>
    </p>
  </div>
</template>
