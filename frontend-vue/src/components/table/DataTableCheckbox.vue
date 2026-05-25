<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  ariaLabel?: string
}>()

const emit = defineEmits<{
  change: [checked: boolean]
}>()

const el = ref<HTMLInputElement | null>(null)

function syncIndeterminate() {
  if (!el.value) return
  el.value.indeterminate = Boolean(props.indeterminate) && !props.checked
}

onMounted(syncIndeterminate)
watch(() => props.indeterminate, syncIndeterminate)
watch(() => props.checked, syncIndeterminate)
</script>

<template>
  <input
    ref="el"
    type="checkbox"
    :checked="checked"
    :disabled="disabled"
    :aria-label="ariaLabel"
    class="h-4 w-4 rounded border-slate-300 text-[#24a1db] focus:ring-[#e9f6fb]"
    @click.stop
    @change.stop="emit('change', ($event.target as HTMLInputElement).checked)"
  />
</template>
