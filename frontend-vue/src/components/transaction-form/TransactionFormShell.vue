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
  <div class="space-y-3">
    <slot name="header" />

    <div
      v-if="error"
      class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 shadow-sm"
    >
      {{ error }}
    </div>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm font-semibold text-slate-500 shadow-sm">
      Loading…
    </div>

    <div v-else class="space-y-3">
      <slot name="status" />
      <slot name="validation" />
      <slot />

      <div class="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white/95 px-1 py-3 shadow-[0_-12px_28px_rgba(15,23,42,0.08)] backdrop-blur">
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
