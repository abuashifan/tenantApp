import { apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

export type ReportResult = Record<string, unknown> & {
  valid?: boolean;
  filter?: Record<string, unknown>;
  totals?: Record<string, unknown>;
  accounts?: Array<Record<string, unknown>>;
  sections?: Array<Record<string, unknown>>;
  lines?: Array<Record<string, unknown>>;
};

export type ReportFilters = Record<string, string | number | boolean | null | undefined>;

export async function getReport(path: string, filters: ReportFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ApiResponse<ReportResult>>(`${path}${suffix}`);
}
