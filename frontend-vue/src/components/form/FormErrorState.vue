<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
    <p class="font-black">{{ message }}</p>
    <BaseButton class="mt-4" variant="secondary" size="sm" @click="$emit('retry')">Retry</BaseButton>
  </div>
</template>
