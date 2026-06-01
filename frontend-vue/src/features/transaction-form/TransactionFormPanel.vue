<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { FileText, History, Save, Search } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import VoidTransactionDialog from '@/components/dialog/VoidTransactionDialog.vue'
import SourceDocumentPickerModal from '@/components/transaction-form/SourceDocumentPickerModal.vue'
import TransactionActionBar from '@/components/transaction-form/TransactionActionBar.vue'
import TransactionDateFields from '@/components/transaction-form/TransactionDateFields.vue'
import TransactionCashBankAmountFields from '@/components/transaction-form/TransactionCashBankAmountFields.vue'
import TransactionFormHeader from '@/components/transaction-form/TransactionFormHeader.vue'
import TransactionFormSection from '@/components/transaction-form/TransactionFormSection.vue'
import TransactionFormShell from '@/components/transaction-form/TransactionFormShell.vue'
import TransactionLineTable from '@/components/transaction-form/TransactionLineTable.vue'
import TransactionNotesPanel from '@/components/transaction-form/TransactionNotesPanel.vue'
import TransactionPartnerSelector from '@/components/transaction-form/TransactionPartnerSelector.vue'
import TransactionTotalsPanel from '@/components/transaction-form/TransactionTotalsPanel.vue'
import TransactionValidationSummary from '@/components/transaction-form/TransactionValidationSummary.vue'

import { useTransactionForm } from '@/composables/transaction-form/useTransactionForm'
import { useTransactionActions } from '@/composables/transaction-form/useTransactionActions'
import { useTransactionTotals } from '@/composables/transaction-form/useTransactionTotals'
import { toErrorMessage } from '@/composables/transaction-form/useTransactionValidation'
import type { RuntimeTransactionFormConfig, TransactionActionConfig, TransactionConversionConfig } from '@/composables/transaction-form/types'
import { usePermission } from '@/composables/usePermission'
import { checkSourceDocumentAvailability, type SourceDocument } from '@/services/transaction/sourceDocuments.service'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import type { SecondaryTab } from '@/stores/workspaceTabsStore'

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
useTransactionTotals(tx.form, { priceField: props.config.lineProduct?.priceField })

const partnerName =
  props.config.partnerField ?? (props.config.partnerType === 'vendor' ? 'vendor_id' : props.config.partnerType === 'customer' ? 'customer_id' : '')

const needsCashBankAndAmount =
  props.config.documentType === 'sales.customer-deposits' ||
  props.config.documentType === 'purchase.vendor-deposits' ||
  props.config.documentType === 'sales.receipts' ||
  props.config.documentType === 'purchase.payments'

const supportsInternalNotes = computed(() => Object.prototype.hasOwnProperty.call(tx.form.values, 'internal_notes'))
const supportsValidUntil = computed(() => Object.prototype.hasOwnProperty.call(tx.form.values, 'valid_until'))
const formTitle = computed(() => props.tab?.entityNumber ?? props.config.title)
const documentNumber = computed(() => {
  const value = tx.form.values[props.config.numberField] ?? props.tab?.entityNumber
  const text = value == null ? '' : String(value).trim()
  return text || (mode === 'create' ? 'Generated on Save' : '-')
})
const documentDate = computed(() => {
  const value = tx.form.values[props.config.dateField]
  return value == null || value === '' ? '-' : String(value).slice(0, 10)
})
const displayedStatus = computed(() => tx.status.value || 'Draft')
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
  sourcePickerOpen.value = false
}
</script>

