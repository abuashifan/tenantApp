<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

import BaseButton from '@/components/ui/BaseButton.vue'
import UnsavedChangesDialog from '@/components/dialog/UnsavedChangesDialog.vue'
import VoidTransactionDialog from '@/components/dialog/VoidTransactionDialog.vue'
import FormActionBar from '@/components/form/FormActionBar.vue'
import FormCheckbox from '@/components/form/FormCheckbox.vue'
import FormDateInput from '@/components/form/FormDateInput.vue'
import FormDirtyIndicator from '@/components/form/FormDirtyIndicator.vue'
import FormErrorState from '@/components/form/FormErrorState.vue'
import FormGrid from '@/components/form/FormGrid.vue'
import FormHeader from '@/components/form/FormHeader.vue'
import FormLineItemsTable from '@/components/form/FormLineItemsTable.vue'
import FormLoadingState from '@/components/form/FormLoadingState.vue'
import FormMoneyInput from '@/components/form/FormMoneyInput.vue'
import FormNumberInput from '@/components/form/FormNumberInput.vue'
import FormPageShell from '@/components/form/FormPageShell.vue'
import FormSection from '@/components/form/FormSection.vue'
import FormSelect from '@/components/form/FormSelect.vue'
import FormStatusBadge from '@/components/form/FormStatusBadge.vue'
import FormTextarea from '@/components/form/FormTextarea.vue'
import FormTextInput from '@/components/form/FormTextInput.vue'
import FormValidationSummary from '@/components/form/FormValidationSummary.vue'
import { useWorkspaceDraft } from '@/composables/useWorkspaceDraft'
import { calculateTransactionTotals } from '@/composables/useTransactionLineCalculation'
import InventoryHistoryPanel from '@/features/inventory/history/InventoryHistoryPanel.vue'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceTabsStore, type SecondaryTab } from '@/stores/workspaceTabsStore'
import {
  createBackendResource,
  extractLaravelErrors,
  runBackendResourceAction,
  showBackendResource,
  updateBackendResource,
} from './backendResourceForm.service'
import {
  defaultValues,
  formSchema,
  type FormActionConfig,
  type FormFieldConfig,
  type ResourceFormConfig,
} from './backendResource.form.config'

const props = defineProps<{
  config: ResourceFormConfig
  primaryTabId: string
  tab: SecondaryTab
}>()

const emit = defineEmits<{
  saved: []
  close: []
}>()

const auth = useAuthStore()
const tabs = useWorkspaceTabsStore()

function makeDefaultDraft() {
  return defaultValues(props.config)
}

const { draft, setDraft, dirty, setDirty, secondaryTabId } = useWorkspaceDraft<Record<string, unknown>>({
  defaultDraft: makeDefaultDraft,
  secondaryTabId: computed(() => props.tab.id),
})

const schema = computed(() => toTypedSchema(formSchema(props.config)))
const form = useForm<Record<string, unknown>>({
  validationSchema: schema,
  initialValues: draft.value,
})

const loading = ref(false)
const saving = ref(false)
const actionLoading = ref<string | null>(null)
const error = ref<string | null>(null)
const serverErrors = ref<string[]>([])
const hydrating = ref(false)
const loadedEntityId = ref<string | number | null>(null)
const voidDialogOpen = ref(false)
const pendingVoidAction = ref<FormActionConfig | null>(null)
const closeConfirmOpen = ref(false)

