import type { LucideIcon } from 'lucide-react';

export type StoredActiveCompany = {
  id: number;
  name: string;
  code?: string;
  slug?: string;
  user_role?: string;
  tenant_database?: {
    database_name?: string;
  };
};

export type ModuleNavItem = {
  id: string;
  key: string;
  label: string;
  href: string;
  permission?: string | readonly string[];
  description?: string;
};

export type ModuleNavGroup = {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  items: ModuleNavItem[];
};

export type PrimaryTab = {
  id: string;
  label: string;
  href: string;
  moduleId: string;
  closable: boolean;
};

export type SecondaryTab = {
  id: string;
  label: string;
  isList: boolean;
  closable: boolean;
  dirty?: boolean;
};

export type DirtyStateMap = Record<string, boolean>;

export type CloseAllCandidate = {
  primaryTabId: string;
  secondaryTabId: string;
  label: string;
};

export type VirtualTabsState = {
  primaryTabs: PrimaryTab[];
  activePrimaryTabId: string;
  secondaryTabsByPrimary: Record<string, SecondaryTab[]>;
  activeSecondaryTabByPrimary: Record<string, string>;
  dirtyState: DirtyStateMap;
};

export type VirtualTabsContextValue = VirtualTabsState & {
  hasHydrated: boolean;
  activePrimaryTab: PrimaryTab;
  activeSecondaryTabs: SecondaryTab[];
  activeSecondaryTabId: string | null;
  openPrimaryTab: (tab: PrimaryTab) => void;
  closePrimaryTab: (tabId: string) => void;
  selectPrimaryTab: (tabId: string) => void;
  openSecondaryTab: (parentTabId: string, childTab: SecondaryTab) => void;
  closeSecondaryTab: (parentTabId: string, childTabId: string) => void;
  selectSecondaryTab: (parentTabId: string, childTabId: string) => void;
  closeAllTabs: () => void;
  markDirty: (tabId: string, dirty: boolean) => void;
  resetTabs: () => void;
};
