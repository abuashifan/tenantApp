import { computed, type Ref } from 'vue'

import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

function snapshot<T>(value: T): T {
  if (value == null || typeof value !== 'object') return value
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

export function useWorkspaceDraft<TDraft extends Record<string, unknown>>(options?: {
  defaultDraft?: () => TDraft
  secondaryTabId?: string | Ref<string>
}) {
  const store = useWorkspaceTabsStore()

  const secondaryTabId = computed(() => {
    const provided = options?.secondaryTabId
    if (typeof provided === 'string') return provided
    if (provided) return provided.value
    return store.activeSecondaryTab?.id ?? ''
  })

  const dirty = computed(() => {
    const sid = secondaryTabId.value
    return Object.values(store.secondaryTabsByPrimaryId)
      .flat()
      .find((tab) => tab.id === sid)?.dirty ?? false
  })

  const draft = computed<TDraft>(() => {
    const sid = secondaryTabId.value
    if (!sid) return (options?.defaultDraft?.() ?? ({} as TDraft))
    const raw = store.draftStateBySecondaryTabId[sid]
    if (raw && typeof raw === 'object') return snapshot(raw as TDraft)
    return snapshot(options?.defaultDraft?.() ?? ({} as TDraft))
  })

  function setDraft(value: TDraft) {
    const sid = secondaryTabId.value
    if (!sid) return
    store.updateDraftState(sid, snapshot(value))
  }

  function patchDraft(partial: Partial<TDraft>) {
    const sid = secondaryTabId.value
    if (!sid) return
    store.patchDraftState(sid, snapshot(partial as Record<string, unknown>))
  }

  function setDirty(next: boolean) {
    const sid = secondaryTabId.value
    if (!sid) return
    store.setSecondaryDirty(sid, next)
  }

  function resetDraft() {
    const sid = secondaryTabId.value
    if (!sid) return
    store.clearDraftState(sid)
    const initial = options?.defaultDraft?.()
    if (initial) store.updateDraftState(sid, snapshot(initial))
  }

  return { draft, setDraft, patchDraft, dirty, setDirty, secondaryTabId, resetDraft }
}
