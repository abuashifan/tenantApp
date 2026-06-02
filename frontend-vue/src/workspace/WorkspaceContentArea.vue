<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import { defaultWorkspaceComponent, workspaceRegistry } from '@/workspace/registry'

const tabs = useWorkspaceTabsStore()
const route = useRoute()

const activeComponent = computed(() => {
  const routeRegistryKey = route.meta.workspaceRegistryKey as string | undefined
  return workspaceRegistry[tabs.activePrimaryTabId] ?? (routeRegistryKey ? workspaceRegistry[routeRegistryKey] : undefined) ?? defaultWorkspaceComponent
})
const activeKey = computed(() => `tenant:${tabs.tenantStateVersion}:primary:${tabs.activePrimaryTabId}`)
</script>

<template>
  <div class="h-full min-h-0 min-w-0">
    <KeepAlive>
      <component :is="activeComponent" :key="activeKey" />
    </KeepAlive>
  </div>
</template>
