import type { ApiError, ValidationErrors } from '@/types/api'
import type { FormContext } from 'vee-validate'

function normalizePath(path: string) {
  // Laravel often returns dot paths; vee-validate understands dot paths as well.
  return path
}

export function applyLaravelValidationErrors(form: FormContext, errors: ValidationErrors | undefined) {
  if (!errors) return
  for (const [path, messages] of Object.entries(errors)) {
    form.setFieldError(normalizePath(path), messages?.[0] ?? 'Invalid value')
  }
}

export function toErrorMessage(cause: unknown) {
  if (!cause) return 'Request failed.'
  if (typeof cause === 'string') return cause
  const api = cause as ApiError
  if (typeof api.message === 'string') return api.message
  return 'Request failed.'
}

