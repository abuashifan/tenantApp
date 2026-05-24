<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import TransactionDateFields from '@/components/transaction-form/TransactionDateFields.vue'
import TransactionFormHeader from '@/components/transaction-form/TransactionFormHeader.vue'
import TransactionFormSection from '@/components/transaction-form/TransactionFormSection.vue'
import TransactionFormShell from '@/components/transaction-form/TransactionFormShell.vue'
import TransactionLineTable from '@/components/transaction-form/TransactionLineTable.vue'
import TransactionNotesPanel from '@/components/transaction-form/TransactionNotesPanel.vue'
import TransactionPartnerSelector from '@/components/transaction-form/TransactionPartnerSelector.vue'
import TransactionStatusBanner from '@/components/transaction-form/TransactionStatusBanner.vue'
import TransactionTotalsPanel from '@/components/transaction-form/TransactionTotalsPanel.vue'
import TransactionValidationSummary from '@/components/transaction-form/TransactionValidationSummary.vue'

import { useTransactionForm } from '@/composables/transaction-form/useTransactionForm'
import { useTransactionTotals } from '@/composables/transaction-form/useTransactionTotals'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'
import type { SecondaryTab } from '@/stores/workspaceTabsStore'

const props = defineProps<{
  config: TransactionFormConfig<any>
  tab: SecondaryTab | null
}>()

const emit = defineEmits<{
  close: []
}>()

const mode = (props.tab?.mode ?? 'detail') as 'create' | 'edit' | 'detail'
const entityId = props.tab?.entityId
const secondaryTabId = props.tab?.id ?? ''

const tx = useTransactionForm({ config: props.config, mode, entityId, secondaryTabId })
useTransactionTotals(tx.form as any)

const partnerName =
  props.config.partnerField ?? (props.config.partnerType === 'vendor' ? 'vendor_id' : props.config.partnerType === 'customer' ? 'customer_id' : '')

async function onSubmit() {
  await tx.save()
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <TransactionFormShell :loading="tx.loading.value" :error="tx.error.value" :readonly="tx.isReadonly.value" @close="emit('close')">
      <template #header>
        <TransactionFormHeader :eyebrow="config.moduleKey" :title="config.title" :subtitle="mode" />
      </template>

      <template #status>
        <TransactionStatusBanner :status="tx.status.value" />
      </template>

      <template #validation>
        <TransactionValidationSummary />
      </template>

      <TransactionFormSection title="Header">
        <div class="grid gap-3 lg:grid-cols-3">
          <TransactionPartnerSelector
            v-if="config.partnerType !== 'none'"
            :partner-type="config.partnerType === 'vendor' ? 'vendor' : 'customer'"
            :name="partnerName"
            :readonly="tx.isReadonly.value"
          />
          <TransactionDateFields :date-name="config.dateField" :readonly="tx.isReadonly.value" />
        </div>
      </TransactionFormSection>

      <TransactionLineTable v-if="config.hasLines" name="lines" :readonly="tx.isReadonly.value" />

      <TransactionFormSection title="Totals">
        <TransactionTotalsPanel />
      </TransactionFormSection>

      <TransactionFormSection title="Notes">
        <TransactionNotesPanel :readonly="tx.isReadonly.value" />
      </TransactionFormSection>

      <template #actions-right>
        <BaseButton v-if="!tx.isReadonly.value" variant="primary" size="md" type="submit" :loading="tx.loading.value">Save</BaseButton>
      </template>
    </TransactionFormShell>
  </form>
</template>
