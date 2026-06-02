<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    closeOnOverlay?: boolean
    closeOnEscape?: boolean
  }>(),
  {
    title: '',
    closeOnOverlay: true,
    closeOnEscape: true,
  },
)

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLDivElement | null>(null)

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (!props.closeOnEscape) return
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    setTimeout(() => dialogRef.value?.focus(), 0)
  },
)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50">
      <div
        class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        @click="closeOnOverlay ? emit('close') : undefined"
      />

      <div class="workspace-scrollbar absolute inset-0 flex min-h-0 items-center justify-center overflow-y-auto p-4">
        <div
          ref="dialogRef"
          tabindex="-1"
          :class="cn('max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl')"
        >
          <div v-if="title" class="mb-4">
            <h2 class="text-base font-extrabold text-slate-950">{{ title }}</h2>
          </div>
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
