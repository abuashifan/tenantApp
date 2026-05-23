<script setup lang="ts">
import { Filter, Plus, Search, Slash } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'

const props = withDefaults(
  defineProps<{
    search: string
    startDate: string
    endDate: string
    selectedCount: number
  }>(),
  {
    selectedCount: 0,
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
  <div class="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:items-end">
        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Search</span>
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              :value="props.search"
              class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
              placeholder="Search transaction number…"
              @input="emit('update:search', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </label>

        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Start Date</span>
          <input
            :value="props.startDate"
            type="date"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
            @input="emit('update:startDate', ($event.target as HTMLInputElement).value)"
          />
        </label>

        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">End Date</span>
          <input
            :value="props.endDate"
            type="date"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
            @input="emit('update:endDate', ($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>

      <div class="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
        <BaseButton variant="secondary" size="md" @click="emit('filter')">
          <Filter class="h-4 w-4" />
          Filter
        </BaseButton>
        <BaseButton variant="secondary" size="md" @click="emit('create')">
          <Plus class="h-4 w-4" />
          Create New
        </BaseButton>
        <BaseButton variant="danger" size="md" :disabled="props.selectedCount === 0" @click="emit('void')">
          <Slash class="h-4 w-4" />
          Void
        </BaseButton>
      </div>
    </div>
  </div>
</template>
