import type { FormContext } from 'vee-validate'

export function useTransactionLines(form: FormContext<Record<string, unknown>>, options?: { field?: string }) {
  const field = options?.field ?? 'lines'
  function ensureAtLeastOneLine() {
    const lines = (form.values[field] ?? []) as unknown
    if (Array.isArray(lines) && lines.length > 0) return
    form.setFieldValue(field, [{}], false)
  }

  return { ensureAtLeastOneLine }
}

