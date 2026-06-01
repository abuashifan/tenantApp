import { z } from 'zod'

import type { LineItemColumn } from '@/components/form/FormLineItemsTable.vue'

export type FormFieldKind = 'text' | 'textarea' | 'date' | 'number' | 'money' | 'select' | 'checkbox'

export type FormFieldConfig = {
  key: string
  label: string
  kind?: FormFieldKind
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  remoteOptions?: {
    endpoint: string
    labelKey?: string
    valueKey?: string
    params?: Record<string, unknown>
  }
  readonly?: boolean
}

export type FormActionConfig = {
  key: string
  label: string
  endpointSuffix: string
  method?: 'post' | 'patch'
  permission: string
  visibleStatuses?: string[]
  variant?: 'primary' | 'secondary' | 'danger'
  payload?: Record<string, unknown>
}

export type ResourceFormConfig = {
  title: string
  endpoint: string
  numberKeys: string[]
  dateKey?: string
  statusKey?: string
  hasShow?: boolean
  createPermission?: string
  editPermission?: string
  sections: Array<{
    title: string
    description?: string
    fields: FormFieldConfig[]
  }>
  lineItems?: {
    key: string
    title: string
    description?: string
    minRows: number
    columns: LineItemColumn[]
    defaultRow: Record<string, unknown>
  }
  actions: FormActionConfig[]
  skippedReason?: string
}

const discountOptions = [
  { label: 'Percent', value: 'percent' },
  { label: 'Fixed Amount', value: 'fixed_amount' },
]

const contactTypeOptions = [
  { label: 'Customer', value: 'customer' },
  { label: 'Supplier', value: 'supplier' },
  { label: 'Employee', value: 'employee' },
  { label: 'Other', value: 'other' },
]

const productTypeOptions = [
  { label: 'Goods', value: 'goods' },
  { label: 'Service', value: 'service' },
]

const commonCommercialFields: FormFieldConfig[] = [
  { key: 'currency_code', label: 'Currency', kind: 'text', placeholder: 'IDR' },
  { key: 'exchange_rate', label: 'Exchange Rate', kind: 'number', placeholder: '1' },
  { key: 'header_discount_type', label: 'Discount Type', kind: 'select', options: discountOptions },
  { key: 'header_discount_value', label: 'Discount Value', kind: 'money' },
  { key: 'is_taxable', label: 'Taxable', kind: 'checkbox' },
  { key: 'tax_included', label: 'Tax Included', kind: 'checkbox' },
]

const salesLineColumns: LineItemColumn[] = [
  { key: 'product_id', label: 'Product ID', type: 'number' },
  { key: 'description', label: 'Description' },
  { key: 'quantity', label: 'Qty', type: 'number' },
  { key: 'unit_id', label: 'Unit ID', type: 'number' },
  { key: 'unit_price', label: 'Unit Price', type: 'money' },
  { key: 'discount_value', label: 'Discount', type: 'money' },
  { key: 'tax_rate', label: 'Tax %', type: 'number' },
  { key: 'warehouse_id', label: 'Warehouse ID', type: 'number' },
  { key: 'department_id', label: 'Dept ID', type: 'number' },
  { key: 'project_id', label: 'Project ID', type: 'number' },
]

const purchaseLineColumns: LineItemColumn[] = [
  ...salesLineColumns,
  { key: 'expense_account_id', label: 'Expense Account ID', type: 'number' },
]

const defaultLine = {
  product_id: null,
  description: '',
  quantity: 1,
  unit_id: null,
  unit_price: 0,
  discount_type: 'fixed_amount',
  discount_value: 0,
  tax_rate: 0,
  warehouse_id: null,
  department_id: null,
  project_id: null,
}

function noteSection() {
  return {
    title: 'Notes',
    fields: [
      { key: 'notes', label: 'Notes', kind: 'textarea' as const },
      { key: 'internal_notes', label: 'Internal Notes', kind: 'textarea' as const },
    ],
  }
}

function commercialLine(key = 'lines', title = 'Line Items') {
  return { key, title, minRows: 1, columns: salesLineColumns, defaultRow: defaultLine }
}

function purchaseLine(key = 'lines', title = 'Line Items') {
  return {
    key,
    title,
    minRows: 1,
    columns: purchaseLineColumns,
    defaultRow: { ...defaultLine, expense_account_id: null },
  }
}

