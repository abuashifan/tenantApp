<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open?: boolean
    showIncludeVoid?: boolean
    includeVoid?: boolean
  }>(),
  {
    open: false,
    showIncludeVoid: false,
    includeVoid: false,
  },
)

defineEmits<{
  'update:includeVoid': [value: boolean]
}>()
</script>

<template>
  <aside v-if="open" class="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
    <slot>
      <div class="grid min-w-0 gap-3">
        <label v-if="showIncludeVoid" class="inline-flex h-9 items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            :checked="includeVoid"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-[#1d81af] focus:ring-[#24a1db]"
            @change="$emit('update:includeVoid', ($event.target as HTMLInputElement).checked)"
          />
          Include voided transactions
        </label>
      </div>
    </slot>
  </aside>
</template>
