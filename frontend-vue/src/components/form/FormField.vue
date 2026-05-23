<script setup lang="ts">
import { cn } from '@/utils/cn'
import FormErrorMessage from '@/components/form/FormErrorMessage.vue'

withDefaults(
  defineProps<{
    name: string
    label?: string
    hint?: string
    required?: boolean
  }>(),
  {
    label: '',
    hint: '',
    required: false,
  },
)
</script>

<template>
  <label :class="cn('block space-y-1.5')">
    <div v-if="label" class="flex items-center justify-between gap-3">
      <span class="text-xs font-bold text-slate-500">
        {{ label }}
        <span v-if="required" class="text-rose-600">*</span>
      </span>
      <span v-if="hint" class="text-[11px] font-semibold text-slate-400">{{ hint }}</span>
    </div>

    <slot />

    <FormErrorMessage :name="name" />
  </label>
</template>
