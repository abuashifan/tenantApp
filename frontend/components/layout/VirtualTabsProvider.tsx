'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createDashboardTab, getListTabLabel } from './navigation';
import type {
  DirtyStateMap,
  DraftStateMap,
  OpenCreateSecondaryTabOptions,
  OpenSecondaryTabEntity,
  PrimaryTab,
  SecondaryTab,
  VirtualTabsContextValue,
  VirtualTabsState,
} from './types';

export const virtualTabsStorageKey = 'tenantApp.virtualTabs';

const dashboardTab = createDashboardTab();

const defaultVirtualTabsState: VirtualTabsState = {
  activePrimaryTabId: dashboardTab.id,
  primaryTabs: [dashboardTab],
  secondaryTabsByPrimaryId: {},
  activeSecondaryTabIdByPrimaryId: {},
  draftStateBySecondaryTabId: {},
  dirtyStateBySecondaryTabId: {},
};

const VirtualTabsContext = createContext<VirtualTabsContextValue | null>(null);

function now() {
  return Date.now();
}

function getStoredCompanyKey() {
  if (typeof window === 'undefined') return 'none';
  return localStorage.getItem('active_company_id') ?? 'none';
}

export function getVirtualTabsStorageKey(companyId = getStoredCompanyKey()) {
  return `${virtualTabsStorageKey}.${companyId}`;
}

function createListSecondaryTab(primaryTab: PrimaryTab): SecondaryTab {
  const timestamp = now();
  return {
    id: `${primaryTab.id}::list`,
    primaryTabId: primaryTab.id,
    label: getListTabLabel(primaryTab.label),
    title: getListTabLabel(primaryTab.label),
    mode: 'list',
    href: primaryTab.href,
    closable: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createCreateSecondaryTab(
  primaryTab: PrimaryTab,
  existingTabs: SecondaryTab[],
  options?: OpenCreateSecondaryTabOptions,
): SecondaryTab {
  const timestamp = now();
  const createCount = existingTabs.filter((tab) => tab.mode === 'create').length + 1;
  const label = options?.label ?? (createCount === 1 ? 'Data Baru' : `Data Baru ${createCount}`);
  return {
    id: `${primaryTab.id}::create::${timestamp}`,
    primaryTabId: primaryTab.id,
    label,
    title: options?.title ?? label,
    mode: 'create',
    href: options?.href ?? `${primaryTab.href}/new`,
    closable: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createEntitySecondaryTab(
  primaryTab: PrimaryTab,
  mode: 'edit' | 'detail',
  entity: OpenSecondaryTabEntity,
): SecondaryTab {
  const timestamp = now();
  const label =
    entity.label ??
    entity.entityNumber ??
    (mode === 'edit' ? `Edit #${entity.entityId}` : `Detail #${entity.entityId}`);
  return {
    id: `${primaryTab.id}::${mode}::${entity.entityId}`,
    primaryTabId: primaryTab.id,
    label,
    title: label,
    mode,
    href: entity.href ?? `${primaryTab.href}/${entity.entityId}${mode === 'edit' ? '/edit' : ''}`,
    entityId: entity.entityId,
    entityNumber: entity.entityNumber,
    closable: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function normalizeSecondaryTabs(primaryTabs: PrimaryTab[], value: unknown) {
  if (!value || typeof value !== 'object') return {};
  const byPrimary = value as Record<string, Partial<SecondaryTab>[]>;
  const primaryIds = new Set(primaryTabs.map((tab) => tab.id));
  const normalized: Record<string, SecondaryTab[]> = {};

  for (const [primaryTabId, tabs] of Object.entries(byPrimary)) {
    if (!primaryIds.has(primaryTabId) || !Array.isArray(tabs)) continue;
    normalized[primaryTabId] = tabs
      .filter((tab): tab is Partial<SecondaryTab> & { id: string; label: string } => {
        return Boolean(tab && typeof tab.id === 'string' && typeof tab.label === 'string');
      })
      .map((tab) => {
        const timestamp = typeof tab.createdAt === 'number' ? tab.createdAt : now();
        const mode = tab.mode ?? (tab.id.endsWith('::list') ? 'list' : 'create');
        return {
          id: tab.id,
          primaryTabId,
          label: tab.label,
          title: tab.title,
          mode,
          href: tab.href,
          entityId: tab.entityId,
          entityNumber: tab.entityNumber,
          closable: mode === 'list' ? false : Boolean(tab.closable),
          dirty: Boolean(tab.dirty),
          createdAt: timestamp,
          updatedAt: typeof tab.updatedAt === 'number' ? tab.updatedAt : timestamp,
        };
      });
  }

  return normalized;
}

function normalizeRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter((entry): entry is [string, string] => {
      return typeof entry[1] === 'string';
    }),
  );
}

function normalizeDirtyState(value: unknown): DirtyStateMap {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, dirty]) => Boolean(dirty))
      .map(([key]) => [key, true]),
  );
}

