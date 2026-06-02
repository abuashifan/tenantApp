<script setup lang="ts">
import { ListTree, X } from 'lucide-vue-next'

import type { SecondaryTab } from '@/stores/workspaceTabsStore'
import { cn } from '@/utils/cn'

withDefaults(
  defineProps<{
    tabs: SecondaryTab[]
    activeId: string
    attached?: boolean
  }>(),
  {
    attached: false,
  },
)

const emit = defineEmits<{
  activate: [tabId: string]
  close: [tabId: string]
}>()
</script>

<template>
  <div
    :class="
      cn(
        'flex min-w-0 overflow-x-auto',
        attached
          ? 'items-end gap-1 bg-transparent'
          : 'items-center gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm',
      )
    "
  >
    <div v-for="tab in tabs" :key="tab.id" class="shrink-0">
      <div
        :class="
          cn(
            'group flex items-center gap-2 border text-xs font-extrabold transition',
            attached ? 'tablet-secondary-tab h-10 rounded-t-xl px-4 text-sm font-medium' : 'h-9 rounded-xl px-3',
            tab.id === activeId
              ? attached
                ? 'relative z-10 -mb-px border-rose-500 border-b-white bg-white text-slate-950 shadow-[0_-3px_10px_rgba(244,63,94,0.12)]'
                : 'border-[#b4db24] bg-[#f7fbe9] text-[#48580e]'
              : attached
                ? 'border-slate-200/60 bg-white/30 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white',
          )
        "
        role="button"
        tabindex="0"
        :title="tab.label"
        @click="emit('activate', tab.id)"
        @keydown.enter="emit('activate', tab.id)"
      >
        <ListTree v-if="tab.mode === 'list'" class="h-4 w-4" />
        <span v-if="tab.label && tab.mode !== 'list'" class="truncate">{{ tab.label }}</span>
        <span v-if="tab.dirty" class="h-2 w-2 rounded-full bg-[#e11d48]" />
        <button
          v-if="tab.closable"
          type="button"
          class="grid h-4 w-4 place-items-center rounded-full text-slate-400 hover:bg-white hover:text-slate-800"
          @click.stop="emit('close', tab.id)"
        >
          <X class="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>
</template>
