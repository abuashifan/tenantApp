<script setup lang="ts">
import { cn } from '@/utils/cn'
</script>

<template>
  <section :class="cn('min-w-0 space-y-5')">
    <slot />
  </section>
</template>
