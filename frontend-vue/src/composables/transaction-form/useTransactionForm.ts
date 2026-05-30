import { computed, onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

import type { ApiResponse } from '@/types/api'
import { applyLaravelValidationErrors, toErrorMessage } from '@/composables/transaction-form/useTransactionValidation'
import { useTransactionDraftState } from '@/composables/transaction-form/useTransactionDraftState'
import { calculateTransactionTotals } from '@/composables/useTransactionLineCalculation'
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

  function normalizeLineValue(value: unknown) {
    return value === '' || value === undefined ? null : value
  }

  function makePayload() {
    const payload = { ...form.values }
    const priceField = options.config.lineProduct?.priceField ?? 'unit_price'

    if (Array.isArray(payload.lines)) {
      const totals = calculateTransactionTotals(payload.lines as Record<string, unknown>[], {
        priceField,
        headerDiscountType: payload.header_discount_type,
        headerDiscountValue: payload.header_discount_value,
        taxIncluded: payload.tax_included,
      })

      payload.lines = totals.lines.map((line) => ({
        ...line,
        product_id: normalizeLineValue(line.product_id),
        unit_id: normalizeLineValue(line.unit_id),
        warehouse_id: normalizeLineValue(line.warehouse_id),
        department_id: normalizeLineValue(line.department_id),
        project_id: normalizeLineValue(line.project_id),
        discount_type: line.discount_type || (Number(line.discount_value ?? 0) > 0 ? 'fixed_amount' : null),
      }))
      payload.subtotal = totals.subtotal_before_discount
      payload.subtotal_before_discount = totals.subtotal_before_discount
      payload.line_discount_total = totals.line_discount_total
      payload.header_discount_amount = totals.header_discount_amount
      payload.subtotal_after_discount = totals.subtotal_after_discount
      payload.discount_amount = totals.line_discount_total + totals.header_discount_amount
      payload.tax_amount = totals.tax_total
      payload.tax_total = totals.tax_total
      payload.grand_total = totals.grand_total
    }

    return payload
  }

  async function load() {
    if (options.mode === 'create') return
    if (options.entityId == null) return
    if (options.mode !== 'detail' && draft.hasDraft()) return
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
      const payload = makePayload()
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