const readonly = computed(() => props.tab.mode === 'detail' || ['posted', 'void', 'voided', 'cancelled', 'closed', 'finalized'].includes(status.value))
const title = computed(() => {
  if (props.tab.mode === 'create') return `Create ${props.config.title}`
  if (props.tab.mode === 'edit') return `Edit ${props.config.title}`
  return `${props.config.title} Detail`
})
const numberText = computed(() => props.config.numberKeys.map((key) => form.values[key]).find((value) => value != null && String(value) !== '') ?? props.tab.entityNumber ?? 'AUTO')
const status = computed(() => String(form.values[props.config.statusKey ?? 'status'] ?? (props.tab.mode === 'create' ? 'draft' : 'draft')).toLowerCase())
const canSave = computed(() => {
  if (readonly.value) return false
  const permission = props.tab.mode === 'edit' ? props.config.editPermission : props.config.createPermission
  if (!permission) return false
  return can(permission)
})
const lineItems = computed<Record<string, unknown>[]>(() => {
  if (!props.config.lineItems) return []
  const raw = form.values[props.config.lineItems.key]
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
})

const totalDebit = computed(() => lineItems.value.reduce((sum, row) => sum + (Number(row.debit) || 0), 0))
const totalCredit = computed(() => lineItems.value.reduce((sum, row) => sum + (Number(row.credit) || 0), 0))
const lineTotal = computed(() =>
  lineItems.value.reduce((sum, row) => {
    const quantity = Number(row.quantity) || 0
    const price = Number(row.unit_price) || Number(row.amount) || 0
    const discount = Number(row.discount_value) || 0
    const taxRate = Number(row.tax_rate) || 0
    const base = Math.max(quantity * price - discount, 0)
    return sum + base + (base * taxRate) / 100
  }, 0),
)
const journalDifference = computed(() => totalDebit.value - totalCredit.value)
const journalBalanced = computed(() => Math.abs(journalDifference.value) < 0.01)
const isJournal = computed(() => props.config.endpoint === '/journals')
const internalTab = ref<'detail' | 'history'>('detail')
const isProductDetail = computed(() =>
  props.tab.mode === 'detail'
  && props.config.endpoint === '/master-data/products',
)
const inventoryHistoryEnabled = computed(() => Boolean(form.values.is_stock_item))
const inventoryEntityName = computed(() => String(form.values.product_name ?? numberText.value))
const canViewInventoryHistory = computed(() => can('inventory.reports.view'))
const showFooterActions = computed(() => !isProductDetail.value)
const showHeaderActions = computed(() => !showFooterActions.value)
const showSummary = computed(() => !isProductDetail.value && Boolean(props.config.lineItems))

function can(permission: string) {
  return auth.permissions.includes('*') || auth.permissions.includes(permission)
}

function visibleAction(action: FormActionConfig) {
  if (!props.tab.entityId || !can(action.permission)) return false
  if (action.visibleStatuses?.length && !action.visibleStatuses.includes(status.value)) return false
  return true
}

function fieldReadonly(field: FormFieldConfig) {
  return readonly.value || Boolean(field.readonly)
}

function activateInternalTab(tab: 'detail' | 'history') {
  if (tab === 'history' && (!inventoryHistoryEnabled.value || !canViewInventoryHistory.value)) return
  internalTab.value = tab
}

function hydrate(values: Record<string, unknown>, markDirty = false) {
  hydrating.value = true
  form.resetForm({ values })
  setDraft(values)
  setDirty(markDirty)
  setTimeout(() => {
    hydrating.value = false
  }, 0)
}

async function loadEntity() {
  const hasDraft = tabs.draftStateBySecondaryTabId[props.tab.id] != null
  if (props.tab.mode === 'create' || !props.tab.entityId) {
    hydrate({ ...makeDefaultDraft(), ...draft.value }, props.tab.dirty)
    return
  }
  if (props.config.hasShow === false) {
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
    const entity = await showBackendResource(props.config.endpoint, props.tab.entityId)
    hydrate({ ...makeDefaultDraft(), ...entity })
    loadedEntityId.value = props.tab.entityId
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Endpoint belum tersedia'
  } finally {
    loading.value = false
  }
}

watch(
  () => secondaryTabId.value,
  () => {
    internalTab.value = 'detail'
    serverErrors.value = []
    loadedEntityId.value = null
    void loadEntity()
  },
  { immediate: true },
)

watch(
  () => form.values,
  (values) => {
    if (hydrating.value) return
    setDraft(values)
    setDirty(form.meta.value.dirty)
  },
  { deep: true },
)

