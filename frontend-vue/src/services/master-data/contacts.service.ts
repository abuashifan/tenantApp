import { createResourceService, masterDataActions } from '@/services/resource.service'

export const contactsService = createResourceService({
  endpoint: '/master-data/contacts',
  actions: masterDataActions,
})
