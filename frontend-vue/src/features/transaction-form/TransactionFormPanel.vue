<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { FileText, History, Info, ListTree, Save, Search } from 'lucide-vue-next'

import FormDateInput from '@/components/form/FormDateInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import VoidTransactionDialog from '@/components/dialog/VoidTransactionDialog.vue'
import SourceDocumentPickerModal from '@/components/transaction-form/SourceDocumentPickerModal.vue'
import TransactionActionBar from '@/components/transaction-form/TransactionActionBar.vue'
import TransactionCashBankAmountFields from '@/components/transaction-form/TransactionCashBankAmountFields.vue'
import TransactionFormSection from '@/components/transaction-form/TransactionFormSection.vue'
import TransactionFormShell from '@/components/transaction-form/TransactionFormShell.vue'
import TransactionLineTable from '@/components/transaction-form/TransactionLineTable.vue'
import TransactionNotesPanel from '@/components/transaction-form/TransactionNotesPanel.vue'
import TransactionPartnerSelector from '@/components/transaction-form/TransactionPartnerSelector.vue'
import TransactionSearchableSelect from '@/components/transaction-form/TransactionSearchableSelect.vue'
import TransactionTotalsPanel from '@/components/transaction-form/TransactionTotalsPanel.vue'
import TransactionValidationSummary from '@/components/transaction-form/TransactionValidationSummary.vue'

import { useTransactionForm } from '@/composables/transaction-form/useTransactionForm'
import { useTransactionActions } from '@/composables/transaction-form/useTransactionActions'
import { useTransactionTotals } from '@/composables/transaction-form/useTransactionTotals'
import { toErrorMessage } from '@/composables/transaction-form/useTransactionValidation'
import type { RuntimeTransactionFormConfig, TransactionActionConfig, TransactionConversionConfig } from '@/composables/transaction-form/types'
import { usePermission } from '@/composables/usePermission'
import { contactsService } from '@/services/master-data/contacts.service'
import { paymentTermsService, type PaymentTerm } from '@/services/master-data/paymentTerms.service'
import { getCompanySettings } from '@/services/settings/companySettings.service'
import { checkSourceDocumentAvailability, type SourceDocument } from '@/services/transaction/sourceDocuments.service'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import type { SecondaryTab } from '@/stores/workspaceTabsStore'
import type { ApiResponse } from '@/types/api'

const props = defineProps<{
  config: RuntimeTransactionFormConfig
  tab: SecondaryTab | null
}>()

const emit = defineEmits<{
  close: []
  changed: []
}>()

const mode = (props.tab?.mode ?? 'detail') as 'create' | 'edit' | 'detail'
const entityId = props.tab?.entityId
const secondaryTabId = props.tab?.id ?? ''

const tx = useTransactionForm({ config: props.config, mode, entityId, secondaryTabId })
const actions = useTransactionActions({ config: props.config, entityId })
const tabs = useWorkspaceTabsStore()
const { can } = usePermission()
const voidDialogOpen = ref(false)
const conversionLoading = ref(false)
const conversionNotice = ref<string | null>(null)
const conversionError = ref<string | null>(null)
const sourcePickerOpen = ref(false)
const activeSourceKey = ref<string | null>(null)
const activeFormTab = ref<'details' | 'more'>('details')
const promptedSourceKeys = ref(new Set<string>())
const paymentTerms = ref<PaymentTerm[]>([])
const defaultPaymentTermId = ref<string | number | null>(null)
const dueDateTouched = ref(false)
const applyingDueDate = ref(false)
useTransactionTotals(tx.form, { priceField: props.config.lineProduct?.priceField })

const partnerName =
  props.config.partnerField ?? (props.config.partnerType === 'vendor' ? 'vendor_id' : props.config.partnerType === 'customer' ? 'customer_id' : '')
const partnerLabel = computed(() =>
  props.config.partnerType === 'vendor' ? 'Vendor' : props.config.partnerType === 'customer' ? 'Pelanggan' : props.config.title,
)

const needsCashBankAndAmount =
  props.config.documentType === 'sales.customer-deposits' ||
  props.config.documentType === 'purchase.vendor-deposits' ||
  props.config.documentType === 'sales.receipts' ||
  props.config.documentType === 'purchase.payments'

