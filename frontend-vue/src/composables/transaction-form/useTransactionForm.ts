import { computed, onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

import type { ApiResponse } from '@/types/api'
import { applyLaravelValidationErrors, toErrorMessage } from '@/composables/transaction-form/useTransactionValidation'
import { useTransactionDraftState } from '@/composables/transaction-form/useTransactionDraftState'
import type { RuntimeTransactionFormConfig, TransactionFormMode } from '@/composables/transaction-form/types'

export function useTransactionForm(options: {
  config: RuntimeTransactionFormConfig
  mode: TransactionFormMode
  secondaryTabId: string
  entityId?: string | number
}) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const status = ref<string | null>(null)

  const form = useForm<Record<string, unknown>>({
    validationSchema: toTypedSchema(options.config.validationSchema),
    initialValues: options.config.makeEmptyValues(),
  })

  const isReadonly = computed(() => options.mode === 'detail')

  const draft = useTransactionDraftState(options.secondaryTabId, form)

  async function load() {
    if (options.mode === 'create') return
    if (options.entityId == null) return
    loading.value = true
    error.value = null
    try {
      const raw = await options.config.apiService.get(options.entityId)
      const res = raw as { data?: ApiResponse<Record<string, unknown>> }
      const data = res.data?.data
      if (data && typeof data === 'object') {
        form.setValues(data, false)
        status.value = String((data as Record<string, unknown>).status ?? '')
      }
    } catch (cause) {
      error.value = toErrorMessage(cause)
    } finally {
      loading.value = false
    }
  }

  async function save() {
    if (isReadonly.value) return
    error.value = null
    const valid = await form.validate()
    if (!valid.valid) return

    loading.value = true
    try {
      const payload = { ...form.values }
      if (options.mode === 'edit' && options.entityId != null) {
        await options.config.apiService.update(options.entityId, payload)
      } else {
        await options.config.apiService.create(payload)
      }
      form.resetForm({ values: form.values })
      draft.clearDraft()
      return true
    } catch (cause) {
      applyLaravelValidationErrors(form, (cause as { errors?: Record<string, string[]> } | null)?.errors)
      error.value = toErrorMessage(cause)
      return false
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return {
    form,
    loading,
    error,
    status,
    isReadonly,
    load,
    save,
  }
}
