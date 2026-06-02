import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import type { SidebarMenuItem } from '@/navigation/sidebar'
import type { WorkspaceListConfig, WorkspaceRowAction } from '@/types/workspace'
import { formatDisplayDate } from '@/utils/date'
import type { BackendResourceRow } from './backendResource.service'

export type BackendWorkspaceKind = 'master-data' | 'document' | 'report' | 'inventory' | 'settings'

export type BackendQueryParamMap = {
  page?: string
  perPage?: string
  search?: string
  sortBy?: string
  sortDirection?: string
  status?: string
  startDate?: string
  endDate?: string
  asOfDate?: string
  includeVoid?: string
}

export type ResourceCapability = {
  kind: BackendWorkspaceKind
  createPermission?: string
  editPermission?: string
  hasDetail?: boolean
  dateFilter?: boolean
  statusFilter?: boolean
  requiredDateFilter?: 'range' | 'as-of'
  voidPermission?: string
  paginationMode?: 'remote' | 'local' | 'none'
  remoteSearch?: boolean
  remoteFilters?: boolean
  remoteSort?: boolean
  includeVoidFilter?: boolean
  queryParamMap?: BackendQueryParamMap
}

const remoteList = {
  paginationMode: 'remote',
  remoteSearch: true,
  remoteFilters: true,
  remoteSort: true,
} satisfies Partial<ResourceCapability>

