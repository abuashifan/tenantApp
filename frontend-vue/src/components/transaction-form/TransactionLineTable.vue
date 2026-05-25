<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Field, useFieldArray, useFormContext } from 'vee-validate'
import { Minus, Plus } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import TransactionFormattedNumberInput from '@/components/transaction-form/TransactionFormattedNumberInput.vue'
import TransactionSearchableSelect from '@/components/transaction-form/TransactionSearchableSelect.vue'
import { useProductLookup } from '@/composables/transaction-form/useProductLookup'
import { useTransactionDimensions } from '@/composables/useTransactionDimensions'
import { applyConfiguredProductToLine } from '@/composables/transaction-form/useTransactionProductSelection'
import type { TransactionLineProductConfig } from '@/composables/transaction-form/types'
import type { NormalizedProduct } from '@/utils/normalizeProduct'

export type TransactionLine = Record<string, unknown> & {
  product_id?: string | number | null
  product_code?: string | null
  description?: string | null
  quantity?: number | null
  unit_id?: string | number | null
  unit_name?: string | null
  unit_price?: number | null
  estimated_unit_price?: number | null
  amount?: number | null
  discount_type?: string | null
  discount_value?: number | null
  discount_amount?: number | null
  tax_rate?: number | null
  tax_amount?: number | null
  line_total?: number | null
  department_id?: string | number | null
  project_id?: string | number | null
}

const props = withDefaults(
  defineProps<{
    name: string
    readonly?: boolean
    productConfig?: TransactionLineProductConfig
  }>(),
  {
    readonly: false,
    productConfig: () => ({ priceMode: 'none', priceField: 'unit_price', priceLabel: 'Unit Price' }),
  },
)

const form = useFormContext<Record<string, unknown>>()
const { fields, push, remove } = useFieldArray<TransactionLine>(() => props.name)
const { products, loading: loadingProducts, error: productError, searchProducts, resetProducts } = useProductLookup()
const {
  departments,
  projects,
  allDepartments,
  allProjects,
  loading: loadingDimensions,
  error: dimensionsError,
  loadDimensions,
} = useTransactionDimensions()
const appliedDescriptions = ref<Record<number, string>>({})

const productOptions = computed(() => products.value)
const departmentOptions = computed(() => departments.value)
const projectOptions = computed(() => projects.value)
const hasLines = computed(() => fields.value.length > 0)
const priceField = computed(() => props.productConfig.priceField ?? 'unit_price')
const priceLabel = computed(() => props.productConfig.priceLabel ?? 'Unit Price')

function addLine() {
  push({
    product_id: '',
    product_code: '',
    description: '',
    quantity: 1,
    unit_id: null,
    unit_name: null,
    [priceField.value]: 0,
    discount_type: 'fixed_amount',
    discount_value: 0,
    discount_amount: 0,
    tax_rate: 0,
    tax_amount: 0,
    line_total: 0,
    department_id: null,
    project_id: null,
  })
}

function lineAt(index: number) {
  const lines = form?.values[props.name]
  return Array.isArray(lines) && lines[index] && typeof lines[index] === 'object'
    ? (lines[index] as TransactionLine)
    : {}
}

function productDisplay(line: TransactionLine) {
  const code = typeof line.product_code === 'string' ? line.product_code.trim() : ''
  const description = typeof line.description === 'string' ? line.description.trim() : ''
  return code && description ? `${code} · ${description}` : description || code
}

function dimensionDisplay(line: TransactionLine, key: 'department_id' | 'project_id') {
  const value = line[key]
  if (value === null || value === undefined || value === '') return ''
  const options = key === 'department_id' ? allDepartments.value : allProjects.value
  const selected = options.find((option) => String(option.id) === String(value))
  return selected?.label ?? String(value)
}

function selectProduct(index: number, option: unknown) {
  const product = option as NormalizedProduct
  const line = lineAt(index)
  const next = applyConfiguredProductToLine(line, product, props.productConfig, appliedDescriptions.value[index])
  form?.setFieldValue(`${props.name}[${index}]`, next)
  appliedDescriptions.value[index] = product.name || product.label
}

