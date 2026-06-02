<script setup lang="ts">
import { FileText, X } from 'lucide-vue-next'

import type { PrimaryTab } from '@/stores/workspaceTabsStore'
import { cn } from '@/utils/cn'

defineProps<{
  tabs: PrimaryTab[]
  activeId: string
}>()

const emit = defineEmits<{
  activate: [tabId: string]
  close: [tabId: string]
}>()
</script>

<template>
  <div class="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      :class="
        cn(
          'tablet-primary-tab group flex h-10 max-w-[220px] shrink-0 items-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition',
          activeId === tab.id
            ? 'border-[#fecdd3] bg-[#fff1f2] text-[#e11d48]'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
        )
      "
      @click="emit('activate', tab.id)"
    >
      <FileText class="h-4 w-4 shrink-0" />
      <span class="truncate">{{ tab.label }}</span>
      <span
        v-if="tab.closable"
        class="grid h-5 w-5 place-items-center rounded-full text-slate-400 hover:bg-white hover:text-slate-700"
        @click.stop="emit('close', tab.id)"
      >
        <X class="h-3.5 w-3.5" />
      </span>
    </button>
  </div>
</template>
