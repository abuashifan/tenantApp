'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CloseAllTabsDialog } from './CloseAllTabsDialog';
import { FloatingSubmenuPanel } from './FloatingSubmenuPanel';
import {
  buildModuleNavGroups,
  createDashboardTab,
  createPrimaryTab,
  findNavItemByHref,
} from './navigation';
import { PrimaryVirtualTabs } from './PrimaryVirtualTabs';
import { SecondaryVirtualTabs } from './SecondaryVirtualTabs';
import { Sidebar } from './Sidebar';
import type {
  CloseAllCandidate,
  ModuleNavGroup,
  ModuleNavItem,
  PrimaryTab,
  SecondaryTab,
  StoredActiveCompany,
} from './types';
import { UserMenu } from './UserMenu';
import {
  getVirtualTabsStorageKey,
  useVirtualTabs,
  virtualTabsStorageKey,
} from './VirtualTabsProvider';
import { getStoredCompanyId, getStoredToken } from '@/lib/api';
import { fetchAndStorePermissions, getStoredPermissions } from '@/lib/permissions';

type AppShellProps = {
  children: ReactNode;
};

type SidebarMode = 'full' | 'minimal';

const dashboardTab = createDashboardTab();

type PendingDirtyAction =
  | { type: 'close-all' }
  | { type: 'close-primary'; tabId: string; fallback: PrimaryTab; wasActive: boolean }
  | { type: 'close-secondary'; primaryTabId: string; secondaryTabId: string };

