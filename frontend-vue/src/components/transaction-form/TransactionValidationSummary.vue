<script setup lang="ts">
import { computed } from 'vue'
import { useFormContext, useFormErrors } from 'vee-validate'

withDefaults(
  defineProps<{
    title?: string
  }>(),
  { title: 'Periksa data yang belum valid' },
)

const errors = useFormErrors()
const form = useFormContext()
const items = computed(() => Object.entries(errors.value).map(([path, message]) => ({ path, message })))
const shouldShow = computed(() => (form?.submitCount.value ?? 0) > 0)
</script>

<template>
  <div
    v-if="shouldShow && items.length"
    class="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 shadow-sm"
  >
    <p class="font-black">{{ title }}</p>
    <ul class="mt-2 list-disc space-y-1 pl-5">
      <li v-for="item in items" :key="item.path">
        <span class="font-bold">{{ item.path }}</span>: {{ item.message }}
      </li>
    </ul>
  </div>
</template>
