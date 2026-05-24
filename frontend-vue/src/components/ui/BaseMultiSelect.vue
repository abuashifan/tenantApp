<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

import { cn } from '@/utils/cn'

export type MultiSelectOption = {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    options: MultiSelectOption[]
    allLabel?: string
    noneLabel?: string
    ariaLabel?: string
  }>(),
  {
    allLabel: 'All selected',
    noneLabel: 'No selection',
    ariaLabel: 'Multi select options',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const root = ref<HTMLElement | null>(null)
const open = ref(false)

const selectedSet = computed(() => new Set(props.modelValue))
const triggerLabel = computed(() => {
  if (props.modelValue.length === props.options.length) return props.allLabel
  if (props.modelValue.length === 0) return props.noneLabel
  return `${props.modelValue.length} selected`
})

function toggleOpen() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function toggleValue(value: string) {
  const next = new Set(props.modelValue)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  emit('update:modelValue', Array.from(next))
}

function onDocumentClick(event: MouseEvent) {
  if (!root.value) return
  if (!root.value.contains(event.target as Node)) close()
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})

defineExpose({ close })
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      :aria-expanded="open"
      :aria-label="ariaLabel"
      class="flex h-8 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-bold text-slate-900 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
      @click.stop="toggleOpen"
    >
      <span>{{ triggerLabel }}</span>
      <ChevronDown class="h-4 w-4 text-slate-500" />
    </button>

    <div
      v-if="open"
      role="listbox"
      :aria-label="ariaLabel"
      class="absolute left-0 top-[calc(100%+6px)] z-40 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/15"
      @click.stop
    >
      <label
        v-for="option in options"
        :key="option.value"
        :class="
          cn(
            'flex h-9 cursor-pointer select-none items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-700 hover:bg-slate-50',
          )
        "
      >
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300 accent-[#06131e]"
          :checked="selectedSet.has(option.value)"
          @change="toggleValue(option.value)"
        />
        {{ option.label }}
      </label>
    </div>
  </div>
</template>
