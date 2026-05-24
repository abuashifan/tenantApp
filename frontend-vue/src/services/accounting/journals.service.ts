import { createResourceService } from '@/services/resource.service'

export const journalsService = createResourceService({
  endpoint: '/journals',
  actions: {
    approve: { method: 'post', path: '{id}/approve' },
    post: { method: 'post', path: '{id}/post' },
    void: { method: 'post', path: '{id}/void' },
  },
})
