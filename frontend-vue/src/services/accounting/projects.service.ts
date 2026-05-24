import { createResourceService, masterDataActions } from '@/services/resource.service'

export const projectsService = createResourceService({
  endpoint: '/master-data/projects',
  actions: masterDataActions,
})
