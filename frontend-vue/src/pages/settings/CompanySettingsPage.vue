<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RefreshCw, Save } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import WorkspaceErrorState from '@/components/workspace/WorkspaceErrorState.vue'
import WorkspaceLoadingState from '@/components/workspace/WorkspaceLoadingState.vue'
import { usePermission } from '@/composables/usePermission'
import {
  getCompanySettings,
  updateCompanyAccountingSettings,
  updateCompanyModuleSettings,
  updateCompanyTransactionDefaults,
  type CompanyAccountingSettings,
  type CompanyModuleSettings,
  type CompanySettings,
  type CompanyTransactionDefaults,
} from '@/services/settings/companySettings.service'
import { paymentTermsService, type PaymentTerm } from '@/services/master-data/paymentTerms.service'
import { useCompanyStore } from '@/stores/companyStore'
import type { ApiError, ValidationErrors } from '@/types/api'

type AccountingBooleanKey =
  | 'auto_post_transactions'
  | 'allow_edit_transactions'
  | 'allow_edit_posted_transactions'
  | 'allow_void_transactions'
  | 'hide_voided_transactions'
  | 'require_void_reason'
  | 'approval_enabled'
  | 'tax_enabled'
  | 'block_outside_current_fiscal_year'
  | 'date_warning_enabled'
  | 'allow_backdated_transactions'
  | 'allow_future_transactions'
type AccountingNumberKey = 'amount_precision' | 'quantity_precision' | 'max_backdate_days' | 'max_future_days'
type ModuleKey = keyof CompanyModuleSettings

const { can } = usePermission()
const companyStore = useCompanyStore()
const settings = ref<CompanySettings | null>(null)
const loading = ref(false)
const loadError = ref('')
const accountingSaving = ref(false)
const moduleSaving = ref(false)
const transactionDefaultSaving = ref(false)
const accountingError = ref('')
const moduleError = ref('')
const transactionDefaultError = ref('')
const accountingNotice = ref('')
const moduleNotice = ref('')
const transactionDefaultNotice = ref('')
const accountingErrors = ref<ValidationErrors>({})
const moduleErrors = ref<ValidationErrors>({})
const transactionDefaultErrors = ref<ValidationErrors>({})
const paymentTerms = ref<PaymentTerm[]>([])

const accountingDraft = reactive<CompanyAccountingSettings>({
  base_currency: 'IDR',
  default_payment_term_id: null,
  amount_precision: 2,
  quantity_precision: 4,
  rounding_method: 'half_up',
  transaction_workflow_mode: 'simple_auto_post',
  auto_post_transactions: true,
  allow_edit_transactions: true,
  allow_edit_posted_transactions: true,
  allow_void_transactions: true,
  hide_voided_transactions: true,
  require_void_reason: true,
  approval_enabled: false,
  tax_enabled: false,
  user_permission_mode: 'role_template',
  block_outside_current_fiscal_year: true,
  date_warning_enabled: true,
  allow_backdated_transactions: true,
  max_backdate_days: null,
  allow_future_transactions: false,
  max_future_days: 0,
})

const transactionDefaultDraft = reactive<CompanyTransactionDefaults>({
  default_payment_term_id: null,
})

const moduleDraft = reactive<CompanyModuleSettings>({
  sales_enabled: true,
  purchase_enabled: true,
  cash_bank_enabled: true,
  inventory_enabled: false,
  warehouse_enabled: false,
  fixed_asset_enabled: false,
  approval_enabled: false,
  tax_enabled: false,
  reports_enabled: true,
})

