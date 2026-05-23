<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

import IconButton from '@/components/ui/IconButton.vue'

defineProps<{
  title: string
}>()

defineEmits<{
  menu: []
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
    <div class="flex items-center gap-2">
      <IconButton variant="soft" size="sm" @click="$emit('menu')">
        <Menu class="h-4 w-4" />
      </IconButton>
      <p class="text-sm font-extrabold text-slate-900">{{ title }}</p>
    </div>
    <slot name="right" />
  </div>
</template>
