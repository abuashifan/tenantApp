import { computed, onMounted, ref, shallowRef, watch, type Ref } from 'vue'
import type { SortingState } from '@tanstack/vue-table'

import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import type { WorkspaceListConfig, WorkspacePagination } from '@/types/workspace'

type BackendListPayload<TRaw> = TRaw[] | { data?: TRaw[]; items?: TRaw[] }
type WorkspaceFetcher<T> = (params: Record<string, unknown>) => Promise<T[]>

export type WorkspaceListFilters = {
  search: string
  startDate: string
  endDate: string
}

export type WorkspaceListOptions<TRow extends { id: string }, TRaw = unknown> = {
  endpoint?: string
  rows?: Ref<TRow[]>
  mapRow?: (row: TRaw) => TRow
  searchParam?: string
  startDateParam?: string
  endDateParam?: string
  clientFilter?: boolean
  config?: WorkspaceListConfig<TRow>
  fetcher?: WorkspaceFetcher<TRow>
  primaryTabId?: string
}

function normalizePayload<TRaw>(payload: BackendListPayload<TRaw>): TRaw[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  return []
}

export function useWorkspaceList<TRow extends { id: string }, TRaw = unknown>(
  options: WorkspaceListOptions<TRow, TRaw>,
) {
  const tabs = useWorkspaceTabsStore()
  const savedListState = options.primaryTabId ? tabs.getListState(options.primaryTabId) : null
  const rows = shallowRef<TRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<WorkspaceListFilters>({
    search: savedListState?.search ?? '',
    startDate: savedListState?.startDate ?? '',
    endDate: savedListState?.endDate ?? '',
  })
  const filterValues = ref<Record<string, unknown>>(savedListState?.filters ?? {})
  const status = ref(savedListState?.status ?? '')
  const pagination = ref<WorkspacePagination>(savedListState?.pagination ?? { page: 1, perPage: 10, total: 0, lastPage: 1 })
  const sorting = ref<SortingState>(savedListState?.sorting ?? [])
  const selectedIds = ref<string[]>(savedListState?.selectedIds ?? [])

  const shouldFetchRemote = computed(() => Boolean(options.endpoint || options.fetcher))

  function persistListState(partial: Record<string, unknown> = {}) {
    if (!options.primaryTabId) return
    const activeSort = sorting.value[0]
    tabs.updateListState(options.primaryTabId, {
      page: pagination.value.page,
      perPage: pagination.value.perPage,
      search: filters.value.search,
      filters: filterValues.value,
      sortBy: activeSort?.id ?? null,
      sortDirection: activeSort ? (activeSort.desc ? 'desc' : 'asc') : null,
      selectedIds: selectedIds.value,
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      status: status.value,
      includeVoid: false,
      pagination: pagination.value,
      sorting: sorting.value,
      ...partial,
    })
  }

  function requestParams() {
    const params: Record<string, unknown> = { ...filterValues.value }
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.startDate) params.date_from = filters.value.startDate
    if (filters.value.endDate) params.date_to = filters.value.endDate
    if (status.value) params.status = status.value
    params.page = pagination.value.page
    params.per_page = pagination.value.perPage
    if (sorting.value[0]) {
      params.sort_by = sorting.value[0].id
      params.sort_direction = sorting.value[0].desc ? 'desc' : 'asc'
    }
    return params
  }

  async function fetchRows() {
    if (!options.endpoint && !options.fetcher) {
      rows.value = options.rows?.value ?? []
      return
    }

    loading.value = true
    error.value = null

    try {
      if (options.fetcher) {
        rows.value = await options.fetcher(requestParams())
      } else if (options.endpoint) {
        const params = requestParams()
        if (filters.value.search && options.searchParam && options.searchParam !== 'search') {
          params[options.searchParam] = filters.value.search
          delete params.search
        }
        if (filters.value.startDate && options.startDateParam && options.startDateParam !== 'date_from') {
          params[options.startDateParam] = filters.value.startDate
          delete params.date_from
        }
        if (filters.value.endDate && options.endDateParam && options.endDateParam !== 'date_to') {
          params[options.endDateParam] = filters.value.endDate
          delete params.date_to
        }

        const response = await api.get<ApiResponse<BackendListPayload<TRaw>>>(options.endpoint, { params })
        const payload = normalizePayload(unwrap(response.data))
        rows.value = options.mapRow ? payload.map(options.mapRow) : (payload as unknown as TRow[])
      }
      pagination.value = {
        ...pagination.value,
        total: rows.value.length,
        lastPage: Math.max(1, Math.ceil(rows.value.length / pagination.value.perPage)),
      }
      persistListState({ lastLoadedAt: new Date().toISOString() })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load workspace data.'
      rows.value = []
    } finally {
      loading.value = false
    }
  }

  const visibleRows = computed(() => {
    if (options.clientFilter === false) return rows.value
    if (shouldFetchRemote.value && options.clientFilter !== true) return rows.value

    const query = filters.value.search.trim().toLowerCase()
    if (!query) return rows.value

    return rows.value.filter((row) => JSON.stringify(row).toLowerCase().includes(query))
  })

  function refresh() {
    return fetchRows()
  }

  function setSearch(value: string) {
    filters.value.search = value
    pagination.value.page = 1
    persistListState()
  }

  function setFilter(key: string, value: unknown) {
    filterValues.value = { ...filterValues.value, [key]: value }
    pagination.value.page = 1
    persistListState()
  }

  function setDateRange(startDate: string, endDate: string) {
    filters.value.startDate = startDate
    filters.value.endDate = endDate
    pagination.value.page = 1
    persistListState()
  }

  function setStatus(value: string) {
    status.value = value
    pagination.value.page = 1
    persistListState()
  }

  function setPage(page: number) {
    pagination.value.page = page
    persistListState()
  }

  function setSorting(nextSorting: SortingState) {
    sorting.value = nextSorting
    persistListState()
  }

  function clearFilters() {
    filters.value = { search: '', startDate: '', endDate: '' }
    filterValues.value = {}
    status.value = ''
    pagination.value.page = 1
    persistListState()
  }

  function handleAction(_actionKey: string, _row?: TRow) {
    return undefined
  }

  function handleBulkAction(_actionKey: string) {
    return undefined
  }

  watch(
    () => options.rows?.value,
    (nextRows) => {
      if (!shouldFetchRemote.value) {
        rows.value = nextRows ?? []
        pagination.value = {
          ...pagination.value,
          total: rows.value.length,
          lastPage: Math.max(1, Math.ceil(rows.value.length / pagination.value.perPage)),
        }
        persistListState()
      }
    },
    { immediate: true },
  )

  watch(selectedIds, () => persistListState(), { deep: true })

  onMounted(fetchRows)

  return {
    rows,
    visibleRows,
    loading,
    error,
    filters,
    filterValues,
    status,
    pagination,
    sorting,
    selectedIds,
    fetchRows,
    refresh,
    setSearch,
    setFilter,
    setDateRange,
    setStatus,
    setPage,
    setSorting,
    clearFilters,
    handleAction,
    handleBulkAction,
  }
}
