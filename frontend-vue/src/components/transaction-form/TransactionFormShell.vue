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
  <div class="flex h-full min-h-0 min-w-0 flex-col gap-2">
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

    <div v-else class="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
      <slot name="status" />
      <slot name="validation" />

      <div class="min-h-0 min-w-0 flex-1 overflow-hidden">
        <slot />
      </div>

      <div class="grid min-w-0 flex-none gap-2 border-t border-slate-200 bg-white pt-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div class="workspace-table-scroll flex min-w-0 flex-nowrap gap-2 overflow-x-auto">
          <slot name="actions-left" />
        </div>
        <div class="workspace-table-scroll flex min-w-0 flex-nowrap justify-start gap-2 overflow-x-auto md:justify-end">
          <slot name="actions-right" />
          <BaseButton class="shrink-0" variant="secondary" size="sm" type="button" @click="$emit('close')">Close</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
