<script setup lang="ts" generic="TRow = unknown">
import { ref, watch } from 'vue'
import { SlidersHorizontal } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import WorkspaceActionBar from '@/components/workspace/WorkspaceActionBar.vue'
import WorkspaceDateRangeFilter from '@/components/workspace/WorkspaceDateRangeFilter.vue'
import WorkspaceSearchBar from '@/components/workspace/WorkspaceSearchBar.vue'
import { useDebounce } from '@/composables/useDebounce'
import type { WorkspaceListConfig } from '@/types/workspace'

const props = defineProps<{
  config: WorkspaceListConfig<TRow>
  search: string
  startDate: string
  endDate: string
  selectedCount: number
  embedded?: boolean
  showFilterActions?: boolean
  hasFilters?: boolean
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:startDate': [value: string]
  'update:endDate': [value: string]
  toggleFilters: []
  applyFilters: []
  resetFilters: []
  create: []
  refresh: []
  actionClick: [key: string]
}>()

const localSearch = ref(props.search)
const emitDebouncedSearch = useDebounce((value: string) => emit('update:search', value), props.config.search?.debounceMs ?? 300)

watch(
  () => props.search,
  (value) => {
    if (value !== localSearch.value) localSearch.value = value
  },
)

watch(localSearch, (value) => emitDebouncedSearch(value))

function applyFilters() {
  emit('update:search', localSearch.value)
  emit('applyFilters')
}
</script>

<template>
  <div
    class="flex min-w-0 flex-col gap-2"
    :class="embedded ? 'border-b border-slate-100 pb-2' : 'rounded-2xl border border-slate-200 bg-white p-3 shadow-sm'"
  >
    <div class="grid min-w-0 items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
      <div
        class="grid min-w-0 items-center gap-2"
        :class="
          config.dateFilter?.enabled
            ? 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(112px,0.36fr)_minmax(112px,0.36fr)_auto]'
            : 'grid-cols-[minmax(0,1fr)_auto]'
        "
      >
        <WorkspaceSearchBar
          v-if="config.search?.enabled !== false"
          v-model="localSearch"
          :placeholder="config.search?.placeholder"
        />

        <WorkspaceDateRangeFilter
          v-if="config.dateFilter?.enabled"
          :start-date="startDate"
          :end-date="endDate"
          :label="config.dateFilter.label"
          @update:start-date="emit('update:startDate', $event)"
          @update:end-date="emit('update:endDate', $event)"
        />

        <BaseButton v-if="hasFilters || config.statusOptions?.length" variant="secondary" size="sm" @click="emit('toggleFilters')">
          <SlidersHorizontal class="h-4 w-4" />
          Filter
        </BaseButton>
      </div>

      <div class="workspace-table-scroll flex min-w-0 items-center justify-start gap-2 overflow-x-auto md:justify-end">
        <slot name="toolbar-bottom" />
        <WorkspaceActionBar
          :create-label="config.createLabel"
          :create-permission="config.permissions?.create"
          :selected-count="selectedCount"
          :actions="config.globalActions"
          @create="emit('create')"
          @refresh="emit('refresh')"
          @action-click="emit('actionClick', $event)"
        />
      </div>
    </div>

    <div v-if="showFilterActions" class="flex justify-end gap-2">
      <BaseButton variant="secondary" size="sm" @click="emit('resetFilters')">Reset</BaseButton>
      <BaseButton variant="primary" size="sm" @click="applyFilters">Apply</BaseButton>
    </div>
  </div>
</template>
