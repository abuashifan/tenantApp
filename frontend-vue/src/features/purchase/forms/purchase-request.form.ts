import { z } from 'zod'

import { purchaseRequestsService } from '@/services/purchase/documents.service'
import { wrapResourceService } from '@/services/transaction/transactionApi'
import { purchaseSourceConversions } from '@/services/transaction/sourceConversions.service'
import type { TransactionFormConfig } from '@/composables/transaction-form/types'

export type PurchaseRequestValues = {
  request_number?: string | null
  request_date: string
  needed_date?: string | null
  notes?: string | null
  internal_notes?: string | null
  lines: Array<{
    product_id?: string | null
    description: string
    quantity: number
    estimated_unit_price?: number
  }>
  subtotal?: number
  discount_amount?: number
  tax_amount?: number
  grand_total?: number
}

export const purchaseRequestFormConfig: TransactionFormConfig<PurchaseRequestValues> = {
  moduleKey: 'purchase',
  documentType: 'purchase.requests',
  title: 'Purchase Request',
  primaryTabId: '/purchase/requests',
  listEndpoint: '/purchase/requests',
  numberField: 'request_number',
  dateField: 'request_date',
  partnerType: 'none',
  apiService: wrapResourceService('/purchase/requests', purchaseRequestsService),
  permissions: {
    view: 'purchase.requests.view',
    create: 'purchase.requests.create',
    edit: 'purchase.requests.edit',
    submit: 'purchase.requests.edit',
    approve: 'purchase.requests.approve',
    reject: 'purchase.requests.cancel',
    cancel: 'purchase.requests.cancel',
  },
  actions: [
    { key: 'submit', label: 'Submit', permission: 'purchase.requests.edit', whenStatusIn: ['draft'], variant: 'primary' },
    { key: 'approve', label: 'Approve', permission: 'purchase.requests.approve', whenStatusIn: ['submitted'], variant: 'primary' },
    { key: 'reject', label: 'Reject', permission: 'purchase.requests.cancel', whenStatusIn: ['submitted'], variant: 'danger', requiresConfirm: true },
    { key: 'cancel', label: 'Cancel', permission: 'purchase.requests.cancel', whenStatusIn: ['draft', 'submitted', 'approved'], variant: 'danger', requiresConfirm: true },
  ],
  conversions: [
    {
      key: 'order_from_request',
      label: 'Convert to Purchase Order',
      permission: 'purchase.orders.convert',
      whenStatusIn: ['approved'],
      targetPrimaryTabId: '/purchase/orders',
      targetLabel: 'Purchase Orders',
      targetNumberField: 'order_number',
      execute: purchaseSourceConversions.orderFromRequest,
      buildPayload() {
        const vendorId = window.prompt('Enter vendor ID for the purchase order')
        return vendorId ? { vendor_id: vendorId } : null
      },
    },
  ],
  hasLines: true,
  lineProduct: { priceMode: 'purchase', priceField: 'estimated_unit_price', priceLabel: 'Estimated Unit Price' },
  validationSchema: z.object({
    request_date: z.string().min(1),
    lines: z.array(z.object({ description: z.string().min(1), quantity: z.coerce.number().gt(0) })).min(1),
  }),
  makeEmptyValues() {
    return {
      request_number: null,
      request_date: '',
      needed_date: null,
      notes: '',
      internal_notes: '',
      lines: [{ product_id: '', description: '', quantity: 1, estimated_unit_price: 0 }],
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      grand_total: 0,
    }
  },
}
