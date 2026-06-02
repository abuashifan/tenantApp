<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import type { WorkspaceActionVariant } from '@/types/workspace'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: WorkspaceActionVariant
  }>(),
  {
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'primary',
  },
)

defineEmits<{
  confirm: []
  cancel: []
  close: []
}>()
</script>

<template>
  <div v-if="open" class="workspace-scrollbar fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4" @click="$emit('close')">
    <div class="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" @click.stop>
      <h2 class="text-lg font-black text-slate-950">{{ title }}</h2>
      <p class="mt-2 text-sm leading-6 text-slate-600">{{ message }}</p>
      <div class="mt-6 flex justify-end gap-2">
        <BaseButton variant="secondary" size="md" @click="$emit('cancel')">{{ props.cancelLabel }}</BaseButton>
        <BaseButton :variant="props.variant === 'danger' ? 'danger' : 'primary'" size="md" @click="$emit('confirm')">
          {{ props.confirmLabel }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