const supportsInternalNotes = computed(() => Object.prototype.hasOwnProperty.call(tx.form.values, 'internal_notes'))
const supportsValidUntil = computed(() => Object.prototype.hasOwnProperty.call(tx.form.values, 'valid_until'))
const supportsDueDate = computed(() => Object.prototype.hasOwnProperty.call(tx.form.values, 'due_date'))
const supportsPaymentTerm = computed(() => supportsDueDate.value && Object.prototype.hasOwnProperty.call(tx.form.values, 'payment_term_id'))
const formTitle = computed(() => props.tab?.entityNumber ?? props.config.title)
const documentNumber = computed(() => {
  const value = tx.form.values[props.config.numberField] ?? props.tab?.entityNumber
  const text = value == null ? '' : String(value).trim()
  return text || (mode === 'create' ? 'Generated on Save' : '-')
})
const sourceType = computed(() => String(tx.form.values.source_type ?? '') || null)
const sourceNumber = computed(() => String(tx.form.values.source_number ?? '') || null)
const currencyCode = computed(() => String(tx.form.values.currency_code ?? 'IDR'))
const sourceOptions = computed(() => props.config.sourceOptions ?? [])
const activeSourceOption = computed(() => sourceOptions.value.find((option) => option.key === activeSourceKey.value) ?? sourceOptions.value[0] ?? null)
const activeSourceType = computed(() => activeSourceOption.value?.sourceType ?? activeSourceOption.value?.key.replace(/-/g, '_') ?? '')
const currentPartnerId = computed<string | number | null>(() => {
  const value = partnerName ? tx.form.values[partnerName] : null
  return typeof value === 'string' || typeof value === 'number' ? value : null
})
const paymentTermOptions = computed(() =>
  paymentTerms.value.map((term) => ({
    value: String(term.id),
    label: term.name,
    code: term.code,
    name: term.name,
  })),
)
const selectedPaymentTerm = computed(() => {
  const id = tx.form.values.payment_term_id
  return paymentTerms.value.find((term) => String(term.id) === String(id ?? '')) ?? null
})
const visibleLifecycleActions = computed(() =>
  props.config.actions.filter((action) => {
    if (action.key === 'save' || !entityId) return false
    if (!can(action.permission)) return false
    return !action.whenStatusIn || action.whenStatusIn.includes((tx.status.value ?? '').toLowerCase())
  }),
)

watch(
  () => currentPartnerId.value,
  async (partnerId) => {
    if (mode === 'create' && supportsPaymentTerm.value) {
      await applyPartnerPaymentTerm(partnerId)
    }
    if (mode !== 'create' || sourceOptions.value.length === 0 || !partnerId) return
    const option = sourceOptions.value[0]
    if (!option) return
    const sourceType = option.sourceType ?? option.key.replace(/-/g, '_')
    const promptKey = `${props.config.documentType}:${sourceType}:${partnerId}`
    if (promptedSourceKeys.value.has(promptKey)) return
    promptedSourceKeys.value.add(promptKey)
    try {
      const availability = await checkSourceDocumentAvailability({
        moduleKey: props.config.moduleKey,
        targetType: props.config.documentType,
        sourceType,
        partnerId: String(partnerId),
      })
      if (availability.available && window.confirm(`Pelanggan/Vendor ini memiliki ${option.label}. Apakah Anda ingin menggunakan dokumen tersebut?`)) {
        activeSourceKey.value = option.key
        sourcePickerOpen.value = true
      }
    } catch {
      // Availability check is only a convenience prompt; manual picker remains available.
    }
  },
)

watch(
  () => tx.form.values[props.config.dateField],
  () => {
    if (mode === 'create') applyDueDateFromPaymentTerm(false)
  },
)

watch(
  () => tx.form.values.payment_term_id,
  (next, previous) => {
    if (!supportsPaymentTerm.value || next === previous) return
    if (mode === 'create') applyDueDateFromPaymentTerm(true)
  },
)

