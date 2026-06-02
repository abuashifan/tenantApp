<script setup lang="ts">
import { Building2, ChevronDown, Lock, PanelLeftClose } from 'lucide-vue-next'

import type { SidebarMenuGroup, SidebarMenuItem } from '@/navigation/sidebar'
import { cn } from '@/utils/cn'

defineProps<{
  modules: SidebarMenuGroup[]
  activeModuleKey: string
  activeHref: string
  activeCompanyName: string
  activeCompanyId: string | number | null
}>()

const emit = defineEmits<{
  toggleModule: [moduleKey: string]
  openItem: [item: SidebarMenuItem]
  collapse: []
}>()
</script>

<template>
  <aside class="app-viewport tablet-sidebar-full hidden w-[304px] shrink-0 flex-col bg-[#06131e] text-white shadow-2xl shadow-slate-950/30 lg:flex">
    <div class="flex h-20 items-center justify-between border-b border-white/10 px-5">
      <div class="flex items-center gap-3">
        <div class="grid h-11 w-11 place-items-center rounded-2xl bg-[#b4db24] text-[#06131e]">
          <Building2 class="h-6 w-6" />
        </div>
        <div>
          <p class="text-sm font-black tracking-tight">Akuntansiku</p>
          <p class="text-xs text-white/50">Vue ERP Workspace</p>
        </div>
      </div>
      <button
        type="button"
        class="rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white"
        @click="emit('collapse')"
      >
        <PanelLeftClose class="h-5 w-5" />
      </button>
    </div>

    <div class="border-b border-white/10 p-5">
      <div class="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
        <p class="text-xs text-white/50">Active Company</p>
        <p class="mt-1 truncate text-sm font-bold">{{ activeCompanyName }}</p>
        <div class="mt-3 flex items-center gap-2 text-xs text-[#f0f8d3]">
          <Lock class="h-3.5 w-3.5" />
          X-Company-ID: {{ activeCompanyId ?? '-' }}
        </div>
      </div>
    </div>

    <nav class="workspace-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
      <div class="space-y-2">
        <div v-for="module in modules" :key="module.key">
          <button
            type="button"
            :class="
              cn(
                'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition',
                activeModuleKey === module.key
                  ? 'bg-[#b4db24] text-[#06131e]'
                  : 'text-white/72 hover:bg-white/10 hover:text-white',
              )
            "
            @click="emit('toggleModule', module.key)"
          >
            <span class="flex items-center gap-3">
              <component :is="module.icon" class="h-5 w-5" />
              {{ module.label }}
            </span>
            <ChevronDown
              v-if="module.items.length > 0"
              :class="cn('h-4 w-4 transition', activeModuleKey === module.key ? 'rotate-180' : '')"
            />
          </button>

          <div v-if="activeModuleKey === module.key && module.items.length > 0" class="mt-2 space-y-1 rounded-2xl bg-white/5 p-2">
            <button
              v-for="item in module.items"
              :key="item.id"
              type="button"
              :class="
                cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/10 hover:text-white',
                  activeHref === item.href ? 'bg-white/10 font-bold text-white' : 'text-white/65',
                )
              "
              :aria-current="activeHref === item.href ? 'page' : undefined"
              @click="emit('openItem', item)"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-[#b4db24]" />
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>
