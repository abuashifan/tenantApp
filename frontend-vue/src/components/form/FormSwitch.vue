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
  <button
    type="button"
    :disabled="disabled"
    class="flex h-10 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 disabled:bg-slate-50"
    @click="model = !model"
  >
    <span>{{ label }}</span>
    <span class="relative h-5 w-9 rounded-full transition" :class="model ? 'bg-[#24a1db]' : 'bg-slate-300'">
      <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition" :class="model ? 'left-4' : 'left-0.5'" />
    </span>
  </button>
</template>
