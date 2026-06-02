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
  <div class="grid min-w-0 flex-none grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-sm md:h-11 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.25fr)]">
    <div class="flex min-w-0 items-center justify-between gap-2 border-r border-b border-slate-200 px-3 py-2 md:border-b-0">
      <span class="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-500">Subtotal</span>
      <span class="min-w-0 truncate text-right font-bold tabular-nums text-slate-800" :title="money(subtotal)">{{ money(subtotal) }}</span>
    </div>
    <div class="flex min-w-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 md:border-r md:border-b-0">
      <span class="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-500">Disc.</span>
      <span class="min-w-0 truncate text-right font-bold tabular-nums text-slate-800" :title="money(discount)">{{ money(discount) }}</span>
    </div>
    <div class="flex min-w-0 items-center justify-between gap-2 border-r border-slate-200 px-3 py-2">
      <span class="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-500">Tax</span>
      <span class="min-w-0 truncate text-right font-bold tabular-nums text-slate-800" :title="money(tax)">{{ money(tax) }}</span>
    </div>
    <div class="flex min-w-0 items-center justify-between gap-2 bg-slate-50 px-3 py-2">
      <span class="shrink-0 whitespace-nowrap text-xs font-black uppercase text-slate-700">Total</span>
      <span class="min-w-0 truncate text-right text-base font-black tabular-nums text-slate-950" :title="money(total)">{{ money(total) }}</span>
    </div>
  </div>
</template>
