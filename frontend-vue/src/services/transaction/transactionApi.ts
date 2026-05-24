export function wrapResourceService<T extends Record<string, any>>(endpoint: string, service: T) {
  return {
    endpoint,
    list: service.list.bind(service),
    get: service.get.bind(service),
    create: service.create.bind(service),
    update: service.update.bind(service),
    action: typeof service.action === 'function' ? service.action.bind(service) : undefined,
  }
}

