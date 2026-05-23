<script setup lang="ts">
import { cn } from '@/utils/cn'
</script>

<template>
  <div :class="cn('flex flex-wrap items-center justify-end gap-2')">
    <slot />
  </div>
</template>
