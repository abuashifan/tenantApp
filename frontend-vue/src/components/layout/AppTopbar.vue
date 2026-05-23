<script setup lang="ts">
import { Bell, ChevronDown, Menu, UserRound } from 'lucide-vue-next'

import IconButton from '@/components/ui/IconButton.vue'
import PrimaryTabsBar from '@/components/navigation/PrimaryTabsBar.vue'
import type { PrimaryTab } from '@/stores/workspaceTabsStore'

defineProps<{
  tabs: PrimaryTab[]
  activeId: string
}>()

const emit = defineEmits<{
  activate: [tabId: string]
  close: [tabId: string]
  mobileMenu: []
}>()
</script>

<template>
  <header class="flex h-20 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
    <button
      type="button"
      class="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 lg:hidden"
      @click="emit('mobileMenu')"
    >
      <Menu class="h-5 w-5" />
    </button>

    <PrimaryTabsBar :tabs="tabs" :active-id="activeId" @activate="(id) => emit('activate', id)" @close="(id) => emit('close', id)" />

    <div class="flex items-center gap-2">
      <IconButton variant="ghost" size="md">
        <Bell class="h-5 w-5" />
      </IconButton>
      <button type="button" class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50">
        <div class="grid h-8 w-8 place-items-center rounded-xl bg-[#06131e] text-[#b4db24]">
          <UserRound class="h-4 w-4" />
        </div>
        <div class="hidden text-left md:block">
          <p class="text-xs font-bold text-slate-900">Admin User</p>
          <p class="text-[11px] text-slate-400">Owner</p>
        </div>
        <ChevronDown class="h-4 w-4 text-slate-400" />
      </button>
    </div>
  </header>
</template>
