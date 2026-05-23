import { computed } from 'vue'

import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

export function useWorkspaceDraft<TDraft extends Record<string, unknown>>(options?: {
  defaultDraft?: () => TDraft
}) {
  const store = useWorkspaceTabsStore()

  const secondaryTabId = computed(() => store.activeSecondaryTab?.id ?? '')

  const dirty = computed(() => store.activeSecondaryTab?.dirty ?? false)

  const draft = computed<TDraft>(() => {
    const sid = secondaryTabId.value
    if (!sid) return (options?.defaultDraft?.() ?? ({} as TDraft))
    const raw = store.draftStateBySecondaryTabId[sid]
    if (raw && typeof raw === 'object') return raw as TDraft
    return (options?.defaultDraft?.() ?? ({} as TDraft))
  })

  function setDraft(value: TDraft) {
    const sid = secondaryTabId.value
    if (!sid) return
    store.updateDraftState(sid, value)
  }

  function patchDraft(partial: Partial<TDraft>) {
    const sid = secondaryTabId.value
    if (!sid) return
    store.patchDraftState(sid, partial as Record<string, unknown>)
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
    if (initial) store.updateDraftState(sid, initial)
  }

  return { draft, setDraft, patchDraft, dirty, setDirty, secondaryTabId, resetDraft }
}
