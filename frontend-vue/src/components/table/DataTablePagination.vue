<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import type { WorkspacePagination } from '@/types/workspace'

const props = defineProps<{
  table: Table<unknown>
  compact?: boolean
  pagination?: WorkspacePagination
  showPageSize?: boolean
}>()

const pageCount = computed(() => Math.max(props.table.getPageCount(), 1))
</script>

<template>
  <div
    class="flex min-w-0 flex-none flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-3"
    :class="compact ? 'py-1.5' : 'py-3'"
  >
    <p class="text-xs font-semibold text-slate-500">
      Page <span class="font-bold text-slate-800">{{ table.getState().pagination.pageIndex + 1 }}</span>
      of <span class="font-bold text-slate-800">{{ pageCount }}</span>
      <template v-if="pagination">
        | <span class="font-bold text-slate-800">{{ pagination.total }}</span> items
        | <span class="font-bold text-slate-800">{{ pagination.perPage }}</span> per page
      </template>
    </p>

    <div class="flex min-w-0 flex-wrap items-center gap-2">
      <label v-if="showPageSize" class="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
        Rows
        <select
          :value="table.getState().pagination.pageSize"
          class="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#24a1db]"
          @change="table.setPageSize(Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="size in [10, 25, 50, 100]" :key="size" :value="size">{{ size }}</option>
        </select>
      </label>
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
