import { ref } from 'vue'

import type { WorkspaceDateRange, WorkspaceListFilters } from '@/types/workspace'

export function useWorkspaceFilters() {
  const search = ref('')
  const filters = ref<WorkspaceListFilters>({})
  const dateRange = ref<WorkspaceDateRange>({ startDate: '', endDate: '' })
  const status = ref('')

  function setSearch(value: string) {
    search.value = value
  }

  function setFilter(key: string, value: unknown) {
    filters.value = { ...filters.value, [key]: value }
  }

  function setDateRange(nextRange: Partial<WorkspaceDateRange>) {
    dateRange.value = { ...dateRange.value, ...nextRange }
  }

  function setStatus(value: string) {
    status.value = value
  }

  function clearFilters() {
    search.value = ''
    filters.value = {}
    dateRange.value = { startDate: '', endDate: '' }
    status.value = ''
  }

  return {
    search,
    filters,
    dateRange,
    status,
    setSearch,
    setFilter,
    setDateRange,
    setStatus,
    clearFilters,
  }
}
