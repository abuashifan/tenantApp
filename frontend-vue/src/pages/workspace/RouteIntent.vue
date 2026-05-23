<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const route = useRoute()
const tabs = useWorkspaceTabsStore()

onMounted(async () => {
  const primaryId = route.meta.primaryTabId as string | undefined
  const primaryLabel = route.meta.primaryTabLabel as string | undefined
  const closable = Boolean(route.meta.primaryTabClosable)

  if (primaryId && primaryLabel) {
    tabs.openPrimaryTab({ id: primaryId, label: primaryLabel, path: primaryId, closable })
    tabs.activatePrimaryTab(primaryId)
  }
})
</script>

<template>
  <!-- This route exists only to translate URL -> workspace tab intent. -->
  <div />
</template>
