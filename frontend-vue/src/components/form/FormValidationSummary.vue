<script setup lang="ts">
defineProps<{
  title?: string
  errors: string[]
}>()
</script>

<template>
  <div v-if="errors.length" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
    <p class="font-black">{{ title || 'Please review the highlighted fields.' }}</p>
    <ul class="mt-2 list-disc space-y-1 pl-5">
      <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>
  </div>
</template>