const capabilities: Record<string, ResourceCapability> = {
  '/master-data/contacts': { ...remoteList, kind: 'master-data', createPermission: 'contacts.create', editPermission: 'contacts.edit', hasDetail: true, statusFilter: true },
  '/master-data/payment-terms': { ...remoteList, kind: 'master-data', createPermission: 'payment_terms.create', editPermission: 'payment_terms.edit', hasDetail: true, statusFilter: true },
  '/master-data/units': { ...remoteList, kind: 'master-data', createPermission: 'units.create', editPermission: 'units.edit', hasDetail: true, statusFilter: true },
  '/master-data/product-categories': { ...remoteList, kind: 'master-data', createPermission: 'products.create', editPermission: 'products.edit', hasDetail: true, statusFilter: true },
  '/master-data/products': { ...remoteList, kind: 'master-data', createPermission: 'products.create', editPermission: 'products.edit', hasDetail: true, statusFilter: true },
  '/master-data/warehouses': { ...remoteList, kind: 'master-data', createPermission: 'warehouses.create', editPermission: 'warehouses.edit', hasDetail: true, statusFilter: true },
  '/master-data/departments': { ...remoteList, kind: 'master-data', createPermission: 'departments.create', editPermission: 'departments.edit', hasDetail: true, statusFilter: true },
  '/master-data/projects': { ...remoteList, kind: 'master-data', createPermission: 'projects.create', editPermission: 'projects.edit', hasDetail: true, statusFilter: true },
  '/master-data/account-mappings': { kind: 'settings', editPermission: 'settings.company.edit' },
  '/accounting/period-locks': { kind: 'settings', editPermission: 'fiscal_year.lock_manage' },
  '/reports/profit-loss': { kind: 'report', dateFilter: true, requiredDateFilter: 'range' },
  '/reports/balance-sheet': { kind: 'report', dateFilter: true, requiredDateFilter: 'as-of' },
  '/reports/cash-flow': { kind: 'report', dateFilter: true, requiredDateFilter: 'range' },
  '/reports/financial-summary': { kind: 'report', dateFilter: true, requiredDateFilter: 'range' },
  '/sales/quotations': { ...remoteList, kind: 'document', createPermission: 'sales.quotations.create', editPermission: 'sales.quotations.edit', hasDetail: true, dateFilter: true, statusFilter: true },
  '/sales/orders': { ...remoteList, kind: 'document', createPermission: 'sales.orders.create', editPermission: 'sales.orders.edit', hasDetail: true, dateFilter: true, statusFilter: true },
  '/sales/delivery-orders': { ...remoteList, kind: 'document', createPermission: 'sales.delivery_orders.create', editPermission: 'sales.delivery_orders.edit', hasDetail: true, dateFilter: true, statusFilter: true },
  '/sales/proformas': { ...remoteList, kind: 'document', createPermission: 'sales.proformas.create', editPermission: 'sales.proformas.edit', hasDetail: true, dateFilter: true, statusFilter: true },
  '/sales/invoices': { ...remoteList, kind: 'document', createPermission: 'sales.invoices.create', editPermission: 'sales.invoices.edit', hasDetail: true, dateFilter: true, statusFilter: true },
  '/sales/billings': { ...remoteList, kind: 'document', createPermission: 'sales.billings.create', hasDetail: true, dateFilter: true, statusFilter: true },
  '/sales/customer-deposits': { ...remoteList, kind: 'document', createPermission: 'sales.deposits.create', hasDetail: true, dateFilter: true, statusFilter: true },
  '/sales/receipts': { ...remoteList, kind: 'document', createPermission: 'sales.receipts.create', hasDetail: true, dateFilter: true, statusFilter: true },
  '/sales/returns': { ...remoteList, kind: 'document', createPermission: 'sales.returns.create', hasDetail: true, dateFilter: true, statusFilter: true },
  '/sales/ar/customer-summary': { kind: 'report' },
  '/sales/ar/open-invoices': { kind: 'document', dateFilter: true, statusFilter: true },
  '/sales/ar/aging': { kind: 'report', dateFilter: true },
  '/sales/ar/reconciliation': { kind: 'report', dateFilter: true },
  '/purchase/requests': { ...remoteList, kind: 'document', createPermission: 'purchase.requests.create', editPermission: 'purchase.requests.edit', hasDetail: true, dateFilter: true, statusFilter: true },
  '/purchase/orders': { ...remoteList, kind: 'document', createPermission: 'purchase.orders.create', editPermission: 'purchase.orders.edit', hasDetail: true, dateFilter: true, statusFilter: true },
  '/purchase/goods-receipts': { ...remoteList, kind: 'document', createPermission: 'purchase.goods_receipts.create', editPermission: 'purchase.goods_receipts.edit', hasDetail: true, dateFilter: true, statusFilter: true },
  '/purchase/bills': { ...remoteList, kind: 'document', createPermission: 'purchase.bills.create', editPermission: 'purchase.bills.edit', hasDetail: true, dateFilter: true, statusFilter: true },
  '/purchase/vendor-deposits': { ...remoteList, kind: 'document', createPermission: 'purchase.deposits.create', hasDetail: true, dateFilter: true, statusFilter: true },
  '/purchase/payments': { ...remoteList, kind: 'document', createPermission: 'purchase.payments.create', hasDetail: true, dateFilter: true, statusFilter: true },
  '/purchase/returns': { ...remoteList, kind: 'document', createPermission: 'purchase.returns.create', hasDetail: true, dateFilter: true, statusFilter: true },
  '/purchase/ap/vendor-summary': { kind: 'report' },
  '/purchase/ap/open-bills': { kind: 'document', dateFilter: true, statusFilter: true },
  '/purchase/ap/aging': { kind: 'report', dateFilter: true },
  '/purchase/ap/reconciliation': { kind: 'report', dateFilter: true },
  '/cash-bank/accounts': { kind: 'master-data' },
  '/cash-bank/cash-receipts': { ...remoteList, kind: 'document', createPermission: 'cash_bank.create', hasDetail: true, dateFilter: true, statusFilter: true, voidPermission: 'cash_bank.void' },
  '/cash-bank/cash-payments': { ...remoteList, kind: 'document', createPermission: 'cash_bank.create', hasDetail: true, dateFilter: true, statusFilter: true, voidPermission: 'cash_bank.void' },
  '/cash-bank/bank-transfers': { ...remoteList, kind: 'document', createPermission: 'cash_bank.transfer', hasDetail: true, dateFilter: true, statusFilter: true, voidPermission: 'cash_bank.void' },
  '/cash-bank/bank-reconciliations': { ...remoteList, kind: 'document', createPermission: 'cash_bank.create', editPermission: 'cash_bank.edit', hasDetail: true, dateFilter: true, statusFilter: true },
  '/inventory/stock-balances': { kind: 'inventory' },
  '/inventory/stock-movements': { ...remoteList, kind: 'inventory', createPermission: 'inventory.movements.create', hasDetail: true, dateFilter: true, statusFilter: true, voidPermission: 'inventory.movements.void' },
  '/inventory/stock-adjustments': { ...remoteList, kind: 'inventory', createPermission: 'inventory.adjustments.create', editPermission: 'inventory.adjustments.edit', hasDetail: true, dateFilter: true, statusFilter: true, voidPermission: 'inventory.adjustments.void' },
  '/inventory/stock-opnames': { ...remoteList, kind: 'inventory', createPermission: 'inventory.opname.create', editPermission: 'inventory.opname.edit', hasDetail: true, statusFilter: true, voidPermission: 'inventory.opname.finalize' },
  '/inventory/valuation': { kind: 'inventory' },
  '/inventory/reports/stock-balances': { kind: 'inventory' },
  '/inventory/reports/stock-movements': { kind: 'inventory', dateFilter: true },
  '/inventory/reports/valuation': { kind: 'inventory', dateFilter: true },
  '/inventory/reports/low-stock': { kind: 'inventory' },
  '/inventory/reports/negative-stock': { kind: 'inventory' },
  '/settings/company': { kind: 'settings', editPermission: 'settings.company.edit' },
  '/settings/account-mappings': { kind: 'settings', editPermission: 'settings.company.edit' },
}

