<script setup lang="ts">
import { computed, nextTick } from 'vue'
import { useFormContext } from 'vee-validate'

import FormErrorMessage from '@/components/form/FormErrorMessage.vue'
import FormMoneyInput from '@/components/form/FormMoneyInput.vue'
import FormNumberInput from '@/components/form/FormNumberInput.vue'
import FormTextInput from '@/components/form/FormTextInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TransactionSearchableSelect from '@/components/transaction-form/TransactionSearchableSelect.vue'
import type {
  StockAdjustmentBalance,
  StockAdjustmentLookupOption,
} from '@/features/inventory/stock-adjustments/stockAdjustmentLookups.service'

const props = defineProps<{
  name: string
  rows: Record<string, unknown>[]
  readonly?: boolean
  products: StockAdjustmentLookupOption[]
  warehouses: StockAdjustmentLookupOption[]
  departments: StockAdjustmentLookupOption[]
  projects: StockAdjustmentLookupOption[]
  balances: StockAdjustmentBalance[]
  balancesLoaded: boolean
}>()

const emit = defineEmits<{
  add: []
  remove: [index: number]
}>()

const form = useFormContext<Record<string, unknown>>()
const setFieldValue = form.setFieldValue as (field: string, value: unknown) => void
const numberFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 })
const moneyFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

const balanceMap = computed(() => {
  const map = new Map<string, StockAdjustmentBalance>()
  props.balances.forEach((balance) => {
    map.set(balanceKey(balance.productId, balance.warehouseId), balance)
  })
  return map
})

function balanceKey(productId: unknown, warehouseId: unknown) {
  return `${Number(productId)}:${Number(warehouseId)}`
}

