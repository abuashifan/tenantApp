import { defineStore } from 'pinia'
import type { SortingState } from '@tanstack/vue-table'

import type { WorkspacePagination, WorkspaceStatusFilter } from '@/types/workspace'

export type PrimaryTab = {
  id: string
  label: string
  routeName?: string
  path?: string
  closable: boolean
}

export type SecondaryTabMode = 'list' | 'create' | 'edit' | 'detail'

export type SecondaryTab = {
  id: string
  primaryTabId: string
  label: string
  mode: SecondaryTabMode
  entityId?: string | number
  entityNumber?: string
  closable: boolean
  dirty: boolean
  createdAt: number
  updatedAt: number
}

export type WorkspaceTabsState = {
  primaryTabs: PrimaryTab[]
  activePrimaryTabId: string
  secondaryTabsByPrimaryId: Record<string, SecondaryTab[]>
  activeSecondaryTabIdByPrimaryId: Record<string, string>
  draftStateBySecondaryTabId: Record<string, unknown>
  listStateByPrimaryTabId: Record<string, WorkspaceListState>
  tenantStateVersion: number
}

export type WorkspaceListState = {
  page: number
  perPage: number
  search: string
  filters: Record<string, unknown>
  sortBy: string | null
  sortDirection: 'asc' | 'desc' | null
  selectedIds: string[]
  startDate: string
  endDate: string
  status: string | WorkspaceStatusFilter
  includeVoid: boolean
  pagination: WorkspacePagination
  sorting: SortingState
  lastLoadedAt?: string
}

type SecondarySaveHandler = () => boolean | Promise<boolean>

const secondarySaveHandlers = new Map<string, SecondarySaveHandler>()

function now() {
  return Date.now()
}

function listSecondaryId(primaryTabId: string) {
  return `${primaryTabId}::list`
}

function createListSecondaryTab(primaryTabId: string, label = 'Daftar'): SecondaryTab {
  return {
    id: listSecondaryId(primaryTabId),
    primaryTabId,
    label,
    mode: 'list',
    closable: false,
    dirty: false,
    createdAt: now(),
    updatedAt: now(),
  }
}

function createSecondaryId(primaryTabId: string) {
  return `${primaryTabId}::create::${now()}`
}

function editSecondaryId(primaryTabId: string, entityId: string | number) {
  return `${primaryTabId}::edit::${entityId}`
}

function detailSecondaryId(primaryTabId: string, entityId: string | number) {
  return `${primaryTabId}::detail::${entityId}`
}

const DASHBOARD_PRIMARY_ID = '/dashboard'

function defaultListState(): WorkspaceListState {
  return {
    page: 1,
    perPage: 10,
    search: '',
    filters: {},
    sortBy: null,
    sortDirection: null,
    selectedIds: [],
    startDate: '',
    endDate: '',
    status: [],
    includeVoid: false,
    pagination: { page: 1, perPage: 10, total: 0, lastPage: 1 },
    sorting: [],
  }
}

