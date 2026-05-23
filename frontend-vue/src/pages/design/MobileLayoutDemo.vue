<script setup lang="ts">
import { computed } from 'vue'

import FormShell from '@/components/form/FormShell.vue'
import MobileTopbar from '@/components/layout/MobileTopbar.vue'
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer.vue'
import MobileBottomActionBar from '@/components/layout/MobileBottomActionBar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()

const sidebarOpen = computed(() => ui.mobileSidebarOpen)
</script>

<template>
  <div class="min-h-dvh bg-slate-50">
    <MobileTopbar title="Mobile Layout Demo" @menu="ui.openMobileSidebar()">
      <template #right>
        <span class="text-xs font-bold text-slate-500">Company: Demo</span>
      </template>
    </MobileTopbar>

    <MobileSidebarDrawer :open="sidebarOpen" @close="ui.closeMobileSidebar()">
      <nav class="space-y-2 text-sm font-semibold text-slate-700">
        <a class="block rounded-xl px-3 py-2 hover:bg-slate-100" href="#">Dashboard</a>
        <a class="block rounded-xl px-3 py-2 hover:bg-slate-100" href="#">Journals</a>
        <a class="block rounded-xl px-3 py-2 hover:bg-slate-100" href="#">Sales</a>
      </nav>
    </MobileSidebarDrawer>

    <FormShell class="pt-3">
      <div class="space-y-4">
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 class="text-lg font-extrabold text-slate-950">Responsive workspace</h1>
          <p class="mt-1 text-sm text-slate-500">
            TODO: Integrate virtual tabs + table + form patterns into AppShell design spec.
          </p>
        </div>

        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div class="overflow-x-auto">
            <div class="min-w-[720px] p-4 text-sm text-slate-600">
              Workspace table horizontally scrolls on mobile (placeholder content).
            </div>
          </div>
        </div>
      </div>
    </FormShell>

    <MobileBottomActionBar>
      <BaseButton class="flex-1" variant="secondary">Cancel</BaseButton>
      <BaseButton class="flex-1" variant="primary">Save</BaseButton>
    </MobileBottomActionBar>
  </div>
</template>
