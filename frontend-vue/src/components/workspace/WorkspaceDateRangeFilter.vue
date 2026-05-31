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
  <label class="block space-y-1.5">
    <span class="text-xs font-bold text-slate-500">{{ label ?? 'Start Date' }}</span>
    <DateInput :model-value="startDate" @update:model-value="$emit('update:startDate', $event)" />
  </label>

  <label class="block space-y-1.5">
    <span class="text-xs font-bold text-slate-500">End Date</span>
    <DateInput :model-value="endDate" @update:model-value="$emit('update:endDate', $event)" />
  </label>
</template>
