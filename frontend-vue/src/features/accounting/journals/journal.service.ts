import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'

export type JournalListParams = Record<string, unknown>

export type BackendJournalEntry = {
  id: string | number
  journal_number?: string | null
  journal_date?: string | null
  description?: string | null
  status?: string | null
  total_debit?: string | number | null
  total_credit?: string | number | null
  metadata?: Record<string, unknown> | null
}

export type JournalListRow = {
  id: string
  journal_number: string
  journal_date: string
  memo: string
  total_debit: number
  total_credit: number
  status: string
}

type BackendListPayload<T> = T[] | { data?: T[]; items?: T[] }

function cleanQueryParams(params: JournalListParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

function normalizeList<T>(payload: BackendListPayload<T>) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  return []
}

function toNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function mapJournalEntry(row: BackendJournalEntry): JournalListRow {
  const id = String(row.id)

  return {
    id,
    journal_number: row.journal_number ?? id,
    journal_date: row.journal_date ? row.journal_date.slice(0, 10) : '-',
    memo: row.description ?? '-',
    total_debit: toNumber(row.total_debit ?? row.metadata?.total_debit ?? row.metadata?.total),
    total_credit: toNumber(row.total_credit ?? row.metadata?.total_credit ?? row.metadata?.total),
    status: row.status ?? 'draft',
  }
}

export async function listJournals(params: JournalListParams = {}) {
  const response = await api.get<ApiResponse<BackendListPayload<BackendJournalEntry>>>('/journals', {
    params: cleanQueryParams(params),
  })
  return normalizeList(unwrap(response.data)).map(mapJournalEntry)
}

export async function getJournal(id: string | number) {
  const response = await api.get<ApiResponse<BackendJournalEntry>>(`/journals/${id}`)
  return mapJournalEntry(unwrap(response.data))
}

export async function voidJournal(id: string | number, reason: string) {
  const response = await api.post<ApiResponse<BackendJournalEntry>>(`/journals/${id}/void`, { reason })
  return mapJournalEntry(unwrap(response.data))
}
