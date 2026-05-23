<script setup lang="ts" generic="TRow extends { id: string }">
import type { ColumnDef } from '@tanstack/vue-table'

import DataTable from '@/components/table/DataTable.vue'

defineProps<{
  columns: ColumnDef<TRow, unknown>[]
  rows: TRow[]
  loading?: boolean
  selectable?: boolean
  selectedIds: string[]
  emptyTitle?: string
  emptyDescription?: string
}>()

defineEmits<{
  'update:selectedIds': [ids: string[]]
  rowClick: [row: TRow]
}>()
</script>

<template>
  <DataTable
    :columns="columns"
    :data="rows"
    :loading="loading"
    :selectable="selectable"
    :selected-ids="selectedIds"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    @update:selected-ids="$emit('update:selectedIds', $event)"
  />
</template>
