import { createResourceService, masterDataActions } from '@/services/resource.service'

export const productCategoriesService = createResourceService({
  endpoint: '/master-data/product-categories',
  actions: masterDataActions,
})
