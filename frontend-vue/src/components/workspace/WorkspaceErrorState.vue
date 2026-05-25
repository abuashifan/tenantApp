<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  message?: string | null
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
    <p class="font-bold">Failed to load workspace data.</p>
    <p class="mt-1">{{ message ?? 'Please retry the request.' }}</p>
    <BaseButton class="mt-4" variant="danger" size="sm" @click="$emit('retry')">Retry</BaseButton>
  </div>
</template>
