<script setup lang="ts">
import { ListTree, X } from 'lucide-vue-next'

import type { SecondaryTab } from '@/stores/workspaceTabsStore'
import { cn } from '@/utils/cn'

defineProps<{
  tabs: SecondaryTab[]
  activeId: string
}>()

const emit = defineEmits<{
  activate: [tabId: string]
  close: [tabId: string]
}>()
</script>

<template>
  <div class="flex items-center gap-2 overflow-x-auto rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
    <div v-for="tab in tabs" :key="tab.id" class="shrink-0">
      <div
        :class="
          cn(
            'group flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-extrabold transition',
            tab.id === activeId
              ? 'border-[#b4db24] bg-[#f7fbe9] text-[#48580e]'
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
        <span v-else class="truncate">{{ tab.label }}</span>
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
