<script setup lang="ts">
import { computed } from 'vue'

import StatusBadge from '@/components/ui/StatusBadge.vue'

const props = defineProps<{
  totalDebit: number
  totalCredit: number
}>()

const diff = computed(() => props.totalDebit - props.totalCredit)
const balanced = computed(() => Math.abs(diff.value) < 0.00001)

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}
</script>

<template>
  <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-sm font-extrabold text-slate-900">Balance Summary</h2>
        <p class="mt-1 text-xs leading-5 text-slate-500">Total debit/credit & difference.</p>
      </div>
      <StatusBadge :status="balanced ? 'Balanced' : 'Not Balanced'" />
    </div>

    <dl class="mt-5 space-y-3 text-sm">
      <div class="flex items-center justify-between">
        <dt class="text-xs font-bold text-slate-500">Total Debit</dt>
        <dd class="font-extrabold text-slate-900">{{ formatMoney(totalDebit) }}</dd>
      </div>
      <div class="flex items-center justify-between">
        <dt class="text-xs font-bold text-slate-500">Total Credit</dt>
        <dd class="font-extrabold text-slate-900">{{ formatMoney(totalCredit) }}</dd>
      </div>
      <div class="flex items-center justify-between border-t border-slate-200 pt-3">
        <dt class="text-xs font-bold text-slate-500">Difference</dt>
        <dd :class="balanced ? 'font-extrabold text-[#2c6d43]' : 'font-extrabold text-rose-700'">
          {{ formatMoney(diff) }}
        </dd>
      </div>
    </dl>
  </div>
</template>
