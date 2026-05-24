import { computed, watchEffect } from 'vue'
import type { FormContext } from 'vee-validate'

type Line = {
  quantity?: number | string | null
  unit_price?: number | string | null
  discount_amount?: number | string | null
  tax_amount?: number | string | null
  line_total?: number | string | null
}

function toNum(value: unknown) {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : 0
  return Number.isFinite(n) ? n : 0
}

export function useTransactionTotals(form: FormContext<Record<string, unknown>>, options?: { linesField?: string }) {
  const linesField = options?.linesField ?? 'lines'

  const lines = computed(() => (Array.isArray(form.values[linesField]) ? (form.values[linesField] as Line[]) : []))

  watchEffect(() => {
    const nextLines = lines.value.map((l) => {
      const qty = toNum(l.quantity)
      const price = toNum(l.unit_price)
      const discount = toNum(l.discount_amount)
      const tax = toNum(l.tax_amount)
      const total = qty * price - discount + tax
      return { ...l, line_total: total }
    })

    // set line totals without triggering validation
    form.setFieldValue(linesField, nextLines, false)

    const subtotal = nextLines.reduce((sum, l) => sum + toNum(l.quantity) * toNum(l.unit_price), 0)
    const discountTotal = nextLines.reduce((sum, l) => sum + toNum(l.discount_amount), 0)
    const taxTotal = nextLines.reduce((sum, l) => sum + toNum(l.tax_amount), 0)
    const grandTotal = subtotal - discountTotal + taxTotal

    form.setFieldValue('subtotal', subtotal, false)
    form.setFieldValue('discount_amount', discountTotal, false)
    form.setFieldValue('tax_amount', taxTotal, false)
    form.setFieldValue('grand_total', grandTotal, false)
  })

  return {
    lines,
  }
}

