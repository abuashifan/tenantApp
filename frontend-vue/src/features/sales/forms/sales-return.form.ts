import { z } from 'zod'

import { salesReturnsService } from '@/services/sales/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type SalesReturnValues = {
  return_number?: string | null
  return_date: string
  customer_id: string
  sales_invoice_id?: string | null
  delivery_order_id?: string | null
  reason?: string | null
  notes?: string | null
  lines: Array<{
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

export const salesReturnFormConfig: TransactionFormConfig<SalesReturnValues> = {
  moduleKey: 'sales',
  documentType: 'sales.returns',
  title: 'Sales Return',
  primaryTabId: '/sales/returns',
  listEndpoint: '/sales/returns',
  numberField: 'return_number',
  dateField: 'return_date',
  partnerType: 'customer',
  partnerField: 'customer_id',
  apiService: wrapResourceService('/sales/returns', salesReturnsService),
  permissions: {
    view: 'sales.returns.view',
    create: 'sales.returns.create',
    edit: 'sales.returns.edit',
    approve: 'sales.returns.approve',
    post: 'sales.returns.post',
    void: 'sales.returns.void',
  },
  actions: [{ key: 'save', label: 'Save' }],
  hasLines: true,
  validationSchema: z.object({
    return_date: z.string().min(1),
    customer_id: z.string().min(1),
    lines: z.array(z.object({ description: z.string().min(1), quantity: z.coerce.number().gt(0), unit_price: z.coerce.number().min(0) })).min(1),
  }),
  makeEmptyValues() {
    return {
      return_number: null,
      return_date: '',
      customer_id: '',
      sales_invoice_id: null,
      delivery_order_id: null,
      reason: '',
      notes: '',
      lines: [{ description: '', quantity: 1, unit_price: 0, discount_amount: 0, tax_amount: 0, line_total: 0 }],
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: 0,
    }
  },
}

