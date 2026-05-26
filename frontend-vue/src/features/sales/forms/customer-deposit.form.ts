import { z } from 'zod'

import { customerDepositsService } from '@/services/sales/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type CustomerDepositValues = {
  deposit_number?: string | null
  deposit_date: string
  customer_id: string
  sales_order_id?: string | null
  cash_bank_account_id: string
  amount: number
  notes?: string | null
}

export const customerDepositFormConfig: TransactionFormConfig<CustomerDepositValues> = {
  moduleKey: 'sales',
  documentType: 'sales.customer-deposits',
  title: 'Customer Deposit',
  primaryTabId: '/sales/customer-deposits',
  listEndpoint: '/sales/customer-deposits',
  numberField: 'deposit_number',
  dateField: 'deposit_date',
  partnerType: 'customer',
  partnerField: 'customer_id',
  apiService: wrapResourceService('/sales/customer-deposits', customerDepositsService),
  permissions: {
    view: 'sales.deposits.view',
    create: 'sales.deposits.create',
    edit: 'sales.deposits.edit',
    post: 'sales.deposits.post',
    void: 'sales.deposits.void',
  },
  actions: [
    { key: 'post', label: 'Post', permission: 'sales.deposits.post', whenStatusIn: ['draft'], variant: 'primary', requiresConfirm: true },
    { key: 'void', label: 'Void', permission: 'sales.deposits.void', whenStatusIn: ['draft', 'posted', 'partially_allocated', 'fully_allocated', 'refunded'], variant: 'danger', requiresReason: true },
    { key: 'refund', label: 'Refund', permission: 'sales.deposits.refund', whenStatusIn: ['posted', 'partially_allocated'] },
  ],
  hasLines: false,
  validationSchema: z.object({
    customer_id: z.string().min(1),
    deposit_date: z.string().min(1),
    cash_bank_account_id: z.string().min(1),
    amount: z.coerce.number().gt(0),
  }),
  makeEmptyValues() {
    return {
      deposit_number: null,
      deposit_date: '',
      customer_id: '',
      sales_order_id: null,
      cash_bank_account_id: '',
      amount: 0,
      notes: '',
    }
  },
}
