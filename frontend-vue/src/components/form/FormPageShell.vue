<script setup lang="ts">
import { cn } from '@/utils/cn'
</script>

<template>
  <section :class="cn('space-y-5')">
    <slot />
  </section>
</template>
