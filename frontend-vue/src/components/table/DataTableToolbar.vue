<script setup lang="ts">
import { Filter, Plus, Search, Slash } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    search: string
    startDate: string
    endDate: string
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
  }>(),
  {
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
  },
)

const emit = defineEmits<{
  'update:search': [value: string]
  'update:startDate': [value: string]
  'update:endDate': [value: string]
  filter: []
  create: []
  void: []
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
          props.showDateFilters
            ? 'grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(112px,0.36fr)_minmax(112px,0.36fr)]'
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
          <input
            :value="props.startDate"
            type="date"
            class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb]"
            @input="emit('update:startDate', ($event.target as HTMLInputElement).value)"
          />
        </label>

        <label v-if="props.showDateFilters" class="block min-w-0">
          <span class="sr-only">End Date</span>
          <input
            :value="props.endDate"
            type="date"
            class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb]"
            @input="emit('update:endDate', ($event.target as HTMLInputElement).value)"
          />
        </label>
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
          v-if="props.showVoid"
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
