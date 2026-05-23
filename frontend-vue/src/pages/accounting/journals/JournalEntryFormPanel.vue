<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

import FormHeader from '@/components/form/FormHeader.vue'
import FormGrid from '@/components/form/FormGrid.vue'
import FormSection from '@/components/form/FormSection.vue'
import FormInput from '@/components/form/FormInput.vue'
import FormTextarea from '@/components/form/FormTextarea.vue'
import FormDateInput from '@/components/form/FormDateInput.vue'
import FormActions from '@/components/form/FormActions.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import TransactionLineTable, { type JournalLine } from '@/components/transaction/TransactionLineTable.vue'
import TransactionBalanceSummary from '@/components/transaction/TransactionBalanceSummary.vue'
import { useWorkspaceDraft } from '@/composables/useWorkspaceDraft'

type JournalDraft = {
  header: {
    date: string
    number: string
    reference: string
    memo: string
  }
  lines: JournalLine[]
}

const accountOptions = [
  { label: '1101 - Cash', value: '1101' },
  { label: '4101 - Sales', value: '4101' },
  { label: '5101 - Office Expense', value: '5101' },
]

const departmentOptions = [
  { label: 'Sales', value: 'sales' },
  { label: 'Finance', value: 'finance' },
]

const projectOptions = [
  { label: 'Project A', value: 'proj-a' },
  { label: 'Project B', value: 'proj-b' },
]

function defaultDraft(): JournalDraft {
  return {
    header: {
      date: '2026-05-23',
      number: 'AUTO',
      reference: '',
      memo: '',
    },
    lines: [
      { accountId: '', description: '', departmentId: '', projectId: '', debit: null, credit: null },
      { accountId: '', description: '', departmentId: '', projectId: '', debit: null, credit: null },
    ],
  }
}

const { draft, setDraft, dirty, setDirty, secondaryTabId } = useWorkspaceDraft<JournalDraft>({
  defaultDraft,
})

const schema = toTypedSchema(
  z.object({
    header: z.object({
      date: z.string().min(1, 'Journal date wajib diisi'),
      number: z.string().min(1, 'Journal number wajib diisi'),
      reference: z.string().optional().default(''),
      memo: z.string().optional().default(''),
    }),
    lines: z
      .array(
        z.object({
          accountId: z.string().min(1, 'Account wajib diisi'),
          description: z.string().optional().default(''),
          departmentId: z.string().optional().default(''),
          projectId: z.string().optional().default(''),
          debit: z.coerce.number().nullable().optional().default(null),
          credit: z.coerce.number().nullable().optional().default(null),
        }),
      )
      .min(1, 'Minimal 1 line'),
  }),
)

const form = useForm<JournalDraft>({
  validationSchema: schema,
  initialValues: draft.value,
})

const hydrating = ref(false)

watch(
  () => secondaryTabId.value,
  () => {
    hydrating.value = true
    form.setValues(draft.value)
    form.resetForm({ values: draft.value })
    setTimeout(() => {
      hydrating.value = false
    }, 0)
  },
  { immediate: true },
)

watch(
  () => form.values,
  (values) => {
    if (hydrating.value) return
    setDraft(values as unknown as JournalDraft)
    setDirty(form.meta.value.dirty)
  },
  { deep: true },
)

const totalDebit = computed(() =>
  (form.values.lines ?? []).reduce((sum, l) => sum + (Number(l.debit) || 0), 0),
)
const totalCredit = computed(() =>
  (form.values.lines ?? []).reduce((sum, l) => sum + (Number(l.credit) || 0), 0),
)
const diff = computed(() => totalDebit.value - totalCredit.value)
const balanced = computed(() => Math.abs(diff.value) < 0.00001)

function saveDraftAction() {
  notify('Save Draft (placeholder)')
  setDirty(false)
}

function cancelAction() {
  notify('Cancel (placeholder)')
}

function submitAction(values: JournalDraft) {
  if (!balanced.value) return
  notify(`Submit/Post (placeholder): ${JSON.stringify(values)}`)
  setDirty(false)
}

const onSubmit = form.handleSubmit((values) => submitAction(values as unknown as JournalDraft))

function notify(message: string) {
  // keep template context typed (avoid globalThis/window in template)
  alert(message)
}
</script>

<template>
  <div class="space-y-6">
    <form @submit.prevent="onSubmit">
      <FormHeader
        title="Input Jurnal Umum"
        subtitle="Isi header jurnal dan baris transaksi. Posting hanya bisa jika debit dan credit balance."
      >
        <template #meta>
          <div class="mt-3 flex items-center gap-2">
            <StatusBadge status="Draft" />
            <span
              class="text-xs font-bold"
              :class="dirty ? 'text-amber-700' : 'text-slate-400'"
            >
              {{ dirty ? 'Unsaved changes' : 'Saved' }}
            </span>
          </div>
        </template>

        <template #actions>
          <BaseButton variant="secondary" type="button" @click="cancelAction">Cancel</BaseButton>
          <BaseButton variant="secondary" type="button" @click="saveDraftAction">Save Draft</BaseButton>
          <BaseButton variant="primary" type="submit" :disabled="!balanced">Post</BaseButton>
        </template>
      </FormHeader>

      <div class="grid gap-6 lg:grid-cols-[1fr_0.45fr]">
        <div class="space-y-6">
          <FormSection title="Journal Header">
            <FormGrid :cols="2">
              <FormDateInput name="header.date" label="Journal Date" />
              <FormInput name="header.number" label="Journal Number" placeholder="AUTO / JRN.2026.0001" />
              <FormInput name="header.reference" label="Reference" placeholder="Optional" />
              <div />
            </FormGrid>

            <div class="mt-4">
              <FormTextarea name="header.memo" label="Memo" placeholder="Optional memo…" />
            </div>
          </FormSection>

          <TransactionLineTable
            name="lines"
            :account-options="accountOptions"
            :department-options="departmentOptions"
            :project-options="projectOptions"
          />
        </div>

        <div class="space-y-6">
          <TransactionBalanceSummary :total-debit="totalDebit" :total-credit="totalCredit" />

          <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-sm font-extrabold text-slate-900">Rules</h2>
            <ul class="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-500">
              <li>Save Draft allowed anytime.</li>
              <li>Post hanya aktif jika balanced.</li>
              <li>Department/Project optional per line.</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="pt-2">
        <FormActions>
          <BaseButton variant="secondary" type="button" @click="cancelAction">Cancel</BaseButton>
          <BaseButton variant="secondary" type="button" @click="saveDraftAction">Save Draft</BaseButton>
          <BaseButton variant="primary" type="submit" :disabled="!balanced">Post</BaseButton>
        </FormActions>
      </div>
    </form>
  </div>
</template>
