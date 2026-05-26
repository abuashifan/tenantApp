import { z } from 'zod'

import { salesReceiptsService } from '@/services/sales/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type SalesReceiptValues = {
  receipt_number?: string | null
  receipt_date: string
  customer_id: string
  sales_invoice_id?: string | null
  billing_invoice_id?: string | null
  cash_bank_account_id: string
  amount: number
  notes?: string | null
}

export const salesReceiptFormConfig: TransactionFormConfig<SalesReceiptValues> = {
  moduleKey: 'sales',
  documentType: 'sales.receipts',
  title: 'Sales Receipt',
  primaryTabId: '/sales/receipts',
  listEndpoint: '/sales/receipts',
  numberField: 'receipt_number',
  dateField: 'receipt_date',
  partnerType: 'customer',
  partnerField: 'customer_id',
  apiService: wrapResourceService('/sales/receipts', salesReceiptsService),
  permissions: {
    view: 'sales.receipts.view',
    create: 'sales.receipts.create',
    edit: 'sales.receipts.edit',
    post: 'sales.receipts.post',
    void: 'sales.receipts.void',
  },
  actions: [
    { key: 'post', label: 'Post', permission: 'sales.receipts.post', whenStatusIn: ['draft'], variant: 'primary', requiresConfirm: true },
    { key: 'void', label: 'Void', permission: 'sales.receipts.void', whenStatusIn: ['posted'], variant: 'danger', requiresReason: true },
  ],
  hasLines: false,
  validationSchema: z.object({
    receipt_date: z.string().min(1),
    customer_id: z.string().min(1),
    cash_bank_account_id: z.string().min(1),
    amount: z.coerce.number().gt(0),
  }),
  makeEmptyValues() {
    return {
      receipt_number: null,
      receipt_date: '',
      customer_id: '',
      sales_invoice_id: null,
      billing_invoice_id: null,
      cash_bank_account_id: '',
      amount: 0,
      notes: '',
    }
  },
}
