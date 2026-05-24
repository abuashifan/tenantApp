import { createResourceService, postVoidActions } from '@/services/resource.service'

export const salesQuotationsService = createResourceService({
  endpoint: '/sales/quotations',
  actions: {
    send: { method: 'patch', path: '{id}/send' },
    approve: { method: 'patch', path: '{id}/approve' },
    accept: { method: 'patch', path: '{id}/accept' },
    reject: { method: 'patch', path: '{id}/reject' },
    cancel: { method: 'patch', path: '{id}/cancel' },
  },
})

export const salesOrdersService = createResourceService({
  endpoint: '/sales/orders',
  actions: {
    approve: { method: 'patch', path: '{id}/approve' },
    confirm: { method: 'patch', path: '{id}/confirm' },
    cancel: { method: 'patch', path: '{id}/cancel' },
    close: { method: 'patch', path: '{id}/close' },
  },
})

export const deliveryOrdersService = createResourceService({
  endpoint: '/sales/delivery-orders',
  actions: {
    ready: { method: 'patch', path: '{id}/ready' },
    ship: { method: 'patch', path: '{id}/ship' },
    deliver: { method: 'patch', path: '{id}/deliver' },
    cancel: { method: 'patch', path: '{id}/cancel' },
    void: { method: 'patch', path: '{id}/void' },
  },
})

export const proformaInvoicesService = createResourceService({
  endpoint: '/sales/proformas',
  actions: {
    issue: { method: 'patch', path: '{id}/issue' },
    accept: { method: 'patch', path: '{id}/accept' },
    cancel: { method: 'patch', path: '{id}/cancel' },
  },
})

export const salesInvoicesService = createResourceService({
  endpoint: '/sales/invoices',
  actions: {
    approve: { method: 'patch', path: '{id}/approve' },
    ...postVoidActions,
  },
})

export const salesReceiptsService = createResourceService({
  endpoint: '/sales/receipts',
  actions: postVoidActions,
})

export const customerDepositsService = createResourceService({
  endpoint: '/sales/customer-deposits',
  actions: {
    ...postVoidActions,
    refund: { method: 'patch', path: '{id}/refund' },
  },
})

export const salesReturnsService = createResourceService({
  endpoint: '/sales/returns',
  actions: {
    approve: { method: 'patch', path: '{id}/approve' },
    ...postVoidActions,
  },
})
