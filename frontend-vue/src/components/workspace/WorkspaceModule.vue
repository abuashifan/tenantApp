<script setup lang="ts" generic="TRow extends { id: string }">
import { computed, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

import DataTable from '@/components/table/DataTable.vue'
import DataTableToolbar from '@/components/table/DataTableToolbar.vue'
import SecondaryTabsBar from '@/components/navigation/SecondaryTabsBar.vue'
import UnsavedChangesDialog from '@/components/dialog/UnsavedChangesDialog.vue'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const props = withDefaults(
  defineProps<{
    primaryId: string
    rows: TRow[]
    columns: ColumnDef<TRow, unknown>[]
    loading?: boolean
    emptyTitle?: string
    emptyDescription?: string
  }>(),
  {
    loading: false,
    emptyTitle: 'No data',
    emptyDescription: 'Try adjusting your filters or date range.',
  },
)

const emit = defineEmits<{
  filter: []
  create: []
  void: [selectedIds: string[]]
  editFirstSelected: [id: string]
  saveDirtyTab: [tabId: string]
}>()

const tabs = useWorkspaceTabsStore()
tabs.ensureListSecondaryTab(props.primaryId)

const activeSecondaryId = computed(
  () => tabs.activeSecondaryTabIdByPrimaryId[props.primaryId] ?? `${props.primaryId}::list`,
)
const secondaryTabs = computed(() => tabs.secondaryTabsByPrimaryId[props.primaryId] ?? [])
const activeSecondary = computed(() => secondaryTabs.value.find((t) => t.id === activeSecondaryId.value) ?? null)

const search = ref('')
const startDate = ref('')
const endDate = ref('')
const selectedIds = ref<string[]>([])
const closePendingId = ref<string | null>(null)
const unsavedOpen = computed(() => closePendingId.value != null)

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()

  return props.rows.filter((row) => {
    const haystack = JSON.stringify(row).toLowerCase()
    return q === '' || haystack.includes(q)
  })
})

function requestClose(tabId: string) {
  const tab = secondaryTabs.value.find((t) => t.id === tabId)
  if (!tab || !tab.closable) return

  if (!tab.dirty) {
    tabs.closeSecondaryTab(props.primaryId, tabId)
    return
  }

  closePendingId.value = tabId
}

function discardClose() {
  if (!closePendingId.value) return
  tabs.clearDraftState(closePendingId.value)
  tabs.closeSecondaryTab(props.primaryId, closePendingId.value)
  closePendingId.value = null
}

function saveClose() {
  if (!closePendingId.value) return
  emit('saveDirtyTab', closePendingId.value)
  tabs.setSecondaryDirty(closePendingId.value, false)
  tabs.closeSecondaryTab(props.primaryId, closePendingId.value)
  closePendingId.value = null
}

function editFirstSelected() {
  const id = selectedIds.value[0]
  if (!id) return
  emit('editFirstSelected', id)
}
</script>

<template>
  <div class="space-y-4">
    <SecondaryTabsBar
      :tabs="secondaryTabs"
      :active-id="activeSecondaryId"
      @activate="(id) => tabs.activateSecondaryTab(primaryId, id)"
      @close="requestClose"
    />

    <div v-if="activeSecondary?.mode === 'list'" class="space-y-4">
      <DataTableToolbar
        v-model:search="search"
        v-model:startDate="startDate"
        v-model:endDate="endDate"
        :selected-count="selectedIds.length"
        @filter="emit('filter')"
        @create="emit('create')"
        @void="emit('void', selectedIds)"
      />

      <div class="flex justify-end">
        <button
          type="button"
          class="text-xs font-bold text-slate-500 hover:text-slate-900"
          :class="selectedIds.length === 0 ? 'pointer-events-none opacity-50' : ''"
          @click="editFirstSelected"
        >
          Edit first selected (placeholder)
        </button>
      </div>

      <DataTable
        :columns="columns"
        :data="filteredRows"
        :loading="loading"
        :empty-title="emptyTitle"
        :empty-description="emptyDescription"
        v-model:selected-ids="selectedIds"
      />
    </div>

    <div v-else class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <slot name="form" :tab="activeSecondary" />
    </div>

    <UnsavedChangesDialog
      :open="unsavedOpen"
      @close="closePendingId = null"
      @discard="discardClose"
      @save="saveClose"
    />
  </div>
</template>
