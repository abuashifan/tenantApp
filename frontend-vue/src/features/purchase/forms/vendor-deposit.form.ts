import { z } from 'zod'

import { vendorDepositsService } from '@/services/purchase/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type VendorDepositValues = {
  deposit_number?: string | null
  deposit_date: string
  vendor_id: string
  purchase_order_id?: string | null
  cash_bank_account_id: string
  amount: number
  notes?: string | null
}

export const vendorDepositFormConfig: TransactionFormConfig<VendorDepositValues> = {
  moduleKey: 'purchase',
  documentType: 'purchase.vendor-deposits',
  title: 'Vendor Deposit',
  primaryTabId: '/purchase/vendor-deposits',
  listEndpoint: '/purchase/vendor-deposits',
  numberField: 'deposit_number',
  dateField: 'deposit_date',
  partnerType: 'vendor',
  partnerField: 'vendor_id',
  apiService: wrapResourceService('/purchase/vendor-deposits', vendorDepositsService),
  permissions: {
    view: 'purchase.deposits.view',
    create: 'purchase.deposits.create',
    edit: 'purchase.deposits.edit',
    post: 'purchase.deposits.post',
    void: 'purchase.deposits.void',
  },
  actions: [
    { key: 'post', label: 'Post', permission: 'purchase.deposits.post', whenStatusIn: ['draft'], variant: 'primary', requiresConfirm: true },
    { key: 'void', label: 'Void', permission: 'purchase.deposits.void', whenStatusIn: ['draft', 'posted', 'partially_allocated', 'fully_allocated', 'refunded'], variant: 'danger', requiresReason: true },
    { key: 'refund', label: 'Refund', permission: 'purchase.deposits.refund', whenStatusIn: ['posted', 'partially_allocated'] },
  ],
  hasLines: false,
  validationSchema: z.object({
    vendor_id: z.string().min(1),
    deposit_date: z.string().min(1),
    cash_bank_account_id: z.string().min(1),
    amount: z.coerce.number().gt(0),
  }),
  makeEmptyValues() {
    return {
      deposit_number: null,
      deposit_date: '',
      vendor_id: '',
      purchase_order_id: null,
      cash_bank_account_id: '',
      amount: 0,
      notes: '',
    }
  },
}