export function resourceCapability(item: SidebarMenuItem): ResourceCapability {
  return { paginationMode: 'local', ...(capabilities[item.href] ?? { kind: 'report' as BackendWorkspaceKind }) }
}

function value(row: BackendResourceRow, keys: string[]) {
  for (const key of keys) {
    const current = row[key]
    if (current !== undefined && current !== null && String(current) !== '') return current
  }
  return '-'
}

function text(row: BackendResourceRow, keys: string[]) {
  const raw = value(row, keys)
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    return String(record.name ?? record.company_name ?? record.contact_name ?? record.id ?? '-')
  }
  return String(raw)
}

function money(row: BackendResourceRow, keys: string[]) {
  const raw = value(row, keys)
  const amount = Number(raw)
  return Number.isFinite(amount) ? new Intl.NumberFormat('id-ID').format(amount) : String(raw)
}

const productQuantityKeys = [
  'current_quantity',
  'quantity',
  'stock_quantity',
  'current_stock',
  'on_hand_quantity',
  'quantity_on_hand',
  'available_quantity',
  'qty',
  'inventory_quantity',
]

function quantity(row: BackendResourceRow, keys = productQuantityKeys) {
  for (const key of keys) {
    const raw = row[key]
    if (raw === null || raw === undefined || raw === '') continue
    const amount = Number(raw)
    if (Number.isFinite(amount)) return amount
  }

  return 0
}

function quantityText(row: BackendResourceRow, keys = productQuantityKeys) {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(quantity(row, keys))
}

function statusCell(row: BackendResourceRow) {
  const raw = value(row, ['status', 'state', 'is_active'])
  const status = typeof raw === 'boolean' ? (raw ? 'active' : 'inactive') : String(raw)
  return h(WorkspaceStatusBadge, { status })
}

function masterDataColumns(): ColumnDef<BackendResourceRow, unknown>[] {
  return [
    { id: 'code', accessorFn: (row) => text(row, ['code', 'account_code', 'sku', 'category_code', 'unit_code', 'warehouse_code', 'contact_code', 'mapping_key', 'id']), header: 'Code', cell: ({ row }) => h('span', { class: 'font-bold text-slate-900' }, text(row.original, ['code', 'account_code', 'sku', 'category_code', 'unit_code', 'warehouse_code', 'contact_code', 'mapping_key', 'id'])) },
    { id: 'name', accessorFn: (row) => text(row, ['name', 'account_name', 'product_name', 'category_name', 'warehouse_name', 'contact_name', 'label']), header: 'Name', cell: ({ row }) => text(row.original, ['name', 'account_name', 'product_name', 'category_name', 'warehouse_name', 'contact_name', 'label']) },
    { id: 'type', accessorFn: (row) => text(row, ['type', 'contact_type', 'account_type', 'category', 'unit_name']), header: 'Type', cell: ({ row }) => text(row.original, ['type', 'contact_type', 'account_type', 'category', 'unit_name']) },
    { id: 'status', accessorFn: (row) => statusText(row), header: 'Status', cell: ({ row }) => statusCell(row.original) },
  ]
}

function productColumns(): ColumnDef<BackendResourceRow, unknown>[] {
  return [
    { id: 'code', accessorFn: (row) => text(row, ['product_code', 'code', 'sku', 'id']), header: 'Code', cell: ({ row }) => h('span', { class: 'font-bold text-slate-900' }, text(row.original, ['product_code', 'code', 'sku', 'id'])) },
    { id: 'name', accessorFn: (row) => text(row, ['product_name', 'name', 'label']), header: 'Name', cell: ({ row }) => text(row.original, ['product_name', 'name', 'label']) },
    { id: 'type', accessorFn: (row) => text(row, ['product_type', 'type', 'category', 'unit_name']), header: 'Type', cell: ({ row }) => text(row.original, ['product_type', 'type', 'category', 'unit_name']) },
    { id: 'quantity', accessorFn: (row) => quantity(row), header: 'Quantity', cell: ({ row }) => h('span', { class: 'block text-right tabular-nums' }, quantityText(row.original)), enableSorting: false },
    { id: 'status', accessorFn: (row) => statusText(row), header: 'Status', cell: ({ row }) => statusCell(row.original) },
  ]
}

