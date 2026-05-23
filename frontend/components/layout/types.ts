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
  moduleId?: string;
  moduleKey?: string;
  closable: boolean;
};

export type SecondaryTabMode = 'list' | 'create' | 'edit' | 'detail';

export type SecondaryTab = {
  id: string;
  primaryTabId: string;
  label: string;
  title?: string;
  mode: SecondaryTabMode;
  href?: string;
  entityId?: string | number;
  entityNumber?: string;
  closable: boolean;
  dirty?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type DirtyStateMap = Record<string, boolean>;
export type DraftStateMap = Record<string, unknown>;

export type CloseAllCandidate = {
  primaryTabId: string;
  secondaryTabId: string;
  label: string;
};

export type VirtualTabsState = {
  activePrimaryTabId: string;
  primaryTabs: PrimaryTab[];
  secondaryTabsByPrimaryId: Record<string, SecondaryTab[]>;
  activeSecondaryTabIdByPrimaryId: Record<string, string>;
  draftStateBySecondaryTabId: DraftStateMap;
  dirtyStateBySecondaryTabId: DirtyStateMap;
};

export type OpenSecondaryTabEntity = {
  entityId: string | number;
  entityNumber?: string;
  label?: string;
  href?: string;
};

export type OpenCreateSecondaryTabOptions = {
  label?: string;
  href?: string;
  title?: string;
};

export type VirtualTabsContextValue = VirtualTabsState & {
  hasHydrated: boolean;
  activePrimaryTab: PrimaryTab;
  activeSecondaryTabs: SecondaryTab[];
  activeSecondaryTab: SecondaryTab | null;
  activeSecondaryTabId: string | null;
  openPrimaryTab: (tab: PrimaryTab) => void;
  closePrimaryTab: (tabId: string) => void;
  activatePrimaryTab: (tabId: string) => void;
  selectPrimaryTab: (tabId: string) => void;
  ensureListSecondaryTab: (primaryTabId: string) => SecondaryTab | null;
  openCreateSecondaryTab: (
    primaryTabId: string,
    options?: OpenCreateSecondaryTabOptions,
  ) => SecondaryTab | null;
  openEditSecondaryTab: (
    primaryTabId: string,
    entity: OpenSecondaryTabEntity,
  ) => SecondaryTab | null;
  openDetailSecondaryTab: (
    primaryTabId: string,
    entity: OpenSecondaryTabEntity,
  ) => SecondaryTab | null;
  openCreateFormForCurrentPrimary: (options?: OpenCreateSecondaryTabOptions) => SecondaryTab | null;
  openEditFormForCurrentPrimary: (entity: OpenSecondaryTabEntity) => SecondaryTab | null;
  closeSecondaryTab: (primaryTabId: string, secondaryTabId: string) => void;
  activateSecondaryTab: (primaryTabId: string, secondaryTabId: string) => void;
  selectSecondaryTab: (primaryTabId: string, secondaryTabId: string) => void;
  closeAllTabs: () => void;
  setSecondaryDirty: (secondaryTabId: string, dirty: boolean) => void;
  markDirty: (tabId: string, dirty: boolean) => void;
  updateSecondaryDraftState: (
    secondaryTabId: string,
    next: unknown | ((previous: unknown) => unknown),
  ) => void;
  getActiveSecondaryTab: (primaryTabId: string) => SecondaryTab | null;
  getDraftState: (secondaryTabId: string) => unknown;
  resetTabs: () => void;
};
