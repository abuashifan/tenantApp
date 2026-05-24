import { createResourceService, masterDataActions } from '@/services/resource.service'

export const chartOfAccountsService = createResourceService({
  endpoint: '/master-data/chart-of-accounts',
  actions: masterDataActions,
})
