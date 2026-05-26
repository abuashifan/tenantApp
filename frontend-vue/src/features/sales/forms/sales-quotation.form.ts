import { z } from 'zod'

import { salesQuotationsService } from '@/services/sales/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type SalesQuotationValues = {
  quotation_number?: string | null
  customer_id: string
  quotation_date: string
  valid_until?: string | null
  notes?: string | null
  internal_notes?: string | null
  lines: Array<{
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

export const salesQuotationFormConfig: TransactionFormConfig<SalesQuotationValues> = {
  moduleKey: 'sales',
  documentType: 'sales.quotations',
  title: 'Sales Quotation',
  primaryTabId: '/sales/quotations',
  listEndpoint: '/sales/quotations',
  numberField: 'quotation_number',
  dateField: 'quotation_date',
  partnerType: 'customer',
  partnerField: 'customer_id',
  apiService: wrapResourceService('/sales/quotations', salesQuotationsService),
  permissions: {
    view: 'sales.quotations.view',
    create: 'sales.quotations.create',
    edit: 'sales.quotations.edit',
    approve: 'sales.quotations.approve',
    cancel: 'sales.quotations.cancel',
  },
  actions: [
    { key: 'send', label: 'Send', permission: 'sales.quotations.edit', whenStatusIn: ['draft'] },
    { key: 'approve', label: 'Approve', permission: 'sales.quotations.approve', whenStatusIn: ['draft', 'sent'], variant: 'primary' },
    { key: 'accept', label: 'Accept', permission: 'sales.quotations.approve', whenStatusIn: ['sent', 'approved'], variant: 'primary' },
    { key: 'reject', label: 'Reject', permission: 'sales.quotations.cancel', whenStatusIn: ['sent', 'approved'], variant: 'danger', requiresConfirm: true },
    { key: 'cancel', label: 'Cancel', permission: 'sales.quotations.cancel', whenStatusIn: ['draft', 'sent', 'approved'], variant: 'danger', requiresConfirm: true },
  ],
  hasLines: true,
  lineProduct: { priceMode: 'sales', priceField: 'unit_price' },
  validationSchema: z.object({
    customer_id: z.string().min(1, 'Customer is required'),
    quotation_date: z.string().min(1, 'Date is required'),
    lines: z
      .array(
        z.object({
          description: z.string().min(1, 'Description is required'),
          quantity: z.coerce.number().gt(0, 'Quantity must be > 0'),
          unit_price: z.coerce.number().min(0, 'Unit price must be >= 0'),
          discount_amount: z.coerce.number().min(0).optional().default(0),
          tax_amount: z.coerce.number().min(0).optional().default(0),
          line_total: z.coerce.number().min(0).optional().default(0),
        }),
      )
      .min(1, 'At least one line is required'),
  }),
  makeEmptyValues() {
    return {
      quotation_number: null,
      customer_id: '',
      quotation_date: '',
      valid_until: null,
      notes: '',
      internal_notes: '',
      lines: [
        {
          product_id: '',
          description: '',
          quantity: 1,
          unit_price: 0,
          discount_amount: 0,
          tax_amount: 0,
          line_total: 0,
        },
      ],
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: 0,
    }
  },
}
