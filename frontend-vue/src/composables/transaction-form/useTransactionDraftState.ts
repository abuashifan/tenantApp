import { onMounted, watch } from 'vue'
import type { FormContext } from 'vee-validate'

import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import { KNOWN_DATE_FIELDS, normalizeDateFields } from '@/utils/date'

function snapshot<T>(value: T): T {
  if (value == null || typeof value !== 'object') return value
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

export function useTransactionDraftState(secondaryTabId: string, form: FormContext<Record<string, unknown>>) {
  const tabs = useWorkspaceTabsStore()

  onMounted(() => {
    const draft = tabs.draftStateBySecondaryTabId[secondaryTabId] as Record<string, unknown> | undefined
    if (draft && typeof draft === 'object') {
      form.setValues(normalizeDateFields(snapshot(draft), KNOWN_DATE_FIELDS), false)
    }
  })

  watch(
    () => form.values,
    (values) => {
      tabs.updateDraftState(secondaryTabId, snapshot(values))
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

  function hasDraft() {
    const draft = tabs.draftStateBySecondaryTabId[secondaryTabId]
    return draft != null && typeof draft === 'object'
  }

  return { clearDraft, hasDraft }
}
