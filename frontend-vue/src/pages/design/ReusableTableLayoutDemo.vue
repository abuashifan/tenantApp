<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { computed, h, ref } from 'vue'

import { ArrowUpDown, MoreHorizontal } from 'lucide-vue-next'

import DataTable from '@/components/table/DataTable.vue'
import DataTableCheckbox from '@/components/table/DataTableCheckbox.vue'
import DataTableStatusBadge from '@/components/table/DataTableStatusBadge.vue'
import DataTableToolbar from '@/components/table/DataTableToolbar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import FormShell from '@/components/form/FormShell.vue'
import { formatDisplayDate } from '@/utils/date'

type TxRow = {
  id: string
  number: string
  date: string
  status: 'Draft' | 'Posted' | 'Void'
  memo: string
  total: number
}

const search = ref('')
const startDate = ref('')
const endDate = ref('')

const selectedIds = ref<string[]>([])

const rows = ref<TxRow[]>([
  { id: 'JRN.2026.0001', number: 'JRN.2026.0001', date: '2026-05-01', status: 'Draft', memo: 'Opening', total: 1250000 },
  { id: 'JRN.2026.0002', number: 'JRN.2026.0002', date: '2026-05-02', status: 'Posted', memo: 'Office expense', total: 420000 },
  { id: 'JRN.2026.0003', number: 'JRN.2026.0003', date: '2026-05-03', status: 'Posted', memo: 'Sales adjustment', total: 3200000 },
])

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return rows.value.filter((r) => {
    const matchSearch = q === '' || r.number.toLowerCase().includes(q) || r.memo.toLowerCase().includes(q)
    const matchStart = startDate.value === '' || r.date >= startDate.value
    const matchEnd = endDate.value === '' || r.date <= endDate.value
    return matchSearch && matchStart && matchEnd
  })
})

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

const columns = computed<ColumnDef<TxRow, unknown>[]>(() => [
  {
    id: 'select',
    header: ({ table }) =>
      h(DataTableCheckbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected(),
        ariaLabel: 'Select all',
        onChange: (checked: boolean) => table.toggleAllPageRowsSelected(checked),
      }),
    cell: ({ row }) =>
      h(DataTableCheckbox, {
        checked: row.getIsSelected(),
        indeterminate: row.getIsSomeSelected(),
        ariaLabel: `Select ${row.id}`,
        onChange: (checked: boolean) => row.toggleSelected(checked),
      }),
    enableSorting: false,
  },
  {
    accessorKey: 'number',
    header: ({ column }) =>
      h(
        BaseButton,
        {
          variant: 'secondary',
          size: 'sm',
          class: 'h-9 px-3 font-bold',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        {
          default: () => ['Number', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })],
        },
      ),
    cell: ({ row }) => row.original.number,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => formatDisplayDate(row.original.date),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(DataTableStatusBadge, { status: row.original.status }),
  },
  {
    accessorKey: 'memo',
    header: 'Memo',
    cell: ({ row }) => row.original.memo,
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => formatMoney(row.original.total),
  },
  {
    id: 'actions',
    header: '',
    cell: () =>
      h(
        IconButton,
        {
          variant: 'ghost',
          size: 'sm',
        },
        { default: () => h(MoreHorizontal, { class: 'h-4 w-4' }) },
      ),
    enableSorting: false,
  },
])

function notify(message: string) {
  globalThis.alert(message)
}
</script>

<template>
  <FormShell>
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-950">Reusable Table Layout</h1>
        <p class="mt-1 text-sm text-slate-500">
          Demo workspace list toolbar + reusable TanStack table wrapper.
        </p>
      </div>

      <DataTableToolbar
        v-model:search="search"
        v-model:startDate="startDate"
        v-model:endDate="endDate"
        :selected-count="selectedIds.length"
        @filter="() => notify('Filter menu (placeholder)')"
        @create="() => notify('Create New (placeholder)')"
        @void="() => notify(`Void selected: ${selectedIds.join(', ')}`)"
      />

      <DataTable :columns="columns" :data="filteredRows" v-model:selected-ids="selectedIds" />
    </div>
  </FormShell>
</template>
