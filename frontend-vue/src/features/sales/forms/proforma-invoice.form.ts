import { z } from 'zod'

import { proformaInvoicesService } from '@/services/sales/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import { salesSourceConversions } from '@/services/transaction/sourceConversions.service'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type ProformaInvoiceValues = {
  proforma_number?: string | null
  customer_id: string
  proforma_date: string
  sales_order_id?: string | null
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

export const proformaInvoiceFormConfig: TransactionFormConfig<ProformaInvoiceValues> = {
  moduleKey: 'sales',
  documentType: 'sales.proformas',
  title: 'Proforma Invoice',
  primaryTabId: '/sales/proformas',
  listEndpoint: '/sales/proformas',
  numberField: 'proforma_number',
  dateField: 'proforma_date',
  partnerType: 'customer',
  partnerField: 'customer_id',
  apiService: wrapResourceService('/sales/proformas', proformaInvoicesService),
  permissions: {
    view: 'sales.proformas.view',
    create: 'sales.proformas.create',
    edit: 'sales.proformas.edit',
    issue: 'sales.proformas.issue',
    accept: 'sales.proformas.issue',
    cancel: 'sales.proformas.cancel',
  },
  sourceOptions: [
    { key: 'sales-order', label: 'Sales Order', sourceType: 'sales_order' },
  ],
  actions: [
    { key: 'issue', label: 'Issue', permission: 'sales.proformas.issue', whenStatusIn: ['draft'], variant: 'primary' },
    { key: 'accept', label: 'Accept', permission: 'sales.proformas.issue', whenStatusIn: ['issued'], variant: 'primary' },
    { key: 'cancel', label: 'Cancel', permission: 'sales.proformas.cancel', whenStatusIn: ['draft', 'issued'], variant: 'danger', requiresConfirm: true },
  ],
  conversions: [
    {
      key: 'invoice_from_proforma',
      label: 'Convert to Sales Invoice',
      permission: 'sales.invoices.create',
      whenStatusIn: ['accepted', 'issued'],
      targetPrimaryTabId: '/sales/invoices',
      targetLabel: 'Sales Invoices',
      targetNumberField: 'invoice_number',
      execute: salesSourceConversions.invoiceFromProforma,
    },
  ],
  hasLines: true,
  lineProduct: { priceMode: 'sales', priceField: 'unit_price' },
  validationSchema: z.object({
    customer_id: z.string().min(1),
    proforma_date: z.string().min(1),
    lines: z.array(z.object({ description: z.string().min(1), quantity: z.coerce.number().gt(0), unit_price: z.coerce.number().min(0) })).min(1),
  }),
  makeEmptyValues() {
    return {
      proforma_number: null,
      customer_id: '',
      proforma_date: '',
      sales_order_id: null,
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
