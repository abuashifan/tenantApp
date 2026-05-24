<script setup lang="ts">
import { computed } from 'vue'

import { findSidebarMenuItem } from '@/navigation/sidebar'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const tabs = useWorkspaceTabsStore()
const item = computed(() => findSidebarMenuItem(tabs.activePrimaryTabId))
const title = computed(() => item.value?.label ?? tabs.activePrimaryTab?.label ?? 'Workspace')
</script>

<template>
  <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
    <p class="text-sm font-semibold text-[#1d81af]">{{ item?.module ?? 'Workspace' }}</p>
    <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-950">{{ title }}</h1>
    <p class="mt-2 text-sm leading-6 text-slate-500">
      Backend endpoint tersedia:
      <span class="font-semibold text-slate-700">GET /api{{ item?.endpoint }}</span>
    </p>
    <p class="mt-2 text-sm leading-6 text-slate-500">
      Halaman frontend belum diimplementasi. Tab workspace ini disediakan agar menu tetap mengikuti kemampuan backend dan
      permission aktif.
    </p>
  </div>
</template>
