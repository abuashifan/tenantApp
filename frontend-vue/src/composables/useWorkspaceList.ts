import { computed, onMounted, ref, shallowRef, watch, type Ref } from 'vue'

import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'

type BackendListPayload<TRaw> = TRaw[] | { data?: TRaw[]; items?: TRaw[] }

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
  const rows = shallowRef<TRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<WorkspaceListFilters>({
    search: '',
    startDate: '',
    endDate: '',
  })

  const shouldFetchRemote = computed(() => Boolean(options.endpoint))

  async function fetchRows() {
    if (!options.endpoint) {
      rows.value = options.rows?.value ?? []
      return
    }

    loading.value = true
    error.value = null

    try {
      const params: Record<string, string> = {}
      if (filters.value.search) params[options.searchParam ?? 'search'] = filters.value.search
      if (filters.value.startDate) params[options.startDateParam ?? 'date_from'] = filters.value.startDate
      if (filters.value.endDate) params[options.endDateParam ?? 'date_to'] = filters.value.endDate

      const response = await api.get<ApiResponse<BackendListPayload<TRaw>>>(options.endpoint, { params })
      const payload = normalizePayload(unwrap(response.data))
      rows.value = options.mapRow ? payload.map(options.mapRow) : (payload as unknown as TRow[])
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load workspace data.'
      rows.value = []
    } finally {
      loading.value = false
    }
  }

  const visibleRows = computed(() => {
    if (shouldFetchRemote.value || options.clientFilter === false) return rows.value

    const query = filters.value.search.trim().toLowerCase()
    if (!query) return rows.value

    return rows.value.filter((row) => JSON.stringify(row).toLowerCase().includes(query))
  })

  watch(
    () => options.rows?.value,
    (nextRows) => {
      if (!shouldFetchRemote.value) rows.value = nextRows ?? []
    },
    { immediate: true },
  )

  onMounted(fetchRows)

  return {
    rows,
    visibleRows,
    loading,
    error,
    filters,
    fetchRows,
  }
}
