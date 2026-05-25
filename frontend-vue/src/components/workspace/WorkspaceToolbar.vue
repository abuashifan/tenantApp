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
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:startDate': [value: string]
  'update:endDate': [value: string]
  toggleFilters: []
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
</script>

<template>
  <div
    class="flex flex-col gap-3"
    :class="embedded ? 'border-b border-slate-100 pb-4' : 'rounded-3xl border border-slate-200 bg-white p-4 shadow-sm'"
  >
    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto] lg:items-end">
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

        <label v-if="config.statusOptions?.length" class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Status</span>
          <BaseButton variant="secondary" size="md" @click="emit('toggleFilters')">
            <SlidersHorizontal class="h-4 w-4" />
            Filter
          </BaseButton>
        </label>
      </div>

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

    <slot name="toolbar-bottom" />
  </div>
</template>
