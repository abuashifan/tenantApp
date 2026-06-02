<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex min-w-0 items-start justify-between gap-2">
    <div class="min-w-0 space-y-0.5">
      <p v-if="eyebrow" class="truncate text-xs font-semibold text-[#1d81af]">{{ eyebrow }}</p>
      <h1 class="truncate text-lg font-black leading-6 tracking-tight text-slate-950">{{ title }}</h1>
      <p v-if="subtitle" class="truncate text-xs leading-4 text-slate-500">{{ subtitle }}</p>
      <slot />
    </div>
    <slot name="aside" />
  </div>
</template>
