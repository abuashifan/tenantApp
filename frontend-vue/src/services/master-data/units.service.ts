import { createResourceService, masterDataActions } from '@/services/resource.service'

export const unitsService = createResourceService({
  endpoint: '/master-data/units',
  actions: masterDataActions,
})
