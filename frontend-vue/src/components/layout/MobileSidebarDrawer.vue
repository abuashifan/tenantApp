<script setup lang="ts">
import { X } from 'lucide-vue-next'

import IconButton from '@/components/ui/IconButton.vue'

defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-40 lg:hidden">
      <div class="absolute inset-0 bg-slate-950/40" @click="$emit('close')" />
      <div class="absolute left-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p class="text-sm font-extrabold text-slate-900">Menu</p>
          <IconButton variant="ghost" size="sm" @click="$emit('close')">
            <X class="h-4 w-4" />
          </IconButton>
        </div>
        <div class="p-4">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
