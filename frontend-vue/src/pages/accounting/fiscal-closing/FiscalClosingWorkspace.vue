<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import DateInput from '@/components/ui/DateInput.vue'
import { usePermission } from '@/composables/usePermission'
import type { ApiError } from '@/types/api'
import { formatDisplayDate } from '@/utils/date'
import {
  closeFiscalYear,
  getClosingChecklist,
  getClosingPreview,
  getFiscalYearStatus,
  getPeriodLockStatus,
  reopenFiscalYear,
  updatePeriodLock,
  type ClosingChecklist,
  type ClosingPreview,
  type FiscalYearStatus,
  type PeriodLockStatus,
} from '@/services/accounting/fiscalClosing.service'

const { can } = usePermission()

const fiscalStatus = ref<FiscalYearStatus | null>(null)
const periodStatus = ref<PeriodLockStatus | null>(null)
const checklist = ref<ClosingChecklist | null>(null)
const preview = ref<ClosingPreview | null>(null)
const loading = ref(false)
const actionLoading = ref('')
const error = ref('')
const notice = ref('')
const closingNotes = ref('')
const reopenReason = ref('')
const lockUntil = ref('')
const lockReason = ref('')
const showReopen = ref(false)

const activeFiscalYear = computed(() => periodStatus.value?.active_fiscal_year ?? fiscalStatus.value?.active_fiscal_year ?? null)
const fiscalYearId = computed(() => activeFiscalYear.value?.id ?? null)
const canViewWizard = computed(() => can('fiscal_year.view') || can('fiscal_year.closing_wizard'))
const canLoadChecklist = computed(() => can('fiscal_year.closing_wizard'))
const canClose = computed(() => can('fiscal_year.close') && Boolean(checklist.value?.can_close) && Boolean(preview.value?.valid))
const canReopen = computed(() => can('fiscal_year.reopen') && Boolean(activeFiscalYear.value?.is_closed || activeFiscalYear.value?.status === 'closed'))
const canManageLock = computed(() => can('fiscal_year.lock_manage'))
const isLocked = computed(() => Boolean(activeFiscalYear.value?.locked_until))

function formatDate(value?: string | null) {
  return formatDisplayDate(value)
}

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value ?? 0)
}

function flattenErrors(errors?: Record<string, string[]>) {
  if (!errors) return []
  return Object.entries(errors).flatMap(([field, messages]) => messages.map((message) => `${field}: ${message}`))
}

function errorText(reason: unknown) {
  const apiError = reason as Partial<ApiError>
  const lines = flattenErrors(apiError.errors)
  if (lines.length > 0) return lines.join(' ')
  if (typeof apiError.message === 'string') return apiError.message
  return reason instanceof Error ? reason.message : 'Request failed.'
}

async function load() {
  loading.value = true
  error.value = ''
  notice.value = ''
  try {
    const [status, lockStatus] = await Promise.all([getFiscalYearStatus(), getPeriodLockStatus()])
    fiscalStatus.value = status
    periodStatus.value = lockStatus
    lockUntil.value = lockStatus.active_fiscal_year.locked_until ?? ''

    const id = lockStatus.active_fiscal_year.id
    const [nextChecklist, nextPreview] = await Promise.all([
      canLoadChecklist.value ? getClosingChecklist(id) : Promise.resolve(null),
      getClosingPreview(id),
    ])
    checklist.value = nextChecklist
    preview.value = nextPreview
  } catch (reason) {
    error.value = errorText(reason)
  } finally {
    loading.value = false
  }
}

async function refreshPreview() {
  if (!fiscalYearId.value) return
  actionLoading.value = 'preview'
  error.value = ''
  try {
    const [nextChecklist, nextPreview] = await Promise.all([
      canLoadChecklist.value ? getClosingChecklist(fiscalYearId.value) : Promise.resolve(null),
      getClosingPreview(fiscalYearId.value),
    ])
    checklist.value = nextChecklist
    preview.value = nextPreview
    notice.value = 'Closing checklist and preview refreshed.'
  } catch (reason) {
    error.value = errorText(reason)
  } finally {
    actionLoading.value = ''
  }
}

async function closeYear() {
  if (!fiscalYearId.value || !canClose.value) return
  actionLoading.value = 'close'
  error.value = ''
  try {
    await closeFiscalYear(fiscalYearId.value, { closing_notes: closingNotes.value || undefined })
    closingNotes.value = ''
    await load()
    notice.value = 'Fiscal year closed successfully.'
  } catch (reason) {
    error.value = errorText(reason)
  } finally {
    actionLoading.value = ''
  }
}

