<script setup lang="ts">
import { Field } from 'vee-validate'

withDefaults(
  defineProps<{
    notesName?: string
    internalNotesName?: string
    readonly?: boolean
  }>(),
  {
    notesName: 'notes',
    internalNotesName: 'internal_notes',
    readonly: false,
  },
)
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <label v-if="notesName" class="block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">Notes</span>
      <Field
        :name="notesName"
        as="textarea"
        rows="4"
        :disabled="readonly"
        class="w-full resize-y rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      />
    </label>

    <label v-if="internalNotesName" class="block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">Internal Notes</span>
      <Field
        :name="internalNotesName"
        as="textarea"
        rows="4"
        :disabled="readonly"
        class="w-full resize-y rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      />
    </label>
  </div>
</template>
