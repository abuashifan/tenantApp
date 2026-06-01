import { z } from 'zod'

import { vendorBillsService } from '@/services/purchase/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type VendorBillValues = {
  bill_number?: string | null
  vendor_id: string
  bill_date: string
  payment_term_id?: string | number | null
  due_date?: string | null
  purchase_order_id?: string | null
  goods_receipt_id?: string | null
  vendor_invoice_number?: string | null
  applied_vendor_deposit_amount?: number | string | null
  notes?: string | null
  internal_notes?: string | null
  lines: Array<{
    purchase_order_line_id?: string | null
    goods_receipt_line_id?: string | null
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

export const vendorBillFormConfig: TransactionFormConfig<VendorBillValues> = {
  moduleKey: 'purchase',
  documentType: 'purchase.bills',
  title: 'Vendor Bill',
  primaryTabId: '/purchase/bills',
  listEndpoint: '/purchase/bills',
  numberField: 'bill_number',
  dateField: 'bill_date',
  partnerType: 'vendor',
  partnerField: 'vendor_id',
  apiService: wrapResourceService('/purchase/bills', vendorBillsService),
  permissions: {
    view: 'purchase.bills.view',
    create: 'purchase.bills.create',
    edit: 'purchase.bills.edit',
    approve: 'purchase.bills.approve',
    post: 'purchase.bills.post',
    void: 'purchase.bills.void',
  },
  sourceOptions: [
    { key: 'goods-receipt', label: 'Goods Receipt', sourceType: 'goods_receipt' },
  ],
  actions: [
    { key: 'approve', label: 'Approve', permission: 'purchase.bills.approve', whenStatusIn: ['draft'] },
    { key: 'post', label: 'Post', permission: 'purchase.bills.post', whenStatusIn: ['draft', 'approved'], variant: 'primary', requiresConfirm: true },
    { key: 'void', label: 'Void', permission: 'purchase.bills.void', whenStatusIn: ['draft', 'approved', 'posted', 'partially_paid', 'paid'], variant: 'danger', requiresReason: true },
  ],
  hasLines: true,
  lineProduct: { priceMode: 'purchase', priceField: 'unit_price' },
  validationSchema: z.object({
    vendor_id: z.string().min(1),
    bill_date: z.string().min(1),
    payment_term_id: z.union([z.string(), z.number()]).optional().nullable(),
    due_date: z.string().optional().nullable(),
    lines: z.array(z.object({ description: z.string().min(1), quantity: z.coerce.number().gt(0), unit_price: z.coerce.number().min(0) })).min(1),
  }),
  makeEmptyValues() {
    return {
      bill_number: null,
      vendor_id: '',
      bill_date: '',
      payment_term_id: null,
      due_date: null,
      purchase_order_id: null,
      goods_receipt_id: null,
      vendor_invoice_number: '',
      applied_vendor_deposit_amount: 0,
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
