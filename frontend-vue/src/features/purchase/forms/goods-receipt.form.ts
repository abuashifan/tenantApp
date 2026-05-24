import { z } from 'zod'

import { goodsReceiptsService } from '@/services/purchase/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type GoodsReceiptValues = {
  receipt_number?: string | null
  receipt_date: string
  vendor_id?: string | null
  purchase_order_id?: string | null
  warehouse_id?: string | null
  notes?: string | null
  internal_notes?: string | null
  lines: Array<{
    purchase_order_line_id?: string | null
    product_id?: string | null
    description: string
    quantity: number
  }>
}

export const goodsReceiptFormConfig: TransactionFormConfig<GoodsReceiptValues> = {
  moduleKey: 'purchase',
  documentType: 'purchase.goods-receipts',
  title: 'Goods Receipt',
  primaryTabId: '/purchase/goods-receipts',
  listEndpoint: '/purchase/goods-receipts',
  numberField: 'receipt_number',
  dateField: 'receipt_date',
  partnerType: 'vendor',
  partnerField: 'vendor_id',
  apiService: wrapResourceService('/purchase/goods-receipts', goodsReceiptsService),
  permissions: {
    view: 'purchase.goods_receipts.view',
    create: 'purchase.goods_receipts.create',
    edit: 'purchase.goods_receipts.edit',
  },
  actions: [{ key: 'save', label: 'Save' }],
  hasLines: true,
  validationSchema: z.object({
    receipt_date: z.string().min(1),
    vendor_id: z.string().min(1).optional().nullable(),
    lines: z.array(z.object({ description: z.string().min(1), quantity: z.coerce.number().gt(0) })).min(1),
  }),
  makeEmptyValues() {
    return {
      receipt_number: null,
      receipt_date: '',
      vendor_id: '',
      purchase_order_id: null,
      warehouse_id: null,
      notes: '',
      internal_notes: '',
      lines: [{ purchase_order_line_id: null, product_id: '', description: '', quantity: 1 }],
    }
  },
}

