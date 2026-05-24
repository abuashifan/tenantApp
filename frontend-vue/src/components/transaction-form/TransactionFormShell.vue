<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  loading?: boolean
  error?: string | null
  readonly?: boolean
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="space-y-4">
    <slot name="header" />

    <div
      v-if="error"
      class="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 shadow-sm"
    >
      {{ error }}
    </div>

    <div v-if="loading" class="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-sm font-semibold text-slate-500 shadow-sm">
      Loading…
    </div>

    <div v-else class="space-y-4">
      <slot name="status" />
      <slot name="validation" />
      <slot />

      <div class="flex flex-wrap items-center justify-between gap-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap gap-2">
          <slot name="actions-left" />
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <slot name="actions-right" />
          <BaseButton variant="secondary" size="md" type="button" @click="$emit('close')">Close</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
