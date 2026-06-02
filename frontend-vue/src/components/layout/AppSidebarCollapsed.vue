<script setup lang="ts">
import { Building2, PanelLeftOpen, X, ChevronRight } from 'lucide-vue-next'

import type { SidebarMenuGroup, SidebarMenuItem } from '@/navigation/sidebar'
import { cn } from '@/utils/cn'

defineProps<{
  modules: SidebarMenuGroup[]
  activeModuleKey: string
  activeHref: string
  floatingModuleKey: string | null
}>()

const emit = defineEmits<{
  activateModule: [moduleKey: string]
  setFloating: [moduleKey: string | null]
  expand: []
  openItem: [item: SidebarMenuItem]
}>()
</script>

<template>
  <aside class="app-viewport hidden w-20 shrink-0 flex-col items-center bg-[#06131e] py-4 text-white shadow-2xl shadow-slate-950/30 lg:flex">
    <div class="grid h-12 w-12 place-items-center rounded-2xl bg-[#b4db24] text-[#06131e]">
      <Building2 class="h-6 w-6" />
    </div>
    <button
      type="button"
      class="mt-5 rounded-2xl p-3 text-white/60 hover:bg-white/10 hover:text-white"
      @click="emit('expand')"
    >
      <PanelLeftOpen class="h-5 w-5" />
    </button>
    <div class="mt-6 flex flex-1 flex-col gap-2">
      <button
        v-for="module in modules"
        :key="module.key"
        type="button"
        :title="module.label"
        :class="
          cn(
            'grid h-12 w-12 place-items-center rounded-2xl transition',
            activeModuleKey === module.key || floatingModuleKey === module.key
              ? 'bg-[#b4db24] text-[#06131e]'
              : 'text-white/60 hover:bg-white/10 hover:text-white',
          )
        "
        @click="emit('activateModule', module.key)"
      >
        <component :is="module.icon" class="h-5 w-5" />
      </button>
    </div>
  </aside>

  <div
    v-if="floatingModuleKey"
    class="fixed left-24 top-24 z-40 hidden w-72 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/15 lg:block"
  >
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Submenu</p>
        <h3 class="font-bold text-slate-950">
          {{ modules.find((m) => m.key === floatingModuleKey)?.label }}
        </h3>
      </div>
      <button
        type="button"
        class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        @click="emit('setFloating', null)"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <div class="space-y-1">
      <button
        v-for="item in modules.find((m) => m.key === floatingModuleKey)?.items ?? []"
        :key="item.id"
        type="button"
        :class="
          cn(
            'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold hover:bg-[#f7fbe9] hover:text-[#48580e]',
            activeHref === item.href ? 'bg-[#f7fbe9] text-[#48580e]' : 'text-slate-600',
          )
        "
        :aria-current="activeHref === item.href ? 'page' : undefined"
        @click="emit('openItem', item)"
      >
        {{ item.label }}
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
