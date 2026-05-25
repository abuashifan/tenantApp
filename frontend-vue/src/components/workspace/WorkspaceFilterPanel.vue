<script setup lang="ts">
import { computed } from 'vue'

import type { WorkspaceStatusOption } from '@/types/workspace'

const props = withDefaults(
  defineProps<{
    open?: boolean
    status: string
    statusOptions?: WorkspaceStatusOption[]
  }>(),
  {
    open: false,
    statusOptions: () => [],
  },
)

const hasStatus = computed(() => props.statusOptions.length > 0)

defineEmits<{
  'update:status': [value: string]
}>()
</script>

<template>
  <div v-if="open" class="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
    <slot>
      <label v-if="hasStatus" class="block max-w-xs space-y-1.5">
        <span class="text-xs font-bold text-slate-500">Status</span>
        <select
          :value="status"
          class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
          @change="$emit('update:status', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">All Status</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </slot>
  </div>
</template>
