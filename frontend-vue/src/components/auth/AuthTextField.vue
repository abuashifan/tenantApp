<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    modelValue: string
    icon?: Component
    type?: string
    placeholder?: string
    helper?: string
  }>(),
  {
    icon: undefined,
    type: 'text',
    placeholder: '',
    helper: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})
</script>

<template>
  <label class="block space-y-2">
    <span class="text-sm font-semibold text-slate-700">{{ label }}</span>

    <div class="relative">
      <component
        :is="icon"
        v-if="icon"
        class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
      />

      <input
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :class="[
          'h-12 w-full rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]',
          icon ? 'pl-12' : 'pl-4',
          $slots.right ? 'pr-12' : 'pr-4',
        ]"
      />

      <div v-if="$slots.right" class="absolute right-3 top-1/2 -translate-y-1/2">
        <slot name="right" />
      </div>
    </div>

    <p v-if="helper" class="text-xs text-slate-500">{{ helper }}</p>
  </label>
</template>
