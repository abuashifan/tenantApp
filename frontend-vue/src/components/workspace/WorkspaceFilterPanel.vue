<script setup lang="ts">
import { computed } from 'vue'

import type { WorkspaceStatusOption } from '@/types/workspace'

const props = withDefaults(
  defineProps<{
    open?: boolean
    status: string
    statusOptions?: WorkspaceStatusOption[]
    showIncludeVoid?: boolean
    includeVoid?: boolean
  }>(),
  {
    open: false,
    statusOptions: () => [],
    showIncludeVoid: false,
    includeVoid: false,
  },
)

const hasStatus = computed(() => props.statusOptions.length > 0)

defineEmits<{
  'update:status': [value: string]
  'update:includeVoid': [value: boolean]
}>()
</script>

<template>
  <aside v-if="open" class="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
    <slot>
      <div class="grid min-w-0 gap-3">
        <label v-if="hasStatus" class="block w-full space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Status</span>
          <select
            :value="status"
            class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb]"
            @change="$emit('update:status', ($event.target as HTMLSelectElement).value)"
          >
            <option value="">All Status</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
        <label v-if="showIncludeVoid" class="inline-flex h-9 items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            :checked="includeVoid"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-[#1d81af] focus:ring-[#24a1db]"
            @change="$emit('update:includeVoid', ($event.target as HTMLInputElement).checked)"
          />
          Include voided transactions
        </label>
      </div>
    </slot>
  </aside>
</template>
