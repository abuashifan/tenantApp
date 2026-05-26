<script setup lang="ts">
import { computed, ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import VoidTransactionDialog from '@/components/dialog/VoidTransactionDialog.vue'
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
import type { RuntimeTransactionFormConfig, TransactionActionConfig } from '@/composables/transaction-form/types'
import { usePermission } from '@/composables/usePermission'
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
const { can } = usePermission()
const voidDialogOpen = ref(false)
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
const displayedStatus = computed(() => tx.status.value || 'Draft')
const visibleLifecycleActions = computed(() =>
  props.config.actions.filter((action) => {
    if (action.key === 'save' || !entityId) return false
    if (!can(action.permission)) return false
    return !action.whenStatusIn || action.whenStatusIn.includes((tx.status.value ?? '').toLowerCase())
  }),
)

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
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <TransactionFormShell :loading="tx.loading.value" :error="tx.error.value" :readonly="tx.isReadonly.value" @close="emit('close')">
      <template #header>
        <TransactionFormHeader :eyebrow="config.moduleKey" :title="formTitle" :subtitle="mode === 'create' ? `Create ${config.title}` : config.title">
          <template #aside>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Form Mode</span>
          </template>
        </TransactionFormHeader>
      </template>

      <template #validation>
        <TransactionValidationSummary />
        <p v-if="actions.actionError.value" class="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{{ actions.actionError.value }}</p>
      </template>

      <div class="grid gap-3 lg:grid-cols-4">
        <TransactionPartnerSelector
          v-if="config.partnerType !== 'none'"
          :partner-type="config.partnerType === 'vendor' ? 'vendor' : 'customer'"
          :name="partnerName"
          :readonly="tx.isReadonly.value"
        />
        <TransactionDateFields
          :date-name="config.dateField"
          :due-date-name="supportsValidUntil ? 'valid_until' : undefined"
          due-date-label="Valid Until"
          :readonly="tx.isReadonly.value"
        />
        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Status</span>
          <span class="flex h-10 w-full items-center rounded-xl border border-slate-200 bg-white px-3 text-sm capitalize text-slate-900">
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

      <div
        v-if="config.hasLines"
        class="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        <TransactionFormSection title="Notes">
          <TransactionNotesPanel :readonly="tx.isReadonly.value" :show-internal-notes="supportsInternalNotes" />
        </TransactionFormSection>

        <TransactionFormSection title="Totals">
          <TransactionTotalsPanel />
        </TransactionFormSection>
      </div>

      <TransactionFormSection v-else title="Notes">
        <TransactionNotesPanel :readonly="tx.isReadonly.value" :show-internal-notes="supportsInternalNotes" />
      </TransactionFormSection>

      <template #actions-right>
        <TransactionActionBar>
          <BaseButton
            v-for="action in visibleLifecycleActions"
            :key="action.key"
            :variant="action.variant ?? 'secondary'"
            size="md"
            type="button"
            :loading="actions.actionLoading.value"
            @click="runLifecycleAction(action)"
          >
            {{ action.label }}
          </BaseButton>
        </TransactionActionBar>
        <BaseButton v-if="!tx.isReadonly.value" variant="primary" size="md" type="submit" :loading="tx.loading.value">Save</BaseButton>
      </template>
    </TransactionFormShell>
    <VoidTransactionDialog
      :open="voidDialogOpen"
      :loading="actions.actionLoading.value"
      :transaction-number="formTitle"
      @close="voidDialogOpen = false"
      @confirm="confirmVoid"
    />
  </form>
</template>
