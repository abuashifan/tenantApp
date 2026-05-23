<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'

import IconButton from '@/components/ui/IconButton.vue'

defineEmits<{
  action: [key: string]
}>()
</script>

<template>
  <IconButton variant="ghost" size="sm" @click="$emit('action', 'menu')">
    <MoreHorizontal class="h-4 w-4" />
  </IconButton>
</template>