function salesActions(module: string) {
  return [
    { key: 'approve', label: 'Approve', endpointSuffix: 'approve', method: 'patch' as const, permission: `${module}.approve`, visibleStatuses: ['draft'], variant: 'secondary' as const },
    { key: 'post', label: 'Post', endpointSuffix: 'post', method: 'patch' as const, permission: `${module}.post`, visibleStatuses: ['approved', 'draft'], variant: 'primary' as const },
    { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch' as const, permission: `${module}.void`, visibleStatuses: ['posted'], variant: 'danger' as const },
  ]
}

function cancelActions(module: string) {
  return [
    { key: 'cancel', label: 'Cancel', endpointSuffix: 'cancel', method: 'patch' as const, permission: `${module}.cancel`, visibleStatuses: ['draft', 'approved', 'confirmed'], variant: 'danger' as const },
  ]
}

export const backendResourceFormConfigs: Record<string, ResourceFormConfig> = {
  '/master-data/contacts': {
    title: 'Contact',
    endpoint: '/master-data/contacts',
    numberKeys: ['contact_code', 'code', 'id'],
    createPermission: 'contacts.create',
    editPermission: 'contacts.edit',
    sections: [
      {
        title: 'Contact Details',
        fields: [
          { key: 'contact_code', label: 'Contact Code', required: true },
          { key: 'name', label: 'Name', required: true },
          { key: 'contact_type', label: 'Type', kind: 'select', options: contactTypeOptions, required: true },
          { key: 'payment_term_id', label: 'Payment Term', kind: 'select', remoteOptions: { endpoint: '/master-data/payment-terms', labelKey: 'name', valueKey: 'id', params: { is_active: true } } },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'address', label: 'Address', kind: 'textarea' },
          { key: 'is_active', label: 'Active', kind: 'checkbox' },
        ],
      },
    ],
    actions: [],
  },
  '/master-data/payment-terms': {
    title: 'Payment Term',
    endpoint: '/master-data/payment-terms',
    numberKeys: ['code', 'id'],
    createPermission: 'payment_terms.create',
    editPermission: 'payment_terms.edit',
    sections: [
      {
        title: 'Payment Term Details',
        fields: [
          { key: 'code', label: 'Code', required: true },
          { key: 'name', label: 'Name', required: true },
          { key: 'days', label: 'Days', kind: 'number' },
          { key: 'is_custom', label: 'Custom', kind: 'checkbox' },
          { key: 'sort_order', label: 'Sort Order', kind: 'number' },
          { key: 'is_active', label: 'Active', kind: 'checkbox' },
        ],
      },
    ],
    actions: [],
  },
  '/master-data/units': {
    title: 'Unit',
    endpoint: '/master-data/units',
    numberKeys: ['code', 'id'],
    createPermission: 'units.create',
    editPermission: 'units.edit',
    sections: [{ title: 'Unit Details', fields: [{ key: 'code', label: 'Code', required: true }, { key: 'name', label: 'Name', required: true }, { key: 'precision', label: 'Precision', kind: 'number', required: true }, { key: 'is_active', label: 'Active', kind: 'checkbox' }] }],
    actions: [],
  },
  '/master-data/product-categories': {
    title: 'Product Category',
    endpoint: '/master-data/product-categories',
    numberKeys: ['code', 'name', 'id'],
    createPermission: 'products.create',
    editPermission: 'products.edit',
    sections: [{ title: 'Category Details', fields: [{ key: 'name', label: 'Name', required: true }, { key: 'description', label: 'Description', kind: 'textarea' }, { key: 'is_active', label: 'Active', kind: 'checkbox' }] }],
    actions: [],
  },
  '/master-data/products': {
    title: 'Product',
    endpoint: '/master-data/products',
    numberKeys: ['product_code', 'code', 'sku', 'id'],
    createPermission: 'products.create',
    editPermission: 'products.edit',
    sections: [
      { title: 'Product Details', fields: [{ key: 'product_code', label: 'Product Code', required: true }, { key: 'product_name', label: 'Product Name', required: true }, { key: 'product_type', label: 'Type', kind: 'select', options: productTypeOptions }, { key: 'product_category_id', label: 'Category ID', kind: 'number' }, { key: 'unit_id', label: 'Unit ID', kind: 'number' }, { key: 'is_stock_item', label: 'Stock Item', kind: 'checkbox' }, { key: 'is_active', label: 'Active', kind: 'checkbox' }] },
      { title: 'Accounting', fields: [{ key: 'sales_account_id', label: 'Sales Account ID', kind: 'number' }, { key: 'purchase_account_id', label: 'Purchase Account ID', kind: 'number' }, { key: 'inventory_account_id', label: 'Inventory Account ID', kind: 'number' }, { key: 'cogs_account_id', label: 'COGS Account ID', kind: 'number' }] },
    ],
    actions: [],
  },
  '/master-data/warehouses': {
    title: 'Warehouse',
    endpoint: '/master-data/warehouses',
    numberKeys: ['code', 'warehouse_code', 'id'],
    createPermission: 'warehouses.create',
    editPermission: 'warehouses.edit',
    sections: [{ title: 'Warehouse Details', fields: [{ key: 'code', label: 'Code', required: true }, { key: 'name', label: 'Name', required: true }, { key: 'address', label: 'Address', kind: 'textarea' }, { key: 'is_default', label: 'Default', kind: 'checkbox' }, { key: 'is_active', label: 'Active', kind: 'checkbox' }] }],
    actions: [],
  },
  '/master-data/departments': {
    title: 'Department',
    endpoint: '/master-data/departments',
    numberKeys: ['code', 'id'],
    createPermission: 'departments.create',
    editPermission: 'departments.edit',
    sections: [{ title: 'Department Details', fields: [{ key: 'code', label: 'Code', required: true }, { key: 'name', label: 'Name', required: true }, { key: 'is_active', label: 'Active', kind: 'checkbox' }] }],
    actions: [],
  },
  '/master-data/projects': {
    title: 'Project',
    endpoint: '/master-data/projects',
    numberKeys: ['code', 'id'],
    createPermission: 'projects.create',
    editPermission: 'projects.edit',
    sections: [{ title: 'Project Details', fields: [{ key: 'code', label: 'Code', required: true }, { key: 'name', label: 'Name', required: true }, { key: 'start_date', label: 'Start Date', kind: 'date' }, { key: 'end_date', label: 'End Date', kind: 'date' }, { key: 'is_active', label: 'Active', kind: 'checkbox' }] }],
    actions: [],
  },
  '/settings/account-mappings': {
    title: 'Account Mapping',
    endpoint: '/master-data/account-mappings',
    numberKeys: ['mapping_key', 'id'],
    hasShow: false,
    editPermission: 'settings.company.edit',
    sections: [{ title: 'Mapping Details', fields: [{ key: 'mapping_key', label: 'Mapping Key', readonly: true }, { key: 'module', label: 'Module', readonly: true }, { key: 'account_id', label: 'Account ID', kind: 'number', required: true }, { key: 'is_active', label: 'Active', kind: 'checkbox' }] }],
    actions: [],
  },
  '/sales/quotations': {
    title: 'Sales Quotation',
    endpoint: '/sales/quotations',
    numberKeys: ['quotation_number', 'id'],
    dateKey: 'quotation_date',
    createPermission: 'sales.quotations.create',
    editPermission: 'sales.quotations.edit',
    sections: [
      { title: 'Main Information', fields: [{ key: 'customer_id', label: 'Customer ID', kind: 'number', required: true }, { key: 'quotation_date', label: 'Quotation Date', kind: 'date', required: true }, { key: 'valid_until', label: 'Valid Until', kind: 'date' }, ...commonCommercialFields] },
      noteSection(),
    ],
    lineItems: commercialLine('lines', 'Quotation Lines'),
    actions: [
      { key: 'send', label: 'Send', endpointSuffix: 'send', method: 'patch', permission: 'sales.quotations.edit', visibleStatuses: ['draft'], variant: 'secondary' },
      { key: 'approve', label: 'Approve', endpointSuffix: 'approve', method: 'patch', permission: 'sales.quotations.approve', visibleStatuses: ['sent', 'draft'], variant: 'secondary' },
      { key: 'accept', label: 'Accept', endpointSuffix: 'accept', method: 'patch', permission: 'sales.quotations.approve', visibleStatuses: ['approved', 'sent'], variant: 'primary' },
      { key: 'reject', label: 'Reject', endpointSuffix: 'reject', method: 'patch', permission: 'sales.quotations.cancel', visibleStatuses: ['sent', 'approved'], variant: 'danger' },
      ...cancelActions('sales.quotations'),
    ],
  },
  '/sales/orders': {
    title: 'Sales Order',
    endpoint: '/sales/orders',
    numberKeys: ['order_number', 'id'],
    dateKey: 'order_date',
    createPermission: 'sales.orders.create',
    editPermission: 'sales.orders.edit',
    sections: [{ title: 'Main Information', fields: [{ key: 'customer_id', label: 'Customer ID', kind: 'number', required: true }, { key: 'order_date', label: 'Order Date', kind: 'date', required: true }, { key: 'quotation_id', label: 'Quotation ID', kind: 'number' }, { key: 'shipping_address', label: 'Shipping Address', kind: 'textarea' }, ...commonCommercialFields] }, noteSection()],
    lineItems: commercialLine('lines', 'Order Lines'),
    actions: [{ key: 'approve', label: 'Approve', endpointSuffix: 'approve', method: 'patch', permission: 'sales.orders.approve', visibleStatuses: ['draft'], variant: 'secondary' }, { key: 'confirm', label: 'Confirm', endpointSuffix: 'confirm', method: 'patch', permission: 'sales.orders.confirm', visibleStatuses: ['approved', 'draft'], variant: 'primary' }, ...cancelActions('sales.orders'), { key: 'close', label: 'Close', endpointSuffix: 'close', method: 'patch', permission: 'sales.orders.confirm', visibleStatuses: ['confirmed'], variant: 'secondary' }],
  },
  '/sales/delivery-orders': {
    title: 'Delivery Order',
    endpoint: '/sales/delivery-orders',
    numberKeys: ['delivery_number', 'id'],
    dateKey: 'delivery_date',
    createPermission: 'sales.delivery_orders.create',
    editPermission: 'sales.delivery_orders.edit',
    sections: [{ title: 'Main Information', fields: [{ key: 'customer_id', label: 'Customer ID', kind: 'number', required: true }, { key: 'delivery_date', label: 'Delivery Date', kind: 'date', required: true }, { key: 'sales_order_id', label: 'Sales Order ID', kind: 'number' }, { key: 'warehouse_id', label: 'Warehouse ID', kind: 'number' }, { key: 'shipping_address', label: 'Shipping Address', kind: 'textarea' }] }, noteSection()],
    lineItems: commercialLine('lines', 'Delivery Lines'),
    actions: [{ key: 'ready', label: 'Ready', endpointSuffix: 'ready', method: 'patch', permission: 'sales.delivery_orders.ship', visibleStatuses: ['draft'], variant: 'secondary' }, { key: 'ship', label: 'Ship', endpointSuffix: 'ship', method: 'patch', permission: 'sales.delivery_orders.ship', visibleStatuses: ['ready'], variant: 'secondary' }, { key: 'deliver', label: 'Deliver', endpointSuffix: 'deliver', method: 'patch', permission: 'sales.delivery_orders.deliver', visibleStatuses: ['shipped', 'ready'], variant: 'primary' }, ...cancelActions('sales.delivery_orders'), { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'sales.delivery_orders.void', visibleStatuses: ['delivered'], variant: 'danger' }],
  },
  '/sales/proformas': {
    title: 'Proforma Invoice',
    endpoint: '/sales/proformas',
    numberKeys: ['proforma_number', 'invoice_number', 'id'],
    dateKey: 'proforma_date',
    createPermission: 'sales.proformas.create',
    editPermission: 'sales.proformas.edit',
    sections: [{ title: 'Main Information', fields: [{ key: 'customer_id', label: 'Customer ID', kind: 'number', required: true }, { key: 'proforma_date', label: 'Proforma Date', kind: 'date', required: true }, { key: 'valid_until', label: 'Valid Until', kind: 'date' }, { key: 'sales_order_id', label: 'Sales Order ID', kind: 'number' }, ...commonCommercialFields] }, noteSection()],
    lineItems: commercialLine('lines', 'Proforma Lines'),
    actions: [{ key: 'issue', label: 'Issue', endpointSuffix: 'issue', method: 'patch', permission: 'sales.proformas.issue', visibleStatuses: ['draft'], variant: 'primary' }, { key: 'accept', label: 'Accept', endpointSuffix: 'accept', method: 'patch', permission: 'sales.proformas.issue', visibleStatuses: ['issued'], variant: 'primary' }, ...cancelActions('sales.proformas')],
  },
  '/sales/invoices': {
    title: 'Sales Invoice',
    endpoint: '/sales/invoices',
    numberKeys: ['invoice_number', 'id'],
    dateKey: 'invoice_date',
    createPermission: 'sales.invoices.create',
    editPermission: 'sales.invoices.edit',
    sections: [{ title: 'Main Information', fields: [{ key: 'customer_id', label: 'Customer ID', kind: 'number', required: true }, { key: 'invoice_date', label: 'Invoice Date', kind: 'date', required: true }, { key: 'due_date', label: 'Due Date', kind: 'date' }, { key: 'sales_order_id', label: 'Sales Order ID', kind: 'number' }, { key: 'delivery_order_id', label: 'Delivery Order ID', kind: 'number' }, { key: 'applied_down_payment_amount', label: 'Applied Customer Deposit', kind: 'money' }, ...commonCommercialFields] }, noteSection()],
    lineItems: commercialLine('lines', 'Invoice Lines'),
    actions: salesActions('sales.invoices'),
  },
  '/sales/billings': {
    title: 'Billing Invoice',
    endpoint: '/sales/billings',
    numberKeys: ['billing_number', 'invoice_number', 'id'],
    dateKey: 'billing_date',
    createPermission: 'sales.billings.create',
    sections: [{ title: 'Main Information', fields: [{ key: 'sales_invoice_id', label: 'Sales Invoice ID', kind: 'number', required: true }, { key: 'billing_date', label: 'Billing Date', kind: 'date', required: true }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    actions: [{ key: 'issue', label: 'Issue', endpointSuffix: 'issue', method: 'patch', permission: 'sales.billings.issue', visibleStatuses: ['draft'], variant: 'primary' }, ...cancelActions('sales.billings')],
  },
  '/sales/customer-deposits': {
    title: 'Customer Deposit',
    endpoint: '/sales/customer-deposits',
    numberKeys: ['deposit_number', 'id'],
    dateKey: 'deposit_date',
    createPermission: 'sales.deposits.create',
    sections: [{ title: 'Deposit Details', fields: [{ key: 'customer_id', label: 'Customer ID', kind: 'number', required: true }, { key: 'deposit_date', label: 'Deposit Date', kind: 'date', required: true }, { key: 'cash_bank_account_id', label: 'Cash/Bank Account ID', kind: 'number', required: true }, { key: 'sales_order_id', label: 'Sales Order ID', kind: 'number' }, { key: 'amount', label: 'Amount', kind: 'money', required: true }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    actions: [{ key: 'post', label: 'Post', endpointSuffix: 'post', method: 'patch', permission: 'sales.deposits.post', visibleStatuses: ['draft'], variant: 'primary' }, { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'sales.deposits.void', visibleStatuses: ['posted'], variant: 'danger' }, { key: 'refund', label: 'Refund', endpointSuffix: 'refund', method: 'patch', permission: 'sales.deposits.refund', visibleStatuses: ['posted'], variant: 'secondary' }],
  },
  '/sales/receipts': {
    title: 'Sales Receipt',
    endpoint: '/sales/receipts',
    numberKeys: ['receipt_number', 'id'],
    dateKey: 'receipt_date',
    createPermission: 'sales.receipts.create',
    sections: [{ title: 'Receipt Details', fields: [{ key: 'customer_id', label: 'Customer ID', kind: 'number', required: true }, { key: 'receipt_date', label: 'Receipt Date', kind: 'date', required: true }, { key: 'cash_bank_account_id', label: 'Cash/Bank Account ID', kind: 'number', required: true }, { key: 'sales_invoice_id', label: 'Sales Invoice ID', kind: 'number' }, { key: 'amount', label: 'Amount', kind: 'money', required: true }, { key: 'payment_reference', label: 'Payment Reference' }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    lineItems: { key: 'lines', title: 'Invoice Allocations', minRows: 0, columns: [{ key: 'sales_invoice_id', label: 'Invoice ID', type: 'number' }, { key: 'amount', label: 'Amount', type: 'money' }, { key: 'description', label: 'Description' }], defaultRow: { sales_invoice_id: null, amount: 0, description: '' } },
    actions: [{ key: 'post', label: 'Post', endpointSuffix: 'post', method: 'patch', permission: 'sales.receipts.post', visibleStatuses: ['draft'], variant: 'primary' }, { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'sales.receipts.void', visibleStatuses: ['posted'], variant: 'danger' }],
  },
  '/sales/returns': {
    title: 'Sales Return',
    endpoint: '/sales/returns',
    numberKeys: ['return_number', 'id'],
    dateKey: 'return_date',
    createPermission: 'sales.returns.create',
    editPermission: 'sales.returns.create',
    sections: [{ title: 'Return Details', fields: [{ key: 'customer_id', label: 'Customer ID', kind: 'number', required: true }, { key: 'return_date', label: 'Return Date', kind: 'date', required: true }, { key: 'sales_invoice_id', label: 'Sales Invoice ID', kind: 'number' }, { key: 'reason', label: 'Reason', kind: 'textarea' }, ...commonCommercialFields] }, noteSection()],
    lineItems: commercialLine('lines', 'Return Lines'),
    actions: salesActions('sales.returns'),
  },
  '/purchase/requests': {
    title: 'Purchase Request',
    endpoint: '/purchase/requests',
    numberKeys: ['request_number', 'id'],
    dateKey: 'request_date',
    createPermission: 'purchase.requests.create',
    editPermission: 'purchase.requests.edit',
    sections: [{ title: 'Request Details', fields: [{ key: 'request_date', label: 'Request Date', kind: 'date', required: true }, { key: 'needed_date', label: 'Needed Date', kind: 'date' }, { key: 'department_id', label: 'Department ID', kind: 'number' }, { key: 'project_id', label: 'Project ID', kind: 'number' }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    lineItems: purchaseLine('lines', 'Request Lines'),
    actions: [{ key: 'submit', label: 'Submit', endpointSuffix: 'submit', method: 'patch', permission: 'purchase.requests.edit', visibleStatuses: ['draft'], variant: 'primary' }, { key: 'approve', label: 'Approve', endpointSuffix: 'approve', method: 'patch', permission: 'purchase.requests.approve', visibleStatuses: ['submitted'], variant: 'primary' }, { key: 'reject', label: 'Reject', endpointSuffix: 'reject', method: 'patch', permission: 'purchase.requests.cancel', visibleStatuses: ['submitted'], variant: 'danger' }, ...cancelActions('purchase.requests')],
  },
  '/purchase/orders': {
    title: 'Purchase Order',
    endpoint: '/purchase/orders',
    numberKeys: ['order_number', 'id'],
    dateKey: 'order_date',
    createPermission: 'purchase.orders.create',
    editPermission: 'purchase.orders.edit',
    sections: [{ title: 'Main Information', fields: [{ key: 'vendor_id', label: 'Vendor ID', kind: 'number', required: true }, { key: 'order_date', label: 'Order Date', kind: 'date', required: true }, { key: 'expected_date', label: 'Expected Date', kind: 'date' }, { key: 'purchase_request_id', label: 'Purchase Request ID', kind: 'number' }, ...commonCommercialFields] }, noteSection()],
    lineItems: purchaseLine('lines', 'Order Lines'),
    actions: [{ key: 'approve', label: 'Approve', endpointSuffix: 'approve', method: 'patch', permission: 'purchase.orders.approve', visibleStatuses: ['draft'], variant: 'secondary' }, { key: 'confirm', label: 'Confirm', endpointSuffix: 'confirm', method: 'patch', permission: 'purchase.orders.confirm', visibleStatuses: ['approved', 'draft'], variant: 'primary' }, ...cancelActions('purchase.orders'), { key: 'close', label: 'Close', endpointSuffix: 'close', method: 'patch', permission: 'purchase.orders.confirm', visibleStatuses: ['confirmed'], variant: 'secondary' }],
  },
  '/purchase/goods-receipts': {
    title: 'Goods Receipt',
    endpoint: '/purchase/goods-receipts',
    numberKeys: ['receipt_number', 'id'],
    dateKey: 'receipt_date',
    createPermission: 'purchase.goods_receipts.create',
    editPermission: 'purchase.goods_receipts.edit',
    sections: [{ title: 'Receipt Details', fields: [{ key: 'vendor_id', label: 'Vendor ID', kind: 'number', required: true }, { key: 'receipt_date', label: 'Receipt Date', kind: 'date', required: true }, { key: 'purchase_order_id', label: 'Purchase Order ID', kind: 'number' }, { key: 'warehouse_id', label: 'Warehouse ID', kind: 'number' }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    lineItems: purchaseLine('lines', 'Received Lines'),
    actions: [{ key: 'receive', label: 'Receive', endpointSuffix: 'receive', method: 'patch', permission: 'purchase.goods_receipts.receive', visibleStatuses: ['draft'], variant: 'primary' }, ...cancelActions('purchase.goods_receipts'), { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'purchase.goods_receipts.void', visibleStatuses: ['received'], variant: 'danger' }],
  },
  '/purchase/bills': {
    title: 'Vendor Bill',
    endpoint: '/purchase/bills',
    numberKeys: ['bill_number', 'id'],
    dateKey: 'bill_date',
    createPermission: 'purchase.bills.create',
    editPermission: 'purchase.bills.edit',
    sections: [{ title: 'Main Information', fields: [{ key: 'vendor_id', label: 'Vendor ID', kind: 'number', required: true }, { key: 'bill_date', label: 'Bill Date', kind: 'date', required: true }, { key: 'due_date', label: 'Due Date', kind: 'date' }, { key: 'vendor_invoice_number', label: 'Vendor Invoice Number' }, { key: 'purchase_order_id', label: 'Purchase Order ID', kind: 'number' }, { key: 'goods_receipt_id', label: 'Goods Receipt ID', kind: 'number' }, { key: 'applied_vendor_deposit_amount', label: 'Applied Vendor Deposit', kind: 'money' }, ...commonCommercialFields] }, noteSection()],
    lineItems: purchaseLine('lines', 'Bill Lines'),
    actions: salesActions('purchase.bills'),
  },
  '/purchase/vendor-deposits': {
    title: 'Vendor Deposit',
    endpoint: '/purchase/vendor-deposits',
    numberKeys: ['deposit_number', 'id'],
    dateKey: 'deposit_date',
    createPermission: 'purchase.deposits.create',
    sections: [{ title: 'Deposit Details', fields: [{ key: 'vendor_id', label: 'Vendor ID', kind: 'number', required: true }, { key: 'deposit_date', label: 'Deposit Date', kind: 'date', required: true }, { key: 'cash_bank_account_id', label: 'Cash/Bank Account ID', kind: 'number', required: true }, { key: 'purchase_order_id', label: 'Purchase Order ID', kind: 'number' }, { key: 'amount', label: 'Amount', kind: 'money', required: true }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    actions: [{ key: 'post', label: 'Post', endpointSuffix: 'post', method: 'patch', permission: 'purchase.deposits.post', visibleStatuses: ['draft'], variant: 'primary' }, { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'purchase.deposits.void', visibleStatuses: ['posted'], variant: 'danger' }, { key: 'refund', label: 'Refund', endpointSuffix: 'refund', method: 'patch', permission: 'purchase.deposits.refund', visibleStatuses: ['posted'], variant: 'secondary' }],
  },
  '/purchase/payments': {
    title: 'Vendor Payment',
    endpoint: '/purchase/payments',
    numberKeys: ['payment_number', 'id'],
    dateKey: 'payment_date',
    createPermission: 'purchase.payments.create',
    sections: [{ title: 'Payment Details', fields: [{ key: 'vendor_id', label: 'Vendor ID', kind: 'number', required: true }, { key: 'payment_date', label: 'Payment Date', kind: 'date', required: true }, { key: 'cash_bank_account_id', label: 'Cash/Bank Account ID', kind: 'number', required: true }, { key: 'vendor_bill_id', label: 'Vendor Bill ID', kind: 'number' }, { key: 'amount', label: 'Amount', kind: 'money', required: true }, { key: 'payment_reference', label: 'Payment Reference' }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    lineItems: { key: 'lines', title: 'Bill Allocations', minRows: 0, columns: [{ key: 'vendor_bill_id', label: 'Bill ID', type: 'number' }, { key: 'amount', label: 'Amount', type: 'money' }, { key: 'description', label: 'Description' }], defaultRow: { vendor_bill_id: null, amount: 0, description: '' } },
    actions: [{ key: 'post', label: 'Post', endpointSuffix: 'post', method: 'patch', permission: 'purchase.payments.post', visibleStatuses: ['draft'], variant: 'primary' }, { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'purchase.payments.void', visibleStatuses: ['posted'], variant: 'danger' }],
  },
  '/purchase/returns': {
    title: 'Purchase Return',
    endpoint: '/purchase/returns',
    numberKeys: ['return_number', 'id'],
    dateKey: 'return_date',
    createPermission: 'purchase.returns.create',
    editPermission: 'purchase.returns.create',
    sections: [{ title: 'Return Details', fields: [{ key: 'vendor_id', label: 'Vendor ID', kind: 'number', required: true }, { key: 'return_date', label: 'Return Date', kind: 'date', required: true }, { key: 'vendor_bill_id', label: 'Vendor Bill ID', kind: 'number' }, { key: 'goods_receipt_id', label: 'Goods Receipt ID', kind: 'number' }, { key: 'reason', label: 'Reason', kind: 'textarea' }, ...commonCommercialFields] }, noteSection()],
    lineItems: purchaseLine('lines', 'Return Lines'),
    actions: salesActions('purchase.returns'),
  },
  '/cash-bank/cash-receipts': {
    title: 'Cash Receipt',
    endpoint: '/cash-bank/cash-receipts',
    numberKeys: ['receipt_number', 'id'],
    dateKey: 'receipt_date',
    createPermission: 'cash_bank.create',
    sections: [{ title: 'Cash In Details', fields: [{ key: 'receipt_date', label: 'Receipt Date', kind: 'date', required: true }, { key: 'cash_bank_account_id', label: 'Cash/Bank Account ID', kind: 'number', required: true }, { key: 'contact_id', label: 'Received From Contact ID', kind: 'number' }, { key: 'amount', label: 'Amount', kind: 'money', required: true }, { key: 'currency_code', label: 'Currency' }, { key: 'exchange_rate', label: 'Exchange Rate', kind: 'number' }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    lineItems: { key: 'lines', title: 'Receipt Lines', minRows: 0, columns: [{ key: 'account_id', label: 'Source Account ID', type: 'number' }, { key: 'amount', label: 'Amount', type: 'money' }, { key: 'description', label: 'Description' }, { key: 'department_id', label: 'Dept ID', type: 'number' }, { key: 'project_id', label: 'Project ID', type: 'number' }], defaultRow: { account_id: null, amount: 0, description: '', department_id: null, project_id: null } },
    actions: [{ key: 'post', label: 'Post', endpointSuffix: 'post', method: 'patch', permission: 'cash_bank.post', visibleStatuses: ['draft'], variant: 'primary' }, { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'cash_bank.void', visibleStatuses: ['posted'], variant: 'danger' }],
  },
  '/cash-bank/cash-payments': {
    title: 'Cash Payment',
    endpoint: '/cash-bank/cash-payments',
    numberKeys: ['payment_number', 'id'],
    dateKey: 'payment_date',
    createPermission: 'cash_bank.create',
    sections: [{ title: 'Cash Out Details', fields: [{ key: 'payment_date', label: 'Payment Date', kind: 'date', required: true }, { key: 'cash_bank_account_id', label: 'Cash/Bank Account ID', kind: 'number', required: true }, { key: 'contact_id', label: 'Paid To Contact ID', kind: 'number' }, { key: 'amount', label: 'Amount', kind: 'money', required: true }, { key: 'currency_code', label: 'Currency' }, { key: 'exchange_rate', label: 'Exchange Rate', kind: 'number' }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    lineItems: { key: 'lines', title: 'Payment Lines', minRows: 0, columns: [{ key: 'account_id', label: 'Expense/Target Account ID', type: 'number' }, { key: 'amount', label: 'Amount', type: 'money' }, { key: 'description', label: 'Description' }, { key: 'department_id', label: 'Dept ID', type: 'number' }, { key: 'project_id', label: 'Project ID', type: 'number' }], defaultRow: { account_id: null, amount: 0, description: '', department_id: null, project_id: null } },
    actions: [{ key: 'post', label: 'Post', endpointSuffix: 'post', method: 'patch', permission: 'cash_bank.post', visibleStatuses: ['draft'], variant: 'primary' }, { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'cash_bank.void', visibleStatuses: ['posted'], variant: 'danger' }],
  },
  '/cash-bank/bank-transfers': {
    title: 'Bank Transfer',
    endpoint: '/cash-bank/bank-transfers',
    numberKeys: ['transfer_number', 'id'],
    dateKey: 'transfer_date',
    createPermission: 'cash_bank.transfer',
    sections: [{ title: 'Transfer Details', fields: [{ key: 'transfer_date', label: 'Transfer Date', kind: 'date', required: true }, { key: 'from_cash_bank_account_id', label: 'From Account ID', kind: 'number', required: true }, { key: 'to_cash_bank_account_id', label: 'To Account ID', kind: 'number', required: true }, { key: 'amount', label: 'Amount', kind: 'money', required: true }, { key: 'fee_amount', label: 'Fee', kind: 'money' }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    actions: [{ key: 'post', label: 'Post', endpointSuffix: 'post', method: 'patch', permission: 'cash_bank.post', visibleStatuses: ['draft'], variant: 'primary' }, { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'cash_bank.void', visibleStatuses: ['posted'], variant: 'danger' }],
  },
  '/cash-bank/bank-reconciliations': {
    title: 'Bank Reconciliation',
    endpoint: '/cash-bank/bank-reconciliations',
    numberKeys: ['reconciliation_number', 'id'],
    createPermission: 'cash_bank.create',
    editPermission: 'cash_bank.edit',
    sections: [{ title: 'Statement Details', fields: [{ key: 'cash_bank_account_id', label: 'Cash/Bank Account ID', kind: 'number', required: true }, { key: 'statement_start_date', label: 'Statement Start', kind: 'date', required: true }, { key: 'statement_end_date', label: 'Statement End', kind: 'date', required: true }, { key: 'statement_opening_balance', label: 'Opening Balance', kind: 'money' }, { key: 'statement_ending_balance', label: 'Ending Balance', kind: 'money' }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    actions: [{ key: 'refresh-lines', label: 'Refresh Lines', endpointSuffix: 'refresh-lines', method: 'post', permission: 'cash_bank.edit', visibleStatuses: ['draft'], variant: 'secondary' }],
  },
  '/inventory/stock-movements': {
    title: 'Stock Movement',
    endpoint: '/inventory/stock-movements',
    numberKeys: ['movement_number', 'id'],
    dateKey: 'movement_date',
    createPermission: 'inventory.movements.create',
    sections: [{ title: 'Movement Details', fields: [{ key: 'movement_date', label: 'Movement Date', kind: 'date', required: true }, { key: 'movement_type', label: 'Movement Type', required: true }, { key: 'direction', label: 'Direction', kind: 'select', options: [{ label: 'In', value: 'in' }, { label: 'Out', value: 'out' }], required: true }, { key: 'warehouse_id', label: 'Warehouse ID', kind: 'number', required: true }, { key: 'description', label: 'Description', kind: 'textarea' }] }],
    lineItems: { key: 'lines', title: 'Movement Lines', minRows: 1, columns: [{ key: 'product_id', label: 'Product ID', type: 'number' }, { key: 'warehouse_id', label: 'Warehouse ID', type: 'number' }, { key: 'quantity', label: 'Quantity', type: 'number' }, { key: 'unit_cost', label: 'Unit Cost', type: 'money' }, { key: 'department_id', label: 'Dept ID', type: 'number' }, { key: 'project_id', label: 'Project ID', type: 'number' }], defaultRow: { product_id: null, warehouse_id: null, quantity: 1, unit_cost: 0, department_id: null, project_id: null } },
    actions: [{ key: 'post', label: 'Post', endpointSuffix: 'post', method: 'patch', permission: 'inventory.movements.post', visibleStatuses: ['draft'], variant: 'primary' }, { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'inventory.movements.void', visibleStatuses: ['posted'], variant: 'danger' }],
  },
  '/inventory/stock-adjustments': {
    title: 'Stock Adjustment',
    endpoint: '/inventory/stock-adjustments',
    numberKeys: ['adjustment_number', 'id'],
    dateKey: 'adjustment_date',
    createPermission: 'inventory.adjustments.create',
    editPermission: 'inventory.adjustments.edit',
    sections: [{ title: 'Adjustment Details', fields: [{ key: 'adjustment_date', label: 'Adjustment Date', kind: 'date', required: true }, { key: 'warehouse_id', label: 'Warehouse', kind: 'number', required: true }, { key: 'reason', label: 'Reason', kind: 'textarea' }] }],
    lineItems: { key: 'lines', title: 'Adjustment Lines', minRows: 1, columns: [{ key: 'product_id', label: 'Product', type: 'number' }, { key: 'warehouse_id', label: 'Warehouse', type: 'number' }, { key: 'adjustment_type', label: 'Adjustment Type' }, { key: 'quantity', label: 'Quantity', type: 'number' }, { key: 'unit_cost', label: 'Unit Cost', type: 'money' }, { key: 'reason', label: 'Reason' }, { key: 'department_id', label: 'Department', type: 'number' }, { key: 'project_id', label: 'Project', type: 'number' }], defaultRow: { product_id: null, warehouse_id: null, adjustment_type: 'increase', quantity: 1, unit_cost: 0, reason: '', department_id: null, project_id: null } },
    actions: [{ key: 'approve', label: 'Approve', endpointSuffix: 'approve', method: 'patch', permission: 'inventory.adjustments.approve', visibleStatuses: ['draft'], variant: 'secondary' }, { key: 'post', label: 'Post', endpointSuffix: 'post', method: 'patch', permission: 'inventory.adjustments.post', visibleStatuses: ['draft', 'approved'], variant: 'primary' }, { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'inventory.adjustments.void', visibleStatuses: ['posted'], variant: 'danger' }],
  },
  '/inventory/stock-opnames': {
    title: 'Stock Opname',
    endpoint: '/inventory/stock-opnames',
    numberKeys: ['opname_number', 'id'],
    dateKey: 'opname_date',
    createPermission: 'inventory.opname.create',
    editPermission: 'inventory.opname.edit',
    sections: [{ title: 'Opname Details', fields: [{ key: 'opname_date', label: 'Opname Date', kind: 'date', required: true }, { key: 'warehouse_id', label: 'Warehouse ID', kind: 'number', required: true }, { key: 'notes', label: 'Notes', kind: 'textarea' }] }],
    lineItems: { key: 'lines', title: 'Count Lines', minRows: 0, columns: [{ key: 'product_id', label: 'Product ID', type: 'number' }, { key: 'system_quantity', label: 'System Qty', type: 'number' }, { key: 'physical_quantity', label: 'Physical Qty', type: 'number' }, { key: 'difference_quantity', label: 'Difference', type: 'number' }], defaultRow: { product_id: null, system_quantity: 0, physical_quantity: 0, difference_quantity: 0 } },
    actions: [{ key: 'generate-lines', label: 'Generate Lines', endpointSuffix: 'generate-lines', method: 'post', permission: 'inventory.opname.edit', visibleStatuses: ['draft'], variant: 'secondary' }, { key: 'counted', label: 'Mark Counted', endpointSuffix: 'counted', method: 'patch', permission: 'inventory.opname.edit', visibleStatuses: ['draft'], variant: 'secondary' }, { key: 'finalize', label: 'Finalize', endpointSuffix: 'finalize', method: 'patch', permission: 'inventory.opname.finalize', visibleStatuses: ['counted'], variant: 'primary' }, { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'patch', permission: 'inventory.opname.finalize', visibleStatuses: ['finalized'], variant: 'danger' }],
  },
  '/inventory/stock-balances': {
    title: 'Stock Balance',
    endpoint: '/inventory/stock-balances',
    numberKeys: ['product_code', 'id'],
    sections: [],
    actions: [],
    skippedReason: 'Report/list-only endpoint. Backend has no create/update stock balance endpoint.',
  },
  '/cash-bank/accounts': {
    title: 'Cash & Bank Account',
    endpoint: '/cash-bank/accounts',
    numberKeys: ['account_code', 'id'],
    sections: [],
    actions: [],
    skippedReason: 'List-only cash/bank account endpoint; accounts are managed through Chart of Accounts/account mapping.',
  },
}

export const journalFormConfig: ResourceFormConfig = {
  title: 'Journal Entry',
  endpoint: '/journals',
  numberKeys: ['journal_number', 'id'],
  dateKey: 'journal_date',
  createPermission: 'journal.create',
  editPermission: 'journal.edit',
  sections: [
    {
      title: 'Journal Header',
      fields: [
        { key: 'journal_date', label: 'Journal Date', kind: 'date', required: true },
        { key: 'journal_number', label: 'Journal Number', readonly: true, placeholder: 'AUTO' },
        { key: 'reference_number', label: 'Reference' },
        { key: 'memo', label: 'Memo', kind: 'textarea' },
      ],
    },
  ],
  lineItems: {
    key: 'lines',
    title: 'Journal Lines',
    minRows: 2,
    columns: [
      { key: 'account_id', label: 'Account ID', type: 'number' },
      { key: 'description', label: 'Description' },
      { key: 'debit', label: 'Debit', type: 'money' },
      { key: 'credit', label: 'Credit', type: 'money' },
      { key: 'department_id', label: 'Dept ID', type: 'number' },
      { key: 'project_id', label: 'Project ID', type: 'number' },
    ],
    defaultRow: { account_id: null, description: '', debit: 0, credit: 0, department_id: null, project_id: null },
  },
  actions: [
    { key: 'approve', label: 'Approve', endpointSuffix: 'approve', method: 'post', permission: 'journal.approve', visibleStatuses: ['draft'], variant: 'secondary' },
    { key: 'post', label: 'Post', endpointSuffix: 'post', method: 'post', permission: 'journal.post', visibleStatuses: ['approved', 'draft'], variant: 'primary' },
    { key: 'void', label: 'Void', endpointSuffix: 'void', method: 'post', permission: 'journal.void', visibleStatuses: ['posted'], variant: 'danger' },
  ],
}

export function formSchema(config: ResourceFormConfig) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.required) {
        shape[field.key] = z.any().refine((value: unknown) => value !== null && value !== undefined && value !== '', `${field.label} is required`)
      } else {
        shape[field.key] = field.kind === 'number' || field.kind === 'money'
          ? z.coerce.number().nullable().optional()
          : field.kind === 'checkbox'
            ? z.boolean().optional()
            : z.string().nullable().optional()
      }
    }
  }
  if (config.lineItems) {
    shape[config.lineItems.key] = z.array(z.record(z.unknown())).min(config.lineItems.minRows)
  }
  return z.object(shape)
}

export function defaultValues(config: ResourceFormConfig) {
  const values: Record<string, unknown> = {}
  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.kind === 'checkbox') values[field.key] = field.key === 'is_active'
      else if (field.kind === 'number' || field.kind === 'money') values[field.key] = null
      else if (field.key === 'currency_code') values[field.key] = 'IDR'
      else if (field.key === 'exchange_rate') values[field.key] = 1
      else values[field.key] = ''
    }
  }
  if (config.lineItems) {
    values[config.lineItems.key] = Array.from({ length: Math.max(config.lineItems.minRows, 1) }, () => ({ ...config.lineItems?.defaultRow }))
  }
  return values
}
