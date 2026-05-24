import { z } from 'zod'

import { deliveryOrdersService } from '@/services/sales/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type DeliveryOrderValues = {
  delivery_order_number?: string | null
  customer_id: string
  delivery_date: string
  sales_order_id?: string | null
  warehouse_id?: string | null
  shipping_address?: string | null
  notes?: string | null
  internal_notes?: string | null
  lines: Array<{
    sales_order_line_id?: string | null
    product_id?: string | null
    description: string
    quantity: number
    unit_price?: number
    discount_amount?: number
    tax_amount?: number
    line_total?: number
  }>
  subtotal?: number
  discount_amount?: number
  tax_amount?: number
  grand_total?: number
}

export const deliveryOrderFormConfig: TransactionFormConfig<DeliveryOrderValues> = {
  moduleKey: 'sales',
  documentType: 'sales.delivery-orders',
  title: 'Delivery Order',
  primaryTabId: '/sales/delivery-orders',
  listEndpoint: '/sales/delivery-orders',
  numberField: 'delivery_order_number',
  dateField: 'delivery_date',
  partnerType: 'customer',
  partnerField: 'customer_id',
  apiService: wrapResourceService('/sales/delivery-orders', deliveryOrdersService),
  permissions: {
    view: 'sales.delivery_orders.view',
    create: 'sales.delivery_orders.create',
    edit: 'sales.delivery_orders.edit',
  },
  actions: [{ key: 'save', label: 'Save' }],
  hasLines: true,
  validationSchema: z.object({
    customer_id: z.string().min(1),
    delivery_date: z.string().min(1),
    lines: z
      .array(
        z.object({
          description: z.string().min(1),
          quantity: z.coerce.number().gt(0),
        }),
      )
      .min(1),
  }),
  makeEmptyValues() {
    return {
      delivery_order_number: null,
      customer_id: '',
      delivery_date: '',
      sales_order_id: null,
      warehouse_id: null,
      shipping_address: '',
      notes: '',
      internal_notes: '',
      lines: [{ sales_order_line_id: null, product_id: '', description: '', quantity: 1, unit_price: 0, discount_amount: 0, tax_amount: 0, line_total: 0 }],
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: 0,
    }
  },
}

