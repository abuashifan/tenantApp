import { createResourceService, masterDataActions } from '@/services/resource.service'

export const warehousesService = createResourceService({
  endpoint: '/master-data/warehouses',
  actions: masterDataActions,
})
