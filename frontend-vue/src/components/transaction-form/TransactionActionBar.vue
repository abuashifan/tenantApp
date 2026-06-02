<script setup lang="ts">
defineProps<{
  readonly?: boolean
}>()
</script>

<template>
  <div class="flex min-w-max flex-nowrap items-center justify-end gap-2">
    <slot />
  </div>
</template>
