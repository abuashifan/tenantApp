<script setup lang="ts">
import { computed } from 'vue'

import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const tabs = useWorkspaceTabsStore()
const title = computed(() => tabs.activePrimaryTab?.label ?? 'Workspace')
</script>

<template>
  <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <p class="text-sm font-semibold text-[#1d81af]">{{ title }}</p>
    <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-950">Draft</h1>
    <p class="mt-2 text-sm leading-6 text-slate-500">
      TODO: Halaman ini menunggu design prototype/canvas sebelum implementasi UI final.
    </p>
  </div>
</template>