function numericValue(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function rowBalance(row: Record<string, unknown>) {
  const productId = numericValue(row.product_id)
  const warehouseId = numericValue(row.warehouse_id)
  if (!productId || !warehouseId) return null
  return balanceMap.value.get(balanceKey(productId, warehouseId)) ?? null
}

function currentStock(row: Record<string, unknown>) {
  const balance = rowBalance(row)
  if (balance) return balance.quantityOnHand
  return props.balancesLoaded && row.product_id && row.warehouse_id ? 0 : null
}

function stockAfter(row: Record<string, unknown>) {
  const current = currentStock(row)
  if (current == null) return null
  const quantity = numericValue(row.quantity)
  return row.adjustment_type === 'decrease' ? current - quantity : current + quantity
}

function formatQuantity(value: number | null) {
  return value == null ? '-' : numberFormat.format(value)
}

function isNegativeStock(row: Record<string, unknown>) {
  const after = stockAfter(row)
  return after != null && after < 0
}

async function onProductSelected(rowIndex: number) {
  await nextTick()
  applyAverageCost(rowIndex)
}

async function onWarehouseSelected(rowIndex: number) {
  await nextTick()
  applyAverageCost(rowIndex)
}

function applyAverageCost(rowIndex: number) {
  const row = props.rows[rowIndex]
  if (!row) return
  const balance = rowBalance(row)
  if (!balance || balance.averageCost <= 0) return
  const currentUnitCost = row.unit_cost
  if (currentUnitCost !== null && currentUnitCost !== undefined && currentUnitCost !== '') return
  setFieldValue(`${props.name}.${rowIndex}.unit_cost`, balance.averageCost)
}

function quantityInput(rowIndex: number) {
  return `${props.name}.${rowIndex}.quantity`
}

function onAdjustmentTypeChange(rowIndex: number, event: Event) {
  const target = event.target instanceof HTMLSelectElement ? event.target : null
  setFieldValue(`${props.name}.${rowIndex}.adjustment_type`, target?.value ?? 'increase')
}
</script>

<template>
  <div class="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="workspace-table-scroll min-w-0 overflow-x-auto">
      <table class="min-w-[1180px] divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-black uppercase text-slate-500">
          <tr>
            <th class="w-64 px-3 py-2">Product</th>
            <th class="w-56 px-3 py-2">Warehouse</th>
            <th class="w-40 px-3 py-2">Adjustment Type</th>
            <th class="w-36 px-3 py-2">Quantity</th>
            <th class="w-32 px-3 py-2 text-right">Current Stock</th>
            <th class="w-32 px-3 py-2 text-right">Stock After</th>
            <th class="w-36 px-3 py-2">Unit Cost</th>
            <th class="w-52 px-3 py-2">Reason</th>
            <th class="w-48 px-3 py-2">Department</th>
            <th class="w-48 px-3 py-2">Project</th>
            <th class="sticky right-0 w-20 bg-slate-50 px-3 py-2 text-right shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.35)]">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
            <td class="px-3 py-2 align-top">
              <TransactionSearchableSelect
                :name="`${name}.${rowIndex}.product_id`"
                :options="products"
                option-value="id"
                option-label="label"
                placeholder="Select product..."
                empty-text="Product tidak ditemukan"
                :disabled="readonly"
                compact
                option-two-line
                selected-font-weight="medium"
                @select="onProductSelected(rowIndex)"
              />
              <FormErrorMessage :name="`${name}.${rowIndex}.product_id`" />
            </td>
            <td class="px-3 py-2 align-top">
              <TransactionSearchableSelect
                :name="`${name}.${rowIndex}.warehouse_id`"
                :options="warehouses"
                option-value="id"
                option-label="label"
                placeholder="Select warehouse..."
                empty-text="Warehouse tidak ditemukan"
                :disabled="readonly"
                compact
                selected-font-weight="medium"
                @select="onWarehouseSelected(rowIndex)"
              />
              <FormErrorMessage :name="`${name}.${rowIndex}.warehouse_id`" />
            </td>
            <td class="px-3 py-2 align-top">
              <select
                :value="row.adjustment_type ?? 'increase'"
                :disabled="readonly"
                class="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50"
                @change="onAdjustmentTypeChange(rowIndex, $event)"
              >
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
              </select>
              <FormErrorMessage :name="`${name}.${rowIndex}.adjustment_type`" />
            </td>
            <td class="px-3 py-2 align-top">
              <FormNumberInput
                :name="quantityInput(rowIndex)"
                placeholder="Qty"
                :disabled="readonly"
                :min="0.0001"
                step="0.0001"
              />
            </td>
            <td class="sticky right-0 bg-white px-3 py-2 text-right align-top shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.35)]">
              <span class="inline-flex h-8 items-center justify-end font-semibold tabular-nums text-slate-700">
                {{ formatQuantity(currentStock(row)) }}
              </span>
            </td>
            <td class="px-3 py-2 text-right align-top">
              <span
                class="inline-flex h-8 items-center justify-end font-black tabular-nums"
                :class="isNegativeStock(row) ? 'text-amber-700' : 'text-slate-950'"
              >
                {{ formatQuantity(stockAfter(row)) }}
              </span>
              <p v-if="isNegativeStock(row)" class="mt-1 text-left text-[11px] font-semibold text-amber-700">
                Stok setelah adjustment akan menjadi negatif.
              </p>
            </td>
            <td class="px-3 py-2 align-top">
              <FormMoneyInput :name="`${name}.${rowIndex}.unit_cost`" placeholder="Unit Cost" :disabled="readonly" />
              <p v-if="rowBalance(row)?.averageCost" class="mt-1 text-[11px] font-semibold text-slate-400">
                Avg: {{ moneyFormat.format(rowBalance(row)?.averageCost ?? 0) }}
              </p>
            </td>
            <td class="px-3 py-2 align-top">
              <FormTextInput :name="`${name}.${rowIndex}.reason`" placeholder="Optional reason" :disabled="readonly" />
            </td>
            <td class="px-3 py-2 align-top">
              <TransactionSearchableSelect
                :name="`${name}.${rowIndex}.department_id`"
                :options="departments"
                option-value="id"
                option-label="label"
                placeholder="Department"
                empty-text="Department tidak ditemukan"
                :disabled="readonly"
                compact
              />
              <FormErrorMessage :name="`${name}.${rowIndex}.department_id`" />
            </td>
            <td class="px-3 py-2 align-top">
              <TransactionSearchableSelect
                :name="`${name}.${rowIndex}.project_id`"
                :options="projects"
                option-value="id"
                option-label="label"
                placeholder="Project"
                empty-text="Project tidak ditemukan"
                :disabled="readonly"
                compact
              />
              <FormErrorMessage :name="`${name}.${rowIndex}.project_id`" />
            </td>
            <td class="px-3 py-2 text-right align-top">
              <BaseButton v-if="!readonly" variant="secondary" size="sm" @click="emit('remove', rowIndex)">Remove</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!readonly" class="border-t border-slate-200 bg-slate-50 px-3 py-3">
      <BaseButton variant="secondary" size="sm" @click="emit('add')">Add row</BaseButton>
    </div>
  </div>
</template>
