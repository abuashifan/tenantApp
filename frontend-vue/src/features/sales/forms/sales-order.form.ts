import { z } from 'zod'

import { salesOrdersService } from '@/services/sales/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type SalesOrderValues = {
  order_number?: string | null
  customer_id: string
  order_date: string
  quotation_id?: string | null
  shipping_address?: string | null
  notes?: string | null
  internal_notes?: string | null
  lines: Array<{
    quotation_line_id?: string | null
    product_id?: string | null
    description: string
    quantity: number
    unit_price: number
    discount_amount?: number
    tax_amount?: number
    line_total?: number
  }>
  subtotal?: number
  discount_amount?: number
  tax_amount?: number
  grand_total?: number
}

export const salesOrderFormConfig: TransactionFormConfig<SalesOrderValues> = {
  moduleKey: 'sales',
  documentType: 'sales.orders',
  title: 'Sales Order',
  primaryTabId: '/sales/orders',
  listEndpoint: '/sales/orders',
  numberField: 'order_number',
  dateField: 'order_date',
  partnerType: 'customer',
  partnerField: 'customer_id',
  apiService: wrapResourceService('/sales/orders', salesOrdersService),
  permissions: {
    view: 'sales.orders.view',
    create: 'sales.orders.create',
    edit: 'sales.orders.edit',
    approve: 'sales.orders.approve',
    confirm: 'sales.orders.confirm',
    cancel: 'sales.orders.cancel',
    close: 'sales.orders.confirm',
  },
  actions: [
    { key: 'approve', label: 'Approve', permission: 'sales.orders.approve', whenStatusIn: ['draft'], variant: 'primary' },
    { key: 'confirm', label: 'Confirm', permission: 'sales.orders.confirm', whenStatusIn: ['approved'], variant: 'primary' },
    { key: 'close', label: 'Close', permission: 'sales.orders.confirm', whenStatusIn: ['confirmed'] },
    { key: 'cancel', label: 'Cancel', permission: 'sales.orders.cancel', whenStatusIn: ['draft', 'approved', 'confirmed'], variant: 'danger', requiresConfirm: true },
  ],
  hasLines: true,
  lineProduct: { priceMode: 'sales', priceField: 'unit_price' },
  validationSchema: z.object({
    customer_id: z.string().min(1),
    order_date: z.string().min(1),
    lines: z
      .array(
        z.object({
          description: z.string().min(1),
          quantity: z.coerce.number().gt(0),
          unit_price: z.coerce.number().min(0),
          discount_amount: z.coerce.number().min(0).optional().default(0),
          tax_amount: z.coerce.number().min(0).optional().default(0),
          line_total: z.coerce.number().min(0).optional().default(0),
        }),
      )
      .min(1),
  }),
  makeEmptyValues() {
    return {
      order_number: null,
      customer_id: '',
      order_date: '',
      quotation_id: null,
      shipping_address: '',
      notes: '',
      internal_notes: '',
      lines: [
        { quotation_line_id: null, product_id: '', description: '', quantity: 1, unit_price: 0, discount_amount: 0, tax_amount: 0, line_total: 0 },
      ],
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: 0,
    }
  },
}