function normalizeDraftState(value: unknown): DraftStateMap {
  if (!value || typeof value !== 'object') return {};
  return { ...(value as DraftStateMap) };
}

function normalizeStoredState(value: unknown): VirtualTabsState | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Partial<
    VirtualTabsState & {
      secondaryTabsByPrimary: Record<string, SecondaryTab[]>;
      activeSecondaryTabByPrimary: Record<string, string>;
      dirtyState: DirtyStateMap;
    }
  >;
  const primaryTabs = Array.isArray(candidate.primaryTabs)
    ? candidate.primaryTabs.filter((tab): tab is PrimaryTab => {
        return Boolean(
          tab &&
            typeof tab.id === 'string' &&
            typeof tab.label === 'string' &&
            typeof tab.href === 'string' &&
            typeof tab.closable === 'boolean',
        );
      })
    : [];

  const tabsWithDashboard = primaryTabs.some((tab) => tab.id === dashboardTab.id)
    ? primaryTabs
    : [dashboardTab, ...primaryTabs];

  if (tabsWithDashboard.length === 0) return null;

  const activePrimaryTabId = tabsWithDashboard.some(
    (tab) => tab.id === candidate.activePrimaryTabId,
  )
    ? String(candidate.activePrimaryTabId)
    : dashboardTab.id;

  return {
    activePrimaryTabId,
    primaryTabs: tabsWithDashboard,
    secondaryTabsByPrimaryId: normalizeSecondaryTabs(
      tabsWithDashboard,
      candidate.secondaryTabsByPrimaryId ?? candidate.secondaryTabsByPrimary,
    ),
    activeSecondaryTabIdByPrimaryId: normalizeRecord(
      candidate.activeSecondaryTabIdByPrimaryId ?? candidate.activeSecondaryTabByPrimary,
    ),
    draftStateBySecondaryTabId: normalizeDraftState(candidate.draftStateBySecondaryTabId),
    dirtyStateBySecondaryTabId: normalizeDirtyState(
      candidate.dirtyStateBySecondaryTabId ?? candidate.dirtyState,
    ),
  };
}

function readStoredState(): VirtualTabsState | null {
  const raw = sessionStorage.getItem(getVirtualTabsStorageKey());
  if (!raw) return null;

  try {
    return normalizeStoredState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function removeRecordKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record };
  delete next[key];
  return next;
}

function removeSecondaryState<T>(record: Record<string, T>, secondaryTabId: string) {
  return removeRecordKey(record, secondaryTabId);
}

function removePrimarySecondaryState<T>(record: Record<string, T>, primaryTabId: string) {
  const next = { ...record };
  Object.keys(next).forEach((key) => {
    if (key.startsWith(`${primaryTabId}::`)) delete next[key];
  });
  return next;
}

