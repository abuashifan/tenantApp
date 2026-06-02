<script setup lang="ts">
import { computed } from 'vue'
import { Download, Plus, RefreshCw } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import { usePermission } from '@/composables/usePermission'
import type { WorkspaceGlobalAction } from '@/types/workspace'

const props = withDefaults(
  defineProps<{
    createLabel?: string
    createPermission?: string
    selectedCount?: number
    actions?: WorkspaceGlobalAction[]
  }>(),
  {
    createLabel: 'Create New',
    selectedCount: 0,
    actions: () => [],
  },
)

const emit = defineEmits<{
  create: []
  refresh: []
  actionClick: [key: string]
}>()

const { can } = usePermission()
const visibleActions = computed(() =>
  props.actions.filter((action) => action.visible !== false && can(action.permission)),
)
</script>

<template>
  <div class="flex min-w-max flex-nowrap items-center justify-start gap-2 xl:justify-end">
    <BaseButton variant="secondary" size="sm" @click="emit('refresh')">
      <RefreshCw class="h-4 w-4" />
      Refresh
    </BaseButton>

    <BaseButton
      v-for="action in visibleActions"
      :key="action.key"
      :variant="action.variant === 'danger' ? 'danger' : 'secondary'"
      size="sm"
      :disabled="selectedCount === 0 && action.variant === 'danger'"
      @click="emit('actionClick', action.key)"
    >
      <Download v-if="action.icon === 'export'" class="h-4 w-4" />
      {{ action.label }}
    </BaseButton>

    <BaseButton v-if="createLabel && createPermission && can(createPermission)" variant="secondary" size="sm" @click="emit('create')">
      <Plus class="h-4 w-4" />
      {{ createLabel }}
    </BaseButton>
  </div>
</template>
