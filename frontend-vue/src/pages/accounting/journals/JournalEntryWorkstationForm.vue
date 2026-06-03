<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { FileClock, FileText, Info, Plus, Trash2 } from 'lucide-vue-next'

import UnsavedChangesDialog from '@/components/dialog/UnsavedChangesDialog.vue'
import VoidTransactionDialog from '@/components/dialog/VoidTransactionDialog.vue'
import FormDirtyIndicator from '@/components/form/FormDirtyIndicator.vue'
import FormStatusBadge from '@/components/form/FormStatusBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import DateInput from '@/components/ui/DateInput.vue'
import { useWorkspaceDraft } from '@/composables/useWorkspaceDraft'
import {
  createBackendResource,
  extractLaravelErrors,
  runBackendResourceAction,
  showBackendResource,
  updateBackendResource,
} from '@/features/workspace/backend-resource/backendResourceForm.service'
import {
  defaultValues,
  journalFormConfig,
  type FormActionConfig,
} from '@/features/workspace/backend-resource/backendResource.form.config'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceTabsStore, type SecondaryTab } from '@/stores/workspaceTabsStore'
import { formatDisplayDate, normalizeDateFields, prepareDateForPayload, toDateInputValue } from '@/utils/date'
import { formatIntegerNumber, parseFormattedInteger } from '@/utils/numberFormat'
import JournalLookupDialog, {
  type JournalLookupKind,
  type JournalLookupSelection,
} from './JournalLookupDialog.vue'

type JournalLine = {
  account_id: string | number | null
  account_display?: string | null
  description: string
  department_id: string | number | null
  department_display?: string | null
  project_id: string | number | null
  project_display?: string | null
  debit: string | number
  credit: string | number
  auto_balance_side?: 'debit' | 'credit' | null
  auto_balance_amount?: number | null
}

type JournalDraft = {
  journal_date: string
  journal_number: string | null
  reference_number: string | null
  memo: string | null
  status?: string | null
  lines: JournalLine[]
  created_at?: string | null
  updated_at?: string | null
  approved_at?: string | null
  posted_at?: string | null
  voided_at?: string | null
  [key: string]: unknown
}

const props = defineProps<{
  primaryTabId: string
  tab: SecondaryTab
}>()

const emit = defineEmits<{
  saved: []
  close: []
}>()

const auth = useAuthStore()
const tabs = useWorkspaceTabsStore()
const loading = ref(false)
const saving = ref(false)
const actionLoading = ref<string | null>(null)
const error = ref<string | null>(null)
const serverErrors = ref<string[]>([])
const hydrating = ref(false)
const loadedEntityId = ref<string | number | null>(null)
const auditOpen = ref(false)
const detailTab = ref<'lines' | 'memo'>('lines')
const lookupOpen = ref(false)
const lookupKind = ref<JournalLookupKind>('account')
const lookupTargetLine = ref<JournalLine | null>(null)
const voidDialogOpen = ref(false)
const pendingVoidAction = ref<FormActionConfig | null>(null)
const closeConfirmOpen = ref(false)

function emptyLine(): JournalLine {
  return {
    account_id: null,
    account_display: null,
    description: '',
    department_id: null,
    department_display: null,
    project_id: null,
    project_display: null,
    debit: 0,
    credit: 0,
  }
}

function normalizeLine(value: unknown): JournalLine {
  const row = value != null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  return {
    account_id: normalizeNullable(row.account_id),
    account_display: normalizeDisplay(row.account_display ?? nestedValue(row.account, ['account_code', 'code'])),
    description: String(row.description ?? ''),
    department_id: normalizeNullable(row.department_id),
    department_display: normalizeDisplay(row.department_display ?? nestedValue(row.department, ['code', 'department_code'])),
    project_id: normalizeNullable(row.project_id),
    project_display: normalizeDisplay(row.project_display ?? nestedValue(row.project, ['code', 'project_code'])),
    debit: row.debit == null || row.debit === '' ? 0 : Number(row.debit),
    credit: row.credit == null || row.credit === '' ? 0 : Number(row.credit),
  }
}

function nestedValue(value: unknown, keys: string[]) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  for (const key of keys) {
    if (record[key] != null && String(record[key]) !== '') return record[key]
  }
  return null
}

