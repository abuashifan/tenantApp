import { createResourceService, masterDataActions } from '@/services/resource.service'

export const departmentsService = createResourceService({
  endpoint: '/master-data/departments',
  actions: masterDataActions,
})
