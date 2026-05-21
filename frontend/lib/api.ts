const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string;
  companyId?: string | number;
  body?: unknown;
};

export class ApiRequestError extends Error {
  status: number;
  errors?: unknown;
  code?: string;

  constructor(message: string, status: number, errors?: unknown, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function getStoredCompanyId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('active_company_id');
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const token = options.token ?? getStoredToken() ?? undefined;
  const companyId = options.companyId ?? getStoredCompanyId() ?? undefined;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (companyId) {
    headers['X-Company-ID'] = String(companyId);
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.message === 'string' ? data.message : 'API request failed';
    throw new ApiRequestError(message, response.status, data?.errors, data?.code);
  }

  return data as T;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    const details = flattenApiErrors(error.errors);
    return details.length > 0 ? `${error.message} ${details.join(' ')}` : error.message;
  }

  return error instanceof Error ? error.message : 'Unexpected error occurred';
}

function flattenApiErrors(errors: unknown): string[] {
  if (!errors) return [];

  if (Array.isArray(errors)) {
    return errors.flatMap((item) =>
      typeof item === 'string' ? [item] : flattenApiErrors(item),
    );
  }

  if (typeof errors === 'object') {
    return Object.entries(errors as Record<string, unknown>).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((item) => `${key}: ${String(item)}`);
      }

      if (typeof value === 'string') {
        return [`${key}: ${value}`];
      }

      return flattenApiErrors(value);
    });
  }

  return [String(errors)];
}
