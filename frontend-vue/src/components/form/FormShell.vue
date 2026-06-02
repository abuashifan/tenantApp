<script setup lang="ts">
import { cn } from '@/utils/cn'
</script>

<template>
  <main
    :class="
      cn(
        'min-h-dvh min-w-0 overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#f7fbe9,transparent_32%),linear-gradient(135deg,#f8fafc_0%,#edf7f5_48%,#e9f6fb_100%)] p-4 text-slate-900 sm:p-6',
      )
    "
  >
    <div class="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      <slot />
    </div>
  </main>
</template>
