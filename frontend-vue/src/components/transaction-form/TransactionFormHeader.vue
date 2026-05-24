<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="space-y-2">
    <p v-if="eyebrow" class="text-sm font-semibold text-[#1d81af]">{{ eyebrow }}</p>
    <h1 class="text-2xl font-black tracking-tight text-slate-950">{{ title }}</h1>
    <p v-if="subtitle" class="text-sm leading-6 text-slate-500">{{ subtitle }}</p>
    <slot />
  </div>
</template>
