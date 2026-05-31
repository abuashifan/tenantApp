<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import BaseModal from '@/components/dialog/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { listSourceDocuments, type SourceDocument } from '@/services/transaction/sourceDocuments.service'
import { toErrorMessage } from '@/composables/transaction-form/useTransactionValidation'

const props = defineProps<{
  open: boolean
  moduleKey: 'sales' | 'purchase'
  targetType: string
  sourceType: string
  sourceLabel: string
  partnerId?: string | number | null
}>()

const emit = defineEmits<{
  close: []
  select: [document: SourceDocument]
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const page = ref(1)
const perPage = ref(10)
const selectedId = ref<string | null>(null)
const documents = ref<SourceDocument[]>([])
const total = ref(0)
const lastPage = ref(1)

const selectedDocument = computed(() => documents.value.find((item) => String(item.id) === selectedId.value) ?? null)

async function loadDocuments() {
  if (!props.open) return
  loading.value = true
  error.value = null
  try {
    const result = await listSourceDocuments({
      moduleKey: props.moduleKey,
      targetType: props.targetType,
      sourceType: props.sourceType,
      partnerId: props.partnerId,
      search: search.value,
      page: page.value,
      perPage: perPage.value,
    })
    documents.value = result.data ?? []
    total.value = Number(result.total ?? documents.value.length)
    lastPage.value = Math.max(1, Number(result.last_page ?? 1))
    if (selectedId.value && !documents.value.some((item) => String(item.id) === selectedId.value)) {
      selectedId.value = null
    }
  } catch (cause) {
    error.value = toErrorMessage(cause)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.open, props.moduleKey, props.targetType, props.sourceType, props.partnerId, page.value, perPage.value],
  () => loadDocuments(),
  { immediate: true },
)

watch(search, () => {
  page.value = 1
  loadDocuments()
})

watch(
  () => props.open,
  (open) => {
    if (!open) return
    selectedId.value = null
    page.value = 1
  },
)

function confirmSelection() {
  if (!selectedDocument.value) return
  emit('select', selectedDocument.value)
}
</script>

<template>
  <BaseModal :open="open" :title="`Ambil ${sourceLabel}`" @close="emit('close')">
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <input
          v-model="search"
          type="search"
          class="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
          placeholder="Cari nomor dokumen"
        >
        <BaseButton variant="secondary" type="button" :loading="loading" @click="loadDocuments">Cari</BaseButton>
      </div>

      <p v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{{ error }}</p>

      <div class="max-h-[420px] overflow-auto rounded-xl border border-slate-200">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th class="w-10 px-3 py-2"></th>
              <th class="px-3 py-2 text-left">No. Dokumen</th>
              <th class="px-3 py-2 text-left">Tanggal</th>
              <th class="px-3 py-2 text-left">Status</th>
              <th class="px-3 py-2 text-right">Baris</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-if="loading">
              <td colspan="5" class="px-3 py-8 text-center text-slate-500">Memuat dokumen...</td>
            </tr>
            <tr v-else-if="documents.length === 0">
              <td colspan="5" class="px-3 py-8 text-center text-slate-500">Tidak ada dokumen sumber.</td>
            </tr>
            <template v-else>
              <tr
                v-for="document in documents"
                :key="document.id"
                class="cursor-pointer hover:bg-slate-50"
                @click="selectedId = String(document.id)"
              >
                <td class="px-3 py-2">
                  <input
                    type="radio"
                    :checked="selectedId === String(document.id)"
                    class="h-4 w-4"
                    @change="selectedId = String(document.id)"
                  >
                </td>
                <td class="px-3 py-2 font-semibold text-slate-900">{{ document.document_number }}</td>
                <td class="px-3 py-2 text-slate-600">{{ document.document_date || '-' }}</td>
                <td class="px-3 py-2 capitalize text-slate-600">{{ document.status || '-' }}</td>
                <td class="px-3 py-2 text-right text-slate-600">{{ document.lines.length }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="text-xs font-semibold text-slate-500">Total {{ total }} dokumen</span>
        <div class="flex items-center gap-2">
          <BaseButton variant="secondary" size="sm" type="button" :disabled="page <= 1 || loading" @click="page -= 1">Sebelumnya</BaseButton>
          <span class="text-xs font-bold text-slate-500">{{ page }} / {{ lastPage }}</span>
          <BaseButton variant="secondary" size="sm" type="button" :disabled="page >= lastPage || loading" @click="page += 1">Berikutnya</BaseButton>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <BaseButton variant="secondary" type="button" @click="emit('close')">Batal</BaseButton>
        <BaseButton type="button" :disabled="!selectedDocument" @click="confirmSelection">Ambil</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
