<script setup lang="ts">
import WorkspaceConfirmDialog from '@/components/workspace/WorkspaceConfirmDialog.vue'

defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'danger'
}>()

defineEmits<{
  confirm: []
  cancel: []
  close: []
}>()
</script>

<template>
  <WorkspaceConfirmDialog
    :open="open"
    :title="title"
    :message="message"
    :confirm-label="confirmLabel"
    :cancel-label="cancelLabel"
    :variant="variant === 'danger' ? 'danger' : 'primary'"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
    @close="$emit('close')"
  />
</template>
