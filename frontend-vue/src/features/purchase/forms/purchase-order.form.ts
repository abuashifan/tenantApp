import { z } from 'zod'

import { purchaseOrdersService } from '@/services/purchase/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import { purchaseSourceConversions } from '@/services/transaction/sourceConversions.service'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type PurchaseOrderValues = {
  order_number?: string | null
  vendor_id: string
  order_date: string
  expected_date?: string | null
  purchase_request_id?: string | null
  notes?: string | null
  internal_notes?: string | null
  lines: Array<{
    purchase_request_line_id?: string | null
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

export const purchaseOrderFormConfig: TransactionFormConfig<PurchaseOrderValues> = {
  moduleKey: 'purchase',
  documentType: 'purchase.orders',
  title: 'Purchase Order',
  primaryTabId: '/purchase/orders',
  listEndpoint: '/purchase/orders',
  numberField: 'order_number',
  dateField: 'order_date',
  partnerType: 'vendor',
  partnerField: 'vendor_id',
  apiService: wrapResourceService('/purchase/orders', purchaseOrdersService),
  permissions: {
    view: 'purchase.orders.view',
    create: 'purchase.orders.create',
    edit: 'purchase.orders.edit',
    approve: 'purchase.orders.approve',
    confirm: 'purchase.orders.confirm',
    close: 'purchase.orders.confirm',
    cancel: 'purchase.orders.cancel',
  },
  sourceOptions: [
    { key: 'purchase-request', label: 'Purchase Request', sourceType: 'purchase_request' },
  ],
  actions: [
    { key: 'approve', label: 'Approve', permission: 'purchase.orders.approve', whenStatusIn: ['draft'] },
    { key: 'confirm', label: 'Confirm', permission: 'purchase.orders.confirm', whenStatusIn: ['approved'], variant: 'primary' },
    { key: 'close', label: 'Close', permission: 'purchase.orders.confirm', whenStatusIn: ['confirmed'] },
    { key: 'cancel', label: 'Cancel', permission: 'purchase.orders.cancel', whenStatusIn: ['draft', 'approved', 'confirmed'], variant: 'danger', requiresConfirm: true },
  ],
  conversions: [
    {
      key: 'goods_receipt_from_purchase_order',
      label: 'Convert to Goods Receipt',
      permission: 'purchase.goods_receipts.create',
      whenStatusIn: ['confirmed', 'partially_received'],
      targetPrimaryTabId: '/purchase/goods-receipts',
      targetLabel: 'Goods Receipts',
      targetNumberField: 'receipt_number',
      execute: purchaseSourceConversions.goodsReceiptFromPurchaseOrder,
    },
    {
      key: 'bill_from_purchase_order',
      label: 'Convert to Vendor Bill',
      permission: 'purchase.bills.create',
      whenStatusIn: ['confirmed', 'partially_received', 'received', 'partially_billed'],
      targetPrimaryTabId: '/purchase/bills',
      targetLabel: 'Vendor Bills',
      targetNumberField: 'bill_number',
      execute: purchaseSourceConversions.billFromPurchaseOrder,
    },
  ],
  hasLines: true,
  lineProduct: { priceMode: 'purchase', priceField: 'unit_price' },
  validationSchema: z.object({
    vendor_id: z.string().min(1),
    order_date: z.string().min(1),
    lines: z.array(z.object({ description: z.string().min(1), quantity: z.coerce.number().gt(0), unit_price: z.coerce.number().min(0) })).min(1),
  }),
  makeEmptyValues() {
    return {
      order_number: null,
      vendor_id: '',
      order_date: '',
      expected_date: null,
      purchase_request_id: null,
      notes: '',
      internal_notes: '',
      lines: [{ purchase_request_line_id: null, product_id: '', description: '', quantity: 1, unit_price: 0, discount_amount: 0, tax_amount: 0, line_total: 0 }],
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: 0,
    }
  },
}