watch(
  () => tx.form.values.due_date,
  (next, previous) => {
    if (!supportsDueDate.value || applyingDueDate.value || next === previous) return
    dueDateTouched.value = true
  },
)
const visibleConversions = computed(() =>
  (props.config.conversions ?? []).filter((conversion) => {
    if (!entityId || !can(conversion.permission)) return false
    return conversion.whenStatusIn.includes((tx.status.value ?? '').toLowerCase())
  }),
)

const formTabs = [
  { key: 'details', label: 'Rincian' },
  { key: 'more', label: 'Informasi Lainnya' },
] as const

function todayDateValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function emptyValue(value: unknown) {
  return value === null || value === undefined || value === ''
}

function addDays(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return ''
  parsed.setDate(parsed.getDate() + days)
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function setAutoDueDate(value: string) {
  applyingDueDate.value = true
  tx.form.setFieldValue('due_date', value)
  window.setTimeout(() => {
    applyingDueDate.value = false
  }, 0)
}

function applyDueDateFromPaymentTerm(force: boolean) {
  if (!supportsPaymentTerm.value || tx.isReadonly.value) return
  if (!force && dueDateTouched.value) return
  const term = selectedPaymentTerm.value
  if (!term || term.days === null) return
  const dateValue = tx.form.values[props.config.dateField]
  if (typeof dateValue !== 'string' || dateValue === '') return
  setAutoDueDate(addDays(dateValue, term.days))
}

function setPaymentTerm(paymentTermId: string | number | null, forceDueDate: boolean) {
  if (!supportsPaymentTerm.value || paymentTermId == null || paymentTermId === '') return
  tx.form.setFieldValue('payment_term_id', String(paymentTermId))
  applyDueDateFromPaymentTerm(forceDueDate)
}

function fallbackPaymentTermId() {
  const companyDefault = defaultPaymentTermId.value
  if (companyDefault != null && companyDefault !== '') return companyDefault
  return paymentTerms.value.find((term) => term.code === 'NET_7')?.id ?? null
}

async function applyPartnerPaymentTerm(partnerId: string | number | null) {
  if (!supportsPaymentTerm.value) return
  let paymentTermId: string | number | null = null
  if (partnerId) {
    try {
      const response = await contactsService.get(partnerId)
      const payload = response.data as ApiResponse<Record<string, unknown>>
      const contact = payload.data
      paymentTermId = contact?.payment_term_id as string | number | null
    } catch {
      paymentTermId = null
    }
  }
  setPaymentTerm(paymentTermId ?? fallbackPaymentTermId(), !dueDateTouched.value)
}

function onPartnerSelected(contact: { payment_term_id?: string | number | null }) {
  if (!supportsPaymentTerm.value) return
  setPaymentTerm(contact.payment_term_id ?? fallbackPaymentTermId(), !dueDateTouched.value)
}

async function loadPaymentTermDefaults() {
  if (!supportsPaymentTerm.value) return
  try {
    const [termsResponse, settings] = await Promise.all([
      paymentTermsService.list({ is_active: true }),
      getCompanySettings(),
    ])
    const termsPayload = termsResponse.data as ApiResponse<PaymentTerm[]>
    paymentTerms.value = Array.isArray(termsPayload.data) ? termsPayload.data : []
    defaultPaymentTermId.value = settings.transaction_defaults?.default_payment_term_id ?? settings.accounting.default_payment_term_id ?? null
    if (mode === 'create' && emptyValue(tx.form.values.payment_term_id)) {
      setPaymentTerm(fallbackPaymentTermId(), true)
    } else if (mode === 'create') {
      applyDueDateFromPaymentTerm(false)
    }
  } catch {
    paymentTerms.value = []
    defaultPaymentTermId.value = null
  }
}

function ensureDefaultDate() {
  if (mode !== 'create') return
  const currentValue = tx.form.values[props.config.dateField]
  if (currentValue !== null && currentValue !== undefined && currentValue !== '') return
  tx.form.resetForm({ values: { ...tx.form.values, [props.config.dateField]: todayDateValue() } })
}

onMounted(() => {
  ensureDefaultDate()
  void loadPaymentTermDefaults()
})

function sourceLabel(type?: string | null) {
  if (!type) return '-'
  return type
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function onSubmit() {
  if (await tx.save()) emit('changed')
}

async function runLifecycleAction(action: TransactionActionConfig, payload?: unknown) {
  if (action.key === 'void' && !payload) {
    voidDialogOpen.value = true
    return
  }
  if (action.requiresConfirm && action.key !== 'void' && !window.confirm(action.confirmMessage ?? `Confirm ${action.label}?`)) return
  if (await actions.runAction(action.key, payload)) {
    voidDialogOpen.value = false
    await tx.load()
    emit('changed')
  }
}

async function confirmVoid(payload: { reason: string }) {
  const action = visibleLifecycleActions.value.find((item) => item.key === 'void')
  if (action) await runLifecycleAction(action, payload)
}

async function runConversion(conversion: TransactionConversionConfig) {
  if (entityId == null) return
  const payload = conversion.buildPayload?.()
  if (conversion.buildPayload && payload == null) return
  conversionLoading.value = true
  conversionError.value = null
  conversionNotice.value = null
  try {
    const raw = await conversion.execute(entityId, payload ?? undefined)
    const document = (raw as { data?: { data?: Record<string, unknown> } }).data?.data
    const targetId = document?.id
    if (targetId == null) throw new Error('Converted document response did not include an ID.')
    const number = String(document?.[conversion.targetNumberField] ?? targetId)
    tabs.openPrimaryTab({
      id: conversion.targetPrimaryTabId,
      label: conversion.targetLabel,
      path: conversion.targetPrimaryTabId,
      closable: true,
    })
    tabs.openEditSecondaryTab(conversion.targetPrimaryTabId, { id: String(targetId), number })
    conversionNotice.value = `${conversion.targetLabel.replace(/s$/, '')} ${number} created from source document.`
    await tx.load()
    emit('changed')
  } catch (cause) {
    conversionError.value = toErrorMessage(cause)
  } finally {
    conversionLoading.value = false
  }
}

function openSourcePicker(key: string) {
  activeSourceKey.value = key
  sourcePickerOpen.value = true
}

function isBlankLine(line: Record<string, unknown>) {
  return !line.product_id && !line.description && Number(line.unit_price ?? 0) === 0 && Number(line.quantity ?? 0) <= 1
}

function normalizeImportedLine(line: Record<string, unknown>, index: number) {
  return {
    ...line,
    product_id: line.product_id == null ? '' : String(line.product_id),
    unit_id: line.unit_id == null ? null : String(line.unit_id),
    warehouse_id: line.warehouse_id == null ? null : String(line.warehouse_id),
    department_id: line.department_id == null ? null : String(line.department_id),
    project_id: line.project_id == null ? null : String(line.project_id),
    expense_account_id: line.expense_account_id == null ? null : String(line.expense_account_id),
    quantity: Number(line.remaining_quantity ?? line.quantity ?? 0),
    unit_price: Number(line.unit_price ?? line.estimated_unit_price ?? 0),
    discount_amount: Number(line.discount_amount ?? 0),
    tax_amount: Number(line.tax_amount ?? 0),
    line_total: Number(line.line_total ?? 0),
    sort_order: index,
  }
}

function applySourceDocument(document: SourceDocument) {
  const header = document.header ?? {}
  for (const [key, value] of Object.entries(header)) {
    if (value !== undefined && Object.prototype.hasOwnProperty.call(tx.form.values, key)) {
      tx.form.setFieldValue(key, value == null ? null : String(value))
    }
  }
  tx.form.setFieldValue('source_type', document.source_type)
  tx.form.setFieldValue('source_id', document.source_id)
  tx.form.setFieldValue('source_number', document.source_number ?? document.document_number ?? '')
  tx.form.setFieldValue('source_revision', document.source_revision ?? null)

  const currentLines = Array.isArray(tx.form.values.lines) ? (tx.form.values.lines as Record<string, unknown>[]) : []
  const keptLines = currentLines.filter((line) => !isBlankLine(line))
  const importedLines = document.lines.map((line, index) => normalizeImportedLine(line as Record<string, unknown>, keptLines.length + index))
  tx.form.setFieldValue('lines', [...keptLines, ...importedLines])
  if (mode === 'create') void applyPartnerPaymentTerm(currentPartnerId.value)
  sourcePickerOpen.value = false
}
</script>

<template>
  <form class="h-full min-h-0 min-w-0" @submit.prevent="onSubmit">
    <TransactionFormShell :loading="tx.loading.value" :error="tx.error.value" :readonly="tx.isReadonly.value" @close="emit('close')">
      <template #header>
        <div class="grid min-w-0 gap-2 md:grid-cols-[minmax(240px,0.95fr)_minmax(0,2.15fr)] md:items-end">
          <div class="min-w-0">
            <TransactionPartnerSelector
              v-if="config.partnerType !== 'none'"
              :partner-type="config.partnerType === 'vendor' ? 'vendor' : 'customer'"
              :name="partnerName"
              :label="partnerLabel"
              :readonly="tx.isReadonly.value"
              compact
              @select="onPartnerSelected"
            />
            <div v-else class="min-w-0">
              <p class="truncate text-[11px] font-bold leading-4 text-[#1d81af]">{{ config.moduleKey }}</p>
              <p class="truncate text-sm font-black leading-5 text-slate-950">{{ config.title }}</p>
            </div>
          </div>

          <div class="grid min-w-0 gap-2 md:grid-cols-[minmax(124px,0.85fr)_minmax(120px,0.75fr)_minmax(150px,1fr)_auto] md:items-end">
            <div class="min-w-0">
              <div class="mb-1 flex items-center gap-1.5 text-[11px] font-bold leading-4 text-slate-500">
                <FileText class="h-3.5 w-3.5" />
                No Faktur
              </div>
              <p class="flex h-9 min-w-0 items-center truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm font-black text-slate-950" :title="documentNumber">
                {{ documentNumber }}
              </p>
            </div>
            <FormDateInput
              :name="config.dateField"
              label="Date"
              :disabled="tx.isReadonly.value"
              compact
            />
            <div class="min-w-0">
              <TransactionSearchableSelect
                v-if="supportsPaymentTerm"
                name="payment_term_id"
                label="Payment Term"
                :options="paymentTermOptions"
                placeholder="Payment term..."
                :readonly="tx.isReadonly.value"
                compact
                selected-display-mode="name"
              />
              <div v-else class="min-w-0">
                <p class="mb-1 truncate text-[11px] font-bold leading-4 text-slate-500">Document</p>
                <p class="flex h-9 min-w-0 items-center truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm font-semibold text-slate-700" :title="formTitle">
                  {{ formTitle }}
                </p>
              </div>
            </div>

            <div class="workspace-table-scroll flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto md:justify-end">
              <BaseButton
                v-for="option in sourceOptions"
                :key="option.key"
                v-show="!tx.isReadonly.value"
                class="shrink-0"
                variant="secondary"
                size="sm"
                type="button"
                @click="openSourcePicker(option.key)"
              >
                Ambil {{ option.label }}
              </BaseButton>
            </div>
          </div>

          <div v-if="sourceType || sourceNumber" class="md:col-start-2 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs">
            <span class="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-semibold text-slate-600">
              Source: {{ sourceLabel(sourceType) }}
            </span>
            <span v-if="sourceNumber" class="min-w-0 truncate rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-bold text-slate-800">
              {{ sourceNumber }}
            </span>
          </div>
        </div>
      </template>

      <template #validation>
        <TransactionValidationSummary />
        <p v-if="actions.actionError.value" class="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{{ actions.actionError.value }}</p>
        <p v-if="conversionError" class="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{{ conversionError }}</p>
        <p v-if="conversionNotice" class="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{{ conversionNotice }}</p>
      </template>

      <div class="grid h-full min-h-0 min-w-0 grid-cols-[46px_minmax(0,1fr)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex min-h-0 flex-col items-center gap-1 border-r border-slate-200 bg-slate-50/80 px-1 py-2">
          <div class="flex flex-col gap-1">
            <button
              v-for="tabItem in formTabs"
              :key="tabItem.key"
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-lg border text-slate-500 transition"
              :class="activeFormTab === tabItem.key ? 'border-[#24a1db]/30 bg-white text-[#1d81af] shadow-sm' : 'border-transparent hover:bg-white hover:text-slate-800'"
              :title="tabItem.label"
              @click="activeFormTab = tabItem.key"
            >
              <ListTree v-if="tabItem.key === 'details'" class="h-4 w-4" />
              <Info v-else class="h-4 w-4" />
              <span class="sr-only">{{ tabItem.label }}</span>
            </button>
          </div>
        </div>

        <div class="min-h-0 min-w-0 overflow-hidden">
          <div v-show="activeFormTab === 'details'" class="h-full min-h-0 min-w-0 flex-col gap-1.5 overflow-hidden p-1.5" :class="activeFormTab === 'details' ? 'flex' : ''">
            <TransactionFormSection v-if="needsCashBankAndAmount" title="Payment">
              <TransactionCashBankAmountFields :readonly="tx.isReadonly.value" />
            </TransactionFormSection>

            <div v-if="config.hasLines" class="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5">
              <TransactionLineTable
                class="min-h-[232px] flex-1 md:min-h-[264px]"
                name="lines"
                :readonly="tx.isReadonly.value"
                :product-config="config.lineProduct"
              />

              <TransactionTotalsPanel :currency="currencyCode" />
            </div>
          </div>

          <div v-show="activeFormTab === 'more'" class="min-h-0 min-w-0 gap-2 overflow-auto p-2 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.42fr)]" :class="activeFormTab === 'more' ? 'grid' : ''">
            <TransactionFormSection v-if="supportsValidUntil" title="Dates">
              <FormDateInput
                name="valid_until"
                label="Valid Until"
                :disabled="tx.isReadonly.value"
                compact
              />
            </TransactionFormSection>

            <TransactionFormSection title="Notes">
              <TransactionNotesPanel :readonly="tx.isReadonly.value" :show-internal-notes="supportsInternalNotes" />
            </TransactionFormSection>

            <TransactionFormSection title="Source">
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-500">Source Type</span>
                  <span class="text-right font-bold text-slate-900">{{ sourceLabel(sourceType) }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-500">Source Number</span>
                  <span class="text-right font-bold text-slate-900">{{ sourceNumber || '-' }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-slate-500">Currency</span>
                  <span class="text-right font-bold text-slate-900">{{ currencyCode }}</span>
                </div>
              </div>
            </TransactionFormSection>
          </div>
        </div>
      </div>

      <template #actions-left>
        <BaseButton variant="secondary" size="sm" type="button" disabled>
          <Search class="h-4 w-4" />
          Preview
        </BaseButton>
        <BaseButton variant="secondary" size="sm" type="button" disabled>
          <History class="h-4 w-4" />
          Audit
        </BaseButton>
      </template>

      <template #actions-right>
        <TransactionActionBar>
          <BaseButton
            v-for="conversion in visibleConversions"
            :key="conversion.key"
            variant="secondary"
            size="sm"
            type="button"
            :loading="conversionLoading"
            @click="runConversion(conversion)"
          >
            {{ conversion.label }}
          </BaseButton>
          <BaseButton
            v-for="action in visibleLifecycleActions"
            :key="action.key"
            :variant="action.variant ?? 'secondary'"
            size="sm"
            type="button"
            :loading="actions.actionLoading.value"
            @click="runLifecycleAction(action)"
          >
            {{ action.label }}
          </BaseButton>
        </TransactionActionBar>
        <BaseButton v-if="!tx.isReadonly.value" variant="primary" size="sm" type="submit" :loading="tx.loading.value">
          <Save class="h-4 w-4" />
          Save
        </BaseButton>
      </template>
    </TransactionFormShell>
    <VoidTransactionDialog
      :open="voidDialogOpen"
      :loading="actions.actionLoading.value"
      :transaction-number="formTitle"
      @close="voidDialogOpen = false"
      @confirm="confirmVoid"
    />
    <SourceDocumentPickerModal
      v-if="activeSourceOption"
      :open="sourcePickerOpen"
      :module-key="config.moduleKey"
      :target-type="config.documentType"
      :source-type="activeSourceType"
      :source-label="activeSourceOption.label"
      :partner-id="currentPartnerId"
      @close="sourcePickerOpen = false"
      @select="applySourceDocument"
    />
  </form>
</template>