onMounted(() => {
  void resetProducts()
  void loadDimensions()
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <div>
        <h2 class="text-sm font-semibold text-slate-900">Lines</h2>
        <p class="mt-0.5 text-xs leading-4 text-slate-500">Add/remove line items.</p>
      </div>
      <BaseButton variant="secondary" size="sm" type="button" :disabled="readonly" @click="addLine">
        <Plus class="h-4 w-4" />
        Add line
      </BaseButton>
    </div>

    <div class="overflow-x-auto">
      <table class="transaction-line-table min-w-[1220px] w-full table-fixed text-left text-xs">
        <colgroup>
          <col class="w-[180px]" />
          <col class="w-[320px]" />
          <col class="w-[64px]" />
          <col class="w-[110px]" />
          <col class="w-[152px]" />
          <col class="w-[72px]" />
          <col class="w-[150px]" />
          <col class="w-[150px]" />
          <col class="w-[120px]" />
          <col class="w-[42px]" />
        </colgroup>
        <thead class="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
          <tr>
            <th class="h-8 px-2 py-1.5 font-medium">Product</th>
            <th class="h-8 px-2 py-1.5 font-medium">Description</th>
            <th class="h-8 px-2 py-1.5 text-right font-medium">Qty</th>
            <th class="h-8 px-2 py-1.5 text-right font-medium">{{ priceLabel }}</th>
            <th class="h-8 px-2 py-1.5 text-right font-medium">Discount</th>
            <th class="h-8 px-2 py-1.5 text-right font-medium">Tax %</th>
            <th class="h-8 px-2 py-1.5 font-medium">Department</th>
            <th class="h-8 px-2 py-1.5 font-medium">Project</th>
            <th class="h-8 px-2 py-1.5 text-right font-medium">Line Total</th>
            <th class="h-8 px-2 py-1.5 text-center font-medium"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="!hasLines">
            <td colspan="10" class="px-6 py-10 text-center text-sm font-semibold text-slate-500">
              No lines. Click "Add line".
            </td>
          </tr>

          <tr v-for="(row, index) in fields" :key="row.key" class="h-10 align-middle">
            <td class="px-2 py-1.5 align-middle">
              <TransactionSearchableSelect
                :name="`${name}[${index}].product_id`"
                :options="productOptions"
                option-value="id"
                option-label="label"
                :display-value="productDisplay(row.value as TransactionLine)"
                placeholder="Search product..."
                empty-text="Produk tidak ditemukan"
                loading-text="Memuat produk..."
                :readonly="readonly"
                :loading="loadingProducts"
                :error="productError"
                compact
                selected-display-mode="code-name"
                selected-font-weight="normal"
                selected-max-one-line
                option-two-line
                @open="resetProducts"
                @search="searchProducts"
                @select="selectProduct(index, $event)"
              />
            </td>
            <td class="px-2 py-1.5 align-middle">
              <Field
                :name="`${name}[${index}].description`"
                as="input"
                type="text"
                :disabled="readonly"
                class="h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-normal leading-none text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50"
              />
            </td>
            <td class="px-2 py-1.5 align-middle">
              <Field
                :name="`${name}[${index}].quantity`"
                as="input"
                type="number"
                step="0.0001"
                inputmode="decimal"
                :disabled="readonly"
                class="h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-right text-xs font-normal leading-none text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50"
              />
            </td>
            <td class="px-2 py-1.5 align-middle">
              <TransactionFormattedNumberInput
                :name="`${name}[${index}].${priceField}`"
                :disabled="readonly"
              />
            </td>
            <td class="px-2 py-1.5 align-middle">
              <div class="flex min-w-0 gap-1.5">
                <Field
                  :name="`${name}[${index}].discount_type`"
                  as="select"
                  :disabled="readonly"
                  class="h-8 w-14 rounded-lg border border-slate-200 bg-white px-1.5 text-xs font-normal leading-none text-slate-700 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50"
                >
                  <option value="fixed_amount">Rp</option>
                  <option value="percent">%</option>
                </Field>
                <TransactionFormattedNumberInput
                  :name="`${name}[${index}].discount_value`"
                  :disabled="readonly"
                />
              </div>
            </td>
            <td class="px-2 py-1.5 align-middle">
              <Field
                :name="`${name}[${index}].tax_rate`"
                as="input"
                type="number"
                step="0.01"
                inputmode="decimal"
                :disabled="readonly"
                class="h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-right text-xs font-normal leading-none text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50"
              />
            </td>
            <td class="px-2 py-1.5 align-middle">
              <TransactionSearchableSelect
                :name="`${name}[${index}].department_id`"
                :options="departmentOptions"
                option-value="id"
                option-label="label"
                :display-value="dimensionDisplay(row.value as TransactionLine, 'department_id')"
                placeholder="Department"
                empty-text="Department tidak ditemukan"
                loading-text="Memuat department..."
                :readonly="readonly"
                :loading="loadingDimensions"
                :error="dimensionsError"
                compact
                selected-display-mode="code-name"
                selected-font-weight="normal"
                selected-max-one-line
                option-two-line
                @open="loadDimensions"
              />
            </td>
            <td class="px-2 py-1.5 align-middle">
              <TransactionSearchableSelect
                :name="`${name}[${index}].project_id`"
                :options="projectOptions"
                option-value="id"
                option-label="label"
                :display-value="dimensionDisplay(row.value as TransactionLine, 'project_id')"
                placeholder="Project"
                empty-text="Project tidak ditemukan"
                loading-text="Memuat project..."
                :readonly="readonly"
                :loading="loadingDimensions"
                :error="dimensionsError"
                compact
                selected-display-mode="code-name"
                selected-font-weight="normal"
                selected-max-one-line
                option-two-line
                @open="loadDimensions"
              />
            </td>
            <td class="px-2 py-1.5 align-middle">
              <TransactionFormattedNumberInput
                :name="`${name}[${index}].line_total`"
                :disabled="true"
              />
            </td>
            <td class="px-2 py-1.5 text-center align-middle">
              <IconButton variant="danger" size="sm" type="button" :disabled="readonly" @click="remove(index)">
                <Minus class="h-4 w-4" />
              </IconButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.transaction-line-table input[type='number']::-webkit-inner-spin-button,
.transaction-line-table input[type='number']::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}

.transaction-line-table input[type='number'] {
  -moz-appearance: textfield;
}
</style>