export function VirtualTabsProvider({ children }: { children: ReactNode }) {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [storageKey, setStorageKey] = useState(getVirtualTabsStorageKey('none'));
  const [state, setState] = useState<VirtualTabsState>(defaultVirtualTabsState);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextStorageKey = getVirtualTabsStorageKey();
      setStorageKey(nextStorageKey);
      setState(readStoredState() ?? defaultVirtualTabsState);
      setHasHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  }, [hasHydrated, state, storageKey]);

  const ensureListSecondaryTab = useCallback((primaryTabId: string) => {
    if (primaryTabId === dashboardTab.id) return null;

    const primaryTab = state.primaryTabs.find((tab) => tab.id === primaryTabId);
    if (!primaryTab) return null;

    const existing = state.secondaryTabsByPrimaryId[primaryTabId]?.find(
      (tab) => tab.mode === 'list',
    );
    if (existing) return existing;

    const listTab = createListSecondaryTab(primaryTab);
    setState((current) => ({
      ...current,
      secondaryTabsByPrimaryId: {
        ...current.secondaryTabsByPrimaryId,
        [primaryTabId]: [listTab, ...(current.secondaryTabsByPrimaryId[primaryTabId] ?? [])],
      },
      activeSecondaryTabIdByPrimaryId: {
        ...current.activeSecondaryTabIdByPrimaryId,
        [primaryTabId]: current.activeSecondaryTabIdByPrimaryId[primaryTabId] ?? listTab.id,
      },
    }));
    return listTab;
  }, [state.primaryTabs, state.secondaryTabsByPrimaryId]);

  const openPrimaryTab = useCallback((tab: PrimaryTab) => {
    setState((current) => {
      const primaryTabs = current.primaryTabs.some((entry) => entry.id === tab.id)
        ? current.primaryTabs
        : [...current.primaryTabs, tab];
      if (tab.id === dashboardTab.id) {
        return { ...current, primaryTabs, activePrimaryTabId: tab.id };
      }

      const existingTabs = current.secondaryTabsByPrimaryId[tab.id] ?? [];
      const listTab = existingTabs.find((entry) => entry.mode === 'list') ?? createListSecondaryTab(tab);
      const secondaryTabs = existingTabs.some((entry) => entry.id === listTab.id)
        ? existingTabs
        : [listTab, ...existingTabs];

      return {
        ...current,
        primaryTabs,
        activePrimaryTabId: tab.id,
        secondaryTabsByPrimaryId: {
          ...current.secondaryTabsByPrimaryId,
          [tab.id]: secondaryTabs,
        },
        activeSecondaryTabIdByPrimaryId: {
          ...current.activeSecondaryTabIdByPrimaryId,
          [tab.id]: current.activeSecondaryTabIdByPrimaryId[tab.id] ?? listTab.id,
        },
      };
    });
  }, []);

  const activatePrimaryTab = useCallback((tabId: string) => {
    setState((current) => {
      const tab = current.primaryTabs.find((entry) => entry.id === tabId);
      if (!tab) return current;
      if (tab.id === dashboardTab.id) return { ...current, activePrimaryTabId: tab.id };

      const existingTabs = current.secondaryTabsByPrimaryId[tab.id] ?? [];
      const listTab = existingTabs.find((entry) => entry.mode === 'list') ?? createListSecondaryTab(tab);
      const secondaryTabs = existingTabs.some((entry) => entry.id === listTab.id)
        ? existingTabs
        : [listTab, ...existingTabs];

      return {
        ...current,
        activePrimaryTabId: tab.id,
        secondaryTabsByPrimaryId: {
          ...current.secondaryTabsByPrimaryId,
          [tab.id]: secondaryTabs,
        },
        activeSecondaryTabIdByPrimaryId: {
          ...current.activeSecondaryTabIdByPrimaryId,
          [tab.id]: current.activeSecondaryTabIdByPrimaryId[tab.id] ?? listTab.id,
        },
      };
    });
  }, []);

  const closePrimaryTab = useCallback((tabId: string) => {
    if (tabId === dashboardTab.id) return;

    setState((current) => {
      const closeIndex = current.primaryTabs.findIndex((tab) => tab.id === tabId);
      const remainingTabs = current.primaryTabs.filter((tab) => tab.id !== tabId);
      const nextTabs = remainingTabs.length ? remainingTabs : [dashboardTab];
      const fallback = nextTabs[Math.max(0, closeIndex - 1)] ?? dashboardTab;

      return {
        ...current,
        primaryTabs: nextTabs,
        activePrimaryTabId:
          current.activePrimaryTabId === tabId ? fallback.id : current.activePrimaryTabId,
        secondaryTabsByPrimaryId: removeRecordKey(current.secondaryTabsByPrimaryId, tabId),
        activeSecondaryTabIdByPrimaryId: removeRecordKey(
          current.activeSecondaryTabIdByPrimaryId,
          tabId,
        ),
        draftStateBySecondaryTabId: removePrimarySecondaryState(
          current.draftStateBySecondaryTabId,
          tabId,
        ),
        dirtyStateBySecondaryTabId: removePrimarySecondaryState(
          current.dirtyStateBySecondaryTabId,
          tabId,
        ),
      };
    });
  }, []);

  const openCreateSecondaryTab = useCallback(
    (primaryTabId: string, options?: OpenCreateSecondaryTabOptions) => {
      if (primaryTabId === dashboardTab.id) return null;
      const primaryTab = state.primaryTabs.find((tab) => tab.id === primaryTabId);
      if (!primaryTab) return null;

      const tab = createCreateSecondaryTab(
        primaryTab,
        state.secondaryTabsByPrimaryId[primaryTabId] ?? [],
        options,
      );
      setState((current) => ({
        ...current,
        activePrimaryTabId: primaryTabId,
        secondaryTabsByPrimaryId: {
          ...current.secondaryTabsByPrimaryId,
          [primaryTabId]: [...(current.secondaryTabsByPrimaryId[primaryTabId] ?? []), tab],
        },
        activeSecondaryTabIdByPrimaryId: {
          ...current.activeSecondaryTabIdByPrimaryId,
          [primaryTabId]: tab.id,
        },
        draftStateBySecondaryTabId: {
          ...current.draftStateBySecondaryTabId,
          [tab.id]: current.draftStateBySecondaryTabId[tab.id] ?? {},
        },
      }));
      return tab;
    },
    [state.primaryTabs, state.secondaryTabsByPrimaryId],
  );

  const openEntitySecondaryTab = useCallback(
    (primaryTabId: string, mode: 'edit' | 'detail', entity: OpenSecondaryTabEntity) => {
      if (primaryTabId === dashboardTab.id) return null;
      const primaryTab = state.primaryTabs.find((tab) => tab.id === primaryTabId);
      if (!primaryTab) return null;

      const tab = createEntitySecondaryTab(primaryTab, mode, entity);
      const existing = state.secondaryTabsByPrimaryId[primaryTabId]?.find(
        (entry) => entry.id === tab.id,
      );
      const nextTab = existing ? { ...existing, ...tab, createdAt: existing.createdAt } : tab;

      setState((current) => {
        const tabs = current.secondaryTabsByPrimaryId[primaryTabId] ?? [];
        const nextTabs = tabs.some((entry) => entry.id === nextTab.id)
          ? tabs.map((entry) => (entry.id === nextTab.id ? nextTab : entry))
          : [...tabs, nextTab];

        return {
          ...current,
          activePrimaryTabId: primaryTabId,
          secondaryTabsByPrimaryId: {
            ...current.secondaryTabsByPrimaryId,
            [primaryTabId]: nextTabs,
          },
          activeSecondaryTabIdByPrimaryId: {
            ...current.activeSecondaryTabIdByPrimaryId,
            [primaryTabId]: nextTab.id,
          },
          draftStateBySecondaryTabId: {
            ...current.draftStateBySecondaryTabId,
            [nextTab.id]: current.draftStateBySecondaryTabId[nextTab.id] ?? {},
          },
        };
      });
      return nextTab;
    },
    [state.primaryTabs, state.secondaryTabsByPrimaryId],
  );

  const openEditSecondaryTab = useCallback(
    (primaryTabId: string, entity: OpenSecondaryTabEntity) =>
      openEntitySecondaryTab(primaryTabId, 'edit', entity),
    [openEntitySecondaryTab],
  );

  const openDetailSecondaryTab = useCallback(
    (primaryTabId: string, entity: OpenSecondaryTabEntity) =>
      openEntitySecondaryTab(primaryTabId, 'detail', entity),
    [openEntitySecondaryTab],
  );

  const activateSecondaryTab = useCallback((primaryTabId: string, secondaryTabId: string) => {
    setState((current) => ({
      ...current,
      activePrimaryTabId: primaryTabId,
      activeSecondaryTabIdByPrimaryId: {
        ...current.activeSecondaryTabIdByPrimaryId,
        [primaryTabId]: secondaryTabId,
      },
    }));
  }, []);

  const closeSecondaryTab = useCallback((primaryTabId: string, secondaryTabId: string) => {
    setState((current) => {
      const tabs = current.secondaryTabsByPrimaryId[primaryTabId] ?? [];
      const tab = tabs.find((entry) => entry.id === secondaryTabId);
      if (!tab?.closable) return current;

      const closeIndex = tabs.findIndex((entry) => entry.id === secondaryTabId);
      const remainingTabs = tabs.filter((entry) => entry.id !== secondaryTabId);
      const listTab = remainingTabs.find((entry) => entry.mode === 'list');
      const fallback =
        remainingTabs[Math.max(0, closeIndex - 1)] ??
        remainingTabs[0] ??
        listTab ??
        null;

      return {
        ...current,
        secondaryTabsByPrimaryId: {
          ...current.secondaryTabsByPrimaryId,
          [primaryTabId]: remainingTabs,
        },
        activeSecondaryTabIdByPrimaryId: {
          ...current.activeSecondaryTabIdByPrimaryId,
          [primaryTabId]:
            current.activeSecondaryTabIdByPrimaryId[primaryTabId] === secondaryTabId
              ? fallback?.id ?? ''
              : current.activeSecondaryTabIdByPrimaryId[primaryTabId],
        },
        draftStateBySecondaryTabId: removeSecondaryState(
          current.draftStateBySecondaryTabId,
          secondaryTabId,
        ),
        dirtyStateBySecondaryTabId: removeSecondaryState(
          current.dirtyStateBySecondaryTabId,
          secondaryTabId,
        ),
      };
    });
  }, []);

  const setSecondaryDirty = useCallback((secondaryTabId: string, dirty: boolean) => {
    setState((current) => {
      const dirtyStateBySecondaryTabId = dirty
        ? { ...current.dirtyStateBySecondaryTabId, [secondaryTabId]: true }
        : removeRecordKey(current.dirtyStateBySecondaryTabId, secondaryTabId);

      const secondaryTabsByPrimaryId = Object.fromEntries(
        Object.entries(current.secondaryTabsByPrimaryId).map(([primaryTabId, tabs]) => [
          primaryTabId,
          tabs.map((tab) =>
            tab.id === secondaryTabId ? { ...tab, dirty, updatedAt: now() } : tab,
          ),
        ]),
      );

      return { ...current, dirtyStateBySecondaryTabId, secondaryTabsByPrimaryId };
    });
  }, []);

  const updateSecondaryDraftState = useCallback(
    (secondaryTabId: string, next: unknown | ((previous: unknown) => unknown)) => {
      setState((current) => {
        const previous = current.draftStateBySecondaryTabId[secondaryTabId];
        const value = typeof next === 'function'
          ? (next as (previousValue: unknown) => unknown)(previous)
          : next;
        return {
          ...current,
          draftStateBySecondaryTabId: {
            ...current.draftStateBySecondaryTabId,
            [secondaryTabId]: value,
          },
        };
      });
    },
    [],
  );

  const resetTabs = useCallback(() => {
    setState(defaultVirtualTabsState);
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  const getActiveSecondaryTab = useCallback(
    (primaryTabId: string) => {
      const tabs = state.secondaryTabsByPrimaryId[primaryTabId] ?? [];
      const activeId = state.activeSecondaryTabIdByPrimaryId[primaryTabId] ?? tabs[0]?.id;
      return tabs.find((tab) => tab.id === activeId) ?? tabs[0] ?? null;
    },
    [state.activeSecondaryTabIdByPrimaryId, state.secondaryTabsByPrimaryId],
  );

  const getDraftState = useCallback(
    (secondaryTabId: string) => state.draftStateBySecondaryTabId[secondaryTabId],
    [state.draftStateBySecondaryTabId],
  );

  const activePrimaryTab = useMemo(
    () => state.primaryTabs.find((tab) => tab.id === state.activePrimaryTabId) ?? dashboardTab,
    [state.activePrimaryTabId, state.primaryTabs],
  );
  const activeSecondaryTabs = useMemo(
    () => state.secondaryTabsByPrimaryId[activePrimaryTab.id] ?? [],
    [activePrimaryTab.id, state.secondaryTabsByPrimaryId],
  );
  const activeSecondaryTab = getActiveSecondaryTab(activePrimaryTab.id);
  const activeSecondaryTabId = activeSecondaryTab?.id ?? null;

  const value: VirtualTabsContextValue = useMemo(
    () => ({
      ...state,
      hasHydrated,
      activePrimaryTab,
      activeSecondaryTabs,
      activeSecondaryTab,
      activeSecondaryTabId,
      openPrimaryTab,
      closePrimaryTab,
      activatePrimaryTab,
      selectPrimaryTab: activatePrimaryTab,
      ensureListSecondaryTab,
      openCreateSecondaryTab,
      openEditSecondaryTab,
      openDetailSecondaryTab,
      openCreateFormForCurrentPrimary: (options) =>
        openCreateSecondaryTab(activePrimaryTab.id, options),
      openEditFormForCurrentPrimary: (entity) =>
        openEditSecondaryTab(activePrimaryTab.id, entity),
      closeSecondaryTab,
      activateSecondaryTab,
      selectSecondaryTab: activateSecondaryTab,
      closeAllTabs: resetTabs,
      setSecondaryDirty,
      markDirty: setSecondaryDirty,
      updateSecondaryDraftState,
      getActiveSecondaryTab,
      getDraftState,
      resetTabs,
    }),
    [
      state,
      hasHydrated,
      activePrimaryTab,
      activeSecondaryTabs,
      activeSecondaryTab,
      activeSecondaryTabId,
      openPrimaryTab,
      closePrimaryTab,
      activatePrimaryTab,
      ensureListSecondaryTab,
      openCreateSecondaryTab,
      openEditSecondaryTab,
      openDetailSecondaryTab,
      closeSecondaryTab,
      activateSecondaryTab,
      resetTabs,
      setSecondaryDirty,
      updateSecondaryDraftState,
      getActiveSecondaryTab,
      getDraftState,
    ],
  );

  return <VirtualTabsContext.Provider value={value}>{children}</VirtualTabsContext.Provider>;
}

export function useVirtualTabs() {
  const context = useContext(VirtualTabsContext);
  if (!context) {
    throw new Error('useVirtualTabs must be used within VirtualTabsProvider');
  }

  return context;
}
