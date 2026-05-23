<script setup lang="ts">
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{
  status: string
}>()
</script>

<template>
  <StatusBadge :status="status" />
</template>
