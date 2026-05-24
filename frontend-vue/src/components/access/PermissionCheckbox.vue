<script setup lang="ts">
defineProps<{
  checked: boolean
  source: 'role_default' | 'user_override_allow' | 'user_override_deny' | 'not_assigned'
}>()

const emit = defineEmits<{
  change: [checked: boolean]
}>()
</script>

<template>
  <button
    type="button"
    class="mx-auto grid h-7 w-7 place-items-center rounded-md border text-xs font-black transition"
    :class="{
      'border-[#1d81af] bg-[#1d81af] text-white': checked && source === 'role_default',
      'border-emerald-500 bg-emerald-100 text-emerald-800': checked && source === 'user_override_allow',
      'border-amber-400 bg-amber-50 text-amber-700': !checked && source === 'user_override_deny',
      'border-slate-300 bg-white text-transparent hover:border-slate-500': !checked && source === 'not_assigned',
    }"
    :title="source.replaceAll('_', ' ')"
    @click="emit('change', !checked)"
  >
    ✓
  </button>
</template>
