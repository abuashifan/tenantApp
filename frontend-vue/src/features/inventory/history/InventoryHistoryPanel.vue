<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Download, RefreshCw, Search } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import DateInput from '@/components/ui/DateInput.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import WorkspaceLoadingState from '@/components/workspace/WorkspaceLoadingState.vue'
import { formatDisplayDate } from '@/utils/date'
import {
  getInventoryHistory,
  listInventoryHistoryWarehouses,
  type StockCardMovement,
  type StockCardResult,
  type WarehouseOption,
} from './inventoryHistory.service'

type MovementFilter = 'all' | 'opening' | 'in' | 'out'
type HistoryRow = {
  id: string
  date: string
  direction: 'opening' | 'in' | 'out'
  description: string
  documentNumber: string
  unitCost: number
  qtyIn: number
  qtyOut: number
  runningQuantity: number
  warehouseName: string
  departmentName: string
  projectName: string
}

const props = defineProps<{
  entityId: string | number
  entityName: string
}>()

const today = new Date().toISOString().slice(0, 10)
const startDate = ref(`${today.slice(0, 4)}-${today.slice(5, 7)}-01`)
const endDate = ref(today)
const search = ref('')
const movementType = ref<MovementFilter>('all')
const warehouseId = ref('')
const warehouses = ref<WarehouseOption[]>([])
const result = ref<StockCardResult | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(value)
}

