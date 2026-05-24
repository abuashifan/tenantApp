<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Field, useFieldArray } from 'vee-validate'
import { Minus, Plus } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import TransactionSearchableSelect from '@/components/transaction-form/TransactionSearchableSelect.vue'
import { productsService } from '@/services/master-data/products.service'
import type { ApiResponse } from '@/types/api'

export type TransactionLine = Record<string, unknown> & {
  product_id?: string | number | null
  description?: string | null
  quantity?: number | null
  unit_price?: number | null
  discount_amount?: number | null
  tax_amount?: number | null
  line_total?: number | null
}

type BackendProduct = { id: number | string; product_code?: string | null; product_name?: string | null }

const props = withDefaults(
  defineProps<{
    name: string
    readonly?: boolean
  }>(),
  {
    readonly: false,
  },
)

const { fields, push, remove } = useFieldArray<TransactionLine>(() => props.name)

const products = ref<BackendProduct[]>([])
const loadingProducts = ref(false)
const productError = ref<string | null>(null)

const productOptions = computed(() =>
  products.value
    .map((p) => {
      const code = (p.product_code ?? '').trim()
      const name = (p.product_name ?? '').trim()
      const label = code ? (name ? `${code} - ${name}` : code) : name
      return { value: String(p.id), label: label || '(Unnamed product)' }
    })
    .filter((o) => o.value !== ''),
)

const hasLines = computed(() => fields.value.length > 0)

function addLine() {
  push({
    product_id: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    discount_amount: 0,
    tax_amount: 0,
    line_total: 0,
  })
}

onMounted(async () => {
  loadingProducts.value = true
  try {
    const res = await productsService.list({ is_active: true })
    const payload = res.data as ApiResponse<BackendProduct[]>
    products.value = Array.isArray(payload.data) ? payload.data : []
  } catch (cause) {
    productError.value = cause instanceof Error ? cause.message : 'Unable to load products.'
  } finally {
    loadingProducts.value = false
  }
})
</script>

<template>
  <div class="rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div class="flex items-start justify-between gap-3 px-6 py-5">
      <div>
        <h2 class="text-sm font-extrabold text-slate-900">Lines</h2>
        <p class="mt-1 text-xs leading-5 text-slate-500">Add/remove line items.</p>
        <p v-if="productError" class="mt-2 text-xs font-semibold text-rose-700">{{ productError }}</p>
      </div>
      <BaseButton variant="secondary" size="md" type="button" :disabled="readonly" @click="addLine">
        <Plus class="h-4 w-4" />
        Add line
      </BaseButton>
    </div>

    <div class="overflow-x-auto overflow-y-visible">
      <table class="min-w-[1050px] w-full text-left text-sm">
        <thead class="bg-slate-50 text-xs font-bold text-slate-600">
          <tr>
            <th class="px-4 py-3">Product</th>
            <th class="px-4 py-3">Description</th>
            <th class="px-4 py-3 text-right">Qty</th>
            <th class="px-4 py-3 text-right">Unit Price</th>
            <th class="px-4 py-3 text-right">Discount</th>
            <th class="px-4 py-3 text-right">Tax</th>
            <th class="px-4 py-3 text-right">Line Total</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="!hasLines">
            <td colspan="8" class="px-6 py-10 text-center text-sm font-semibold text-slate-500">
              No lines. Click “Add line”.
            </td>
          </tr>

          <tr v-for="(row, index) in fields" :key="row.key" class="align-top">
            <td class="px-4 py-3">
              <TransactionSearchableSelect
                :name="`${name}[${index}].product_id`"
                placeholder="Search product…"
                :options="productOptions"
                :readonly="readonly || loadingProducts"
                :loading="loadingProducts"
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
                :name="`${name}[${index}].unit_price`"
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
