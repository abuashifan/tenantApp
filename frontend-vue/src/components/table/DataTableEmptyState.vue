<script setup lang="ts">
import EmptyState from '@/components/ui/EmptyState.vue'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: 'No data',
    description: 'Try adjusting your filters or date range.',
  },
)
</script>

<template>
  <EmptyState :title="title" :description="description" />
</template>
