import type { ColumnDef, SortingState } from '@tanstack/vue-table'

export type WorkspaceActionVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost'

export type WorkspaceRowAction<T = unknown> = {
  key: string
  label: string
  icon?: string
  variant?: WorkspaceActionVariant
  permission?: string
  visibleWhen?: (row: T) => boolean
  disabledWhen?: (row: T) => boolean
  confirm?: {
    title: string
    message: string
    confirmLabel?: string
    variant?: WorkspaceActionVariant
  }
}

export type WorkspaceGlobalAction = {
  key: string
  label: string
  icon?: string
  variant?: WorkspaceActionVariant
  permission?: string
  visible?: boolean
}

export type WorkspaceStatusTone = 'default' | 'draft' | 'success' | 'warning' | 'danger' | 'info'

export type WorkspaceStatusOption = {
  label: string
  value: string
  tone?: WorkspaceStatusTone
}

export type WorkspaceStatusFilter = string[]

export type WorkspaceDateFilterConfig = {
  enabled: boolean
  field?: string
  label?: string
}

export type WorkspaceSearchConfig = {
  enabled: boolean
  placeholder?: string
  debounceMs?: number
}

export type WorkspacePagination = {
  page: number
  perPage: number
  total: number
  lastPage?: number
  from?: number | null
  to?: number | null
}

export type WorkspaceDateRange = {
  startDate: string
  endDate: string
}

export type WorkspaceListFilters = Record<string, unknown>

export type WorkspaceListState = {
  search: string
  filters: WorkspaceListFilters
  dateRange: WorkspaceDateRange
  status: WorkspaceStatusFilter
  pagination: WorkspacePagination
  sorting: SortingState
  selectedIds: string[]
}

export type WorkspaceListConfig<T = unknown> = {
  moduleKey: string
  primaryTabId: string
  title: string
  subtitle?: string
  listTabLabel?: string
  createLabel?: string
  search?: WorkspaceSearchConfig
  dateFilter?: WorkspaceDateFilterConfig
  statusOptions?: WorkspaceStatusOption[]
  columns: ColumnDef<T, unknown>[]
  rowKey: keyof T | ((row: T) => string | number)
  globalActions?: WorkspaceGlobalAction[]
  rowActions?: WorkspaceRowAction<T>[]
  isRowSelectable?: (row: T) => boolean
  permissions?: {
    view?: string
    create?: string
    edit?: string
    void?: string
    delete?: string
  }
  routes?: {
    list?: string
    create?: string
    edit?: (row: T) => string
    detail?: (row: T) => string
  }
  emptyTitle?: string
  emptyDescription?: string
  selectable?: boolean
  clearSelectionOnPageChange?: boolean
}
