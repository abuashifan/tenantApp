import type { ApiError } from '@/types/api'
import { formatDisplayDate } from '@/utils/date'

export type LedgerMovement = {
  date: string | null
  document_type: string
  document_id: number
  document_number?: string | null
  description?: string | null
  debit: number
  credit: number
  balance: number
  source_type?: string
  source_id?: number
  customer_name?: string | null
  vendor_name?: string | null
}

export function formatDate(value?: string | null) {
  return formatDisplayDate(value)
}

export function formatMoney(value?: number | null) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

export function documentLabel(value?: string | null) {
  if (!value) return '-'
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function flattenErrors(errors?: Record<string, string[]>) {
  if (!errors) return []
  return Object.entries(errors).flatMap(([field, messages]) => messages.map((message) => `${field}: ${message}`))
}

export function errorText(reason: unknown) {
  const apiError = reason as Partial<ApiError>
  const lines = flattenErrors(apiError.errors)
  if (lines.length > 0) return lines.join(' ')
  if (typeof apiError.message === 'string') return apiError.message
  return reason instanceof Error ? reason.message : 'Request failed.'
}

export function ledgerTotals(rows: LedgerMovement[], balanceMode: 'debit-minus-credit' | 'credit-minus-debit') {
  const debit = rows.reduce((sum, row) => sum + Number(row.debit ?? 0), 0)
  const credit = rows.reduce((sum, row) => sum + Number(row.credit ?? 0), 0)

  return {
    opening: 0,
    debit,
    credit,
    ending: rows.at(-1)?.balance ?? (balanceMode === 'debit-minus-credit' ? debit - credit : credit - debit),
  }
}
