<script setup lang="ts">
defineProps<{
  readonly?: boolean
}>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-end gap-2">
    <slot />
  </div>
</template>
