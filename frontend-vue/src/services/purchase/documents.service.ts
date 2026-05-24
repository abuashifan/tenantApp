import { createResourceService, postVoidActions } from '@/services/resource.service'

export const purchaseRequestsService = createResourceService({
  endpoint: '/purchase/requests',
  actions: {
    submit: { method: 'patch', path: '{id}/submit' },
    approve: { method: 'patch', path: '{id}/approve' },
    reject: { method: 'patch', path: '{id}/reject' },
    cancel: { method: 'patch', path: '{id}/cancel' },
  },
})

export const purchaseOrdersService = createResourceService({
  endpoint: '/purchase/orders',
  actions: {
    approve: { method: 'patch', path: '{id}/approve' },
    confirm: { method: 'patch', path: '{id}/confirm' },
    cancel: { method: 'patch', path: '{id}/cancel' },
    close: { method: 'patch', path: '{id}/close' },
  },
})

export const goodsReceiptsService = createResourceService({
  endpoint: '/purchase/goods-receipts',
  actions: {
    receive: { method: 'patch', path: '{id}/receive' },
    cancel: { method: 'patch', path: '{id}/cancel' },
    void: { method: 'patch', path: '{id}/void' },
  },
})

export const vendorBillsService = createResourceService({
  endpoint: '/purchase/bills',
  actions: {
    approve: { method: 'patch', path: '{id}/approve' },
    ...postVoidActions,
  },
})

export const vendorPaymentsService = createResourceService({
  endpoint: '/purchase/payments',
  actions: postVoidActions,
})

export const vendorDepositsService = createResourceService({
  endpoint: '/purchase/vendor-deposits',
  actions: {
    ...postVoidActions,
    refund: { method: 'patch', path: '{id}/refund' },
  },
})

export const purchaseReturnsService = createResourceService({
  endpoint: '/purchase/returns',
  actions: {
    approve: { method: 'patch', path: '{id}/approve' },
    ...postVoidActions,
  },
})
