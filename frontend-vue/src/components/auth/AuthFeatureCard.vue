<script setup lang="ts">
import { cn } from '@/utils/cn'

withDefaults(
  defineProps<{
    title: string
    description: string
    tone?: 'lime' | 'blue'
  }>(),
  {
    tone: 'lime',
  },
)
</script>

<template>
  <div class="rounded-3xl bg-white/10 p-5 ring-1 ring-white/15">
    <div
      :class="
        cn(
          'grid h-10 w-10 place-items-center rounded-2xl',
          tone === 'lime' ? 'bg-[#b4db24] text-[#06131e]' : 'bg-[#24a1db] text-white',
        )
      "
    >
      <slot />
    </div>
    <p class="mt-4 text-sm font-bold text-white">{{ title }}</p>
    <p class="mt-2 text-xs leading-5 text-white/60">{{ description }}</p>
  </div>
</template>
