<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import FormMoneyInput from '@/components/form/FormMoneyInput.vue'
import FormNumberInput from '@/components/form/FormNumberInput.vue'
import FormSelect, { type SelectOption } from '@/components/form/FormSelect.vue'
import FormTextInput from '@/components/form/FormTextInput.vue'

export type LineItemColumn = {
  key: string
  label: string
  type?: 'text' | 'number' | 'money' | 'select'
  options?: SelectOption[]
  placeholder?: string
}

defineProps<{
  name: string
  rows: Record<string, unknown>[]
  columns: LineItemColumn[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  add: []
  remove: [index: number]
}>()
</script>

<template>
  <div class="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div class="workspace-table-scroll min-w-0 overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-black uppercase text-slate-500">
          <tr>
            <th v-for="column in columns" :key="column.key" class="px-3 py-2">{{ column.label }}</th>
            <th class="sticky right-0 w-20 bg-slate-50 px-3 py-2 text-right shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.35)]">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(_, rowIndex) in rows" :key="rowIndex">
            <td v-for="column in columns" :key="column.key" class="min-w-36 px-3 py-2 align-top">
              <FormSelect
                v-if="column.type === 'select'"
                :name="`${name}.${rowIndex}.${column.key}`"
                :options="column.options ?? []"
                :placeholder="column.placeholder ?? column.label"
                :disabled="readonly"
              />
              <FormNumberInput
                v-else-if="column.type === 'number'"
                :name="`${name}.${rowIndex}.${column.key}`"
                :placeholder="column.placeholder ?? column.label"
                :disabled="readonly"
              />
              <FormMoneyInput
                v-else-if="column.type === 'money'"
                :name="`${name}.${rowIndex}.${column.key}`"
                :placeholder="column.placeholder ?? column.label"
                :disabled="readonly"
              />
              <FormTextInput
                v-else
                :name="`${name}.${rowIndex}.${column.key}`"
                :placeholder="column.placeholder ?? column.label"
                :disabled="readonly"
              />
            </td>
            <td class="sticky right-0 bg-white px-3 py-2 text-right align-top shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.35)]">
              <BaseButton v-if="!readonly" variant="secondary" size="sm" @click="emit('remove', rowIndex)">Remove</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!readonly" class="border-t border-slate-200 bg-slate-50 px-3 py-3">
      <BaseButton variant="secondary" size="sm" @click="emit('add')">Add row</BaseButton>
    </div>
  </div>
</template>
