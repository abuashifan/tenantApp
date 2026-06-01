<script setup lang="ts">
import FormDateInput from '@/components/form/FormDateInput.vue'

withDefaults(
  defineProps<{
    dateName: string
    dateLabel?: string
    dueDateName?: string
    dueDateLabel?: string
    readonly?: boolean
    compact?: boolean
  }>(),
  {
    dateLabel: 'Date',
    dueDateLabel: 'Due Date',
    readonly: false,
    compact: false,
  },
)
</script>

<template>
  <FormDateInput :name="dateName" :label="dateLabel" :disabled="readonly" :compact="compact" />

  <FormDateInput v-if="dueDateName" :name="dueDateName" :label="dueDateLabel" :disabled="readonly" :compact="compact" />
</template>
