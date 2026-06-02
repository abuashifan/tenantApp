<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import BaseModal from '@/components/dialog/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import {
  listBackendResource,
  type BackendResourceRow,
} from '@/features/workspace/backend-resource/backendResource.service'

export type JournalLookupKind = 'account' | 'department' | 'project'

export type JournalLookupSelection = {
  kind: JournalLookupKind
  id: string | number
  code: string
  name: string
  row: BackendResourceRow
}

const props = defineProps<{
  open: boolean
  kind: JournalLookupKind
}>()

const emit = defineEmits<{
  close: []
  select: [selection: JournalLookupSelection]
}>()

type LookupConfig = {
  title: string
  endpoint: string
  codeLabel: string
  nameLabel: string
  codeKeys: string[]
  nameKeys: string[]
  idKeys: string[]
}

const configs: Record<JournalLookupKind, LookupConfig> = {
  account: {
    title: 'Data Akun',
    endpoint: '/master-data/chart-of-accounts',
    codeLabel: 'No Akun',
    nameLabel: 'Nama Akun',
    codeKeys: ['account_code', 'code', 'number', 'id'],
    nameKeys: ['account_name', 'name', 'label'],
    idKeys: ['id', 'account_id'],
  },
  department: {
    title: 'Data Department',
    endpoint: '/master-data/departments',
    codeLabel: 'Kode Dept',
    nameLabel: 'Nama Department',
    codeKeys: ['code', 'department_code', 'id'],
    nameKeys: ['name', 'department_name', 'label'],
    idKeys: ['id', 'department_id'],
  },
  project: {
    title: 'Data Project',
    endpoint: '/master-data/projects',
    codeLabel: 'Kode Project',
    nameLabel: 'Nama Project',
    codeKeys: ['code', 'project_code', 'id'],
    nameKeys: ['name', 'project_name', 'label'],
    idKeys: ['id', 'project_id'],
  },
}

const config = computed(() => configs[props.kind])
const codeSearch = ref('')
const nameSearch = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const rows = ref<BackendResourceRow[]>([])
const selectedId = ref<string | null>(null)
const page = ref(1)
const perPage = ref(20)
const total = ref(0)
const lastPage = ref(1)

const selectedRow = computed(() => rows.value.find((row) => selectionId(row) === selectedId.value) ?? null)

function firstValue(row: BackendResourceRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (value != null && String(value) !== '') return String(value)
  }
  return ''
}

function rowCode(row: BackendResourceRow) {
  return firstValue(row, config.value.codeKeys)
}

function rowName(row: BackendResourceRow) {
  return firstValue(row, config.value.nameKeys)
}

function rowValue(row: BackendResourceRow) {
  return firstValue(row, config.value.idKeys) || rowCode(row)
}

function selectionId(row: BackendResourceRow) {
  return String(rowValue(row))
}

function requestParams() {
  const code = codeSearch.value.trim()
  const name = nameSearch.value.trim()
  const params: Record<string, unknown> = {
    page: page.value,
    per_page: perPage.value,
  }

  if (code || name) params.search = [code, name].filter(Boolean).join(' ')
  return params
}

async function loadRows() {
  if (!props.open) return
  loading.value = true
  error.value = null
  try {
    const result = await listBackendResource(config.value.endpoint, requestParams())
    rows.value = result.rows
    total.value = result.pagination?.total ?? result.rows.length
    lastPage.value = result.pagination?.lastPage ?? Math.max(1, Math.ceil(result.rows.length / perPage.value))
    if (selectedId.value && !rows.value.some((row) => selectionId(row) === selectedId.value)) {
      selectedId.value = null
    }
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Gagal memuat data.'
    rows.value = []
    total.value = 0
    lastPage.value = 1
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.open, props.kind, page.value, perPage.value],
  () => {
    void loadRows()
  },
  { immediate: true },
)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    selectedId.value = null
    page.value = 1
  },
)

function search() {
  page.value = 1
  void loadRows()
}

function reset() {
  codeSearch.value = ''
  nameSearch.value = ''
  page.value = 1
  void loadRows()
}

function confirmSelection(row = selectedRow.value) {
  if (!row) return
  emit('select', {
    kind: props.kind,
    id: rowValue(row),
    code: rowCode(row),
    name: rowName(row),
    row,
  })
}
</script>

<template>
  <BaseModal :open="open" :title="config.title" @close="emit('close')">
    <div class="space-y-3">
      <div class="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          v-model="codeSearch"
          type="search"
          class="h-9 min-w-0 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb]"
          :placeholder="config.codeLabel"
          @keydown.enter.prevent="search"
        >
        <input
          v-model="nameSearch"
          type="search"
          class="h-9 min-w-0 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb]"
          :placeholder="config.nameLabel"
          @keydown.enter.prevent="search"
        >
        <BaseButton type="button" size="sm" variant="secondary" :loading="loading" @click="search">Cari</BaseButton>
        <BaseButton type="button" size="sm" variant="secondary" :disabled="loading" @click="reset">Reset</BaseButton>
      </div>

      <p v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{{ error }}</p>

      <div class="max-h-[430px] overflow-auto rounded-lg border border-slate-200">
        <table class="min-w-full border-collapse text-sm">
          <thead class="sticky top-0 bg-slate-700 text-xs font-bold uppercase text-white">
            <tr>
              <th class="w-10 border border-slate-600 px-2 py-1.5"></th>
              <th class="w-36 border border-slate-600 px-2 py-1.5 text-left">{{ config.codeLabel }}</th>
              <th class="border border-slate-600 px-2 py-1.5 text-left">{{ config.nameLabel }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="3" class="px-3 py-8 text-center text-slate-500">Memuat data...</td>
            </tr>
            <tr v-else-if="rows.length === 0">
              <td colspan="3" class="px-3 py-8 text-center text-slate-500">Data tidak ditemukan.</td>
            </tr>
            <tr
              v-for="row in rows"
              v-else
              :key="selectionId(row)"
              class="cursor-pointer odd:bg-white even:bg-slate-100 hover:bg-sky-50"
              :class="selectedId === selectionId(row) ? 'bg-sky-100 odd:bg-sky-100 even:bg-sky-100' : ''"
              @click="selectedId = selectionId(row)"
              @dblclick="confirmSelection(row)"
            >
              <td class="border border-slate-200 px-2 py-1 text-center">
                <input
                  type="radio"
                  :checked="selectedId === selectionId(row)"
                  class="h-4 w-4"
                  @change="selectedId = selectionId(row)"
                >
              </td>
              <td class="border border-slate-200 px-2 py-1 font-semibold text-slate-800">{{ rowCode(row) }}</td>
              <td class="border border-slate-200 px-2 py-1 text-slate-700">{{ rowName(row) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="text-xs font-semibold text-slate-500">Total {{ total }} data</span>
        <div class="flex items-center gap-2">
          <BaseButton type="button" size="sm" variant="secondary" :disabled="page <= 1 || loading" @click="page -= 1">Prev</BaseButton>
          <span class="min-w-16 text-center text-xs font-bold text-slate-600">{{ page }} / {{ lastPage }}</span>
          <BaseButton type="button" size="sm" variant="secondary" :disabled="page >= lastPage || loading" @click="page += 1">Next</BaseButton>
        </div>
      </div>

      <div class="flex justify-end gap-2 border-t border-slate-100 pt-3">
        <BaseButton type="button" variant="secondary" @click="emit('close')">Batal</BaseButton>
        <BaseButton type="button" :disabled="!selectedRow" @click="confirmSelection()">Simpan</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
