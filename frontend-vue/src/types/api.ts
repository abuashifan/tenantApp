export type ApiListParams = Record<string, unknown>

export type ApiListPayload<T> = T[] | { data?: T[]; items?: T[] }
