'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createDashboardTab, getListTabLabel } from './navigation';
import type {
  DirtyStateMap,
  PrimaryTab,
  SecondaryTab,
  VirtualTabsContextValue,
  VirtualTabsState,
} from './types';

export const virtualTabsStorageKey = 'erp.virtualTabs.v1';

const dashboardTab = createDashboardTab();

const defaultVirtualTabsState: VirtualTabsState = {
  primaryTabs: [dashboardTab],
  activePrimaryTabId: dashboardTab.id,
  secondaryTabsByPrimary: {},
  activeSecondaryTabByPrimary: {},
  dirtyState: {},
};

const VirtualTabsContext = createContext<VirtualTabsContextValue | null>(null);

function createListSecondaryTab(primaryTab: PrimaryTab): SecondaryTab {
  return {
    id: `${primaryTab.id}::list`,
    label: getListTabLabel(primaryTab.label),
    isList: true,
    closable: false,
  };
}

function normalizeStoredState(value: unknown): VirtualTabsState | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Partial<VirtualTabsState>;
  const primaryTabs = Array.isArray(candidate.primaryTabs)
    ? candidate.primaryTabs.filter((tab): tab is PrimaryTab => {
        return Boolean(
          tab &&
            typeof tab.id === 'string' &&
            typeof tab.label === 'string' &&
            typeof tab.href === 'string' &&
            typeof tab.moduleId === 'string' &&
            typeof tab.closable === 'boolean',
        );
      })
    : [];

  if (primaryTabs.length === 0) return null;

  const tabsWithDashboard = primaryTabs.some((tab) => tab.id === dashboardTab.id)
    ? primaryTabs
    : [dashboardTab, ...primaryTabs];

  const activePrimaryTabId = tabsWithDashboard.some(
    (tab) => tab.id === candidate.activePrimaryTabId,
  )
    ? String(candidate.activePrimaryTabId)
    : dashboardTab.id;

  return {
    primaryTabs: tabsWithDashboard,
    activePrimaryTabId,
    secondaryTabsByPrimary:
      candidate.secondaryTabsByPrimary &&
      typeof candidate.secondaryTabsByPrimary === 'object'
        ? candidate.secondaryTabsByPrimary
        : {},
    activeSecondaryTabByPrimary:
      candidate.activeSecondaryTabByPrimary &&
      typeof candidate.activeSecondaryTabByPrimary === 'object'
        ? candidate.activeSecondaryTabByPrimary
        : {},
    dirtyState:
      candidate.dirtyState && typeof candidate.dirtyState === 'object'
        ? candidate.dirtyState
        : {},
  };
}

