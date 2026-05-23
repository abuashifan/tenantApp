<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  table: Table<unknown>
}>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
    <p class="text-xs font-semibold text-slate-500">
      Page <span class="font-bold text-slate-800">{{ table.getState().pagination.pageIndex + 1 }}</span>
      of <span class="font-bold text-slate-800">{{ table.getPageCount() }}</span>
    </p>

    <div class="flex items-center gap-2">
      <BaseButton
        variant="secondary"
        size="sm"
        :disabled="!table.getCanPreviousPage()"
        @click="table.previousPage()"
      >
        <ChevronLeft class="h-4 w-4" />
        Prev
      </BaseButton>
      <BaseButton
        variant="secondary"
        size="sm"
        :disabled="!table.getCanNextPage()"
        @click="table.nextPage()"
      >
        Next
        <ChevronRight class="h-4 w-4" />
      </BaseButton>
    </div>
  </div>
</template>