watch(
  () => form.meta.value.dirty,
  (value) => {
    if (!hydrating.value) setDirty(value)
  },
)

function addLine() {
  if (!props.config.lineItems) return
  form.setFieldValue(props.config.lineItems.key, [...lineItems.value, { ...props.config.lineItems.defaultRow }])
}

function removeLine(index: number) {
  if (!props.config.lineItems) return
  const next = lineItems.value.filter((_, current) => current !== index)
  form.setFieldValue(props.config.lineItems.key, next)
}

function payload(values: Record<string, unknown>) {
  const result: Record<string, unknown> = { ...values }
  if (props.config.endpoint === '/master-data/contacts') {
    const contactType = String(result.contact_type ?? 'other')
    result.is_customer = contactType === 'customer'
    result.is_supplier = contactType === 'supplier'
    result.is_employee = contactType === 'employee'
  }
  if (props.config.lineItems) {
    const firstLine = lineItems.value.find((line) => Object.keys(line).length > 0) ?? {}
    const priceField = 'estimated_unit_price' in firstLine ? 'estimated_unit_price' : 'amount' in firstLine && !('unit_price' in firstLine) ? 'amount' : 'unit_price'
    const totals = calculateTransactionTotals(lineItems.value, {
      priceField,
      headerDiscountType: result.header_discount_type,
      headerDiscountValue: result.header_discount_value,
      taxIncluded: result.tax_included,
    })
    result[props.config.lineItems.key] = totals.lines.map((line) => ({
      ...line,
      product_id: line.product_id === '' ? null : line.product_id,
      unit_id: line.unit_id === '' ? null : line.unit_id,
      warehouse_id: line.warehouse_id === '' ? null : line.warehouse_id,
      department_id: line.department_id === '' ? null : line.department_id,
      project_id: line.project_id === '' ? null : line.project_id,
    }))
    result.subtotal_before_discount = totals.subtotal_before_discount
    result.line_discount_total = totals.line_discount_total
    result.header_discount_amount = totals.header_discount_amount
    result.subtotal_after_discount = totals.subtotal_after_discount
    result.tax_total = totals.tax_total
    result.grand_total = totals.grand_total
  }
  return result
}

