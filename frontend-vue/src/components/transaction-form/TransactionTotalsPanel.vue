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
</script>

<template>
  <div class="grid gap-1 text-sm">
    <div class="flex items-center justify-between gap-6 py-1">
      <span class="font-normal text-slate-600">Subtotal</span>
      <span class="text-right font-normal tabular-nums text-slate-700">{{ formatIntegerNumber(subtotal) }}</span>
    </div>
    <div class="flex items-center justify-between gap-6 py-1">
      <span class="font-normal text-slate-600">Discount</span>
      <span class="text-right font-normal tabular-nums text-slate-700">{{ formatIntegerNumber(discount) }}</span>
    </div>
    <div class="flex items-center justify-between gap-6 py-1">
      <span class="font-normal text-slate-600">Tax</span>
      <span class="text-right font-normal tabular-nums text-slate-700">{{ formatIntegerNumber(tax) }}</span>
    </div>
    <div class="mt-1 flex items-center justify-between gap-6 border-t border-slate-100 pt-2">
      <span class="text-sm font-semibold text-slate-800">Grand Total</span>
      <span class="text-right text-base font-semibold tabular-nums text-slate-950">{{ formatIntegerNumber(total) }}</span>
    </div>
  </div>
</template>
