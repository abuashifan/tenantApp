import { createResourceService, masterDataActions } from '@/services/resource.service'

export const productsService = createResourceService({
  endpoint: '/master-data/products',
  actions: masterDataActions,
})