function displayType(type: string) {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function direction(row: StockCardMovement): 'in' | 'out' {
  return row.qty_in > 0 ? 'in' : 'out'
}

const rows = computed<HistoryRow[]>(() => {
  const data = result.value
  if (!data) return []
  const selectedWarehouse = warehouses.value.find((warehouse) => warehouse.id === warehouseId.value)?.name ?? 'Semua Gudang'
  const opening: HistoryRow[] = data.opening_quantity === 0
    ? []
    : [{
        id: 'opening',
        date: startDate.value,
        direction: 'opening',
        description: `On Hand As of ${startDate.value}`,
        documentNumber: '-',
        unitCost: 0,
        qtyIn: data.opening_quantity,
        qtyOut: 0,
        runningQuantity: data.opening_quantity,
        warehouseName: selectedWarehouse,
        departmentName: '-',
        projectName: '-',
      }]
  const movements = data.movements.map((row) => ({
    id: String(row.id),
    date: row.date,
    direction: direction(row),
    description: row.description || displayType(row.type),
    documentNumber: row.document_number || row.number || '-',
    unitCost: row.unit_cost,
    qtyIn: row.qty_in,
    qtyOut: row.qty_out,
    runningQuantity: row.running_quantity,
    warehouseName: row.warehouse_name || '-',
    departmentName: row.department_name || '-',
    projectName: row.project_name || '-',
  }))
  const term = search.value.trim().toLowerCase()

  return [...opening, ...movements].filter((row) => {
    if (movementType.value !== 'all' && row.direction !== movementType.value) return false
    if (!term) return true
    return [
      row.description,
      row.documentNumber,
      row.warehouseName,
      row.departmentName,
      row.projectName,
    ].join(' ').toLowerCase().includes(term)
  })
})

async function loadWarehouses() {
  try {
    warehouses.value = await listInventoryHistoryWarehouses()
  } catch {
    warehouses.value = []
  }
}

async function load() {
  loading.value = true
  error.value = null
  try {
    result.value = await getInventoryHistory({
      product_id: props.entityId,
      warehouse_id: warehouseId.value || undefined,
      start_date: startDate.value,
      end_date: endDate.value,
    })
  } catch (reason) {
    if (reason && typeof reason === 'object' && 'message' in reason && typeof reason.message === 'string') {
      error.value = reason.message
    } else {
      error.value = 'Gagal memuat riwayat persediaan.'
    }
    result.value = null
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadWarehouses()
  await load()
})
</script>

<template>
  <section class="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-200 p-5">
      <div class="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 class="text-base font-extrabold text-slate-950">Riwayat Persediaan: {{ entityName }}</h2>
          <p class="mt-1 text-sm text-slate-500">Mencatat semua stock in dan stock out berdasarkan periode filter.</p>
        </div>
        <div class="flex gap-2">
          <BaseButton variant="secondary" size="md" :loading="loading" @click="load">
            <RefreshCw class="h-4 w-4" /> Refresh
          </BaseButton>
          <BaseButton variant="secondary" size="md" disabled title="Export akan diaktifkan pada fase akhir.">
            <Download class="h-4 w-4" /> Export
          </BaseButton>
        </div>
      </div>

      <div class="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[170px_170px_minmax(240px,1fr)_190px_180px]">
        <label class="space-y-1.5">
          <span class="block text-xs font-bold text-slate-500">Dari</span>
          <DateInput v-model="startDate" />
        </label>
        <label class="space-y-1.5">
          <span class="block text-xs font-bold text-slate-500">Sampai</span>
          <DateInput v-model="endDate" />
        </label>
        <label class="space-y-1.5">
          <span class="block text-xs font-bold text-slate-500">Search</span>
          <span class="relative block">
            <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input v-model="search" class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm" placeholder="Cari deskripsi, no faktur, gudang..." />
          </span>
        </label>
        <label class="space-y-1.5">
          <span class="block text-xs font-bold text-slate-500">Gudang</span>
          <select v-model="warehouseId" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
            <option value="">Semua Gudang</option>
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">{{ warehouse.name }}</option>
          </select>
        </label>
        <label class="space-y-1.5">
          <span class="block text-xs font-bold text-slate-500">Tipe Mutasi</span>
          <select v-model="movementType" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
            <option value="all">Semua</option>
            <option value="opening">Opening</option>
            <option value="in">In</option>
            <option value="out">Out</option>
          </select>
        </label>
      </div>
      <div class="mt-3 flex justify-end">
        <BaseButton variant="primary" size="md" :loading="loading" @click="load">Apply</BaseButton>
      </div>
    </div>

    <p v-if="error" class="m-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ error }}</p>
    <div v-else-if="loading" class="p-5">
      <WorkspaceLoadingState />
    </div>
    <div v-else-if="rows.length === 0" class="p-5">
      <WorkspaceEmptyState
        title="Tidak ada riwayat persediaan untuk periode ini."
        description="Ubah filter periode atau gudang untuk melihat pergerakan stok."
      />
    </div>
    <div v-else class="workspace-table-scroll min-w-0 overflow-x-auto p-5 pt-0">
      <table class="w-full min-w-[1120px] overflow-hidden rounded-2xl border border-slate-200 text-sm">
        <thead class="bg-slate-800 text-left text-xs font-bold text-white">
          <tr>
            <th class="px-3 py-3">Tanggal</th>
            <th class="px-3 py-3">Tipe</th>
            <th class="px-3 py-3">Deskripsi</th>
            <th class="px-3 py-3">No Faktur</th>
            <th class="px-3 py-3 text-right">Harga</th>
            <th class="px-3 py-3 text-right">Masuk</th>
            <th class="px-3 py-3 text-right">Keluar</th>
            <th class="px-3 py-3 text-right">Saldo Qty</th>
            <th class="px-3 py-3">Gudang</th>
            <th class="px-3 py-3">Departemen</th>
            <th class="px-3 py-3">Proyek</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-b border-slate-100 text-slate-700 hover:bg-slate-50">
            <td class="whitespace-nowrap px-3 py-3">{{ formatDisplayDate(row.date) }}</td>
            <td class="px-3 py-3">
              <span
                class="rounded-full border px-2.5 py-1 text-xs font-bold"
                :class="row.direction === 'in' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : row.direction === 'out' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-50 text-slate-600'"
              >
                {{ row.direction === 'opening' ? 'Opening' : row.direction === 'in' ? 'In' : 'Out' }}
              </span>
            </td>
            <td class="px-3 py-3 font-medium text-slate-900">{{ row.description }}</td>
            <td class="whitespace-nowrap px-3 py-3">{{ row.documentNumber }}</td>
            <td class="px-3 py-3 text-right tabular-nums">{{ formatNumber(row.unitCost) }}</td>
            <td class="px-3 py-3 text-right font-bold tabular-nums text-emerald-700">{{ row.qtyIn ? formatNumber(row.qtyIn) : '-' }}</td>
            <td class="px-3 py-3 text-right font-bold tabular-nums text-rose-700">{{ row.qtyOut ? formatNumber(row.qtyOut) : '-' }}</td>
            <td class="px-3 py-3 text-right font-bold tabular-nums text-slate-950">{{ formatNumber(row.runningQuantity) }}</td>
            <td class="px-3 py-3">{{ row.warehouseName }}</td>
            <td class="px-3 py-3">{{ row.departmentName }}</td>
            <td class="px-3 py-3">{{ row.projectName }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
