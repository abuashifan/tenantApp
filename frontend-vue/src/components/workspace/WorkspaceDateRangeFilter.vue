<script setup lang="ts">
defineProps<{
  startDate: string
  endDate: string
  label?: string
}>()

defineEmits<{
  'update:startDate': [value: string]
  'update:endDate': [value: string]
}>()
</script>

<template>
  <label class="block space-y-1.5">
    <span class="text-xs font-bold text-slate-500">{{ label ?? 'Start Date' }}</span>
    <input
      :value="startDate"
      type="date"
      class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
      @input="$emit('update:startDate', ($event.target as HTMLInputElement).value)"
    />
  </label>

  <label class="block space-y-1.5">
    <span class="text-xs font-bold text-slate-500">End Date</span>
    <input
      :value="endDate"
      type="date"
      class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
      @input="$emit('update:endDate', ($event.target as HTMLInputElement).value)"
    />
  </label>
</template>
