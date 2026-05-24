<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'

const props = withDefaults(
  defineProps<{
    name: string
    label: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const { value, setValue } = useField<boolean>(() => props.name)
const model = computed({
  get: () => Boolean(value.value),
  set: (next: boolean) => setValue(next),
})
</script>

<template>
  <label class="flex min-h-10 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
    <input v-model="model" type="checkbox" :disabled="disabled" class="h-4 w-4 rounded border-slate-300 text-[#24a1db]" />
    <span>{{ label }}</span>
  </label>
</template>
