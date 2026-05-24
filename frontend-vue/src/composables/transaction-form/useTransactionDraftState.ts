import { onMounted, watch } from 'vue'
import type { FormContext } from 'vee-validate'

import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

export function useTransactionDraftState(secondaryTabId: string, form: FormContext<Record<string, unknown>>) {
  const tabs = useWorkspaceTabsStore()

  onMounted(() => {
    const draft = tabs.draftStateBySecondaryTabId[secondaryTabId] as Record<string, unknown> | undefined
    if (draft && typeof draft === 'object') {
      form.setValues(draft, false)
    }
  })

  watch(
    () => form.values,
    (values) => {
      tabs.updateDraftState(secondaryTabId, values)
      tabs.setSecondaryDirty(secondaryTabId, form.meta.value.dirty)
    },
    { deep: true },
  )

  watch(
    () => form.meta.value.dirty,
    (dirty) => tabs.setSecondaryDirty(secondaryTabId, dirty),
  )

  function clearDraft() {
    tabs.clearDraftState(secondaryTabId)
  }

  return { clearDraft }
}
