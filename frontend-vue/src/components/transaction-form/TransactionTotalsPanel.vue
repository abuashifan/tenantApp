<script setup lang="ts">
import { computed } from 'vue'
import { useFormValues } from 'vee-validate'

import { formatIntegerNumber } from '@/utils/numberFormat'

const props = defineProps<{
  currency?: string
  subtotalField?: string
  discountField?: string
  taxField?: string
  totalField?: string
}>()

const values = useFormValues<Record<string, unknown>>()
const subtotal = computed(() => Number(values.value[props.subtotalField ?? 'subtotal'] ?? 0))
const discount = computed(() => Number(values.value[props.discountField ?? 'discount_amount'] ?? 0))
const tax = computed(() => Number(values.value[props.taxField ?? 'tax_amount'] ?? 0))
const total = computed(() => Number(values.value[props.totalField ?? 'grand_total'] ?? 0))
const currencyCode = computed(() => props.currency ?? String(values.value.currency_code ?? 'IDR'))

function money(value: number) {
  return `${currencyCode.value} ${formatIntegerNumber(value)}`
}
</script>

<template>
  <div class="grid gap-1 text-sm">
    <div class="flex items-center justify-between gap-6 py-0.5">
      <span class="font-normal text-slate-600">Subtotal</span>
      <span class="text-right font-normal tabular-nums text-slate-700">{{ money(subtotal) }}</span>
    </div>
    <div class="flex items-center justify-between gap-6 py-0.5">
      <span class="font-normal text-slate-600">Discount</span>
      <span class="text-right font-normal tabular-nums text-slate-700">{{ money(discount) }}</span>
    </div>
    <div class="flex items-center justify-between gap-6 py-0.5">
      <span class="font-normal text-slate-600">Tax</span>
      <span class="text-right font-normal tabular-nums text-slate-700">{{ money(tax) }}</span>
    </div>
    <div class="mt-1 flex items-center justify-between gap-6 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <span class="text-sm font-semibold text-slate-800">Grand Total</span>
      <span class="text-right text-lg font-black tabular-nums text-slate-950">{{ money(total) }}</span>
    </div>
  </div>
</template>
