<script setup lang="ts" generic="TRow">
import { computed } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import { usePermission } from '@/composables/usePermission'
import type { WorkspaceRowAction } from '@/types/workspace'

const props = defineProps<{
  row: TRow
  actions: WorkspaceRowAction<TRow>[]
}>()

const emit = defineEmits<{
  actionClick: [key: string, row: TRow]
}>()

const { can } = usePermission()
const visibleActions = computed(() =>
  props.actions.filter((action) => {
    if (!can(action.permission)) return false
    return action.visibleWhen ? action.visibleWhen(props.row) : true
  }),
)
</script>

<template>
  <div class="flex items-center justify-end gap-2">
    <BaseButton
      v-for="action in visibleActions"
      :key="action.key"
      :variant="action.variant === 'danger' ? 'danger' : 'secondary'"
      size="sm"
      :disabled="action.disabledWhen?.(row) ?? false"
      @click="emit('actionClick', action.key, row)"
    >
      {{ action.label }}
    </BaseButton>
  </div>
</template>
