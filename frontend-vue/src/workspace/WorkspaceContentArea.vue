<script setup lang="ts">
import { computed } from 'vue'

import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import { defaultWorkspaceComponent, workspaceRegistry } from '@/workspace/registry'

const tabs = useWorkspaceTabsStore()

const activeComponent = computed(() => workspaceRegistry[tabs.activePrimaryTabId] ?? defaultWorkspaceComponent)
const activeKey = computed(() => `primary:${tabs.activePrimaryTabId}`)
</script>

<template>
  <KeepAlive>
    <component :is="activeComponent" :key="activeKey" />
  </KeepAlive>
</template>
