import { defineStore } from 'pinia'

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
  listStateByPrimaryTabId: Record<string, unknown>
}

function now() {
  return Date.now()
}

function listSecondaryId(primaryTabId: string) {
  return `${primaryTabId}::list`
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
      [DASHBOARD_PRIMARY_ID]: [
        {
          id: listSecondaryId(DASHBOARD_PRIMARY_ID),
          primaryTabId: DASHBOARD_PRIMARY_ID,
          label: '',
          mode: 'list',
          closable: false,
          dirty: false,
          createdAt: now(),
          updatedAt: now(),
        },
      ],
    },
    activeSecondaryTabIdByPrimaryId: {
      [DASHBOARD_PRIMARY_ID]: listSecondaryId(DASHBOARD_PRIMARY_ID),
    },
    draftStateBySecondaryTabId: {},
    listStateByPrimaryTabId: {},
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
  },

  actions: {
    openPrimaryTab(tab: PrimaryTab) {
      const existing = this.primaryTabs.find((t) => t.id === tab.id)
      if (!existing) this.primaryTabs.push(tab)
      this.activatePrimaryTab(tab.id)
      this.ensureListSecondaryTab(tab.id)
    },

    activatePrimaryTab(primaryTabId: string) {
      this.activePrimaryTabId = primaryTabId
      this.ensureListSecondaryTab(primaryTabId)
      if (!this.activeSecondaryTabIdByPrimaryId[primaryTabId]) {
        this.activeSecondaryTabIdByPrimaryId[primaryTabId] = listSecondaryId(primaryTabId)
      }
    },

    closePrimaryTab(primaryTabId: string) {
      const tab = this.primaryTabs.find((t) => t.id === primaryTabId)
      if (!tab || !tab.closable) return

      const secondaries = this.secondaryTabsByPrimaryId[primaryTabId] ?? []
      for (const sec of secondaries) {
        delete this.draftStateBySecondaryTabId[sec.id]
      }
      delete this.secondaryTabsByPrimaryId[primaryTabId]
      delete this.activeSecondaryTabIdByPrimaryId[primaryTabId]
      delete this.listStateByPrimaryTabId[primaryTabId]

      this.primaryTabs = this.primaryTabs.filter((t) => t.id !== primaryTabId)

      if (this.activePrimaryTabId === primaryTabId) {
        this.activePrimaryTabId = DASHBOARD_PRIMARY_ID
      }
    },

    ensureListSecondaryTab(primaryTabId: string) {
      const listId = listSecondaryId(primaryTabId)
      const existing = this.secondaryTabsByPrimaryId[primaryTabId] ?? []
      if (!existing.some((t) => t.id === listId)) {
        this.secondaryTabsByPrimaryId[primaryTabId] = [
          {
            id: listId,
            primaryTabId,
            label: '',
            mode: 'list',
            closable: false,
            dirty: false,
            createdAt: now(),
            updatedAt: now(),
          },
          ...existing,
        ]
      }
      if (!this.activeSecondaryTabIdByPrimaryId[primaryTabId]) {
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
      this.activeSecondaryTabIdByPrimaryId[primaryTabId] = secondaryTabId
    },

    closeSecondaryTab(primaryTabId: string, secondaryTabId: string) {
      const tabs = this.secondaryTabsByPrimaryId[primaryTabId] ?? []
      const tab = tabs.find((t) => t.id === secondaryTabId)
      if (!tab || !tab.closable) return

      this.secondaryTabsByPrimaryId[primaryTabId] = tabs.filter((t) => t.id !== secondaryTabId)
      delete this.draftStateBySecondaryTabId[secondaryTabId]

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

    updateListState(primaryTabId: string, state: unknown) {
      this.listStateByPrimaryTabId[primaryTabId] = state
    },

    closeAllTabs() {
      const keep = this.primaryTabs.find((t) => t.id === DASHBOARD_PRIMARY_ID)
      this.primaryTabs = keep ? [keep] : []
      this.activePrimaryTabId = DASHBOARD_PRIMARY_ID
      this.secondaryTabsByPrimaryId = {
        [DASHBOARD_PRIMARY_ID]: [
          {
            id: listSecondaryId(DASHBOARD_PRIMARY_ID),
            primaryTabId: DASHBOARD_PRIMARY_ID,
            label: '',
            mode: 'list',
            closable: false,
            dirty: false,
            createdAt: now(),
            updatedAt: now(),
          },
        ],
      }
      this.activeSecondaryTabIdByPrimaryId = {
        [DASHBOARD_PRIMARY_ID]: listSecondaryId(DASHBOARD_PRIMARY_ID),
      }
      this.draftStateBySecondaryTabId = {}
      this.listStateByPrimaryTabId = {}
    },
  },
})
