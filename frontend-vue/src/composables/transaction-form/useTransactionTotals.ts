import { computed, watch } from 'vue'
import type { FormContext } from 'vee-validate'

import {
  calculateTransactionTotals,
  toTransactionNumber,
  type TransactionCalculationLine,
} from '@/composables/useTransactionLineCalculation'

export function useTransactionTotals(
  form: FormContext<Record<string, unknown>>,
  options?: { linesField?: string; priceField?: 'unit_price' | 'estimated_unit_price' | 'amount' },
) {
  const linesField = options?.linesField ?? 'lines'
  const priceField = options?.priceField ?? 'unit_price'

  const lines = computed(() =>
    Array.isArray(form.values[linesField]) ? (form.values[linesField] as TransactionCalculationLine[]) : [],
  )

  watch(
    () => ({
      lines: lines.value,
      headerDiscountType: form.values.header_discount_type,
      headerDiscountValue: form.values.header_discount_value,
      taxIncluded: form.values.tax_included,
    }),
    ({ lines: currentLines, headerDiscountType, headerDiscountValue, taxIncluded }) => {
      const totals = calculateTransactionTotals(currentLines, {
        priceField,
        headerDiscountType,
        headerDiscountValue,
        taxIncluded,
      })

      const nextLineSignature = JSON.stringify(totals.lines.map(({ line_total, discount_type, discount_value, discount_amount, tax_rate, tax_amount, gross_amount, subtotal_after_discount }) => ({
        line_total,
        discount_type,
        discount_value,
        discount_amount,
        tax_rate,
        tax_amount,
        gross_amount,
        subtotal_after_discount,
      })))
      const currentLineSignature = JSON.stringify(currentLines.map(({ line_total, discount_type, discount_value, discount_amount, tax_rate, tax_amount, gross_amount, subtotal_after_discount }) => ({
        line_total,
        discount_type,
        discount_value,
        discount_amount,
        tax_rate,
        tax_amount,
        gross_amount,
        subtotal_after_discount,
      })))

      if (nextLineSignature !== currentLineSignature) form.setFieldValue(linesField, totals.lines, false)

      form.setFieldValue('subtotal', totals.subtotal_before_discount, false)
      form.setFieldValue('subtotal_before_discount', totals.subtotal_before_discount, false)
      form.setFieldValue('discount_amount', totals.line_discount_total + totals.header_discount_amount, false)
      form.setFieldValue('line_discount_total', totals.line_discount_total, false)
      form.setFieldValue('header_discount_amount', totals.header_discount_amount, false)
      form.setFieldValue('subtotal_after_discount', totals.subtotal_after_discount, false)
      form.setFieldValue('tax_amount', totals.tax_total, false)
      form.setFieldValue('tax_total', totals.tax_total, false)
      form.setFieldValue('grand_total', totals.grand_total, false)
    },
    { deep: true, immediate: true },
  )

  return {
    lines,
    toTransactionNumber,
  }
}
