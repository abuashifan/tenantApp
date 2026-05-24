<script setup lang="ts">
import { computed } from 'vue'

import BackendResourceForm from '@/features/workspace/backend-resource/BackendResourceForm.vue'
import { journalFormConfig } from '@/features/workspace/backend-resource/backendResource.form.config'
import { journalListConfig } from '@/features/accounting/journals/journal-list.config'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const tabs = useWorkspaceTabsStore()
const activeSecondaryId = computed(
  () => tabs.activeSecondaryTabIdByPrimaryId[journalListConfig.primaryTabId] ?? `${journalListConfig.primaryTabId}::list`,
)
const activeSecondary = computed(() =>
  (tabs.secondaryTabsByPrimaryId[journalListConfig.primaryTabId] ?? []).find((tab) => tab.id === activeSecondaryId.value),
)

function closeForm() {
  if (!activeSecondary.value) return
  tabs.clearDraftState(activeSecondary.value.id)
  tabs.closeSecondaryTab(journalListConfig.primaryTabId, activeSecondary.value.id)
}
</script>

<template>
  <BackendResourceForm
    v-if="activeSecondary"
    :config="journalFormConfig"
    :primary-tab-id="journalListConfig.primaryTabId"
    :tab="activeSecondary"
    @close="closeForm"
  />
</template>
