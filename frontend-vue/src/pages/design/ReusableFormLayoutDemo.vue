<script setup lang="ts">
import { computed } from 'vue'
import { Form as VvForm, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

import FormShell from '@/components/form/FormShell.vue'
import FormHeader from '@/components/form/FormHeader.vue'
import FormSection from '@/components/form/FormSection.vue'
import FormGrid from '@/components/form/FormGrid.vue'
import FormInput from '@/components/form/FormInput.vue'
import FormTextarea from '@/components/form/FormTextarea.vue'
import FormSelect from '@/components/form/FormSelect.vue'
import FormDateInput from '@/components/form/FormDateInput.vue'
import FormMoneyInput from '@/components/form/FormMoneyInput.vue'
import FormActions from '@/components/form/FormActions.vue'
import FormFooter from '@/components/form/FormFooter.vue'
import FormDirtyIndicator from '@/components/form/FormDirtyIndicator.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const schema = toTypedSchema(
  z.object({
    date: z.string().min(1, 'Tanggal wajib diisi'),
    number: z.string().min(1, 'Nomor wajib diisi'),
    reference: z.string().optional().default(''),
    memo: z.string().optional().default(''),
    status: z.enum(['Draft', 'Posted']).default('Draft'),
    amount: z.coerce.number().min(0, 'Amount minimal 0'),
  }),
)

const form = useForm({
  validationSchema: schema,
  initialValues: {
    date: '2026-05-23',
    number: 'JRN.2026.0001',
    reference: '',
    memo: '',
    status: 'Draft',
    amount: 0,
  },
})

const isDirty = computed(() => form.meta.value.dirty)

function notify(message: string) {
  alert(message)
}

function onSubmit(values: unknown) {
  notify(`Submit (placeholder): ${JSON.stringify(values)}`)
  form.resetForm({ values: form.values })
}
</script>

<template>
  <FormShell>
    <VvForm @submit="onSubmit">
      <FormHeader
        title="Reusable Form Layout"
        subtitle="Demo form shell/sections/grid + VeeValidate + Zod pattern."
      >
        <template #meta>
          <div class="mt-3">
            <FormDirtyIndicator :dirty="isDirty" />
          </div>
        </template>

        <template #actions>
          <BaseButton variant="secondary" type="button" @click="form.resetForm()">Reset</BaseButton>
          <BaseButton variant="primary" type="submit">Save</BaseButton>
        </template>
      </FormHeader>

      <div class="grid gap-6 lg:grid-cols-[1fr_0.45fr]">
        <div class="space-y-6">
          <FormSection title="Header" description="Example header fields.">
            <FormGrid :cols="2">
              <FormDateInput name="date" label="Journal Date" />
              <FormInput name="number" label="Journal Number" placeholder="JRN.2026.0001" />
              <FormInput name="reference" label="Reference" placeholder="Optional" />
              <FormSelect
                name="status"
                label="Status"
                :options="[
                  { label: 'Draft', value: 'Draft' },
                  { label: 'Posted', value: 'Posted' },
                ]"
              />
            </FormGrid>

            <div class="mt-4">
              <FormTextarea name="memo" label="Memo" placeholder="Optional memo…" />
            </div>
          </FormSection>
        </div>

        <div class="space-y-6">
          <FormSection title="Summary" description="Example money input.">
            <FormMoneyInput name="amount" label="Amount" placeholder="0" />
          </FormSection>
        </div>
      </div>

      <FormFooter sticky>
        <FormActions>
          <BaseButton variant="secondary" type="button" @click="notify('Cancel (placeholder)')">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" type="submit">Save</BaseButton>
        </FormActions>
      </FormFooter>
    </VvForm>
  </FormShell>
</template>
