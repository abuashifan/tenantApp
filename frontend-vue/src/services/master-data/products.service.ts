import { createResourceService, masterDataActions } from '@/services/resource.service'
import type { ApiListParams } from '@/types/api'

export const productsService = createResourceService({
  endpoint: '/master-data/products',
  actions: masterDataActions,
})

export function listProducts(params?: ApiListParams) {
  return productsService.list(params)
}