const accountingToggles: Array<{ key: AccountingBooleanKey; label: string }> = [
  { key: 'auto_post_transactions', label: 'Auto post transactions' },
  { key: 'approval_enabled', label: 'Approval enabled' },
  { key: 'tax_enabled', label: 'Tax enabled' },
  { key: 'allow_edit_transactions', label: 'Allow editing transactions' },
  { key: 'allow_edit_posted_transactions', label: 'Allow editing posted transactions' },
  { key: 'allow_void_transactions', label: 'Allow void transactions' },
  { key: 'hide_voided_transactions', label: 'Hide voided transactions' },
  { key: 'require_void_reason', label: 'Require void reason' },
  { key: 'block_outside_current_fiscal_year', label: 'Block outside fiscal year' },
  { key: 'date_warning_enabled', label: 'Transaction date warnings' },
  { key: 'allow_backdated_transactions', label: 'Allow backdated transactions' },
  { key: 'allow_future_transactions', label: 'Allow future transactions' },
]

const moduleToggles: Array<{ key: ModuleKey; label: string }> = [
  { key: 'sales_enabled', label: 'Sales' },
  { key: 'purchase_enabled', label: 'Purchase' },
  { key: 'cash_bank_enabled', label: 'Cash & Bank' },
  { key: 'inventory_enabled', label: 'Inventory' },
  { key: 'warehouse_enabled', label: 'Warehouse' },
  { key: 'fixed_asset_enabled', label: 'Fixed Assets' },
  { key: 'approval_enabled', label: 'Approval' },
  { key: 'tax_enabled', label: 'Tax' },
  { key: 'reports_enabled', label: 'Reports' },
]

const canEdit = computed(() => can('settings.company.edit'))
const activeCompany = computed(() => companyStore.activeCompany)
const enabledModules = computed(() =>
  moduleToggles.filter(({ key }) => Boolean(moduleDraft[key])).map(({ label }) => label),
)

function messageFrom(reason: unknown, fallback: string) {
  const error = reason as Partial<ApiError>
  if (error.status === 403) return 'You do not have permission to update company settings.'
  return typeof error.message === 'string' ? error.message : fallback
}

function validationFrom(reason: unknown) {
  const error = reason as Partial<ApiError>
  return error.errors ?? {}
}

function setDraft(next: CompanySettings) {
  Object.assign(accountingDraft, next.accounting)
  Object.assign(transactionDefaultDraft, next.transaction_defaults ?? {
    default_payment_term_id: next.accounting.default_payment_term_id,
  })
  Object.assign(moduleDraft, next.modules)
}

async function load(clearNotices = true) {
  loading.value = true
  loadError.value = ''
  if (clearNotices) {
    accountingNotice.value = ''
    moduleNotice.value = ''
    transactionDefaultNotice.value = ''
  }
  try {
    try {
      const paymentTermsResponse = await paymentTermsService.list({ is_active: true })
      const paymentTermsPayload = paymentTermsResponse.data as { data?: PaymentTerm[] }
      paymentTerms.value = Array.isArray(paymentTermsPayload.data) ? paymentTermsPayload.data : []
    } catch {
      paymentTerms.value = []
    }
    const next = await getCompanySettings()
    settings.value = next
    setDraft(next)
  } catch (reason) {
    settings.value = null
    loadError.value = messageFrom(reason, 'Unable to load company settings.')
  } finally {
    loading.value = false
  }
}

function setAccountingNumber(key: AccountingNumberKey, event: Event) {
  const value = (event.target as HTMLInputElement).value
  accountingDraft[key] = value === '' ? null : Number(value)
}

function toggleAccounting(key: AccountingBooleanKey) {
  accountingDraft[key] = !accountingDraft[key]
}

function toggleModule(key: ModuleKey) {
  moduleDraft[key] = !moduleDraft[key]
}

function fieldError(errors: ValidationErrors, key: string) {
  return errors[key]?.[0] ?? ''
}

async function saveAccounting() {
  if (!canEdit.value) return
  accountingSaving.value = true
  accountingError.value = ''
  accountingNotice.value = ''
  accountingErrors.value = {}
  try {
    await updateCompanyAccountingSettings({ ...accountingDraft })
    await load(false)
    accountingNotice.value = 'Accounting settings saved.'
  } catch (reason) {
    accountingErrors.value = validationFrom(reason)
    accountingError.value = messageFrom(reason, 'Unable to save accounting settings.')
  } finally {
    accountingSaving.value = false
  }
}