async function save(closeAfter = false) {
  serverErrors.value = []
  error.value = null
  if (isJournal.value && !journalBalanced.value) {
    serverErrors.value = ['Journal total debit and credit must be balanced before posting or saving.']
    return
  }
  const valid = await form.validate()
  if (!valid.valid) {
    serverErrors.value = Object.values(valid.errors).map(String)
    return
  }
  saving.value = true
  try {
    const values = payload(form.values)
    const saved = props.tab.mode === 'edit' && props.tab.entityId
      ? await updateBackendResource(props.config.endpoint, props.tab.entityId, values)
      : await createBackendResource(props.config.endpoint, values)
    hydrate({ ...makeDefaultDraft(), ...saved })
    tabs.setSecondaryDirty(props.tab.id, false)
    emit('saved')
    if (closeAfter) emit('close')
  } catch (reason) {
    const normalized = extractLaravelErrors(reason)
    serverErrors.value = normalized.messages
    for (const [key, messages] of Object.entries(normalized.fieldErrors)) {
      form.setFieldError(key, messages.join(', '))
    }
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
  if (isJournal.value && action.key === 'post' && !journalBalanced.value) {
    serverErrors.value = ['Journal total debit and credit must be balanced before posting.']
    return
  }
  actionLoading.value = action.key
  serverErrors.value = []
  try {
    await runBackendResourceAction(
      props.config.endpoint,
      props.tab.entityId,
      action.endpointSuffix,
      action.method ?? 'patch',
      actionPayload ?? action.payload ?? {},
    )
    await loadEntity()
    emit('saved')
    voidDialogOpen.value = false
  } catch (reason) {
    serverErrors.value = extractLaravelErrors(reason).messages
  } finally {
    actionLoading.value = null
  }
}

function confirmVoid(payload: { reason: string }) {
  if (pendingVoidAction.value) void runAction(pendingVoidAction.value, payload)
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
  <FormPageShell>
    <FormLoadingState v-if="loading" />
    <FormErrorState v-else-if="error" :message="error" @retry="loadEntity" />
    <form v-else class="space-y-5" @submit.prevent="save(false)">
      <FormHeader :title="title" :subtitle="`Document ${numberText}`">
        <template #meta>
          <div v-if="!isProductDetail" class="mt-3 flex flex-wrap items-center gap-2">
            <FormStatusBadge :status="status" />
            <span class="rounded-xl bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{{ tab.mode }}</span>
            <FormDirtyIndicator :dirty="dirty" />
          </div>
        </template>
        <template v-if="showHeaderActions" #actions>
          <BaseButton variant="secondary" type="button" @click="close">Cancel</BaseButton>
          <BaseButton v-if="canSave" variant="secondary" type="button" :loading="saving" @click="save(true)">Save & Close</BaseButton>
          <BaseButton v-if="canSave" variant="primary" type="submit" :loading="saving">Save</BaseButton>
        </template>
      </FormHeader>

      <FormValidationSummary :errors="serverErrors" />

      <nav v-if="isProductDetail" class="flex items-end gap-1 border-b border-slate-200 pt-1">
        <button
          type="button"
          class="h-11 rounded-t-xl border px-5 text-sm font-semibold transition"
          :class="internalTab === 'detail' ? 'relative z-10 -mb-px border-rose-400 border-b-white bg-white text-slate-950 shadow-[0_-3px_10px_rgba(244,63,94,0.1)]' : 'border-slate-200/70 bg-white/40 text-slate-500 hover:bg-slate-50'"
          @click="activateInternalTab('detail')"
        >
          Detail
        </button>
        <button
          type="button"
          class="h-11 rounded-t-xl border px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          :class="internalTab === 'history' ? 'relative z-10 -mb-px border-rose-400 border-b-white bg-white text-slate-950 shadow-[0_-3px_10px_rgba(244,63,94,0.1)]' : 'border-slate-200/70 bg-white/40 text-slate-500 hover:bg-slate-50'"
          :disabled="!inventoryHistoryEnabled || !canViewInventoryHistory"
          :title="!canViewInventoryHistory ? 'Permission inventory.reports.view diperlukan.' : !inventoryHistoryEnabled ? 'History tersedia untuk stock item.' : ''"
          @click="activateInternalTab('history')"
        >
          History Persediaan
        </button>
      </nav>

      <div v-show="!isProductDetail || internalTab === 'detail'" class="space-y-5">
        <FormSection
          v-for="section in config.sections"
          :key="section.title"
          :title="section.title"
          :description="section.description"
          :plain="/header/i.test(section.title)"
        >
          <FormGrid :cols="2">
            <template v-for="field in section.fields" :key="field.key">
              <FormTextarea
                v-if="field.kind === 'textarea'"
                :name="field.key"
                :label="field.label"
                :placeholder="field.placeholder"
                :disabled="fieldReadonly(field)"
              />
              <FormDateInput
                v-else-if="field.kind === 'date'"
                :name="field.key"
                :label="field.label"
                :disabled="fieldReadonly(field)"
              />
              <FormNumberInput
                v-else-if="field.kind === 'number'"
                :name="field.key"
                :label="field.label"
                :placeholder="field.placeholder"
                :disabled="fieldReadonly(field)"
              />
              <FormMoneyInput
                v-else-if="field.kind === 'money'"
                :name="field.key"
                :label="field.label"
                :placeholder="field.placeholder"
                :disabled="fieldReadonly(field)"
              />
              <FormSelect
                v-else-if="field.kind === 'select'"
                :name="field.key"
                :label="field.label"
                :options="field.options ?? []"
                :disabled="fieldReadonly(field)"
              />
              <FormCheckbox
                v-else-if="field.kind === 'checkbox'"
                :name="field.key"
                :label="field.label"
                :disabled="fieldReadonly(field)"
              />
              <FormTextInput
                v-else
                :name="field.key"
                :label="field.label"
                :placeholder="field.placeholder"
                :readonly="fieldReadonly(field)"
              />
            </template>
          </FormGrid>
        </FormSection>

        <FormSection
          v-if="config.lineItems"
          :title="config.lineItems.title"
          :description="config.lineItems.description"
        >
          <FormLineItemsTable
            :name="config.lineItems.key"
            :rows="lineItems"
            :columns="config.lineItems.columns"
            :readonly="readonly"
            @add="addLine"
            @remove="removeLine"
          />
        </FormSection>

        <FormSection v-if="showSummary" title="Summary">
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-black uppercase text-slate-500">Line Total</p>
              <p class="mt-1 text-xl font-black tabular-nums text-slate-950">{{ new Intl.NumberFormat('id-ID').format(lineTotal) }}</p>
            </div>
            <div v-if="isJournal" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-black uppercase text-slate-500">Debit / Credit</p>
              <p class="mt-1 text-xl font-black tabular-nums text-slate-950">
                {{ new Intl.NumberFormat('id-ID').format(totalDebit) }} / {{ new Intl.NumberFormat('id-ID').format(totalCredit) }}
              </p>
            </div>
            <div v-if="isJournal" class="rounded-2xl border p-4" :class="journalBalanced ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'">
              <p class="text-xs font-black uppercase" :class="journalBalanced ? 'text-emerald-700' : 'text-amber-700'">Difference</p>
              <p class="mt-1 text-xl font-black tabular-nums text-slate-950">{{ new Intl.NumberFormat('id-ID').format(journalDifference) }}</p>
            </div>
          </div>
        </FormSection>

        <FormSection v-if="tab.mode !== 'create' && !isProductDetail" title="Audit / Status">
          <div class="grid gap-3 text-sm sm:grid-cols-3">
            <div v-for="key in ['created_at', 'updated_at', 'approved_at', 'posted_at', 'voided_at']" :key="key" class="rounded-2xl bg-slate-50 p-3">
              <p class="text-xs font-black uppercase text-slate-500">{{ key.replaceAll('_', ' ') }}</p>
              <p class="mt-1 font-bold text-slate-700">{{ form.values[key] || '-' }}</p>
            </div>
          </div>
        </FormSection>

        <FormActionBar v-if="showFooterActions">
          <BaseButton variant="secondary" type="button" @click="close">Cancel</BaseButton>
          <BaseButton
            v-for="action in config.actions.filter(visibleAction)"
            :key="action.key"
            :variant="action.variant ?? 'secondary'"
            type="button"
            :loading="actionLoading === action.key"
            @click="runAction(action)"
          >
            {{ action.label }}
          </BaseButton>
          <BaseButton v-if="canSave" variant="secondary" type="button" :loading="saving" @click="save(true)">Save & Close</BaseButton>
          <BaseButton v-if="canSave" variant="primary" type="submit" :loading="saving">Save</BaseButton>
        </FormActionBar>
      </div>

      <InventoryHistoryPanel
        v-if="isProductDetail && internalTab === 'history' && inventoryHistoryEnabled && canViewInventoryHistory && tab.entityId"
        :entity-id="tab.entityId"
        :entity-name="inventoryEntityName"
      />
    </form>
    <VoidTransactionDialog
      :open="voidDialogOpen"
      :loading="actionLoading === 'void'"
      :transaction-number="String(numberText)"
      @close="voidDialogOpen = false"
      @confirm="confirmVoid"
    />
    <UnsavedChangesDialog
      :open="closeConfirmOpen"
      @close="closeConfirmOpen = false"
      @discard="discardClose"
      @save="saveAndCloseFromDialog"
    />
  </FormPageShell>
</template>
