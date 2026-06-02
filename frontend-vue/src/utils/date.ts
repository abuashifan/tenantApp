const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DATE_PREFIX_PATTERN = /^(\d{4}-\d{2}-\d{2})(?:[T\s].*)?$/

export const KNOWN_DATE_FIELDS = [
  'document_date',
  'journal_date',
  'posting_date',
  'quotation_date',
  'order_date',
  'delivery_date',
  'invoice_date',
  'bill_date',
  'due_date',
  'receipt_date',
  'payment_date',
  'adjustment_date',
  'opname_date',
  'request_date',
  'needed_date',
  'expected_date',
  'valid_until',
  'start_date',
  'end_date',
  'statement_start_date',
  'statement_end_date',
] as const

function isValidDateParts(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function isValidDateInput(value: string) {
  if (!DATE_INPUT_PATTERN.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  if (year == null || month == null || day == null) return false
  return isValidDateParts(year, month, day)
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function currentMonthDateRange(now = new Date()) {
  const year = now.getFullYear()
  const month = now.getMonth()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return {
    startDate: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    endDate: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
  }
}

export function toDateInputValue(value: unknown): string {
  if (value == null || value === '') return ''

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ''
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
  }

  if (typeof value !== 'string') return ''

  const trimmed = value.trim()
  if (!trimmed) return ''

  const match = trimmed.match(DATE_PREFIX_PATTERN)
  const date = match?.[1] ?? ''
  return isValidDateInput(date) ? date : ''
}

export function formatDisplayDate(value: unknown): string {
  const date = toDateInputValue(value)
  if (!date) return '-'
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function toDateDisplayValue(value: unknown): string {
  const formatted = formatDisplayDate(value)
  return formatted === '-' ? '' : formatted
}

export function parseDateDisplayValue(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''

  const iso = toDateInputValue(trimmed)
  if (iso) return iso

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ''

  const [, day, month, year] = match
  const candidate = `${year}-${month}-${day}`
  return isValidDateInput(candidate) ? candidate : ''
}

export function prepareDateForPayload(value: unknown): string | null {
  return toDateInputValue(value) || null
}

export function normalizeDateFields<T extends Record<string, unknown>>(
  record: T,
  fields: readonly string[],
): T {
  const next: Record<string, unknown> = { ...record }
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(next, field)) {
      next[field] = toDateInputValue(next[field])
    }
  }
  return next as T
}
