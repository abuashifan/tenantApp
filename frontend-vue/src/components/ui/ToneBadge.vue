<script setup lang="ts">
import { computed } from 'vue'

import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    tone?: 'green' | 'blue' | 'lime'
  }>(),
  {
    tone: 'green',
  },
)

const toneClass = computed(() => {
  const map: Record<string, string> = {
    green: 'bg-[#edf8f1] text-[#2c6d43] ring-[#b6e2c5]',
    blue: 'bg-[#e9f6fb] text-[#156184] ring-[#a7d9f1]',
    lime: 'bg-[#f7fbe9] text-[#48580e] ring-[#e1f1a7]',
  }
  return map[props.tone] ?? map.green
})
</script>

<template>
  <span :class="cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1', toneClass)">
    <slot />
  </span>
</template>
