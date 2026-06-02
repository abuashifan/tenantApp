<script setup lang="ts">
import { Minus, Plus } from 'lucide-vue-next'
import { Field, useFieldArray } from 'vee-validate'

import BaseButton from '@/components/ui/BaseButton.vue'
import IconButton from '@/components/ui/IconButton.vue'

export type JournalLine = {
  accountId: string
  description: string
  departmentId?: string
  projectId?: string
  debit: number | null
  credit: number | null
}

const props = defineProps<{
  name: string
  accountOptions: Array<{ label: string; value: string }>
  departmentOptions: Array<{ label: string; value: string }>
  projectOptions: Array<{ label: string; value: string }>
}>()

const { fields, push, remove } = useFieldArray<JournalLine>(() => props.name)

function addLine() {
  push({
    accountId: '',
    description: '',
    departmentId: '',
    projectId: '',
    debit: null,
    credit: null,
  })
}
</script>

<template>
  <div class="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div class="flex min-w-0 items-start justify-between gap-3 px-6 py-5">
      <div>
        <h2 class="text-sm font-extrabold text-slate-900">Journal Lines</h2>
        <p class="mt-1 text-xs leading-5 text-slate-500">Add/remove lines and input debit/credit.</p>
      </div>
      <BaseButton variant="secondary" size="md" type="button" @click="addLine">
        <Plus class="h-4 w-4" />
        Add line
      </BaseButton>
    </div>

    <div class="workspace-table-scroll min-w-0 overflow-x-auto">
      <table class="w-full min-w-[980px] text-left text-sm">
        <thead class="bg-slate-50 text-xs font-bold text-slate-600">
          <tr>
            <th class="px-4 py-3">Account</th>
            <th class="px-4 py-3">Description</th>
            <th class="px-4 py-3">Department</th>
            <th class="px-4 py-3">Project</th>
            <th class="px-4 py-3 text-right">Debit</th>
            <th class="px-4 py-3 text-right">Credit</th>
            <th class="sticky right-0 bg-slate-50 px-4 py-3 shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.35)]"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="fields.length === 0">
            <td colspan="7" class="px-6 py-10 text-center text-sm font-semibold text-slate-500">
              No lines. Click “Add line”.
            </td>
          </tr>

          <tr v-for="(row, index) in fields" :key="row.key" class="align-top">
            <td class="sticky right-0 bg-white px-4 py-3 shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.35)]">
              <Field :name="`${name}[${index}].accountId`" as="select"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]">
                <option value="" disabled>Select…</option>
                <option v-for="opt in accountOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </Field>
            </td>
            <td class="px-4 py-3">
              <Field
                :name="`${name}[${index}].description`"
                as="input"
                type="text"
                placeholder="Description…"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
              />
            </td>
            <td class="px-4 py-3">
              <Field :name="`${name}[${index}].departmentId`" as="select"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]">
                <option value="">(Optional)</option>
                <option v-for="opt in departmentOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </Field>
            </td>
            <td class="px-4 py-3">
              <Field :name="`${name}[${index}].projectId`" as="select"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]">
                <option value="">(Optional)</option>
                <option v-for="opt in projectOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </Field>
            </td>
            <td class="px-4 py-3">
              <Field
                :name="`${name}[${index}].debit`"
                as="input"
                type="number"
                step="0.01"
                inputmode="decimal"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
              />
            </td>
            <td class="px-4 py-3">
              <Field
                :name="`${name}[${index}].credit`"
                as="input"
                type="number"
                step="0.01"
                inputmode="decimal"
                class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
              />
            </td>
            <td class="px-4 py-3">
              <IconButton variant="danger" size="sm" type="button" @click="remove(index)">
                <Minus class="h-4 w-4" />
              </IconButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
