<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status?: string | null
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral'
}>()

const toneClass = computed(() => {
  const t = props.tone ?? 'neutral'
  const map: Record<NonNullable<typeof props.tone>, string> = {
    info: 'border-sky-200 bg-sky-50 text-sky-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-rose-200 bg-rose-50 text-rose-800',
    neutral: 'border-slate-200 bg-white text-slate-700',
  }
  return map[t]
})
</script>

<template>
  <div v-if="status" class="rounded-3xl border px-5 py-4 text-sm font-semibold shadow-sm" :class="toneClass">
    Status: <span class="font-black">{{ status }}</span>
  </div>
</template>