export const useWorkspaceTabsStore = defineStore('workspaceTabs', {
  state: (): WorkspaceTabsState => ({
    primaryTabs: [
      {
        id: DASHBOARD_PRIMARY_ID,
        label: 'Dashboard',
        path: '/dashboard',
        routeName: 'dashboard',
        closable: false,
      },
    ],
    activePrimaryTabId: DASHBOARD_PRIMARY_ID,
    secondaryTabsByPrimaryId: {
      [DASHBOARD_PRIMARY_ID]: [],
    },
    activeSecondaryTabIdByPrimaryId: {},
    draftStateBySecondaryTabId: {},
    listStateByPrimaryTabId: {},
    tenantStateVersion: 0,
  }),

  getters: {
    activePrimaryTab(state) {
      return state.primaryTabs.find((t) => t.id === state.activePrimaryTabId) ?? null
    },
    activeSecondaryTab(state) {
      const pid = state.activePrimaryTabId
      const sid = state.activeSecondaryTabIdByPrimaryId[pid]
      if (!sid) return null
      return (state.secondaryTabsByPrimaryId[pid] ?? []).find((t) => t.id === sid) ?? null
    },
    secondaryTabsForActive(state) {
      return state.secondaryTabsByPrimaryId[state.activePrimaryTabId] ?? []
    },
    hasTenantScopedState(state) {
      const hasTenantTabs = state.primaryTabs.some((tab) => tab.id !== DASHBOARD_PRIMARY_ID)
      return (
        hasTenantTabs ||
        Object.keys(state.secondaryTabsByPrimaryId).some((key) => key !== DASHBOARD_PRIMARY_ID) ||
        Object.keys(state.activeSecondaryTabIdByPrimaryId).length > 0 ||
        Object.keys(state.draftStateBySecondaryTabId).length > 0 ||
        Object.keys(state.listStateByPrimaryTabId).length > 0
      )
    },
    hasDirtySecondaryTabs(state) {
      return Object.values(state.secondaryTabsByPrimaryId).some((tabs) => tabs.some((tab) => tab.dirty))
    },
  },

  actions: {
    openPrimaryTab(tab: PrimaryTab) {
      const existing = this.primaryTabs.find((t) => t.id === tab.id)
      if (!existing) this.primaryTabs.push(tab)
      this.activatePrimaryTab(tab.id)
      this.ensureListSecondaryTab(tab.id, { label: 'Daftar' })
    },

    activatePrimaryTab(primaryTabId: string) {
      this.activePrimaryTabId = primaryTabId
      this.ensureListSecondaryTab(primaryTabId)
      if (primaryTabId === DASHBOARD_PRIMARY_ID) return

      const activeSecondaryId = this.activeSecondaryTabIdByPrimaryId[primaryTabId]
      const activeStillExists = (this.secondaryTabsByPrimaryId[primaryTabId] ?? []).some((tab) => tab.id === activeSecondaryId)
      if (!activeSecondaryId || !activeStillExists) {
        this.activeSecondaryTabIdByPrimaryId[primaryTabId] = listSecondaryId(primaryTabId)
      }
    },

    closePrimaryTab(primaryTabId: string) {
      const tab = this.primaryTabs.find((t) => t.id === primaryTabId)
      if (!tab || !tab.closable) return

      const secondaries = this.secondaryTabsByPrimaryId[primaryTabId] ?? []
      for (const sec of secondaries) {
        delete this.draftStateBySecondaryTabId[sec.id]
        secondarySaveHandlers.delete(sec.id)
      }
      delete this.secondaryTabsByPrimaryId[primaryTabId]
      delete this.activeSecondaryTabIdByPrimaryId[primaryTabId]
      delete this.listStateByPrimaryTabId[primaryTabId]

      this.primaryTabs = this.primaryTabs.filter((t) => t.id !== primaryTabId)

      if (this.activePrimaryTabId === primaryTabId) {
        this.activePrimaryTabId = DASHBOARD_PRIMARY_ID
      }
    },

    ensureListSecondaryTab(primaryTabId: string, options?: { label?: string }) {
      if (primaryTabId === DASHBOARD_PRIMARY_ID) return

      const listId = listSecondaryId(primaryTabId)
      const existing = this.secondaryTabsByPrimaryId[primaryTabId] ?? []
      const label = options?.label ?? 'Daftar'
      const existingList = existing.find((t) => t.id === listId)

      if (!existingList) {
        this.secondaryTabsByPrimaryId[primaryTabId] = [createListSecondaryTab(primaryTabId, label), ...existing]
      } else if (existingList.label !== label || existingList.closable || existingList.mode !== 'list') {
        this.secondaryTabsByPrimaryId[primaryTabId] = existing.map((tab) =>
          tab.id === listId
            ? {
                ...tab,
                label,
                mode: 'list',
                closable: false,
                dirty: false,
                updatedAt: now(),
              }
            : tab,
        )
      }

      const activeSecondaryId = this.activeSecondaryTabIdByPrimaryId[primaryTabId]
      const activeStillExists = (this.secondaryTabsByPrimaryId[primaryTabId] ?? []).some((tab) => tab.id === activeSecondaryId)
      if (!activeSecondaryId || !activeStillExists) {
        this.activeSecondaryTabIdByPrimaryId[primaryTabId] = listId
      }
    },

    openCreateSecondaryTab(primaryTabId: string, options?: { label?: string }) {
      this.ensureListSecondaryTab(primaryTabId)

      const id = createSecondaryId(primaryTabId)
      const tab: SecondaryTab = {
        id,
        primaryTabId,
        label: options?.label ?? 'Data Baru',
        mode: 'create',
        closable: true,
        dirty: false,
        createdAt: now(),
        updatedAt: now(),
      }

      this.secondaryTabsByPrimaryId[primaryTabId] = [...(this.secondaryTabsByPrimaryId[primaryTabId] ?? []), tab]
      this.activateSecondaryTab(primaryTabId, id)
      return tab
    },

    openEditSecondaryTab(primaryTabId: string, entity: { id: string | number; number?: string }) {
      this.ensureListSecondaryTab(primaryTabId)

      const id = editSecondaryId(primaryTabId, entity.id)
      const existing = (this.secondaryTabsByPrimaryId[primaryTabId] ?? []).find((t) => t.id === id)
      if (existing) {
        this.activateSecondaryTab(primaryTabId, id)
        return existing
      }

      const tab: SecondaryTab = {
        id,
        primaryTabId,
        label: entity.number ?? String(entity.id),
        mode: 'edit',
        entityId: entity.id,
        entityNumber: entity.number,
        closable: true,
        dirty: false,
        createdAt: now(),
        updatedAt: now(),
      }

      this.secondaryTabsByPrimaryId[primaryTabId] = [...(this.secondaryTabsByPrimaryId[primaryTabId] ?? []), tab]
      this.activateSecondaryTab(primaryTabId, id)
      return tab
    },

    openDetailSecondaryTab(primaryTabId: string, entity: { id: string | number; number?: string }) {
      this.ensureListSecondaryTab(primaryTabId)

      const id = detailSecondaryId(primaryTabId, entity.id)
      const existing = (this.secondaryTabsByPrimaryId[primaryTabId] ?? []).find((t) => t.id === id)
      if (existing) {
        this.activateSecondaryTab(primaryTabId, id)
        return existing
      }

      const tab: SecondaryTab = {
        id,
        primaryTabId,
        label: entity.number ?? String(entity.id),
        mode: 'detail',
        entityId: entity.id,
        entityNumber: entity.number,
        closable: true,
        dirty: false,
        createdAt: now(),
        updatedAt: now(),
      }

      this.secondaryTabsByPrimaryId[primaryTabId] = [...(this.secondaryTabsByPrimaryId[primaryTabId] ?? []), tab]
      this.activateSecondaryTab(primaryTabId, id)
      return tab
    },

    activateSecondaryTab(primaryTabId: string, secondaryTabId: string) {
      this.activePrimaryTabId = primaryTabId
      this.ensureListSecondaryTab(primaryTabId)
      const exists = (this.secondaryTabsByPrimaryId[primaryTabId] ?? []).some((tab) => tab.id === secondaryTabId)
      if (!exists) {
        this.activeSecondaryTabIdByPrimaryId[primaryTabId] = listSecondaryId(primaryTabId)
        return
      }
      this.activeSecondaryTabIdByPrimaryId[primaryTabId] = secondaryTabId
    },

    closeSecondaryTab(primaryTabId: string, secondaryTabId: string) {
      this.ensureListSecondaryTab(primaryTabId)
      if (secondaryTabId === listSecondaryId(primaryTabId)) return

      const tabs = this.secondaryTabsByPrimaryId[primaryTabId] ?? []
      const tab = tabs.find((t) => t.id === secondaryTabId)
      if (!tab || !tab.closable) return

      this.secondaryTabsByPrimaryId[primaryTabId] = tabs.filter((t) => t.id !== secondaryTabId)
      delete this.draftStateBySecondaryTabId[secondaryTabId]
      secondarySaveHandlers.delete(secondaryTabId)

      const currentActive = this.activeSecondaryTabIdByPrimaryId[primaryTabId]
      if (currentActive === secondaryTabId) {
        this.activeSecondaryTabIdByPrimaryId[primaryTabId] = listSecondaryId(primaryTabId)
      }
    },

    setSecondaryDirty(secondaryTabId: string, dirty: boolean) {
      for (const [primaryTabId, tabs] of Object.entries(this.secondaryTabsByPrimaryId)) {
        const idx = tabs.findIndex((t) => t.id === secondaryTabId)
        if (idx === -1) continue
        const current = tabs[idx]
        if (!current) return
        tabs[idx] = { ...current, dirty, updatedAt: now() }
        this.secondaryTabsByPrimaryId[primaryTabId] = [...tabs]
        return
      }
    },

    updateDraftState(secondaryTabId: string, value: unknown) {
      this.draftStateBySecondaryTabId[secondaryTabId] = value
    },

    patchDraftState(secondaryTabId: string, partial: Record<string, unknown>) {
      const prev = (this.draftStateBySecondaryTabId[secondaryTabId] ?? {}) as Record<string, unknown>
      this.draftStateBySecondaryTabId[secondaryTabId] = { ...prev, ...partial }
    },

    clearDraftState(secondaryTabId: string) {
      delete this.draftStateBySecondaryTabId[secondaryTabId]
      this.setSecondaryDirty(secondaryTabId, false)
    },

    registerSecondarySaveHandler(secondaryTabId: string, handler: SecondarySaveHandler) {
      secondarySaveHandlers.set(secondaryTabId, handler)
    },

    unregisterSecondarySaveHandler(secondaryTabId: string) {
      secondarySaveHandlers.delete(secondaryTabId)
    },

    hasSecondarySaveHandler(secondaryTabId: string) {
      return secondarySaveHandlers.has(secondaryTabId)
    },

    async saveSecondaryTab(secondaryTabId: string) {
      const handler = secondarySaveHandlers.get(secondaryTabId)
      if (!handler) return false
      return Boolean(await handler())
    },

    ensureWorkspaceListState(primaryTabId: string) {
      if (!this.listStateByPrimaryTabId[primaryTabId]) {
        this.listStateByPrimaryTabId[primaryTabId] = defaultListState()
      }
      return this.listStateByPrimaryTabId[primaryTabId]
    },

    getListState(primaryTabId: string) {
      return this.ensureWorkspaceListState(primaryTabId)
    },

    updateListState(primaryTabId: string, state: Partial<WorkspaceListState>) {
      this.listStateByPrimaryTabId[primaryTabId] = {
        ...this.ensureWorkspaceListState(primaryTabId),
        ...state,
      }
    },

    patchListState(primaryTabId: string, partial: Partial<WorkspaceListState>) {
      this.updateListState(primaryTabId, partial)
    },

    clearWorkspaceState(primaryTabId: string) {
      const secondaries = this.secondaryTabsByPrimaryId[primaryTabId] ?? []
      for (const sec of secondaries) {
        delete this.draftStateBySecondaryTabId[sec.id]
        secondarySaveHandlers.delete(sec.id)
      }
      delete this.secondaryTabsByPrimaryId[primaryTabId]
      delete this.activeSecondaryTabIdByPrimaryId[primaryTabId]
      delete this.listStateByPrimaryTabId[primaryTabId]
    },

    closeAllTabs() {
      const keep = this.primaryTabs.find((t) => t.id === DASHBOARD_PRIMARY_ID)
      this.primaryTabs = keep ? [keep] : []
      this.activePrimaryTabId = DASHBOARD_PRIMARY_ID
      this.secondaryTabsByPrimaryId = {
        [DASHBOARD_PRIMARY_ID]: [],
      }
      this.activeSecondaryTabIdByPrimaryId = {}
      this.draftStateBySecondaryTabId = {}
      this.listStateByPrimaryTabId = {}
      secondarySaveHandlers.clear()
    },

    resetForCompanySwitch() {
      // Workspace rows, selected IDs, forms, and drafts are tenant-scoped.
      // Bump the version so KeepAlive remounts cached workspace components.
      this.closeAllTabs()
      this.tenantStateVersion += 1
    },
  },
})
