<script setup lang="ts">
import { computed } from 'vue'

import { cn } from '@/utils/cn'

type Status = 'Draft' | 'Posted' | 'Approved' | 'Void' | string

const props = defineProps<{
  status: Status
}>()

const statusClass = computed(() => {
  const styles: Record<string, string> = {
    Posted: 'bg-[#edf8f1] text-[#2c6d43] ring-[#b6e2c5]',
    Draft: 'bg-[#f7fbe9] text-[#6c8415] ring-[#e1f1a7]',
    Approved: 'bg-[#e9f6fb] text-[#156184] ring-[#a7d9f1]',
    Void: 'bg-rose-50 text-rose-700 ring-rose-200',
  }
  return styles[props.status] ?? styles.Draft
})
</script>

<template>
  <span :class="cn('inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1', statusClass)">
    {{ status }}
  </span>
</template>
