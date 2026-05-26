import { z } from 'zod'

import { vendorPaymentsService } from '@/services/purchase/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type VendorPaymentValues = {
  payment_number?: string | null
  payment_date: string
  vendor_id: string
  vendor_bill_id: string
  cash_bank_account_id: string
  amount: number
  notes?: string | null
}

export const vendorPaymentFormConfig: TransactionFormConfig<VendorPaymentValues> = {
  moduleKey: 'purchase',
  documentType: 'purchase.payments',
  title: 'Vendor Payment',
  primaryTabId: '/purchase/payments',
  listEndpoint: '/purchase/payments',
  numberField: 'payment_number',
  dateField: 'payment_date',
  partnerType: 'vendor',
  partnerField: 'vendor_id',
  apiService: wrapResourceService('/purchase/payments', vendorPaymentsService),
  permissions: {
    view: 'purchase.payments.view',
    create: 'purchase.payments.create',
    edit: 'purchase.payments.edit',
    post: 'purchase.payments.post',
    void: 'purchase.payments.void',
  },
  actions: [
    { key: 'post', label: 'Post', permission: 'purchase.payments.post', whenStatusIn: ['draft'], variant: 'primary', requiresConfirm: true },
    { key: 'void', label: 'Void', permission: 'purchase.payments.void', whenStatusIn: ['posted'], variant: 'danger', requiresReason: true },
  ],
  hasLines: false,
  validationSchema: z.object({
    payment_date: z.string().min(1),
    vendor_id: z.string().min(1),
    vendor_bill_id: z.string().min(1),
    cash_bank_account_id: z.string().min(1),
    amount: z.coerce.number().gt(0),
  }),
  makeEmptyValues() {
    return {
      payment_number: null,
      payment_date: '',
      vendor_id: '',
      vendor_bill_id: '',
      cash_bank_account_id: '',
      amount: 0,
      notes: '',
    }
  },
}