function normalizeDisplay(value: unknown) {
  if (value == null || value === '') return null
  return String(value)
}

function normalizeNullable(value: unknown) {
  if (value === '' || value == null) return null
  if (typeof value === 'string' || typeof value === 'number') return value
  return String(value)
}

function ensureMinRows(lines: unknown): JournalLine[] {
  const normalized = Array.isArray(lines) ? lines.map(normalizeLine) : []
  while (normalized.length < 2) normalized.push(emptyLine())
  return normalized
}

function makeDefaultDraft(): JournalDraft {
  const values = defaultValues(journalFormConfig) as Record<string, unknown>
  return {
    ...values,
    journal_date: String(values.journal_date || toDateInputValue(new Date())),
    journal_number: values.journal_number == null ? null : String(values.journal_number),
    reference_number: values.reference_number == null ? null : String(values.reference_number),
    memo: values.memo == null ? null : String(values.memo),
    lines: ensureMinRows(values.lines),
  }
}

function cloneDraft(value: JournalDraft): JournalDraft {
  return JSON.parse(JSON.stringify(value)) as JournalDraft
}

function toPlainDraft(): JournalDraft {
  return cloneDraft(form)
}

const form = reactive<JournalDraft>(makeDefaultDraft())
const { draft, setDraft, dirty, setDirty, secondaryTabId } = useWorkspaceDraft<JournalDraft>({
  defaultDraft: makeDefaultDraft,
  secondaryTabId: computed(() => props.tab.id),
})

const status = computed(() => String(form.status || 'draft').toLowerCase())
const hasBackendStatus = computed(() => Boolean(form.status))
const showStatusBadge = computed(() => props.tab.mode !== 'create' || hasBackendStatus.value)
const readonlyStatuses = ['posted', 'void', 'voided', 'cancelled', 'closed', 'finalized']
const readonly = computed(() => props.tab.mode === 'detail' || readonlyStatuses.includes(status.value))
const title = computed(() => {
  if (props.tab.mode === 'create') return 'New Journal Entry'
  if (props.tab.mode === 'edit') return 'Edit Journal Entry'
  return 'Journal Entry Detail'
})
const numberText = computed(() => String(form.journal_number || props.tab.entityNumber || 'AUTO'))
const canSave = computed(() => {
  if (readonly.value) return false
  const permission = props.tab.mode === 'edit' ? journalFormConfig.editPermission : journalFormConfig.createPermission
  return permission ? can(permission) : false
})
const totalDebit = computed(() => form.lines.reduce((sum, line) => sum + asNumber(line.debit), 0))
const totalCredit = computed(() => form.lines.reduce((sum, line) => sum + asNumber(line.credit), 0))
const journalDifference = computed(() => totalDebit.value - totalCredit.value)
const journalBalanced = computed(() => Math.abs(journalDifference.value) < 0.01)
const visibleActions = computed(() => journalFormConfig.actions.filter(visibleAction))
const auditItems = computed(() => [
  { label: 'Created', value: form.created_at },
  { label: 'Updated', value: form.updated_at },
  { label: 'Approved', value: form.approved_at },
  { label: 'Posted', value: form.posted_at },
  { label: 'Voided', value: form.voided_at },
])

function can(permission: string) {
  return auth.permissions.includes('*') || auth.permissions.includes(permission)
}

function visibleAction(action: FormActionConfig) {
  if (!props.tab.entityId || !can(action.permission)) return false
  if (action.visibleStatuses?.length && !action.visibleStatuses.includes(status.value)) return false
  return true
}

