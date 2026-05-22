import { apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { BankReconciliation, BankTransfer, CashBankAccount, CashBankFormPayload, CashBankListFilters, CashBankReportSummary, CashInTransaction, CashOutTransaction } from '@/types/cash-bank';

function query(params: CashBankListFilters = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return search.toString() ? `?${search.toString()}` : '';
}

function get<T>(path: string, params: CashBankListFilters = {}) {
  return apiRequest<ApiResponse<T>>(`/cash-bank${path}${query(params)}`);
}

function post<T>(path: string, body?: unknown) {
  return apiRequest<ApiResponse<T>>(`/cash-bank${path}`, { method: 'POST', body });
}

function patch<T>(path: string, body?: unknown) {
  return apiRequest<ApiResponse<T>>(`/cash-bank${path}`, { method: 'PATCH', body });
}

export const getCashBankAccounts = () => get<CashBankAccount[]>('/accounts');
export const getCashInList = (filters: CashBankListFilters = {}) => get<CashInTransaction[]>('/cash-receipts', filters);
export const getCashInDetail = (id: string | number) => get<CashInTransaction>(`/cash-receipts/${id}`);
export const createCashIn = (payload: CashBankFormPayload) => post<CashInTransaction>('/cash-receipts', payload);
export const updateCashIn = (id: string | number, payload: CashBankFormPayload) => patch<CashInTransaction>(`/cash-receipts/${id}`, payload);
export const postCashIn = (id: string | number) => patch<CashInTransaction>(`/cash-receipts/${id}/post`);
export const voidCashIn = (id: string | number, reason?: string) => patch<CashInTransaction>(`/cash-receipts/${id}/void`, { reason });

export const getCashOutList = (filters: CashBankListFilters = {}) => get<CashOutTransaction[]>('/cash-payments', filters);
export const getCashOutDetail = (id: string | number) => get<CashOutTransaction>(`/cash-payments/${id}`);
export const createCashOut = (payload: CashBankFormPayload) => post<CashOutTransaction>('/cash-payments', payload);
export const updateCashOut = (id: string | number, payload: CashBankFormPayload) => patch<CashOutTransaction>(`/cash-payments/${id}`, payload);
export const postCashOut = (id: string | number) => patch<CashOutTransaction>(`/cash-payments/${id}/post`);
export const voidCashOut = (id: string | number, reason?: string) => patch<CashOutTransaction>(`/cash-payments/${id}/void`, { reason });

export const getTransferList = (filters: CashBankListFilters = {}) => get<BankTransfer[]>('/bank-transfers', filters);
export const getTransferDetail = (id: string | number) => get<BankTransfer>(`/bank-transfers/${id}`);
export const createTransfer = (payload: CashBankFormPayload) => post<BankTransfer>('/bank-transfers', payload);
export const updateTransfer = (id: string | number, payload: CashBankFormPayload) => patch<BankTransfer>(`/bank-transfers/${id}`, payload);
export const postTransfer = (id: string | number) => patch<BankTransfer>(`/bank-transfers/${id}/post`);
export const voidTransfer = (id: string | number, reason?: string) => patch<BankTransfer>(`/bank-transfers/${id}/void`, { reason });

export const getReconciliationList = (filters: CashBankListFilters = {}) => get<BankReconciliation[]>('/bank-reconciliations', filters);
export const getReconciliationDetail = (id: string | number) => get<BankReconciliation>(`/bank-reconciliations/${id}`);
export const createReconciliation = (payload: CashBankFormPayload) => post<BankReconciliation>('/bank-reconciliations', payload);
export const refreshReconciliationLines = (id: string | number) => post<BankReconciliation>(`/bank-reconciliations/${id}/refresh-lines`);
export const markReconciliationLines = (id: string | number, lineIds: number[], cleared: boolean) => post<BankReconciliation>(`/bank-reconciliations/${id}/mark-lines`, { line_ids: lineIds, cleared });

export const getCashBankReports = (filters: CashBankListFilters = {}) => get<CashBankReportSummary>('/reports/account-statement', filters);
export const getCashBankSummaryReport = getCashBankReports;
export const getCashBankLedgerReport = getCashBankReports;
export const getCashBankAccountBalances = getCashBankAccounts;