function readActiveCompany(): StoredActiveCompany | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem('active_company');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredActiveCompany;
  } catch {
    return null;
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [activeCompany, setActiveCompany] = useState<StoredActiveCompany | null>(null);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('full');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>('dashboard');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [flyoutGroupId, setFlyoutGroupId] = useState<string | null>(null);
  const [closeAllQueue, setCloseAllQueue] = useState<CloseAllCandidate[]>([]);
  const [closeAllCandidate, setCloseAllCandidate] = useState<CloseAllCandidate | null>(null);
  const [pendingDirtyAction, setPendingDirtyAction] = useState<PendingDirtyAction | null>(null);
  const {
    hasHydrated: hasRestoredShellState,
    primaryTabs,
    activePrimaryTabId,
    secondaryTabsByPrimaryId,
    activeSecondaryTabIdByPrimaryId,
    dirtyStateBySecondaryTabId,
    activePrimaryTab,
    activeSecondaryTabs,
    activeSecondaryTabId,
    openPrimaryTab,
    closePrimaryTab: closePrimaryTabState,
    activatePrimaryTab,
    openCreateSecondaryTab,
    openEditSecondaryTab,
    openDetailSecondaryTab,
    closeSecondaryTab: closeSecondaryTabState,
    activateSecondaryTab,
    closeAllTabs,
    resetTabs,
  } = useVirtualTabs();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setActiveCompany(readActiveCompany());
      setPermissions(getStoredPermissions());
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hasRestoredShellState) return;

    const token = getStoredToken();
    const companyId = getStoredCompanyId();
    if (!token || !companyId) return;

    fetchAndStorePermissions()
      .then((nextPermissions) => setPermissions(nextPermissions))
      .catch(() => {
        setPermissions(getStoredPermissions());
      });
  }, [hasRestoredShellState]);

  const moduleGroups = useMemo(() => buildModuleNavGroups(permissions), [permissions]);
  const activeLookup = useMemo(
    () => findNavItemByHref(moduleGroups, pathname),
    [moduleGroups, pathname],
  );
  const activeModuleId =
    selectedModuleId ??
    (activePrimaryTab.id === dashboardTab.id
      ? activeLookup.group.id
      : activePrimaryTab.moduleId ?? 'dashboard');
  const activeItemId = activePrimaryTab.id === dashboardTab.id ? activeLookup.item?.id ?? null : activePrimaryTab.id;
  const flyoutGroup = moduleGroups.find((group) => group.id === flyoutGroupId) ?? null;

  useEffect(() => {
    if (!hasRestoredShellState) return;

    const timeout = window.setTimeout(() => {
      if (!activeLookup.item) {
        if (pathname === '/dashboard') {
          activatePrimaryTab(dashboardTab.id);
          setSelectedModuleId('dashboard');
        }
        return;
      }

      const nextTab = createPrimaryTab(activeLookup.item, activeLookup.group.id);
      openPrimaryTab(nextTab);
      syncRouteToSecondaryTab(nextTab, pathname);
      setSelectedModuleId(activeLookup.group.id);
      setExpandedModuleId(activeLookup.group.id);
    }, 0);

    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRestoredShellState, pathname, activeLookup.group.id, activeLookup.item?.id]);

  useEffect(() => {
    if (!hasRestoredShellState || !activeLookup.item) return;
    if (activePrimaryTab.id !== activeLookup.item.href) return;
    syncRouteToSecondaryTab(activePrimaryTab, pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRestoredShellState, pathname, activePrimaryTab.id, activeLookup.item?.id]);

  function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('active_company_id');
    localStorage.removeItem('active_company');
    localStorage.removeItem('auth_permissions');
    sessionStorage.removeItem(virtualTabsStorageKey);
    sessionStorage.removeItem(getVirtualTabsStorageKey());
    resetTabs();
    router.push('/login');
  }

  function handleDashboardSelect() {
    activatePrimaryTab(dashboardTab.id);
    setSelectedModuleId('dashboard');
    setExpandedModuleId(null);
    setFlyoutGroupId(null);
    router.push(dashboardTab.href);
  }

  function handleSidebarModeChange(mode: SidebarMode) {
    if (mode === 'full') {
      setFlyoutGroupId(null);
    }
    setSidebarMode(mode);
  }

  function handleModuleSelect(group: ModuleNavGroup) {
    setSelectedModuleId(group.id);
    if (sidebarMode === 'minimal' && group.items.length > 0) {
      setFlyoutGroupId(group.id);
    } else {
      setFlyoutGroupId(null);
    }
  }

  function handleItemSelect(group: ModuleNavGroup, item: ModuleNavItem) {
    const tab = createPrimaryTab(item, group.id);
    openPrimaryTab(tab);
    setSelectedModuleId(group.id);
    setExpandedModuleId(group.id);
    setFlyoutGroupId(null);
    router.push(item.href);
  }

  function handlePrimaryTabSelect(tab: PrimaryTab) {
    activatePrimaryTab(tab.id);
    if (tab.id === dashboardTab.id) {
      setSelectedModuleId('dashboard');
      setExpandedModuleId(null);
    } else {
      setSelectedModuleId(tab.moduleId ?? null);
      setExpandedModuleId(tab.moduleId ?? null);
    }
    const restoredSecondary = getActiveSecondaryForPrimary(tab.id);
    router.push(restoredSecondary?.href ?? tab.href);
  }

  function closePrimaryTab(tabId: string) {
    if (tabId === dashboardTab.id) return;

    const closeIndex = primaryTabs.findIndex((tab) => tab.id === tabId);
    const remaining = primaryTabs.filter((tab) => tab.id !== tabId);
    const nextTabs = remaining.length ? remaining : [dashboardTab];
    const fallback = nextTabs[Math.max(0, closeIndex - 1)] ?? dashboardTab;

    const wasActive = activePrimaryTabId === tabId;
    const dirtyCandidates = getDirtyCandidates(tabId);

    if (dirtyCandidates.length > 0) {
      const action: PendingDirtyAction = { type: 'close-primary', tabId, fallback, wasActive };
      setPendingDirtyAction(action);
      continueCloseAll(dirtyCandidates, action);
      return;
    }

    closePrimaryTabAfterDirty(tabId, fallback, wasActive);
  }

  function closePrimaryTabAfterDirty(tabId: string, fallback: PrimaryTab, wasActive: boolean) {
    closePrimaryTabState(tabId);

    if (!wasActive) return;

    setSelectedModuleId(fallback.moduleId ?? null);
    setExpandedModuleId(fallback.id === dashboardTab.id ? null : fallback.moduleId ?? null);
    const restoredSecondary = getActiveSecondaryForPrimary(fallback.id);
    router.push(restoredSecondary?.href ?? fallback.href);
  }

  function syncRouteToSecondaryTab(tab: PrimaryTab, currentPathname: string | null) {
    if (!currentPathname || tab.id === dashboardTab.id) return;

    const base = tab.href.replace(/\/$/, '');
    const activeForTab = getActiveSecondaryForPrimary(tab.id);
    if (activeForTab?.href === currentPathname) return;

    if (currentPathname === `${base}/new`) {
      openCreateSecondaryTab(tab.id, { href: currentPathname });
      return;
    }

    const editMatch = currentPathname.match(new RegExp(`^${escapeRegExp(base)}/([^/]+)/edit$`));
    if (editMatch?.[1]) {
      openEditSecondaryTab(tab.id, {
        entityId: decodeURIComponent(editMatch[1]),
        href: currentPathname,
      });
      return;
    }

    const detailMatch = currentPathname.match(new RegExp(`^${escapeRegExp(base)}/([^/]+)$`));
    if (detailMatch?.[1]) {
      openDetailSecondaryTab(tab.id, {
        entityId: decodeURIComponent(detailMatch[1]),
        href: currentPathname,
      });
      return;
    }

    const listTab = (secondaryTabsByPrimaryId[tab.id] ?? []).find((entry) => entry.mode === 'list');
    if (listTab && currentPathname === base) activateSecondaryTab(tab.id, listTab.id);
  }

  function getActiveSecondaryForPrimary(primaryTabId: string) {
    const tabs = secondaryTabsByPrimaryId[primaryTabId] ?? [];
    const activeId = activeSecondaryTabIdByPrimaryId[primaryTabId];
    return tabs.find((tab) => tab.id === activeId) ?? tabs[0] ?? null;
  }

  function addSecondaryTab() {
    if (activePrimaryTab.id === dashboardTab.id) return;

    const newTab = openCreateSecondaryTab(activePrimaryTab.id);
    if (newTab?.href) router.push(newTab.href);
  }

  function closeSecondaryTab(tab: SecondaryTab) {
    if (!tab.closable) return;
    if (dirtyStateBySecondaryTabId[tab.id]) {
      const action: PendingDirtyAction = {
        type: 'close-secondary',
        primaryTabId: activePrimaryTab.id,
        secondaryTabId: tab.id,
      };
      setPendingDirtyAction(action);
      setCloseAllQueue([]);
      setCloseAllCandidate({
        primaryTabId: activePrimaryTab.id,
        secondaryTabId: tab.id,
        label: tab.label,
      });
      return;
    }
    closeSecondaryTabAfterDirty(activePrimaryTab.id, tab.id);
  }

  function closeSecondaryTabAfterDirty(primaryTabId: string, secondaryTabId: string) {
    const fallbackHref = getSecondaryFallbackHref(primaryTabId, secondaryTabId);
    closeSecondaryTabState(primaryTabId, secondaryTabId);
    if (fallbackHref) router.push(fallbackHref);
  }

  function getSecondaryFallbackHref(primaryTabId: string, secondaryTabId: string) {
    const tabs = secondaryTabsByPrimaryId[primaryTabId] ?? [];
    const closeIndex = tabs.findIndex((entry) => entry.id === secondaryTabId);
    const remaining = tabs.filter((entry) => entry.id !== secondaryTabId);
    const fallback = remaining[Math.max(0, closeIndex - 1)] ?? remaining[0] ?? null;
    const primaryTab = primaryTabs.find((entry) => entry.id === primaryTabId);
    return fallback?.href ?? primaryTab?.href ?? null;
  }

  function resetToDashboard() {
    closeAllTabs();
    setSelectedModuleId('dashboard');
    setExpandedModuleId(null);
    setFlyoutGroupId(null);
    router.push(dashboardTab.href);
  }

  function getDirtyCandidates(primaryTabId: string) {
    return (secondaryTabsByPrimaryId[primaryTabId] ?? [])
      .filter((tab) => tab.closable && dirtyStateBySecondaryTabId[tab.id])
      .map((tab) => ({
        primaryTabId,
        secondaryTabId: tab.id,
        label: tab.label,
      }));
  }

  function finishDirtyAction(action: PendingDirtyAction | null) {
    if (action?.type === 'close-primary') {
      closePrimaryTabAfterDirty(action.tabId, action.fallback, action.wasActive);
    } else if (action?.type === 'close-secondary') {
      closeSecondaryTabAfterDirty(action.primaryTabId, action.secondaryTabId);
    } else {
      resetToDashboard();
    }

    setCloseAllQueue([]);
    setCloseAllCandidate(null);
    setPendingDirtyAction(null);
  }

  function continueCloseAll(queue: CloseAllCandidate[], action = pendingDirtyAction) {
    const [nextCandidate, ...remaining] = queue;
    if (!nextCandidate) {
      finishDirtyAction(action);
      return;
    }

    setCloseAllQueue(remaining);
    setCloseAllCandidate(nextCandidate);
  }

  function handleCloseAll() {
    const dirtyCandidates = Object.keys(secondaryTabsByPrimaryId).flatMap(getDirtyCandidates);

    if (dirtyCandidates.length === 0) {
      resetToDashboard();
      return;
    }

    const action: PendingDirtyAction = { type: 'close-all' };
    setPendingDirtyAction(action);
    continueCloseAll(dirtyCandidates, action);
  }

  function discardCloseAllCandidate() {
    if (!closeAllCandidate) return;

    if (pendingDirtyAction?.type === 'close-secondary') {
      finishDirtyAction(pendingDirtyAction);
      return;
    }
    closeSecondaryTabState(closeAllCandidate.primaryTabId, closeAllCandidate.secondaryTabId);
    continueCloseAll(closeAllQueue);
  }

  async function saveCloseAllCandidate() {
    if (!closeAllCandidate) return;

    // TODO: production must connect this to each form’s real save handler.
    await Promise.resolve();
    discardCloseAllCandidate();
  }

  function cancelCloseAll() {
    setCloseAllQueue([]);
    setCloseAllCandidate(null);
    setPendingDirtyAction(null);
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <Sidebar
        mode={sidebarMode}
        groups={moduleGroups}
        activeModuleId={activeModuleId}
        activeItemId={activeItemId}
        activeCompany={activeCompany}
        expandedModuleId={expandedModuleId}
        onModeChange={handleSidebarModeChange}
        onExpandedModuleChange={setExpandedModuleId}
        onDashboardSelect={handleDashboardSelect}
        onModuleSelect={handleModuleSelect}
        onItemSelect={handleItemSelect}
      />

      {sidebarMode === 'minimal' ? (
        <FloatingSubmenuPanel
          open={Boolean(flyoutGroup)}
          group={flyoutGroup}
          activeItemId={activeItemId}
          onClose={() => setFlyoutGroupId(null)}
          onItemSelect={handleItemSelect}
        />
      ) : null}

      <div className={sidebarMode === 'minimal' ? 'pl-20' : 'pl-80'}>
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-20 items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <PrimaryVirtualTabs
              tabs={primaryTabs}
              activeTabId={activePrimaryTabId}
              onSelectTab={handlePrimaryTabSelect}
              onCloseTab={closePrimaryTab}
            />

            <div className="flex shrink-0 items-center gap-2 pb-2">
              <button
                type="button"
                onClick={handleCloseAll}
                className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 md:block"
              >
                Close All
              </button>
              <UserMenu onLogout={logout} />
            </div>
          </div>
        </header>

        <SecondaryVirtualTabs
          activePrimaryTab={activePrimaryTab}
          tabs={activeSecondaryTabs}
          activeTabId={activeSecondaryTabId}
          onSelectTab={(tabId) => {
            const tab = activeSecondaryTabs.find((entry) => entry.id === tabId);
            activateSecondaryTab(activePrimaryTab.id, tabId);
            router.push(tab?.href ?? activePrimaryTab.href);
          }}
          onCloseTab={closeSecondaryTab}
          onAddTab={addSecondaryTab}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <CloseAllTabsDialog
        candidate={closeAllCandidate}
        onCancel={cancelCloseAll}
        onDiscard={discardCloseAllCandidate}
        onSave={saveCloseAllCandidate}
      />
    </div>
  );
}