async function saveModules() {
  if (!canEdit.value) return
  moduleSaving.value = true
  moduleError.value = ''
  moduleNotice.value = ''
  moduleErrors.value = {}
  try {
    await updateCompanyModuleSettings({ ...moduleDraft })
    await load(false)
    moduleNotice.value = 'Module settings saved.'
  } catch (reason) {
    moduleErrors.value = validationFrom(reason)
    moduleError.value = messageFrom(reason, 'Unable to save module settings.')
  } finally {
    moduleSaving.value = false
  }
}

async function saveTransactionDefaults() {
  if (!canEdit.value) return
  transactionDefaultSaving.value = true
  transactionDefaultError.value = ''
  transactionDefaultNotice.value = ''
  transactionDefaultErrors.value = {}
  try {
    await updateCompanyTransactionDefaults({ ...transactionDefaultDraft })
    await load(false)
    transactionDefaultNotice.value = 'Transaction defaults saved.'
  } catch (reason) {
    transactionDefaultErrors.value = validationFrom(reason)
    transactionDefaultError.value = messageFrom(reason, 'Unable to save transaction defaults.')
  } finally {
    transactionDefaultSaving.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="min-w-0 space-y-4">
    <header class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-[#1d81af]">Settings</p>
          <h1 class="mt-1 text-2xl font-black text-slate-950">Company Settings</h1>
        </div>
        <BaseButton variant="secondary" size="md" :loading="loading" @click="load()">
          <RefreshCw class="h-4 w-4" />
          Refresh
        </BaseButton>
      </div>
    </header>

    <WorkspaceErrorState v-if="loadError" :message="loadError" @retry="load()" />
    <WorkspaceLoadingState v-else-if="loading && !settings" />
    <WorkspaceEmptyState v-else-if="!settings" title="No company settings" description="No settings data was returned." />

    <template v-else>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <h2 class="text-base font-black text-slate-950">Company Info</h2>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
            {{ activeCompany?.status ?? 'active' }}
          </span>
        </div>
        <dl class="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt class="text-xs font-bold text-slate-500">Company Name</dt>
            <dd class="mt-1 font-bold text-slate-950">{{ activeCompany?.name ?? '-' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-bold text-slate-500">Company Code</dt>
            <dd class="mt-1 font-bold text-slate-950">{{ activeCompany?.code ?? '-' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-bold text-slate-500">Base Currency</dt>
            <dd class="mt-1 font-bold text-slate-950">{{ accountingDraft.base_currency ?? '-' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-bold text-slate-500">Active Modules</dt>
            <dd class="mt-1 font-bold text-slate-950">{{ enabledModules.join(', ') || '-' }}</dd>
          </div>
        </dl>
      </article>

      <div class="grid min-w-0 gap-4 xl:grid-cols-[minmax(440px,1.45fr)_minmax(320px,1fr)]">
        <form class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="saveAccounting">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h2 class="text-base font-black text-slate-950">Accounting Settings</h2>
            <span v-if="!canEdit" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Read only</span>
          </div>

          <p v-if="accountingError" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ accountingError }}</p>
          <div v-if="Object.keys(accountingErrors).length > 0" class="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <p v-for="(messages, key) in accountingErrors" :key="key">{{ key }}: {{ messages.join(' ') }}</p>
          </div>
          <p v-if="accountingNotice" class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{{ accountingNotice }}</p>

          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <label class="space-y-1.5 text-sm font-bold text-slate-700">
              <span>Base Currency</span>
              <input v-model="accountingDraft.base_currency" maxlength="3" :disabled="!canEdit || accountingSaving" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 uppercase outline-none focus:border-[#24a1db] disabled:bg-slate-50" />
              <span v-if="fieldError(accountingErrors, 'base_currency')" class="block text-xs text-rose-600">{{ fieldError(accountingErrors, 'base_currency') }}</span>
            </label>
            <label class="space-y-1.5 text-sm font-bold text-slate-700">
              <span>Rounding Method</span>
              <select v-model="accountingDraft.rounding_method" :disabled="!canEdit || accountingSaving" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-[#24a1db] disabled:bg-slate-50">
                <option value="half_up">Half Up</option>
                <option value="half_down">Half Down</option>
                <option value="bankers">Bankers</option>
                <option value="floor">Floor</option>
                <option value="ceil">Ceil</option>
              </select>
              <span v-if="fieldError(accountingErrors, 'rounding_method')" class="block text-xs text-rose-600">{{ fieldError(accountingErrors, 'rounding_method') }}</span>
            </label>
            <label class="space-y-1.5 text-sm font-bold text-slate-700">
              <span>Amount Precision</span>
              <input :value="accountingDraft.amount_precision ?? ''" type="number" min="0" max="6" :disabled="!canEdit || accountingSaving" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-[#24a1db] disabled:bg-slate-50" @input="setAccountingNumber('amount_precision', $event)" />
              <span v-if="fieldError(accountingErrors, 'amount_precision')" class="block text-xs text-rose-600">{{ fieldError(accountingErrors, 'amount_precision') }}</span>
            </label>
            <label class="space-y-1.5 text-sm font-bold text-slate-700">
              <span>Quantity Precision</span>
              <input :value="accountingDraft.quantity_precision ?? ''" type="number" min="0" max="8" :disabled="!canEdit || accountingSaving" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-[#24a1db] disabled:bg-slate-50" @input="setAccountingNumber('quantity_precision', $event)" />
              <span v-if="fieldError(accountingErrors, 'quantity_precision')" class="block text-xs text-rose-600">{{ fieldError(accountingErrors, 'quantity_precision') }}</span>
            </label>
            <label class="space-y-1.5 text-sm font-bold text-slate-700">
              <span>Workflow Mode</span>
              <select v-model="accountingDraft.transaction_workflow_mode" :disabled="!canEdit || accountingSaving" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-[#24a1db] disabled:bg-slate-50">
                <option value="simple_auto_post">Simple Auto Post</option>
                <option value="draft_then_post">Draft then Post</option>
                <option value="draft_approve_post">Draft, Approve, Post</option>
              </select>
              <span v-if="fieldError(accountingErrors, 'transaction_workflow_mode')" class="block text-xs text-rose-600">{{ fieldError(accountingErrors, 'transaction_workflow_mode') }}</span>
            </label>
            <label class="space-y-1.5 text-sm font-bold text-slate-700">
              <span>Permission Mode</span>
              <select v-model="accountingDraft.user_permission_mode" :disabled="!canEdit || accountingSaving" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-[#24a1db] disabled:bg-slate-50">
                <option value="role_template">Role Template</option>
                <option value="manual_per_user">Manual per User</option>
              </select>
              <span v-if="fieldError(accountingErrors, 'user_permission_mode')" class="block text-xs text-rose-600">{{ fieldError(accountingErrors, 'user_permission_mode') }}</span>
            </label>
            <label class="space-y-1.5 text-sm font-bold text-slate-700">
              <span>Maximum Backdate Days</span>
              <input :value="accountingDraft.max_backdate_days ?? ''" type="number" min="0" max="3650" :disabled="!canEdit || accountingSaving" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-[#24a1db] disabled:bg-slate-50" @input="setAccountingNumber('max_backdate_days', $event)" />
              <span v-if="fieldError(accountingErrors, 'max_backdate_days')" class="block text-xs text-rose-600">{{ fieldError(accountingErrors, 'max_backdate_days') }}</span>
            </label>
            <label class="space-y-1.5 text-sm font-bold text-slate-700">
              <span>Maximum Future Days</span>
              <input :value="accountingDraft.max_future_days ?? ''" type="number" min="0" max="3650" :disabled="!canEdit || accountingSaving" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-[#24a1db] disabled:bg-slate-50" @input="setAccountingNumber('max_future_days', $event)" />
              <span v-if="fieldError(accountingErrors, 'max_future_days')" class="block text-xs text-rose-600">{{ fieldError(accountingErrors, 'max_future_days') }}</span>
            </label>
          </div>

          <div class="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              v-for="toggle in accountingToggles"
              :key="toggle.key"
              type="button"
              role="switch"
              :aria-checked="Boolean(accountingDraft[toggle.key])"
              :disabled="!canEdit || accountingSaving"
              class="flex h-10 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-bold text-slate-700 disabled:bg-slate-50"
              @click="toggleAccounting(toggle.key)"
            >
              <span>{{ toggle.label }}</span>
              <span class="relative h-5 w-9 shrink-0 rounded-full transition" :class="accountingDraft[toggle.key] ? 'bg-[#24a1db]' : 'bg-slate-300'">
                <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition" :class="accountingDraft[toggle.key] ? 'left-4' : 'left-0.5'" />
              </span>
            </button>
          </div>

          <div v-if="canEdit" class="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <BaseButton type="submit" :loading="accountingSaving">
              <Save class="h-4 w-4" />
              Save Accounting
            </BaseButton>
          </div>
        </form>

        <div class="space-y-4">
          <form class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="saveTransactionDefaults">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h2 class="text-base font-black text-slate-950">Transaction Defaults</h2>
              <span v-if="!canEdit" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Read only</span>
            </div>

            <p v-if="transactionDefaultError" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ transactionDefaultError }}</p>
            <p v-if="transactionDefaultNotice" class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{{ transactionDefaultNotice }}</p>

            <label class="mt-4 block space-y-1.5 text-sm font-bold text-slate-700">
              <span>Default Payment Term</span>
              <select
                v-model="transactionDefaultDraft.default_payment_term_id"
                :disabled="!canEdit || transactionDefaultSaving"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-[#24a1db] disabled:bg-slate-50"
              >
                <option :value="null">Net 7 fallback</option>
                <option v-for="term in paymentTerms" :key="term.id" :value="term.id">{{ term.name }}</option>
              </select>
              <span v-if="fieldError(transactionDefaultErrors, 'default_payment_term_id')" class="block text-xs text-rose-600">{{ fieldError(transactionDefaultErrors, 'default_payment_term_id') }}</span>
            </label>

            <div v-if="canEdit" class="mt-5 flex justify-end border-t border-slate-100 pt-4">
              <BaseButton type="submit" :loading="transactionDefaultSaving">
                <Save class="h-4 w-4" />
                Save Defaults
              </BaseButton>
            </div>
          </form>

        <form class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="saveModules">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h2 class="text-base font-black text-slate-950">Module Settings</h2>
            <span v-if="!canEdit" class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Read only</span>
          </div>

          <p v-if="moduleError" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ moduleError }}</p>
          <p v-if="moduleNotice" class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{{ moduleNotice }}</p>

          <div class="mt-4 grid gap-2">
            <button
              v-for="toggle in moduleToggles"
              :key="toggle.key"
              type="button"
              role="switch"
              :aria-checked="Boolean(moduleDraft[toggle.key])"
              :disabled="!canEdit || moduleSaving"
              class="flex h-11 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 disabled:bg-slate-50"
              @click="toggleModule(toggle.key)"
            >
              <span>{{ toggle.label }}</span>
              <span class="relative h-5 w-9 shrink-0 rounded-full transition" :class="moduleDraft[toggle.key] ? 'bg-[#24a1db]' : 'bg-slate-300'">
                <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition" :class="moduleDraft[toggle.key] ? 'left-4' : 'left-0.5'" />
              </span>
            </button>
            <p v-for="(messages, key) in moduleErrors" :key="key" class="text-xs font-semibold text-rose-600">
              {{ messages[0] }}
            </p>
          </div>

          <div v-if="canEdit" class="mt-5 flex justify-end border-t border-slate-100 pt-4">
            <BaseButton type="submit" :loading="moduleSaving">
              <Save class="h-4 w-4" />
              Save Modules
            </BaseButton>
          </div>
        </form>
        </div>
      </div>
    </template>
  </section>
</template>
