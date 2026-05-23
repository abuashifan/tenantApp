<script setup lang="ts">
import { computed } from 'vue'

import { cn } from '@/utils/cn'
import type { WorkspaceStatusTone } from '@/types/workspace'

const props = defineProps<{
  status: string
  tone?: WorkspaceStatusTone
}>()

const normalized = computed(() => props.status.toLowerCase())
const label = computed(() => props.status.charAt(0).toUpperCase() + props.status.slice(1))

const tone = computed<WorkspaceStatusTone>(() => {
  if (props.tone) return props.tone
  const status = normalized.value
  if (['posted', 'paid', 'success', 'active'].includes(status)) return 'success'
  if (['approved', 'partial', 'info'].includes(status)) return 'info'
  if (['draft', 'neutral'].includes(status)) return 'draft'
  if (['unpaid', 'pending', 'warning'].includes(status)) return 'warning'
  if (['void', 'cancelled', 'canceled', 'danger', 'inactive'].includes(status)) return 'danger'
  return 'default'
})

const toneClass = computed(() => {
  const classes: Record<WorkspaceStatusTone, string> = {
    default: 'border-slate-200 bg-slate-50 text-slate-600',
    draft: 'border-slate-200 bg-slate-50 text-slate-600',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-rose-200 bg-rose-50 text-rose-700',
    info: 'border-sky-200 bg-sky-50 text-sky-700',
  }

  return classes[tone.value]
})
</script>

<template>
  <span :class="cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-bold', toneClass)">
    {{ label }}
  </span>
</template>
