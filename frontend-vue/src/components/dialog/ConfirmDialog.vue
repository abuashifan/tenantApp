<script setup lang="ts">
import BaseModal from '@/components/dialog/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
    confirmDisabled?: boolean
  }>(),
  {
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    danger: false,
    confirmDisabled: false,
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <p class="text-sm leading-6 text-slate-600">{{ message }}</p>

    <div class="mt-6 flex flex-wrap items-center justify-end gap-2">
      <BaseButton variant="secondary" @click="emit('close')">{{ cancelLabel }}</BaseButton>
      <BaseButton
        :variant="danger ? 'danger' : 'primary'"
        :disabled="confirmDisabled"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
