<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import WorkspaceErrorState from '@/components/workspace/WorkspaceErrorState.vue'
import WorkspaceLoadingState from '@/components/workspace/WorkspaceLoadingState.vue'
import { usePermission } from '@/composables/usePermission'
import {
  dashboardErrorMessage,
  financialPeriodFromFiscalYear,
  getDashboardFinancialSummary,
  getDashboardFiscalYearStatus,
} from '@/services/dashboard.service'
import type { FiscalYearStatus } from '@/services/accounting/fiscalClosing.service'
import type { FinancialSummaryResult } from '@/services/report.service'
import { useCompanyStore } from '@/stores/companyStore'
import { formatDisplayDate } from '@/utils/date'

const { can } = usePermission()
const company = useCompanyStore()
const fiscalStatus = ref<FiscalYearStatus | null>(null)
const summary = ref<FinancialSummaryResult | null>(null)
const statusError = ref<string | null>(null)
const summaryError = ref<string | null>(null)
const loading = ref(false)

const activeCompanyName = computed(() => company.activeCompany?.name ?? 'Active Company')
const canViewFinancialSummary = computed(() => can('reports.view'))
const fiscalYear = computed(() => fiscalStatus.value?.active_fiscal_year ?? null)
const reportingPeriod = computed(() => fiscalStatus.value ? financialPeriodFromFiscalYear(fiscalStatus.value) : null)
const fiscalWarning = computed(() => {
  if (fiscalYear.value?.status === 'closed') return 'The active fiscal year is closed. Reports remain readable; transactions are read-only.'
  if (fiscalStatus.value?.closing_required) return 'Annual closing is required for the active fiscal year.'
  return ''
})