function statusText(row: BackendResourceRow) {
  const raw = value(row, ['status', 'state', 'is_active'])
  return typeof raw === 'boolean' ? (raw ? 'active' : 'inactive') : String(raw)
}

const documentDateFields = [
  'document_date',
  'date',
  'transaction_date',
  'quotation_date',
  'order_date',
  'delivery_date',
  'invoice_date',
  'billing_date',
  'return_date',
  'receipt_date',
  'request_date',
  'bill_date',
  'payment_date',
  'deposit_date',
  'transfer_date',
  'movement_date',
  'adjustment_date',
  'opname_date',
  'created_at',
]

function documentColumns(): ColumnDef<BackendResourceRow, unknown>[] {
  return [
    { id: 'number', accessorFn: (row) => text(row, ['document_number', 'number', 'quotation_number', 'order_number', 'invoice_number', 'billing_number', 'receipt_number', 'return_number', 'deposit_number', 'transfer_number', 'id']), header: 'Number', cell: ({ row }) => h('span', { class: 'font-bold text-slate-900' }, text(row.original, ['document_number', 'number', 'quotation_number', 'order_number', 'invoice_number', 'billing_number', 'receipt_number', 'return_number', 'deposit_number', 'transfer_number', 'id'])) },
    { id: 'date', accessorFn: (row) => text(row, documentDateFields), header: 'Date', cell: ({ row }) => formatDisplayDate(text(row.original, documentDateFields)) },
    { id: 'party', accessorFn: (row) => text(row, ['customer_name', 'vendor_name', 'contact_name', 'customer', 'vendor', 'contact']), header: 'Customer / Vendor', cell: ({ row }) => text(row.original, ['customer_name', 'vendor_name', 'contact_name', 'customer', 'vendor', 'contact']) },
    { id: 'status', accessorFn: (row) => statusText(row), header: 'Status', cell: ({ row }) => statusCell(row.original) },
    { id: 'total', accessorFn: (row) => Number(value(row, ['grand_total', 'total', 'total_amount', 'amount', 'balance'])) || 0, header: 'Total', cell: ({ row }) => h('span', { class: 'tabular-nums' }, money(row.original, ['grand_total', 'total', 'total_amount', 'amount', 'balance'])) },
  ]
}

function reportColumns(): ColumnDef<BackendResourceRow, unknown>[] {
  return [
    { id: 'code', accessorFn: (row) => text(row, ['account_code', 'code', 'document_number', 'number', 'id']), header: 'Account / Reference', cell: ({ row }) => h('span', { class: 'font-bold text-slate-900' }, text(row.original, ['account_code', 'code', 'document_number', 'number', 'id'])) },
    { id: 'name', accessorFn: (row) => text(row, ['account_name', 'name', 'description', 'label', 'customer_name', 'vendor_name']), header: 'Description', cell: ({ row }) => text(row.original, ['account_name', 'name', 'description', 'label', 'customer_name', 'vendor_name']) },
    { id: 'debit', accessorFn: (row) => Number(value(row, ['debit', 'total_debit'])) || 0, header: 'Debit', cell: ({ row }) => h('span', { class: 'tabular-nums' }, money(row.original, ['debit', 'total_debit'])) },
    { id: 'credit', accessorFn: (row) => Number(value(row, ['credit', 'total_credit'])) || 0, header: 'Credit', cell: ({ row }) => h('span', { class: 'tabular-nums' }, money(row.original, ['credit', 'total_credit'])) },
    { id: 'balance', accessorFn: (row) => Number(value(row, ['balance', 'net_balance', 'amount', 'total'])) || 0, header: 'Balance', cell: ({ row }) => h('span', { class: 'tabular-nums font-bold' }, money(row.original, ['balance', 'net_balance', 'amount', 'total'])) },
  ]
}

