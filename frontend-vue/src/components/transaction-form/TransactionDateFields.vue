<script setup lang="ts">
import FormDateInput from '@/components/form/FormDateInput.vue'

withDefaults(
  defineProps<{
    dateName: string
    dateLabel?: string
    dueDateName?: string
    dueDateLabel?: string
    readonly?: boolean
  }>(),
  {
    dateLabel: 'Date',
    dueDateLabel: 'Due Date',
    readonly: false,
  },
)
</script>

<template>
  <FormDateInput :name="dateName" :label="dateLabel" :disabled="readonly" />

  <FormDateInput v-if="dueDateName" :name="dueDateName" :label="dueDateLabel" :disabled="readonly" />
</template>
