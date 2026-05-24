<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="space-y-2">
    <h2 class="text-lg font-black text-slate-950">{{ title }}</h2>
    <p v-if="description" class="text-sm leading-6 text-slate-600">{{ description }}</p>
    <slot />
  </div>
</template>
