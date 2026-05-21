'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { getStoredCompanyId, getStoredToken } from '@/lib/api';
import { fetchAndStorePermissions, hasPermission, type Permission } from '@/lib/permissions';

type AccountingPageGateProps = {
  permission: Permission | readonly Permission[];
  children: ReactNode;
};

export function AccountingPageGate({ permission, children }: AccountingPageGateProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    const companyId = getStoredCompanyId();
    if (!companyId) {
      router.replace('/select-company');
      return;
    }

    fetchAndStorePermissions()
      .then((permissions) => {
        if (!hasPermission(permissions, permission)) {
          setError('You do not have permission to access this accounting page.');
          setAllowed(false);
          return;
        }

        setAllowed(true);
      })
      .catch((event) => {
        setError(event instanceof Error ? event.message : 'Failed to load permissions');
      })
      .finally(() => setLoading(false));
  }, [permission, router]);

  if (loading) return <LoadingState title="Checking access" />;
  if (error) return <ErrorState message={error} />;
  if (!allowed) return null;

  return <>{children}</>;
}
