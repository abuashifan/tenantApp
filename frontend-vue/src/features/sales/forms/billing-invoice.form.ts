import { z } from 'zod'

import { createResourceService } from '@/services/resource.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

// Billing invoices are not yet exposed in src/services/sales/documents.service.ts
const billingInvoicesService = createResourceService({
  endpoint: '/sales/billings',
  actions: {
    issue: { method: 'patch', path: '{id}/issue' },
    cancel: { method: 'patch', path: '{id}/cancel' },
  },
})

export type BillingInvoiceValues = {
  billing_number?: string | null
  billing_date: string
  due_date?: string | null
  customer_id: string
  sales_invoice_id?: string | null
  notes?: string | null
  internal_notes?: string | null
  lines: Array<{ product_id?: string | null; product_code?: string | null; description: string; amount: number; line_total?: number }>
  subtotal?: number
  discount_amount?: number
  tax_amount?: number
  grand_total?: number
}

export const billingInvoiceFormConfig: TransactionFormConfig<BillingInvoiceValues> = {
  moduleKey: 'sales',
  documentType: 'sales.billings',
  title: 'Billing Invoice',
  primaryTabId: '/sales/billings',
  listEndpoint: '/sales/billings',
  numberField: 'billing_number',
  dateField: 'billing_date',
  partnerType: 'customer',
  partnerField: 'customer_id',
  apiService: wrapResourceService('/sales/billings', billingInvoicesService),
  permissions: {
    view: 'sales.billings.view',
    create: 'sales.billings.create',
    edit: 'sales.billings.edit',
  },
  actions: [{ key: 'save', label: 'Save' }],
  hasLines: true,
  lineProduct: { priceMode: 'sales', priceField: 'amount', priceLabel: 'Amount' },
  validationSchema: z.object({
    customer_id: z.string().min(1),
    billing_date: z.string().min(1),
    lines: z.array(z.object({ description: z.string().min(1), amount: z.coerce.number().gt(0) })).min(1),
  }),
  makeEmptyValues() {
    return {
      billing_number: null,
      billing_date: '',
      due_date: null,
      customer_id: '',
      sales_invoice_id: null,
      notes: '',
      internal_notes: '',
      lines: [{ product_id: '', product_code: '', description: '', amount: 0, line_total: 0 }],
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: 0,
    }
  },
}
