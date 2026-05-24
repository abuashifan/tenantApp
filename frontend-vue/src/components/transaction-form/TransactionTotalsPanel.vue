<script setup lang="ts">
import { computed } from 'vue'
import { useFormValues } from 'vee-validate'

import { toMoney } from '@/utils/money'

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
  <div class="grid gap-2 text-sm">
    <div class="flex items-center justify-between">
      <span class="font-semibold text-slate-600">Subtotal</span>
      <span class="font-black tabular-nums text-slate-950">{{ toMoney(subtotal) }}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="font-semibold text-slate-600">Discount</span>
      <span class="font-black tabular-nums text-slate-950">{{ toMoney(discount) }}</span>
    </div>
    <div class="flex items-center justify-between">
      <span class="font-semibold text-slate-600">Tax</span>
      <span class="font-black tabular-nums text-slate-950">{{ toMoney(tax) }}</span>
    </div>
    <div class="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
      <span class="text-xs font-extrabold uppercase tracking-wide text-slate-600">Grand Total</span>
      <span class="text-lg font-black tabular-nums text-slate-950">{{ toMoney(total) }}</span>
    </div>
  </div>
</template>
