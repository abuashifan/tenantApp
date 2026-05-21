'use client';

import type { ReactNode } from 'react';
import { getStoredPermissions, hasPermission } from '@/lib/permissions';

type PermissionGuardProps = {
  permission: string | readonly string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const permissions = getStoredPermissions();

  if (!hasPermission(permissions, permission)) return fallback;

  return <>{children}</>;
}