<template>
  <form class="space-y-3" @submit.prevent="onSubmit">
    <TransactionFormShell :loading="tx.loading.value" :error="tx.error.value" :readonly="tx.isReadonly.value" @close="emit('close')">
      <template #header>
        <div class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_520px]">
          <TransactionFormHeader :eyebrow="config.moduleKey" :title="config.title" :subtitle="mode === 'create' ? `Create ${config.title}` : formTitle">
            <div v-if="sourceType || sourceNumber" class="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-600">
                Source: {{ sourceLabel(sourceType) }}
              </span>
              <span v-if="sourceNumber" class="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-bold text-slate-800">
                {{ sourceNumber }}
              </span>
            </div>
          </TransactionFormHeader>

          <div class="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-2 sm:grid-cols-4">
            <div class="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
              <div class="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-500">
                <FileText class="h-3.5 w-3.5" />
                Number
              </div>
              <p class="mt-1 truncate text-sm font-black text-slate-950" :title="documentNumber">{{ documentNumber }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
              <p class="text-[11px] font-bold uppercase text-slate-500">Date</p>
              <p class="mt-1 truncate text-sm font-bold tabular-nums text-slate-900">{{ documentDate }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
              <p class="text-[11px] font-bold uppercase text-slate-500">Status</p>
              <p class="mt-1 truncate text-sm font-bold capitalize text-slate-900">{{ displayedStatus }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
              <p class="text-[11px] font-bold uppercase text-slate-500">Mode</p>
              <p class="mt-1 truncate text-sm font-bold capitalize text-slate-900">{{ mode }}</p>
            </div>
          </div>
        </div>
      </template>

      <template #validation>
        <TransactionValidationSummary />
        <p v-if="actions.actionError.value" class="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{{ actions.actionError.value }}</p>
        <p v-if="conversionError" class="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{{ conversionError }}</p>
        <p v-if="conversionNotice" class="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{{ conversionNotice }}</p>
      </template>

      <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-3 pt-2">
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="tabItem in formTabs"
              :key="tabItem.key"
              type="button"
              class="rounded-t-lg border border-b-0 px-3 py-2 text-xs font-bold transition"
              :class="activeFormTab === tabItem.key ? 'border-slate-200 bg-white text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-800'"
              @click="activeFormTab = tabItem.key"
            >
              {{ tabItem.label }}
            </button>
          </div>

          <div v-if="sourceOptions.length && !tx.isReadonly.value" class="flex flex-wrap gap-1.5 pb-2">
            <BaseButton
              v-for="option in sourceOptions"
              :key="option.key"
              variant="secondary"
              size="sm"
              type="button"
              @click="openSourcePicker(option.key)"
            >
              Ambil {{ option.label }}
            </BaseButton>
          </div>
        </div>

        <div v-show="activeFormTab === 'details'" class="space-y-3 p-3">
          <div class="grid gap-2 lg:grid-cols-4">
            <TransactionPartnerSelector
              v-if="config.partnerType !== 'none'"
              :partner-type="config.partnerType === 'vendor' ? 'vendor' : 'customer'"
              :name="partnerName"
              :readonly="tx.isReadonly.value"
              compact
            />
            <TransactionDateFields
              :date-name="config.dateField"
              :due-date-name="supportsValidUntil ? 'valid_until' : undefined"
              due-date-label="Valid Until"
              :readonly="tx.isReadonly.value"
              compact
            />
            <label class="block space-y-1.5">
              <span class="text-xs font-bold text-slate-500">Status</span>
              <span class="flex h-9 w-full items-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs capitalize text-slate-900">
                {{ displayedStatus }}
              </span>
            </label>
          </div>

          <TransactionFormSection v-if="needsCashBankAndAmount" title="Payment">
            <TransactionCashBankAmountFields :readonly="tx.isReadonly.value" />
          </TransactionFormSection>

          <TransactionLineTable
            v-if="config.hasLines"
            name="lines"
            :readonly="tx.isReadonly.value"
            :product-config="config.lineProduct"
          />

          <div v-if="config.hasLines" class="grid justify-items-end">
            <TransactionFormSection title="Totals" class="w-full max-w-md">
              <TransactionTotalsPanel :currency="currencyCode" />
            </TransactionFormSection>
          </div>
        </div>

        <div v-show="activeFormTab === 'more'" class="grid gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_320px]">
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
