import { z } from 'zod'

import { salesInvoicesService } from '@/services/sales/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type SalesInvoiceValues = {
  invoice_number?: string | null
  customer_id: string
  invoice_date: string
  due_date?: string | null
  sales_order_id?: string | null
  delivery_order_id?: string | null
  proforma_invoice_id?: string | null
  applied_down_payment_amount?: number | string | null
  notes?: string | null
  internal_notes?: string | null
  lines: Array<{
    sales_order_line_id?: string | null
    delivery_order_line_id?: string | null
    proforma_invoice_line_id?: string | null
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

export const salesInvoiceFormConfig: TransactionFormConfig<SalesInvoiceValues> = {
  moduleKey: 'sales',
  documentType: 'sales.invoices',
  title: 'Sales Invoice',
  primaryTabId: '/sales/invoices',
  listEndpoint: '/sales/invoices',
  numberField: 'invoice_number',
  dateField: 'invoice_date',
  partnerType: 'customer',
  partnerField: 'customer_id',
  apiService: wrapResourceService('/sales/invoices', salesInvoicesService),
  permissions: {
    view: 'sales.invoices.view',
    create: 'sales.invoices.create',
    edit: 'sales.invoices.edit',
    approve: 'sales.invoices.approve',
    post: 'sales.invoices.post',
    void: 'sales.invoices.void',
  },
  sourceOptions: [
    { key: 'sales-order', label: 'From Sales Order' },
    { key: 'delivery-order', label: 'From Delivery Order' },
  ],
  actions: [{ key: 'save', label: 'Save' }],
  hasLines: true,
  validationSchema: z.object({
    customer_id: z.string().min(1),
    invoice_date: z.string().min(1),
    due_date: z.string().optional().nullable(),
    lines: z.array(z.object({ description: z.string().min(1), quantity: z.coerce.number().gt(0), unit_price: z.coerce.number().min(0) })).min(1),
  }),
  makeEmptyValues() {
    return {
      invoice_number: null,
      customer_id: '',
      invoice_date: '',
      due_date: null,
      sales_order_id: null,
      delivery_order_id: null,
      proforma_invoice_id: null,
      applied_down_payment_amount: 0,
      notes: '',
      internal_notes: '',
      lines: [{ product_id: '', description: '', quantity: 1, unit_price: 0, discount_amount: 0, tax_amount: 0, line_total: 0 }],
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: 0,
    }
  },
}

