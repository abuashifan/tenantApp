type ResourceService = {
  list(params?: Record<string, unknown>): Promise<unknown>
  get(id: string | number): Promise<unknown>
  create(payload: unknown): Promise<unknown>
  update(id: string | number, payload: unknown): Promise<unknown>
  action?(key: string, id: string | number, payload?: unknown): Promise<unknown>
}

export function wrapResourceService<T extends ResourceService>(endpoint: string, service: T) {
  return {
    endpoint,
    list: service.list.bind(service),
    get: service.get.bind(service),
    create: service.create.bind(service),
    update: service.update.bind(service),
    action: typeof service.action === 'function' ? service.action.bind(service) : undefined,
  }
}
