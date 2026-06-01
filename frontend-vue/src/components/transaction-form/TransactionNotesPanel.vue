<script setup lang="ts">
import { ref } from 'vue'
import { Field } from 'vee-validate'

const props = withDefaults(
  defineProps<{
    notesName?: string
    internalNotesName?: string
    showInternalNotes?: boolean
    readonly?: boolean
  }>(),
  {
    notesName: 'notes',
    internalNotesName: 'internal_notes',
    showInternalNotes: true,
    readonly: false,
  },
)

const activeTab = ref<'notes' | 'internal'>('notes')
</script>

<template>
  <div class="space-y-2">
    <div v-if="props.showInternalNotes" class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
      <button
        type="button"
        class="rounded-md px-3 py-1.5 font-medium transition"
        :class="activeTab === 'notes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
        @click="activeTab = 'notes'"
      >
        Notes
      </button>
      <button
        type="button"
        class="rounded-md px-3 py-1.5 font-medium transition"
        :class="activeTab === 'internal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'"
        @click="activeTab = 'internal'"
      >
        Internal Notes
      </button>
    </div>

    <label v-if="notesName && activeTab === 'notes'" class="block space-y-1.5">
      <span v-if="!props.showInternalNotes" class="text-xs font-medium text-slate-500">Notes</span>
      <Field
        :name="notesName"
        as="textarea"
        rows="4"
        :disabled="readonly"
        class="min-h-20 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      />
    </label>

    <label v-if="props.showInternalNotes && internalNotesName && activeTab === 'internal'" class="block space-y-1.5">
      <Field
        :name="internalNotesName"
        as="textarea"
        rows="4"
        :disabled="readonly"
        class="min-h-20 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:bg-slate-50"
      />
    </label>
  </div>
</template>
