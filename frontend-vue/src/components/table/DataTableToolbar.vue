<script setup lang="ts">
import { Filter, Plus, Search, Slash } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import DateInput from '@/components/ui/DateInput.vue'
import BaseMultiSelect from '@/components/ui/BaseMultiSelect.vue'
import type { WorkspaceStatusFilter, WorkspaceStatusOption } from '@/types/workspace'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    search: string
    startDate: string
    endDate: string
    status?: WorkspaceStatusFilter
    statusOptions?: WorkspaceStatusOption[]
    selectedCount: number
    searchPlaceholder?: string
    createLabel?: string
    voidLabel?: string
    filterLabel?: string
    showCreate?: boolean
    showVoid?: boolean
    showFilter?: boolean
    showDateFilters?: boolean
    embedded?: boolean
    bulkActions?: Array<{ key: string; label: string; variant?: 'primary' | 'secondary' | 'danger' }>
  }>(),
  {
    status: () => [],
    statusOptions: () => [],
    selectedCount: 0,
    searchPlaceholder: 'Search transaction number…',
    createLabel: 'Create New',
    voidLabel: 'Void',
    filterLabel: 'Filter',
    showCreate: true,
    showVoid: true,
    showFilter: true,
    showDateFilters: true,
    embedded: false,
    bulkActions: () => [],
  },
)

const emit = defineEmits<{
  'update:search': [value: string]
  'update:startDate': [value: string]
  'update:endDate': [value: string]
  'update:status': [value: WorkspaceStatusFilter]
  filter: []
  create: []
  void: []
  bulkAction: [key: string]
}>()
</script>

<template>
  <div
    :class="
      cn(
        'flex min-w-0 flex-col gap-2',
        props.embedded ? 'border-b border-slate-100 pb-2' : 'rounded-2xl border border-slate-200 bg-white p-3 shadow-sm',
      )
    "
  >
    <div class="grid min-w-0 items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
      <div
        class="grid w-full min-w-0 items-center gap-2"
        :class="
          props.showDateFilters && props.statusOptions.length
            ? 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(112px,0.34fr)_minmax(112px,0.34fr)_minmax(132px,0.4fr)]'
            : props.showDateFilters
              ? 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(112px,0.36fr)_minmax(112px,0.36fr)]'
              : props.statusOptions.length
                ? 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(132px,0.4fr)]'
                : 'grid-cols-1'
        "
      >
        <label class="block min-w-0">
          <span class="sr-only">Search</span>
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              :value="props.search"
              class="h-9 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb]"
              :placeholder="props.searchPlaceholder"
              @input="emit('update:search', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </label>

        <label v-if="props.showDateFilters" class="block min-w-0">
          <span class="sr-only">Start Date</span>
          <DateInput :model-value="props.startDate" compact @update:model-value="emit('update:startDate', $event)" />
        </label>

        <label v-if="props.showDateFilters" class="block min-w-0">
          <span class="sr-only">End Date</span>
          <DateInput :model-value="props.endDate" compact @update:model-value="emit('update:endDate', $event)" />
        </label>

        <BaseMultiSelect
          v-if="props.statusOptions.length"
          :model-value="props.status"
          :options="props.statusOptions"
          all-label="All Status"
          none-label="All Status"
          aria-label="Status filter"
          @update:model-value="emit('update:status', $event)"
        />
      </div>

      <div class="workspace-table-scroll flex min-w-0 flex-nowrap items-center justify-start gap-2 overflow-x-auto md:justify-end">
        <BaseButton v-if="props.showFilter" variant="secondary" size="sm" @click="emit('filter')">
          <Filter class="h-4 w-4" />
          {{ props.filterLabel }}
        </BaseButton>
        <BaseButton v-if="props.showCreate" variant="secondary" size="sm" @click="emit('create')">
          <Plus class="h-4 w-4" />
          {{ props.createLabel }}
        </BaseButton>
        <BaseButton
          v-for="action in props.bulkActions"
          :key="action.key"
          :variant="action.variant ?? 'secondary'"
          size="sm"
          :disabled="props.selectedCount === 0"
          @click="emit('bulkAction', action.key)"
        >
          {{ action.label }}
        </BaseButton>
        <BaseButton
          v-if="props.showVoid && props.bulkActions.length === 0"
          variant="danger"
          size="sm"
          :disabled="props.selectedCount === 0"
          @click="emit('void')"
        >
          <Slash class="h-4 w-4" />
          {{ props.voidLabel }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
