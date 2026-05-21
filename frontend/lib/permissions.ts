import { apiRequest, getStoredCompanyId, getStoredToken } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { PermissionPayload } from '@/types/accounting';

export type Permission = string;

export const ACCOUNTING_NAV_ITEMS = [
  {
    label: 'Chart of Accounts',
    href: '/accounting/chart-of-accounts',
    permission: 'coa.view',
  },
  {
    label: 'Master Data',
    href: '/accounting/master-data',
    permission: 'master_data.view',
  },
  {
    label: 'Journal Entries',
    href: '/accounting/journals',
    permission: 'journal.view',
  },
  {
    label: 'General Ledger',
    href: '/accounting/reports/general-ledger',
    permission: 'reports.view',
  },
  {
    label: 'Trial Balance',
    href: '/accounting/reports/trial-balance',
    permission: 'reports.view',
  },
  {
    label: 'Financial Statements',
    href: '/accounting/reports/financial-statements',
    permission: 'reports.view',
  },
  {
    label: 'Fiscal Closing',
    href: '/accounting/fiscal-closing',
    permission: 'fiscal_year.view',
  },
] as const;

export function hasPermission(
  permissions: readonly Permission[] | null | undefined,
  permission: Permission | readonly Permission[],
): boolean {
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes('*')) return true;

  const required = Array.isArray(permission) ? permission : [permission];

  return required.some((item) => permissions.includes(item));
}

export function getStoredPermissions(): Permission[] {
  if (typeof window === 'undefined') return [];

  const raw = localStorage.getItem('auth_permissions');
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is Permission => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function storePermissions(permissions: Permission[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_permissions', JSON.stringify(permissions));
}

export async function fetchAndStorePermissions(): Promise<Permission[]> {
  const token = getStoredToken();
  const companyId = getStoredCompanyId();

  if (!token || !companyId) return getStoredPermissions();

  const res = await apiRequest<ApiResponse<PermissionPayload>>('/auth/permissions', {
    token,
    companyId,
  });
  const permissions = res.data.permissions ?? [];
  storePermissions(permissions);

  return permissions;
}
