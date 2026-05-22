'use client';

import type { ReactNode } from 'react';
import { VirtualTabsProvider } from './VirtualTabsProvider';

export function ClientLayoutProviders({ children }: { children: ReactNode }) {
  return <VirtualTabsProvider>{children}</VirtualTabsProvider>;
}
