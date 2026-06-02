<script setup lang="ts">
import { Pencil } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'

const props = withDefaults(
  defineProps<{
    selectedCount: number
    editLabel?: string
    showEdit?: boolean
  }>(),
  {
    editLabel: 'Edit first selected',
    showEdit: true,
  },
)

defineEmits<{
  edit: []
}>()
</script>

<template>
  <div v-if="props.showEdit && props.selectedCount > 0" class="flex justify-end">
    <BaseButton
      variant="secondary"
      size="sm"
      :disabled="props.selectedCount === 0"
      @click="$emit('edit')"
    >
      <Pencil class="h-4 w-4" />
      {{ props.editLabel }}
    </BaseButton>
  </div>
</template>
