import { z } from 'zod'

import { purchaseReturnsService } from '@/services/purchase/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type PurchaseReturnValues = {
  return_number?: string | null
  return_date: string
  vendor_id: string
  vendor_bill_id?: string | null
  goods_receipt_id?: string | null
  reason?: string | null
  notes?: string | null
  internal_notes?: string | null
  lines: Array<{
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

export const purchaseReturnFormConfig: TransactionFormConfig<PurchaseReturnValues> = {
  moduleKey: 'purchase',
  documentType: 'purchase.returns',
  title: 'Purchase Return',
  primaryTabId: '/purchase/returns',
  listEndpoint: '/purchase/returns',
  numberField: 'return_number',
  dateField: 'return_date',
  partnerType: 'vendor',
  partnerField: 'vendor_id',
  apiService: wrapResourceService('/purchase/returns', purchaseReturnsService),
  permissions: {
    view: 'purchase.returns.view',
    create: 'purchase.returns.create',
    edit: 'purchase.returns.edit',
    approve: 'purchase.returns.approve',
    post: 'purchase.returns.post',
    void: 'purchase.returns.void',
  },
  actions: [
    { key: 'approve', label: 'Approve', permission: 'purchase.returns.approve', whenStatusIn: ['draft'] },
    { key: 'post', label: 'Post', permission: 'purchase.returns.post', whenStatusIn: ['draft', 'approved'], variant: 'primary', requiresConfirm: true },
    { key: 'void', label: 'Void', permission: 'purchase.returns.void', whenStatusIn: ['draft', 'approved', 'posted'], variant: 'danger', requiresReason: true },
  ],
  hasLines: true,
  lineProduct: { priceMode: 'purchase', priceField: 'unit_price' },
  validationSchema: z.object({
    return_date: z.string().min(1),
    vendor_id: z.string().min(1),
    lines: z.array(z.object({ description: z.string().min(1), quantity: z.coerce.number().gt(0) })).min(1),
  }),
  makeEmptyValues() {
    return {
      return_number: null,
      return_date: '',
      vendor_id: '',
      vendor_bill_id: null,
      goods_receipt_id: null,
      reason: '',
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