function asNumber(value: unknown) {
  if (value == null || value === '') return 0
  const parsed = typeof value === 'string' ? parseFormattedInteger(value) : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoney(value: number) {
  return formatIntegerNumber(value)
}

function amountInputValue(value: string | number) {
  if (value === '') return ''
  return formatIntegerNumber(value)
}

function updateAmount(line: JournalLine, key: 'debit' | 'credit', value: string) {
  const nextValue = value.trim() === '' ? '' : parseFormattedInteger(value)
  line.auto_balance_side = null
  line.auto_balance_amount = null
  line[key] = nextValue
  if (asNumber(nextValue) > 0) line[key === 'debit' ? 'credit' : 'debit'] = 0
  queueMicrotask(() => autoFillNextEligibleLine(line))
}

function lookupDisplay(line: JournalLine, key: 'account' | 'department' | 'project') {
  if (key === 'account') return line.account_display || (line.account_id == null ? '' : String(line.account_id))
  if (key === 'department') return line.department_display || (line.department_id == null ? '' : String(line.department_id))
  return line.project_display || (line.project_id == null ? '' : String(line.project_id))
}

function updateLookupText(line: JournalLine, key: 'account' | 'department' | 'project', value: string) {
  if (key === 'account') {
    line.account_id = value || null
    line.account_display = value || null
    return
  }
  if (key === 'department') {
    line.department_id = value || null
    line.department_display = value || null
    return
  }
  line.project_id = value || null
  line.project_display = value || null
}

function openLookup(kind: JournalLookupKind, line: JournalLine) {
  if (readonly.value) return
  lookupKind.value = kind
  lookupTargetLine.value = line
  lookupOpen.value = true
}

function applyLookup(selection: JournalLookupSelection) {
  const line = lookupTargetLine.value
  if (!line) return
  const display = selection.code || String(selection.id)

  if (selection.kind === 'account') {
    line.account_id = selection.id
    line.account_display = display
    line.description = selection.name || line.description
    autoFillLine(line)
  } else if (selection.kind === 'department') {
    line.department_id = selection.id
    line.department_display = display
  } else {
    line.project_id = selection.id
    line.project_display = display
  }

  lookupOpen.value = false
  lookupTargetLine.value = null
}

function lineHasValue(line: JournalLine) {
  return Boolean(
    line.account_id
    || line.description
    || line.department_id
    || line.project_id
    || asNumber(line.debit) > 0
    || asNumber(line.credit) > 0,
  )
}

function lineHasManualAmount(line: JournalLine) {
  if (line.auto_balance_side) return false
  return asNumber(line.debit) > 0 || asNumber(line.credit) > 0
}

function lineCanBeAutoFilled(line: JournalLine) {
  return !readonly.value && (line.auto_balance_side || !lineHasManualAmount(line))
}

function totalsExcluding(target: JournalLine) {
  return form.lines.reduce(
    (totals, line) => {
      if (line === target) return totals
      totals.debit += asNumber(line.debit)
      totals.credit += asNumber(line.credit)
      return totals
    },
    { debit: 0, credit: 0 },
  )
}

function clearAutoBalance(line: JournalLine) {
  if (!line.auto_balance_side) return
  line.debit = 0
  line.credit = 0
  line.auto_balance_side = null
  line.auto_balance_amount = null
}

function autoFillLine(line: JournalLine) {
  if (!lineCanBeAutoFilled(line)) return

  const totals = totalsExcluding(line)
  const difference = totals.debit - totals.credit
  if (Math.abs(difference) < 0.01) {
    clearAutoBalance(line)
    return
  }

  const side = difference > 0 ? 'credit' : 'debit'
  const amount = Math.abs(difference)
  line.debit = side === 'debit' ? amount : 0
  line.credit = side === 'credit' ? amount : 0
  line.auto_balance_side = side
  line.auto_balance_amount = amount
}

function autoFillNextEligibleLine(changedLine: JournalLine) {
  if (journalBalanced.value) return
  const changedIndex = form.lines.indexOf(changedLine)
  const candidates = changedIndex >= 0 ? form.lines.slice(changedIndex + 1) : form.lines
  const target = candidates.find((line) => line.account_id && lineCanBeAutoFilled(line))
  if (target) autoFillLine(target)
}

function hydrate(values: Record<string, unknown>, markDirty = false) {
  const normalized = normalizeDateFields(values, ['journal_date'])
  const next = {
    ...makeDefaultDraft(),
    ...normalized,
    journal_date: String(normalized.journal_date || (props.tab.mode === 'create' ? toDateInputValue(new Date()) : '')),
    lines: ensureMinRows(normalized.lines),
  } as JournalDraft

  hydrating.value = true
  Object.assign(form, next)
  setDraft(cloneDraft(next))
  setDirty(markDirty)
  setTimeout(() => {
    hydrating.value = false
  }, 0)
}

async function loadEntity() {
  const hasDraft = tabs.draftStateBySecondaryTabId[props.tab.id] != null
  serverErrors.value = []
  if (props.tab.mode === 'create' || !props.tab.entityId) {
    hydrate({ ...makeDefaultDraft(), ...draft.value }, props.tab.dirty)
    return
  }
  if (hasDraft && props.tab.dirty) {
    hydrate({ ...makeDefaultDraft(), ...draft.value }, true)
    loadedEntityId.value = props.tab.entityId
    return
  }
  if (loadedEntityId.value === props.tab.entityId) return

  loading.value = true
  error.value = null
  try {
    const entity = await showBackendResource(journalFormConfig.endpoint, props.tab.entityId)
    hydrate({ ...makeDefaultDraft(), ...entity })
    loadedEntityId.value = props.tab.entityId
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Endpoint belum tersedia.'
  } finally {
    loading.value = false
  }
}

watch(
  () => secondaryTabId.value,
  () => {
    loadedEntityId.value = null
    auditOpen.value = false
    void loadEntity()
  },
  { immediate: true },
)

watch(
  form,
  () => {
    if (hydrating.value) return
    setDraft(toPlainDraft())
    setDirty(true)
  },
  { deep: true },
)

function addLine() {
  if (readonly.value) return
  const line = emptyLine()
  form.lines.push(line)
  autoFillLine(line)
}

function removeLine(index: number) {
  if (readonly.value || form.lines.length <= 2) return
  form.lines.splice(index, 1)
}

function normalizeIdForPayload(value: string | number | null) {
  return value === '' || value == null ? null : value
}

function payload() {
  return {
    journal_date: prepareDateForPayload(form.journal_date),
    journal_number: form.journal_number || undefined,
    reference_number: form.reference_number || null,
    memo: form.memo || null,
    lines: form.lines.map((line, index) => ({
      account_id: normalizeIdForPayload(line.account_id),
      description: line.description || '',
      department_id: normalizeIdForPayload(line.department_id),
      project_id: normalizeIdForPayload(line.project_id),
      debit: asNumber(line.debit),
      credit: asNumber(line.credit),
      sort_order: index,
    })),
  }
}

function validate() {
  const messages: string[] = []
  if (!form.journal_date) messages.push('Journal Date is required.')
  if (form.lines.length < 2) messages.push('Journal must have at least 2 lines.')
  if (!journalBalanced.value) messages.push('Journal total debit and credit must be balanced before posting or saving.')
  if (!form.lines.some(lineHasValue)) messages.push('Journal lines cannot be empty.')

  form.lines.forEach((line, index) => {
    const hasAmount = asNumber(line.debit) > 0 || asNumber(line.credit) > 0
    if (hasAmount && !line.account_id) messages.push(`Line ${index + 1}: Account is required.`)
    if (asNumber(line.debit) > 0 && asNumber(line.credit) > 0) {
      messages.push(`Line ${index + 1}: Debit and Credit cannot both be filled.`)
    }
  })

  serverErrors.value = [...new Set(messages)]
  return serverErrors.value.length === 0
}

async function save(closeAfter = false) {
  if (!canSave.value) return
  serverErrors.value = []
  error.value = null
  if (!validate()) return

  saving.value = true
  try {
    const values = payload()
    const saved = props.tab.mode === 'edit' && props.tab.entityId
      ? await updateBackendResource(journalFormConfig.endpoint, props.tab.entityId, values)
      : await createBackendResource(journalFormConfig.endpoint, values)
    hydrate({ ...makeDefaultDraft(), ...saved })
    tabs.setSecondaryDirty(props.tab.id, false)
    emit('saved')
    if (closeAfter) emit('close')
  } catch (reason) {
    serverErrors.value = extractLaravelErrors(reason).messages
  } finally {
    saving.value = false
  }
}

async function runAction(action: FormActionConfig, actionPayload?: Record<string, unknown>) {
  if (!props.tab.entityId) return
  if (action.key === 'void' && !actionPayload) {
    pendingVoidAction.value = action
    voidDialogOpen.value = true
    return
  }
  if (action.key === 'post' && !journalBalanced.value) {
    serverErrors.value = ['Journal total debit and credit must be balanced before posting.']
    return
  }

  actionLoading.value = action.key
  serverErrors.value = []
  try {
    await runBackendResourceAction(
      journalFormConfig.endpoint,
      props.tab.entityId,
      action.endpointSuffix,
      action.method ?? 'patch',
      actionPayload ?? action.payload ?? {},
    )
    loadedEntityId.value = null
    await loadEntity()
    emit('saved')
    voidDialogOpen.value = false
  } catch (reason) {
    serverErrors.value = extractLaravelErrors(reason).messages
  } finally {
    actionLoading.value = null
  }
}

function confirmVoid(voidPayload: { reason: string }) {
  if (pendingVoidAction.value) void runAction(pendingVoidAction.value, voidPayload)
}

function close() {
  if (dirty.value) {
    closeConfirmOpen.value = true
    return
  }
  emit('close')
}

function discardClose() {
  closeConfirmOpen.value = false
  emit('close')
}

function saveAndCloseFromDialog() {
  closeConfirmOpen.value = false
  void save(true)
}
</script>

<template>
  <form
    class="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto rounded-2xl bg-white text-slate-950 md:overflow-hidden"
    @submit.prevent="save(false)"
  >
    <div v-if="loading" class="grid min-h-80 flex-1 place-items-center text-sm font-semibold text-slate-500">
      Loading journal...
    </div>

    <div v-else-if="error" class="grid min-h-80 flex-1 place-items-center px-4 text-center">
      <div class="max-w-md space-y-3">
        <p class="text-sm font-semibold text-rose-700">{{ error }}</p>
        <BaseButton type="button" size="sm" variant="secondary" @click="loadEntity">Retry</BaseButton>
      </div>
    </div>

    <template v-else>
      <header class="shrink-0 border-b border-slate-200 bg-white px-3 py-2 lg:px-4">
        <div class="flex min-w-0 flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <div class="min-w-0">
              <h2 class="truncate text-base font-black leading-5 text-slate-950">{{ title }}</h2>
              <p class="truncate text-[11px] font-semibold text-slate-500">Journal {{ numberText }}</p>
            </div>
            <FormStatusBadge v-if="showStatusBadge" :status="status" />
            <span class="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-black uppercase text-slate-600">
              {{ tab.mode }}
            </span>
            <FormDirtyIndicator :dirty="dirty" />
          </div>

          <div class="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              :class="auditOpen ? 'border-sky-200 bg-sky-50 text-sky-800' : ''"
              @click="auditOpen = !auditOpen"
            >
              <FileClock class="h-3.5 w-3.5" />
              Audit
            </button>
            <BaseButton type="button" size="sm" variant="secondary" @click="close">Cancel</BaseButton>
            <BaseButton
              v-for="action in visibleActions"
              :key="action.key"
              type="button"
              size="sm"
              :variant="action.variant ?? 'secondary'"
              :loading="actionLoading === action.key"
              @click="runAction(action)"
            >
              {{ action.label }}
            </BaseButton>
            <BaseButton v-if="canSave" type="button" size="sm" variant="secondary" :loading="saving" @click="save(true)">
              Save & Close
            </BaseButton>
            <BaseButton v-if="canSave" type="submit" size="sm" variant="primary" :loading="saving">Save</BaseButton>
          </div>
        </div>

        <div
          v-if="auditOpen"
          class="mt-2 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:grid-cols-5"
        >
          <div v-for="item in auditItems" :key="item.label" class="min-w-0">
            <p class="font-black uppercase text-slate-400">{{ item.label }}</p>
            <p class="truncate font-semibold text-slate-700">{{ formatDisplayDate(item.value) }}</p>
          </div>
        </div>
      </header>

      <div v-if="serverErrors.length" class="shrink-0 border-b border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 lg:px-4">
        <ul class="flex flex-wrap gap-x-5 gap-y-1">
          <li v-for="message in serverErrors" :key="message" class="list-disc">{{ message }}</li>
        </ul>
      </div>

      <section class="shrink-0 border-b border-slate-200 bg-slate-50/70 px-3 py-2 lg:px-4">
        <div class="grid gap-2 md:grid-cols-3">
          <label class="min-w-0 space-y-1">
            <span class="text-[11px] font-black uppercase text-slate-500">Journal Date</span>
            <DateInput v-model="form.journal_date" compact :readonly="readonly" />
          </label>
          <label class="min-w-0 space-y-1">
            <span class="text-[11px] font-black uppercase text-slate-500">Journal Number</span>
            <input
              v-model="form.journal_number"
              readonly
              class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none"
              placeholder="AUTO"
            >
          </label>
          <label class="min-w-0 space-y-1">
            <span class="text-[11px] font-black uppercase text-slate-500">Reference</span>
            <input
              v-model="form.reference_number"
              :readonly="readonly"
              class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] read-only:bg-slate-50"
              placeholder="Reference"
            >
          </label>
        </div>
      </section>

      <section class="flex min-h-0 flex-1 overflow-hidden bg-white">
        <nav class="flex w-10 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center border-b border-slate-200 transition"
            :class="detailTab === 'lines' ? 'bg-white text-rose-600 shadow-[inset_3px_0_0_#f43f5e]' : 'text-slate-500 hover:bg-white hover:text-slate-800'"
            title="Journal lines"
            @click="detailTab = 'lines'"
          >
            <FileText class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center border-b border-slate-200 transition"
            :class="detailTab === 'memo' ? 'bg-white text-rose-600 shadow-[inset_3px_0_0_#f43f5e]' : 'text-slate-500 hover:bg-white hover:text-slate-800'"
            title="Memo"
            @click="detailTab = 'memo'"
          >
            <Info class="h-4 w-4" />
          </button>
        </nav>

        <div v-show="detailTab === 'lines'" class="min-h-0 flex-1 overflow-auto px-3 py-2 lg:px-4">
          <table class="min-w-[1060px] table-fixed border-collapse border border-slate-200 text-sm">
            <thead class="sticky top-0 z-10 bg-slate-100 text-[11px] uppercase text-slate-600">
              <tr>
                <th class="w-44 border border-slate-200 px-3 py-2 text-left font-black">Account</th>
                <th class="w-[320px] border border-slate-200 px-3 py-2 text-left font-black">Description</th>
                <th class="w-40 border border-slate-200 px-3 py-2 text-right font-black">Debit</th>
                <th class="w-40 border border-slate-200 px-3 py-2 text-right font-black">Credit</th>
                <th class="w-32 border border-slate-200 px-3 py-2 text-left font-black">Dept</th>
                <th class="w-32 border border-slate-200 px-3 py-2 text-left font-black">Project</th>
                <th class="w-16 border border-slate-200 px-3 py-2 text-center font-black">Action</th>
              </tr>
            </thead>
            <tbody class="text-slate-900">
              <tr v-for="(line, index) in form.lines" :key="index" class="group h-9 hover:bg-sky-50/40">
                <td class="border border-slate-200 p-0" @dblclick="openLookup('account', line)">
                  <input
                    :value="lookupDisplay(line, 'account')"
                    :readonly="readonly"
                    class="h-9 w-full border-0 bg-transparent px-3 text-xs font-semibold outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-[#24a1db]/30 read-only:bg-slate-50"
                    placeholder="Account"
                    title="Double click untuk memilih akun"
                    @input="updateLookupText(line, 'account', ($event.target as HTMLInputElement).value)"
                    @dblclick.stop="openLookup('account', line)"
                  >
                </td>
                <td class="border border-slate-200 p-0">
                  <input
                    v-model="line.description"
                    :readonly="readonly"
                    class="h-9 w-full border-0 bg-transparent px-3 text-xs font-semibold outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-[#24a1db]/30 read-only:bg-slate-50"
                    placeholder="Description"
                  >
                </td>
                <td class="border border-slate-200 p-0">
                  <input
                    :value="amountInputValue(line.debit)"
                    :readonly="readonly"
                    type="text"
                    inputmode="numeric"
                    class="h-9 w-full border-0 bg-transparent px-3 text-right text-xs font-semibold tabular-nums outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-[#24a1db]/30 read-only:bg-slate-50"
                    @input="updateAmount(line, 'debit', ($event.target as HTMLInputElement).value)"
                  >
                </td>
                <td class="border border-slate-200 p-0">
                  <input
                    :value="amountInputValue(line.credit)"
                    :readonly="readonly"
                    type="text"
                    inputmode="numeric"
                    class="h-9 w-full border-0 bg-transparent px-3 text-right text-xs font-semibold tabular-nums outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-[#24a1db]/30 read-only:bg-slate-50"
                    @input="updateAmount(line, 'credit', ($event.target as HTMLInputElement).value)"
                  >
                </td>
                <td class="border border-slate-200 p-0" @dblclick="openLookup('department', line)">
                  <input
                    :value="lookupDisplay(line, 'department')"
                    :readonly="readonly"
                    class="h-9 w-full border-0 bg-transparent px-3 text-xs font-semibold outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-[#24a1db]/30 read-only:bg-slate-50"
                    placeholder="Dept"
                    title="Double click untuk memilih department"
                    @input="updateLookupText(line, 'department', ($event.target as HTMLInputElement).value)"
                    @dblclick.stop="openLookup('department', line)"
                  >
                </td>
                <td class="border border-slate-200 p-0" @dblclick="openLookup('project', line)">
                  <input
                    :value="lookupDisplay(line, 'project')"
                    :readonly="readonly"
                    class="h-9 w-full border-0 bg-transparent px-3 text-xs font-semibold outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-[#24a1db]/30 read-only:bg-slate-50"
                    placeholder="Project"
                    title="Double click untuk memilih project"
                    @input="updateLookupText(line, 'project', ($event.target as HTMLInputElement).value)"
                    @dblclick.stop="openLookup('project', line)"
                  >
                </td>
                <td class="border border-slate-200 p-0 text-center">
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-30"
                    :disabled="readonly || form.lines.length <= 2"
                    aria-label="Remove line"
                    @click="removeLine(index)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-show="detailTab === 'memo'" class="min-h-0 flex-1 overflow-auto px-3 py-2 lg:px-4">
          <label class="flex h-full min-h-[180px] flex-col">
            <span class="mb-2 text-xs font-black uppercase text-slate-500">Memo</span>
            <textarea
              v-model="form.memo"
              :readonly="readonly"
              class="min-h-0 flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] read-only:bg-slate-50"
              placeholder="Memo"
            />
          </label>
        </div>
      </section>

      <footer class="shrink-0 border-t border-slate-200 bg-white px-3 py-2 lg:px-4">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            class="inline-flex h-8 w-fit items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
            :disabled="readonly"
            @click="addLine"
          >
            <Plus class="h-3.5 w-3.5" />
            Add line
          </button>

          <div class="grid gap-2 text-xs sm:grid-cols-3 md:min-w-[520px]">
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p class="font-black uppercase text-slate-400">Debit</p>
              <p class="text-right text-base font-black tabular-nums text-slate-950">{{ formatMoney(totalDebit) }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p class="font-black uppercase text-slate-400">Credit</p>
              <p class="text-right text-base font-black tabular-nums text-slate-950">{{ formatMoney(totalCredit) }}</p>
            </div>
            <div
              class="rounded-lg border px-3 py-2"
              :class="journalBalanced ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'"
            >
              <p class="font-black uppercase" :class="journalBalanced ? 'text-emerald-600' : 'text-amber-700'">Difference</p>
              <p class="text-right text-base font-black tabular-nums" :class="journalBalanced ? 'text-emerald-700' : 'text-amber-800'">
                {{ formatMoney(journalDifference) }}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </template>

    <UnsavedChangesDialog
      :open="closeConfirmOpen"
      @close="closeConfirmOpen = false"
      @discard="discardClose"
      @save="saveAndCloseFromDialog"
    />
    <VoidTransactionDialog
      :open="voidDialogOpen"
      :loading="actionLoading === 'void'"
      :transaction-number="numberText"
      @close="voidDialogOpen = false"
      @confirm="confirmVoid"
    />
    <JournalLookupDialog
      :open="lookupOpen"
      :kind="lookupKind"
      @close="lookupOpen = false"
      @select="applyLookup"
    />
  </form>
</template>
