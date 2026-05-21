import { apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { JournalEntry, JournalEntryPayload } from '@/types/accounting';

export type JournalFilters = {
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
};

export async function listJournals(filters: JournalFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ApiResponse<JournalEntry[]>>(`/journals${suffix}`);
}

export async function getJournal(id: string | number) {
  return apiRequest<ApiResponse<JournalEntry>>(`/journals/${id}`);
}

export async function createJournal(payload: JournalEntryPayload) {
  return apiRequest<ApiResponse<JournalEntry>>('/journals', {
    method: 'POST',
    body: payload,
  });
}

export async function updateJournal(id: string | number, payload: JournalEntryPayload) {
  return apiRequest<ApiResponse<JournalEntry>>(`/journals/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function approveJournal(id: string | number) {
  return apiRequest<ApiResponse<JournalEntry>>(`/journals/${id}/approve`, {
    method: 'POST',
  });
}

export async function postJournal(id: string | number) {
  return apiRequest<ApiResponse<JournalEntry>>(`/journals/${id}/post`, {
    method: 'POST',
  });
}

export async function voidJournal(id: string | number, reason: string) {
  return apiRequest<ApiResponse<JournalEntry>>(`/journals/${id}/void`, {
    method: 'POST',
    body: { reason },
  });
}
