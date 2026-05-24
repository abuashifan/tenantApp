<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Field, useFieldArray, useFormContext } from 'vee-validate'
import { Minus, Plus } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import TransactionSearchableSelect from '@/components/transaction-form/TransactionSearchableSelect.vue'
import { useProductLookup } from '@/composables/transaction-form/useProductLookup'
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
  discount_amount?: number | null
  tax_amount?: number | null
  line_total?: number | null
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
const appliedDescriptions = ref<Record<number, string>>({})

const productOptions = computed(() => products.value)
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
    discount_amount: 0,
    tax_amount: 0,
    line_total: 0,
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
  return code && description ? `${code} - ${description}` : description || code
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
})
</script>

<template>
  <div class="rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div class="flex items-start justify-between gap-3 px-6 py-5">
      <div>
        <h2 class="text-sm font-extrabold text-slate-900">Lines</h2>
        <p class="mt-1 text-xs leading-5 text-slate-500">Add/remove line items.</p>
      </div>
      <BaseButton variant="secondary" size="md" type="button" :disabled="readonly" @click="addLine">
        <Plus class="h-4 w-4" />
        Add line
      </BaseButton>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-[1050px] w-full text-left text-sm">
        <thead class="bg-slate-50 text-xs font-bold text-slate-600">
          <tr>
            <th class="px-4 py-3">Product</th>
            <th class="px-4 py-3">Description</th>
            <th class="px-4 py-3 text-right">Qty</th>
            <th class="px-4 py-3 text-right">{{ priceLabel }}</th>
            <th class="px-4 py-3 text-right">Discount</th>
            <th class="px-4 py-3 text-right">Tax</th>
            <th class="px-4 py-3 text-right">Line Total</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="!hasLines">
            <td colspan="8" class="px-6 py-10 text-center text-sm font-semibold text-slate-500">
              No lines. Click "Add line".
            </td>
          </tr>

          <tr v-for="(row, index) in fields" :key="row.key" class="align-top">
            <td class="px-4 py-3">
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
                @open="resetProducts"
                @search="searchProducts"
                @select="selectProduct(index, $event)"
              />
            </td>
            <td class="px-4 py-3">
              <Field
                :name="`${name}[${index}].description`"
                as="input"
                type="text"
                :disabled="readonly"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
              />
            </td>
            <td class="px-4 py-3">
              <Field
                :name="`${name}[${index}].quantity`"
                as="input"
                type="number"
                step="0.0001"
                inputmode="decimal"
                :disabled="readonly"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
              />
            </td>
            <td class="px-4 py-3">
              <Field
                :name="`${name}[${index}].${priceField}`"
                as="input"
                type="number"
                step="0.01"
                inputmode="decimal"
                :disabled="readonly"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
              />
            </td>
            <td class="px-4 py-3">
              <Field
                :name="`${name}[${index}].discount_amount`"
                as="input"
                type="number"
                step="0.01"
                inputmode="decimal"
                :disabled="readonly"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
              />
            </td>
            <td class="px-4 py-3">
              <Field
                :name="`${name}[${index}].tax_amount`"
                as="input"
                type="number"
                step="0.01"
                inputmode="decimal"
                :disabled="readonly"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
              />
            </td>
            <td class="px-4 py-3">
              <Field
                :name="`${name}[${index}].line_total`"
                as="input"
                type="number"
                step="0.01"
                inputmode="decimal"
                :disabled="true"
                class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-right text-sm font-bold text-slate-900 outline-none"
              />
            </td>
            <td class="px-4 py-3">
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