function inventoryColumns(): ColumnDef<BackendResourceRow, unknown>[] {
  return [
    { id: 'reference', accessorFn: (row) => text(row, ['product_code', 'sku', 'document_number', 'movement_number', 'opname_number', 'adjustment_number', 'id']), header: 'Product / Reference', cell: ({ row }) => h('span', { class: 'font-bold text-slate-900' }, text(row.original, ['product_code', 'sku', 'document_number', 'movement_number', 'opname_number', 'adjustment_number', 'id'])) },
    { id: 'name', accessorFn: (row) => text(row, ['product_name', 'name', 'description', 'warehouse_name', 'warehouse']), header: 'Description', cell: ({ row }) => text(row.original, ['product_name', 'name', 'description', 'warehouse_name', 'warehouse']) },
    { id: 'quantity', accessorFn: (row) => Number(value(row, ['quantity', 'qty', 'on_hand', 'available_quantity'])) || 0, header: 'Quantity', cell: ({ row }) => h('span', { class: 'tabular-nums' }, money(row.original, ['quantity', 'qty', 'on_hand', 'available_quantity'])) },
    { id: 'value', accessorFn: (row) => Number(value(row, ['value', 'total_value', 'amount'])) || 0, header: 'Value', cell: ({ row }) => h('span', { class: 'tabular-nums' }, money(row.original, ['value', 'total_value', 'amount'])) },
    { id: 'status', accessorFn: (row) => statusText(row), header: 'Status', cell: ({ row }) => statusCell(row.original) },
  ]
}

function settingsColumns(): ColumnDef<BackendResourceRow, unknown>[] {
  return [
    { id: 'key', accessorFn: (row) => text(row, ['mapping_key', 'key', 'name', 'id']), header: 'Setting', cell: ({ row }) => h('span', { class: 'font-bold text-slate-900' }, text(row.original, ['mapping_key', 'key', 'name', 'id'])) },
    { id: 'value', accessorFn: (row) => text(row, ['account_name', 'value', 'label', 'company_name', 'name']), header: 'Value', cell: ({ row }) => text(row.original, ['account_name', 'value', 'label', 'company_name', 'name']) },
    { id: 'status', accessorFn: (row) => statusText(row), header: 'Status', cell: ({ row }) => statusCell(row.original) },
  ]
}

function columnsFor(kind: BackendWorkspaceKind, href: string) {
  if (href === '/master-data/products') return productColumns()
  if (kind === 'master-data') return masterDataColumns()
  if (kind === 'document') return documentColumns()
  if (kind === 'inventory') return inventoryColumns()
  if (kind === 'settings') return settingsColumns()
  return reportColumns()
}

export function makeBackendResourceConfig(item: SidebarMenuItem): WorkspaceListConfig<BackendResourceRow> {
  const capability = resourceCapability(item)
  const rowActions: WorkspaceRowAction<BackendResourceRow>[] = []

  if (capability.hasDetail) {
    rowActions.push({ key: 'detail', label: 'Open', permission: item.permission, variant: 'secondary' })
  }
  if (capability.editPermission) {
    rowActions.push({ key: 'edit', label: 'Edit', permission: capability.editPermission, variant: 'secondary' })
  }

  return {
    moduleKey: item.id,
    primaryTabId: item.href,
    title: item.label,
    subtitle: `Backend source: GET /api${item.endpoint}`,
    listTabLabel: item.label,
    createLabel: capability.createPermission ? `Create ${item.label}` : undefined,
    search: { enabled: true, placeholder: `Search ${item.label.toLowerCase()}...`, debounceMs: 250 },
    dateFilter: { enabled: Boolean(capability.dateFilter), label: 'Start Date' },
    statusOptions: capability.statusFilter
      ? [
          { label: 'Draft', value: 'draft', tone: 'draft' },
          { label: 'Active', value: 'active', tone: 'success' },
          { label: 'Posted', value: 'posted', tone: 'success' },
          { label: 'Inactive', value: 'inactive', tone: 'danger' },
          { label: 'Void', value: 'void', tone: 'danger' },
        ]
      : undefined,
    columns: columnsFor(capability.kind, item.href),
    rowKey: 'id',
    selectable: Boolean(capability.voidPermission),
    globalActions: capability.voidPermission
      ? [{ key: 'void', label: 'Bulk Void', variant: 'danger', permission: capability.voidPermission }]
      : undefined,
    permissions: {
      view: item.permission,
      create: capability.createPermission,
      edit: capability.editPermission,
      void: capability.voidPermission,
    },
    rowActions,
    emptyTitle: `No ${item.label.toLowerCase()}`,
    emptyDescription: `No rows returned from GET /api${item.endpoint}.`,
  }
}