function readStoredState(): VirtualTabsState | null {
  const raw = sessionStorage.getItem(virtualTabsStorageKey);
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

export function VirtualTabsProvider({ children }: { children: ReactNode }) {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [primaryTabs, setPrimaryTabs] = useState<PrimaryTab[]>(
    defaultVirtualTabsState.primaryTabs,
  );
  const [activePrimaryTabId, setActivePrimaryTabId] = useState(
    defaultVirtualTabsState.activePrimaryTabId,
  );
  const [secondaryTabsByPrimary, setSecondaryTabsByPrimary] = useState<
    Record<string, SecondaryTab[]>
  >(defaultVirtualTabsState.secondaryTabsByPrimary);
  const [activeSecondaryTabByPrimary, setActiveSecondaryTabByPrimary] = useState<
    Record<string, string>
  >(defaultVirtualTabsState.activeSecondaryTabByPrimary);
  const [dirtyState, setDirtyState] = useState<DirtyStateMap>(
    defaultVirtualTabsState.dirtyState,
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const storedState = readStoredState() ?? defaultVirtualTabsState;
      setPrimaryTabs(storedState.primaryTabs);
      setActivePrimaryTabId(storedState.activePrimaryTabId);
      setSecondaryTabsByPrimary(storedState.secondaryTabsByPrimary);
      setActiveSecondaryTabByPrimary(storedState.activeSecondaryTabByPrimary);
      setDirtyState(storedState.dirtyState);
      setHasHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const state: VirtualTabsState = {
      primaryTabs,
      activePrimaryTabId,
      secondaryTabsByPrimary,
      activeSecondaryTabByPrimary,
      dirtyState,
    };

    sessionStorage.setItem(virtualTabsStorageKey, JSON.stringify(state));
  }, [
    activePrimaryTabId,
    activeSecondaryTabByPrimary,
    dirtyState,
    hasHydrated,
    primaryTabs,
    secondaryTabsByPrimary,
  ]);

  function ensureSecondaryListTab(tab: PrimaryTab) {
    if (tab.id === dashboardTab.id) return;

    setSecondaryTabsByPrimary((current) => {
      if (current[tab.id]?.length) return current;
      return { ...current, [tab.id]: [createListSecondaryTab(tab)] };
    });
    setActiveSecondaryTabByPrimary((current) => {
      if (current[tab.id]) return current;
      return { ...current, [tab.id]: `${tab.id}::list` };
    });
  }

  function openPrimaryTab(tab: PrimaryTab) {
    setPrimaryTabs((current) =>
      current.some((entry) => entry.id === tab.id) ? current : [...current, tab],
    );
    setActivePrimaryTabId(tab.id);
    ensureSecondaryListTab(tab);
  }

  function selectPrimaryTab(tabId: string) {
    const tab = primaryTabs.find((entry) => entry.id === tabId);
    if (!tab) return;
    setActivePrimaryTabId(tab.id);
    ensureSecondaryListTab(tab);
  }

  function closePrimaryTab(tabId: string) {
    if (tabId === dashboardTab.id) return;

    const closeIndex = primaryTabs.findIndex((tab) => tab.id === tabId);
    const remainingTabs = primaryTabs.filter((tab) => tab.id !== tabId);
    const nextTabs = remainingTabs.length ? remainingTabs : [dashboardTab];
    const fallback = nextTabs[Math.max(0, closeIndex - 1)] ?? dashboardTab;

    setPrimaryTabs(nextTabs);
    setSecondaryTabsByPrimary((current) => removeRecordKey(current, tabId));
    setActiveSecondaryTabByPrimary((current) => removeRecordKey(current, tabId));
    setDirtyState((current) => {
      const next = { ...current };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${tabId}::`)) delete next[key];
      });
      return next;
    });

    if (activePrimaryTabId === tabId) {
      setActivePrimaryTabId(fallback.id);
      ensureSecondaryListTab(fallback);
    }
  }

  function openSecondaryTab(parentTabId: string, childTab: SecondaryTab) {
    setSecondaryTabsByPrimary((current) => {
      const tabs = current[parentTabId] ?? [];
      const nextTabs = tabs.some((tab) => tab.id === childTab.id)
        ? tabs
        : [...tabs, childTab];
      return { ...current, [parentTabId]: nextTabs };
    });
    setActiveSecondaryTabByPrimary((current) => ({
      ...current,
      [parentTabId]: childTab.id,
    }));

    if (childTab.dirty) {
      setDirtyState((current) => ({ ...current, [childTab.id]: true }));
    }
  }

  function selectSecondaryTab(parentTabId: string, childTabId: string) {
    setActiveSecondaryTabByPrimary((current) => ({
      ...current,
      [parentTabId]: childTabId,
    }));
  }

  function closeSecondaryTab(parentTabId: string, childTabId: string) {
    const tabs = secondaryTabsByPrimary[parentTabId] ?? [];
    const tab = tabs.find((entry) => entry.id === childTabId);
    if (!tab?.closable) return;

    const remainingTabs = tabs.filter((entry) => entry.id !== childTabId);
    const fallback = remainingTabs[remainingTabs.length - 1] ?? null;

    setSecondaryTabsByPrimary((current) => ({
      ...current,
      [parentTabId]: remainingTabs,
    }));
    setActiveSecondaryTabByPrimary((current) => ({
      ...current,
      [parentTabId]: fallback?.id ?? '',
    }));
    setDirtyState((current) => removeRecordKey(current, childTabId));
  }

  function markDirty(tabId: string, dirty: boolean) {
    setDirtyState((current) => {
      if (dirty) return { ...current, [tabId]: true };
      return removeRecordKey(current, tabId);
    });
  }

  function resetTabs() {
    setPrimaryTabs([dashboardTab]);
    setActivePrimaryTabId(dashboardTab.id);
    setSecondaryTabsByPrimary({});
    setActiveSecondaryTabByPrimary({});
    setDirtyState({});
    sessionStorage.removeItem(virtualTabsStorageKey);
  }

  function closeAllTabs() {
    resetTabs();
  }

  const activePrimaryTab =
    primaryTabs.find((tab) => tab.id === activePrimaryTabId) ?? dashboardTab;
  const activeSecondaryTabs = secondaryTabsByPrimary[activePrimaryTab.id] ?? [];
  const activeSecondaryTabId =
    activeSecondaryTabByPrimary[activePrimaryTab.id] ?? activeSecondaryTabs[0]?.id ?? null;

  const value: VirtualTabsContextValue = {
    hasHydrated,
    primaryTabs,
    activePrimaryTabId,
    secondaryTabsByPrimary,
    activeSecondaryTabByPrimary,
    dirtyState,
    activePrimaryTab,
    activeSecondaryTabs,
    activeSecondaryTabId,
    openPrimaryTab,
    closePrimaryTab,
    selectPrimaryTab,
    openSecondaryTab,
    closeSecondaryTab,
    selectSecondaryTab,
    closeAllTabs,
    markDirty,
    resetTabs,
  };

  return <VirtualTabsContext.Provider value={value}>{children}</VirtualTabsContext.Provider>;
}

export function useVirtualTabs() {
  const context = useContext(VirtualTabsContext);
  if (!context) {
    throw new Error('useVirtualTabs must be used within VirtualTabsProvider');
  }

  return context;
}
