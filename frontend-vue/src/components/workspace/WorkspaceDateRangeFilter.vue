<script setup lang="ts">
import DateInput from '@/components/ui/DateInput.vue'

defineProps<{
  startDate: string
  endDate: string
  label?: string
}>()

defineEmits<{
  'update:startDate': [value: string]
  'update:endDate': [value: string]
}>()
</script>

<template>
  <label class="block min-w-0">
    <span class="sr-only">{{ label ?? 'Start Date' }}</span>
    <DateInput :model-value="startDate" compact @update:model-value="$emit('update:startDate', $event)" />
  </label>

  <label class="block min-w-0">
    <span class="sr-only">End Date</span>
    <DateInput :model-value="endDate" compact @update:model-value="$emit('update:endDate', $event)" />
  </label>
</template>