function formatDate(value?: string | null) {
  return formatDisplayDate(value)
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

async function load() {
  loading.value = true
  statusError.value = null
  summaryError.value = null
  summary.value = null

  try {
    fiscalStatus.value = await getDashboardFiscalYearStatus()
  } catch (cause) {
    fiscalStatus.value = null
    statusError.value = dashboardErrorMessage(cause, 'Unable to load fiscal year status.')
    loading.value = false
    return
  }

  if (!canViewFinancialSummary.value) {
    loading.value = false
    return
  }

  const period = reportingPeriod.value
  if (!period) {
    summaryError.value = 'The active fiscal year does not provide a valid report period.'
    loading.value = false
    return
  }

  try {
    summary.value = await getDashboardFinancialSummary(period)
  } catch (cause) {
    summaryError.value = dashboardErrorMessage(cause, 'Unable to load financial summary.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="min-w-0 space-y-4">
    <div class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div class="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p class="text-sm font-semibold text-[#1d81af]">Dashboard</p>
          <h1 class="mt-2 text-2xl font-black text-slate-950">{{ activeCompanyName }}</h1>
          <p v-if="fiscalYear" class="mt-2 text-sm text-slate-500">
            Fiscal Year {{ fiscalYear.year }}: {{ formatDate(fiscalYear.start_date) }} - {{ formatDate(fiscalYear.end_date) }}
          </p>
        </div>
        <BaseButton variant="secondary" size="md" :loading="loading" @click="load">
          <RefreshCw class="h-4 w-4" />Refresh
        </BaseButton>
      </div>
    </div>

    <WorkspaceErrorState v-if="statusError" :message="statusError" @retry="load" />
    <WorkspaceLoadingState v-if="loading" />

    <template v-else-if="fiscalStatus && fiscalYear">
      <p v-if="fiscalWarning" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
        {{ fiscalWarning }}
      </p>

      <div class="grid min-w-0 gap-4 xl:grid-cols-[minmax(280px,1fr)_minmax(420px,2fr)]">
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-black uppercase text-slate-400">Fiscal Status</p>
          <div class="mt-4 flex items-center justify-between gap-3">
            <p class="text-2xl font-black text-slate-950">{{ fiscalYear.year }}</p>
            <span
              class="rounded-full px-3 py-1 text-xs font-black uppercase"
              :class="fiscalYear.status === 'closed' ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-800'"
            >
              {{ fiscalYear.status }}
            </span>
          </div>
          <dl class="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="font-semibold text-slate-500">Closing required</dt>
              <dd class="font-extrabold text-slate-900">{{ fiscalStatus.closing_required ? 'Yes' : 'No' }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="font-semibold text-slate-500">Closing model</dt>
              <dd class="font-extrabold text-slate-900">{{ fiscalStatus.annual_closing_only ? 'Annual' : 'Periodic' }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="font-semibold text-slate-500">Period</dt>
              <dd class="text-right font-extrabold text-slate-900">{{ formatDate(fiscalYear.end_date) }}</dd>
            </div>
          </dl>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs font-black uppercase text-slate-400">Report Health</p>
              <h2 class="mt-1 text-lg font-black text-slate-950">Financial Summary</h2>
            </div>
            <span
              v-if="summary"
              class="rounded-full px-3 py-1 text-xs font-black uppercase"
              :class="summary.balance_sheet.is_balanced ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
            >
              {{ summary.balance_sheet.is_balanced ? 'Balanced' : 'Unbalanced' }}
            </span>
          </div>
          <p v-if="reportingPeriod" class="mt-3 text-sm text-slate-500">
            Posted report data for {{ formatDate(reportingPeriod.start_date) }} - {{ formatDate(reportingPeriod.end_date) }}
          </p>
          <p v-if="summary" class="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
            Balance sheet status:
            <strong :class="summary.balance_sheet.is_balanced ? 'text-emerald-700' : 'text-amber-700'">
              {{ summary.balance_sheet.is_balanced ? 'balanced' : 'requires review' }}
            </strong>
          </p>
          <WorkspaceErrorState v-else-if="summaryError" class="mt-4" :message="summaryError" @retry="load" />
          <p v-else-if="!canViewFinancialSummary" class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
            Financial summary requires permission <span class="font-black">reports.view</span>.
          </p>
        </article>
      </div>

      <div v-if="summary" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-bold text-slate-500">Net Profit / Loss</p>
          <p class="mt-2 text-xl font-black tabular-nums text-slate-950">{{ formatMoney(summary.profit_loss.net_profit_or_loss) }}</p>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-bold text-slate-500">Total Assets</p>
          <p class="mt-2 text-xl font-black tabular-nums text-slate-950">{{ formatMoney(summary.balance_sheet.total_assets) }}</p>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-bold text-slate-500">Total Liabilities</p>
          <p class="mt-2 text-xl font-black tabular-nums text-slate-950">{{ formatMoney(summary.balance_sheet.total_liabilities) }}</p>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-bold text-slate-500">Total Equity</p>
          <p class="mt-2 text-xl font-black tabular-nums text-slate-950">{{ formatMoney(summary.balance_sheet.total_equity) }}</p>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-bold text-slate-500">Cash Movement</p>
          <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-extrabold tabular-nums text-slate-950">
            <span>In {{ formatMoney(summary.cash_flow.cash_in) }}</span>
            <span>Out {{ formatMoney(summary.cash_flow.cash_out) }}</span>
          </div>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-bold text-slate-500">Ending Cash Balance</p>
          <p class="mt-2 text-xl font-black tabular-nums text-slate-950">{{ formatMoney(summary.cash_flow.ending_cash_balance) }}</p>
        </article>
      </div>

      <WorkspaceEmptyState
        v-else-if="canViewFinancialSummary && !summaryError"
        title="Financial summary unavailable"
        description="There is no financial summary available for the active fiscal period."
      />
    </template>
    <WorkspaceEmptyState
      v-else-if="!statusError"
      title="Fiscal year status unavailable"
      description="No active fiscal year status was returned for the active company."
    />
  </section>
</template>
