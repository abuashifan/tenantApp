<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div class="space-y-1">
      <p v-if="eyebrow" class="text-xs font-semibold text-[#1d81af]">{{ eyebrow }}</p>
      <h1 class="text-xl font-black tracking-tight text-slate-950">{{ title }}</h1>
      <p v-if="subtitle" class="text-xs leading-5 text-slate-500">{{ subtitle }}</p>
      <slot />
    </div>
    <slot name="aside" />
  </div>
</template>
