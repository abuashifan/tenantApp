<script setup lang="ts">
import type { PermissionCatalogModule } from '@/services/access/permissions.service'

defineProps<{
  modules: PermissionCatalogModule[]
  activeModuleKey: string
}>()

const emit = defineEmits<{
  select: [moduleKey: string]
}>()
</script>

<template>
  <div class="flex gap-2 overflow-x-auto border-b border-slate-200">
    <button
      v-for="module in modules"
      :key="module.key"
      type="button"
      class="whitespace-nowrap border-b-2 px-3 py-3 text-sm font-bold"
      :class="module.key === activeModuleKey ? 'border-[#1d81af] text-[#1d81af]' : 'border-transparent text-slate-500 hover:text-slate-900'"
      @click="emit('select', module.key)"
    >
      {{ module.label }}
    </button>
  </div>
</template>