async function reopenYear() {
  if (!fiscalYearId.value) return
  if (!reopenReason.value.trim()) {
    error.value = 'Reopen reason is required.'
    return
  }

  actionLoading.value = 'reopen'
  error.value = ''
  try {
    await reopenFiscalYear(fiscalYearId.value, { reopen_reason: reopenReason.value.trim() })
    reopenReason.value = ''
    showReopen.value = false
    await load()
    notice.value = 'Fiscal year reopened successfully.'
  } catch (reason) {
    error.value = errorText(reason)
  } finally {
    actionLoading.value = ''
  }
}

async function savePeriodLock() {
  actionLoading.value = 'lock'
  error.value = ''
  try {
    await updatePeriodLock({
      lock_until: lockUntil.value || null,
      override_reason: lockReason.value || undefined,
    })
    notice.value = lockUntil.value ? 'Period lock updated.' : 'Period lock cleared.'
    lockReason.value = ''
    const nextStatus = await getPeriodLockStatus()
    periodStatus.value = nextStatus
    lockUntil.value = nextStatus.active_fiscal_year.locked_until ?? ''
  } catch (reason) {
    error.value = errorText(reason)
  } finally {
    actionLoading.value = ''
  }
}

onMounted(load)
</script>

<template>
  <section class="space-y-5">
    <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-[#1d81af]">Accounting</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-950">Fiscal Closing & Period Locking</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Review the active fiscal year, validate the closing checklist, execute year-end closing, reopen with reason,
            and manage the transaction lock date. Reports remain readable; transaction mutations stay backend-controlled.
          </p>
        </div>
        <BaseButton variant="secondary" :loading="loading" @click="load">Refresh Status</BaseButton>
      </div>
    </div>

    <div v-if="!canViewWizard" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
      You do not have permission to view fiscal closing.
    </div>

    <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
      {{ error }}
    </div>
    <div v-if="notice" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
      {{ notice }}
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
      Loading fiscal closing workspace...
    </div>

    <template v-else-if="activeFiscalYear">
      <div class="grid gap-4 xl:grid-cols-3">
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs font-black uppercase tracking-wide text-slate-400">Active Fiscal Year</p>
              <h2 class="mt-2 text-2xl font-black text-slate-950">{{ activeFiscalYear.year }}</h2>
              <p class="mt-1 text-sm text-slate-500">
                {{ formatDate(activeFiscalYear.start_date) }} - {{ formatDate(activeFiscalYear.end_date) }}
              </p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-black uppercase"
              :class="activeFiscalYear.status === 'closed' || activeFiscalYear.is_closed ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-800'"
            >
              {{ activeFiscalYear.status }}
            </span>
          </div>
          <div class="mt-5 grid gap-3 md:grid-cols-3">
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs font-bold uppercase text-slate-400">Closing Required</p>
              <p class="mt-2 text-lg font-black text-slate-900">{{ fiscalStatus?.closing_required ? 'Yes' : 'No' }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs font-bold uppercase text-slate-400">Lock Until</p>
              <p class="mt-2 text-lg font-black text-slate-900">{{ formatDate(activeFiscalYear.locked_until) }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs font-bold uppercase text-slate-400">Mutation State</p>
              <p class="mt-2 text-lg font-black" :class="isLocked || activeFiscalYear.is_closed ? 'text-rose-700' : 'text-emerald-700'">
                {{ isLocked || activeFiscalYear.is_closed ? 'Blocked' : 'Open' }}
              </p>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-black uppercase tracking-wide text-slate-400">Actions</p>
          <div class="mt-4 space-y-3">
            <BaseButton class="w-full" variant="secondary" :loading="actionLoading === 'preview'" @click="refreshPreview">
              Generate Preview
            </BaseButton>
            <textarea
              v-model="closingNotes"
              rows="3"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Optional closing notes"
            />
            <BaseButton
              class="w-full"
              variant="danger"
              :disabled="!canClose"
              :loading="actionLoading === 'close'"
              @click="closeYear"
            >
              Close Fiscal Year
            </BaseButton>
            <p v-if="!can('fiscal_year.close')" class="text-xs font-semibold text-slate-500">Close action requires fiscal_year.close.</p>
            <p v-else-if="!checklist?.can_close" class="text-xs font-semibold text-amber-700">Close is blocked until checklist passes.</p>
            <p v-else-if="!preview?.valid" class="text-xs font-semibold text-amber-700">Generate a valid preview before closing.</p>

            <BaseButton class="w-full" variant="secondary" :disabled="!canReopen" @click="showReopen = !showReopen">
              Reopen Fiscal Year
            </BaseButton>
            <div v-if="showReopen" class="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <textarea
                v-model="reopenReason"
                rows="3"
                class="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm"
                placeholder="Required reopen reason"
              />
              <BaseButton variant="danger" :loading="actionLoading === 'reopen'" @click="reopenYear">Confirm Reopen</BaseButton>
            </div>
          </div>
        </article>
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-black uppercase tracking-wide text-slate-400">Closing Checklist</p>
              <h2 class="mt-1 text-xl font-black text-slate-950">
                {{ checklist?.can_close ? 'Ready to close' : 'Blocked' }}
              </h2>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-black uppercase"
              :class="checklist?.can_close ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'"
            >
              {{ checklist?.can_close ? 'passed' : 'failed' }}
            </span>
          </div>

          <p v-if="!canLoadChecklist" class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            Closing checklist requires fiscal_year.closing_wizard. Status, preview, and period lock state remain readable.
          </p>

          <ul class="mt-4 space-y-2">
            <li
              v-for="check in checklist?.checks ?? []"
              :key="check.key"
              class="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm"
            >
              <span
                class="mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-black uppercase"
                :class="{
                  'bg-emerald-100 text-emerald-800': check.status === 'passed',
                  'bg-amber-100 text-amber-800': check.status === 'warning',
                  'bg-rose-100 text-rose-700': check.status === 'failed',
                }"
              >
                {{ check.status }}
              </span>
              <span>
                <strong class="block text-slate-800">{{ check.key }}</strong>
                <span class="text-slate-500">{{ check.message }}</span>
              </span>
            </li>
          </ul>

          <div v-if="flattenErrors(checklist?.errors).length" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3">
            <p class="text-sm font-black text-rose-700">Blocking errors</p>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-700">
              <li v-for="item in flattenErrors(checklist?.errors)" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div v-if="checklist?.warnings.length" class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p class="text-sm font-black text-amber-800">Warnings</p>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
              <li v-for="item in checklist.warnings" :key="item">{{ item }}</li>
            </ul>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-black uppercase tracking-wide text-slate-400">Closing Preview</p>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs font-bold uppercase text-slate-400">Net Profit / Loss</p>
              <p class="mt-2 text-xl font-black text-slate-950">{{ formatMoney(preview?.preview?.net_profit_loss) }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs font-bold uppercase text-slate-400">Posted Journals</p>
              <p class="mt-2 text-xl font-black text-slate-950">{{ preview?.preview?.journal_count ?? 0 }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs font-bold uppercase text-slate-400">Retained Earnings Account</p>
              <p class="mt-2 text-xl font-black text-slate-950">{{ preview?.preview?.retained_earnings_account?.account_id ?? '-' }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs font-bold uppercase text-slate-400">Preview Valid</p>
              <p class="mt-2 text-xl font-black" :class="preview?.valid ? 'text-emerald-700' : 'text-rose-700'">
                {{ preview?.valid ? 'Yes' : 'No' }}
              </p>
            </div>
          </div>
          <div v-if="flattenErrors(preview?.errors).length" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3">
            <p class="text-sm font-black text-rose-700">Preview errors</p>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-700">
              <li v-for="item in flattenErrors(preview?.errors)" :key="item">{{ item }}</li>
            </ul>
          </div>
        </article>
      </div>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-black uppercase tracking-wide text-slate-400">Period Lock</p>
            <h2 class="mt-1 text-xl font-black text-slate-950">Transaction mutation lock</h2>
            <p class="mt-1 text-sm text-slate-500">
              Transactions dated on or before the lock date are blocked by backend validation. Historical reports remain readable.
            </p>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label class="text-sm font-bold text-slate-700">
              Lock until
              <DateInput
                v-model="lockUntil"
                :disabled="!canManageLock"
                class="mt-2"
              />
            </label>
            <label class="text-sm font-bold text-slate-700">
              Reason
              <input
                v-model="lockReason"
                :disabled="!canManageLock"
                class="mt-2 block h-10 rounded-xl border border-slate-200 px-3 text-sm disabled:bg-slate-50"
                placeholder="Optional"
              />
            </label>
            <BaseButton :disabled="!canManageLock" :loading="actionLoading === 'lock'" @click="savePeriodLock">Update Lock</BaseButton>
          </div>
        </div>
        <p v-if="!canManageLock" class="mt-3 text-xs font-semibold text-slate-500">
          Period lock update requires fiscal_year.lock_manage.
        </p>
      </article>
    </template>
  </section>
</template>
