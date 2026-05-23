<script setup lang="ts">
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{
  status: 'Draft' | 'Balanced' | 'Not Balanced' | string
}>()
</script>

<template>
  <StatusBadge :status="status" />
</template>
