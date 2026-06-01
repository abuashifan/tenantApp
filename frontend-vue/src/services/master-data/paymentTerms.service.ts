import { createResourceService, masterDataActions } from '@/services/resource.service'

export type PaymentTerm = {
  id: number
  code: string
  name: string
  days: number | null
  is_custom: boolean
  is_active: boolean
  sort_order: number
}

export const paymentTermsService = createResourceService<PaymentTerm[], PaymentTerm>({
  endpoint: '/master-data/payment-terms',
  actions: masterDataActions,
})
