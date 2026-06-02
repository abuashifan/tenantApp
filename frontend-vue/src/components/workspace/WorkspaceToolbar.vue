<script setup lang="ts" generic="TRow = unknown">
import { computed, ref, watch } from 'vue'
import { SlidersHorizontal } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseMultiSelect from '@/components/ui/BaseMultiSelect.vue'
import WorkspaceActionBar from '@/components/workspace/WorkspaceActionBar.vue'
import WorkspaceDateRangeFilter from '@/components/workspace/WorkspaceDateRangeFilter.vue'
import WorkspaceSearchBar from '@/components/workspace/WorkspaceSearchBar.vue'
import { useDebounce } from '@/composables/useDebounce'
import type { WorkspaceListConfig, WorkspaceStatusFilter } from '@/types/workspace'

const props = defineProps<{
  config: WorkspaceListConfig<TRow>
  search: string
  startDate: string
  endDate: string
  status: WorkspaceStatusFilter
  selectedCount: number
  embedded?: boolean
  hasFilters?: boolean
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:startDate': [value: string]
  'update:endDate': [value: string]
  'update:status': [value: WorkspaceStatusFilter]
  toggleFilters: []
  create: []
  refresh: []
  actionClick: [key: string]
}>()

const localSearch = ref(props.search)
const emitDebouncedSearch = useDebounce((value: string) => emit('update:search', value), props.config.search?.debounceMs ?? 300)
const filterGridClass = computed(() => {
  const hasDate = Boolean(props.config.dateFilter?.enabled)
  const hasStatus = Boolean(props.config.statusOptions?.length)
  const hasToggle = Boolean(props.hasFilters)

  if (hasDate && hasStatus && hasToggle) {
    return 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(112px,0.34fr)_minmax(112px,0.34fr)_minmax(132px,0.4fr)_auto]'
  }
  if (hasDate && hasStatus) {
    return 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(112px,0.34fr)_minmax(112px,0.34fr)_minmax(132px,0.4fr)]'
  }
  if (hasDate && hasToggle) {
    return 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(112px,0.36fr)_minmax(112px,0.36fr)_auto]'
  }
  if (hasDate) {
    return 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(112px,0.36fr)_minmax(112px,0.36fr)]'
  }
  if (hasStatus && hasToggle) {
    return 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(132px,0.4fr)_auto]'
  }
  if (hasStatus) {
    return 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(132px,0.4fr)]'
  }
  return hasToggle ? 'grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-1'
})

watch(
  () => props.search,
  (value) => {
    if (value !== localSearch.value) localSearch.value = value
  },
)

watch(localSearch, (value) => emitDebouncedSearch(value))
</script>

<template>
  <div
    class="flex min-w-0 flex-col gap-2"
    :class="embedded ? 'border-b border-slate-100 pb-2' : 'rounded-2xl border border-slate-200 bg-white p-3 shadow-sm'"
  >
    <div class="grid min-w-0 items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
      <div
        class="grid min-w-0 items-center gap-2"
        :class="filterGridClass"
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

        <BaseMultiSelect
          v-if="config.statusOptions?.length"
          :model-value="status"
          :options="config.statusOptions"
          all-label="All Status"
          none-label="All Status"
          aria-label="Status filter"
          @update:model-value="emit('update:status', $event)"
        />

        <BaseButton v-if="hasFilters" variant="secondary" size="sm" @click="emit('toggleFilters')">
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

  </div>
</template>
