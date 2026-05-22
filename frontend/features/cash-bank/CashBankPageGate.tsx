'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { getStoredCompanyId, getStoredToken } from '@/lib/api';
import { fetchAndStorePermissions, hasPermission } from '@/lib/permissions';

export function CashBankPageGate({ permission, children }: { permission: string | readonly string[]; children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getStoredToken()) {
      router.replace('/login');
      return;
    }
    if (!getStoredCompanyId()) {
      router.replace('/select-company');
      return;
    }
    fetchAndStorePermissions()
      .then((permissions) => {
        if (!hasPermission(permissions, permission)) {
          setError('You do not have permission to access this cash bank page.');
          return;
        }
        setAllowed(true);
      })
      .catch((event) => setError(event instanceof Error ? event.message : 'Failed to load permissions'))
      .finally(() => setLoading(false));
  }, [permission, router]);

  if (loading) return <LoadingState title="Checking cash bank access" />;
  if (error) return <ErrorState message={error} />;
  if (!allowed) return null;

  return <>{children}</>;
}
