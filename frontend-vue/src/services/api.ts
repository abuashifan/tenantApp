import axios, { AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'
import type { ApiError, ValidationErrors } from '@/types/api'

const PUBLIC_API_ENDPOINTS = new Set([
  '/auth/login',
  '/api/auth/login',
  '/auth/register',
  '/api/auth/register',
  '/health',
  '/api/health',
])

function safeJson<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return value as T
  }
}

function authToken() {
  try {
    const auth = useAuthStore()
    return auth.token || localStorage.getItem('ta_token') || localStorage.getItem('auth_token') || ''
  } catch {
    return localStorage.getItem('ta_token') || localStorage.getItem('auth_token') || ''
  }
}

function activeCompanyId() {
  try {
    const company = useCompanyStore()
    return (
      company.activeCompanyId ??
      safeJson<string | number>(
        localStorage.getItem('ta_active_company_id') ?? localStorage.getItem('active_company_id'),
      )
    )
  } catch {
    return safeJson<string | number>(
      localStorage.getItem('ta_active_company_id') ?? localStorage.getItem('active_company_id'),
    )
  }
}

function normalizeValidationErrors(errors: unknown): ValidationErrors | undefined {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return undefined
  const normalized: ValidationErrors = {}
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    normalized[key] = Array.isArray(value)
      ? value.map((item) => sanitizeErrorMessage(String(item), undefined, key))
      : [sanitizeErrorMessage(String(value), undefined, key)]
  }
  return normalized
}

const FIELD_LABELS: Record<string, string> = {
  code: 'Code',
  name: 'Name',
  precision: 'Precision',
  contact_code: 'Contact Code',
  contact_type: 'Type',
  type: 'Type',
  account_code: 'Account Code',
  account_name: 'Account Name',
  account_type: 'Account Type',
  normal_balance: 'Normal Balance',
  product_code: 'Product Code',
  product_name: 'Product Name',
  product_id: 'Product',
  product_type: 'Product Type',
  product_category_id: 'Category',
  category_id: 'Category',
  unit_id: 'Unit',
  warehouse_id: 'Warehouse',
  department_id: 'Department',
  project_id: 'Project',
  customer_id: 'Customer',
  vendor_id: 'Vendor',
  cash_bank_account_id: 'Cash/Bank Account',
  from_cash_bank_account_id: 'From Account',
  to_cash_bank_account_id: 'To Account',
  sales_invoice_id: 'Sales Invoice',
  vendor_bill_id: 'Vendor Bill',
  email: 'Email',
  phone: 'Phone',
  transaction_date: 'Date',
  document_date: 'Document Date',
  journal_date: 'Journal Date',
  quotation_date: 'Quotation Date',
  order_date: 'Order Date',
  delivery_date: 'Delivery Date',
  proforma_date: 'Proforma Date',
  invoice_date: 'Invoice Date',
  billing_date: 'Billing Date',
  return_date: 'Return Date',
  request_date: 'Request Date',
  receipt_date: 'Receipt Date',
  payment_date: 'Payment Date',
  deposit_date: 'Deposit Date',
  bill_date: 'Bill Date',
  transfer_date: 'Transfer Date',
  movement_date: 'Movement Date',
  adjustment_date: 'Adjustment Date',
  adjustment_type: 'Adjustment Type',
  opname_date: 'Opname Date',
  statement_start_date: 'Statement Start',
  statement_end_date: 'Statement End',
  lines: 'Details',
  account_id: 'Account',
  quantity: 'Quantity',
  unit_price: 'Unit Price',
  amount: 'Amount',
  description: 'Description',
}

const DUPLICATE_ERROR_FIELDS: Record<string, string> = {
  DUPLICATE_UNIT_CODE: 'code',
  DUPLICATE_DEPARTMENT_CODE: 'code',
  DUPLICATE_PROJECT_CODE: 'code',
  DUPLICATE_WAREHOUSE_CODE: 'code',
  DUPLICATE_ACCOUNT_CODE: 'account_code',
  DUPLICATE_CONTACT_CODE: 'contact_code',
  DUPLICATE_PRODUCT_CODE: 'product_code',
  ACTIVE_INVITATION_EXISTS: 'email',
}

const TECHNICAL_ERROR_PATTERNS = [
  /SQLSTATE/i,
  /Integrity constraint violation/i,
  /NOT NULL constraint failed/i,
  /UNIQUE constraint failed/i,
  /Connection:\s*\w+/i,
  /SQL:\s*/i,
  /\bPDOException\b/i,
  /\bQueryException\b/i,
  /\/[^ ]+\.php\b/i,
  /database\/[^ ]+/i,
]

function fieldLabel(field: string | undefined) {
  if (!field) return 'Data'
  const normalized = field
    .replace(/\.\d+\./g, '.')
    .replace(/\.\*\./g, '.')
    .split('.')
    .pop() ?? field
  return FIELD_LABELS[normalized] ?? normalized
    .replace(/_id$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function containsTechnicalDetails(message: string) {
  return TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(message))
}

function detectConstraintError(message: string): { type: 'required' | 'unique'; field?: string } | null {
  const notNull = message.match(/NOT NULL constraint failed:\s*([a-z0-9_]+)\.([a-z0-9_]+)/i)
  if (notNull?.[2]) return { type: 'required', field: notNull[2] }

  const unique = message.match(/UNIQUE constraint failed:\s*([a-z0-9_]+)\.([a-z0-9_]+)/i)
  if (unique?.[2]) return { type: 'unique', field: unique[2] }

  if (/Integrity constraint violation/i.test(message)) return { type: 'unique' }
  return null
}

function friendlyConstraintMessage(message: string, field?: string) {
  const constraint = detectConstraintError(message)
  if (constraint?.type === 'required') return `${fieldLabel(constraint.field ?? field)} is required.`
  if (constraint?.type === 'unique') {
    const label = fieldLabel(constraint.field ?? field)
    return constraint.field || field
      ? `${label} is already in use.`
      : 'Data with this value is already in use.'
  }
  return null
}

function friendlyValidationMessage(message: string, field?: string) {
  const label = fieldLabel(field)
  const escapedField = field?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const fieldPattern = escapedField ? new RegExp(`\\b${escapedField.replace(/_/g, '[ _]')}\\b`, 'i') : null

  if (/\bwajib (diisi|dipilih)\b/i.test(message)) return `${label} is required.`
  if (/\btidak valid\b/i.test(message)) return `${label} is invalid.`
  if (/\bsudah digunakan\b/i.test(message)) return `${label} is already in use.`

  if (/^The .+ field is required\.$/i.test(message) || /^The .+ field must be present\.$/i.test(message)) {
    return `${label} is required.`
  }
  if (/^The selected .+ is invalid\.$/i.test(message)) return `${label} is invalid.`
  if (/^The .+ must be a valid email address\.$/i.test(message)) return `${label} is not valid.`
  if (/^The .+ must be (an integer|a number|numeric)\.$/i.test(message)) return `${label} must be a number.`
  if (/^The .+ must be a valid date\.$/i.test(message)) return `${label} must be a valid date.`
  if (/^The .+ must be greater than 0\.$/i.test(message)) return `${label} must be greater than 0.`
  if (/^The .+ must be at least 1 items?\.$/i.test(message)) return `${label} must have at least 1 item.`
  if (fieldPattern?.test(message) && /\balready exists\b/i.test(message)) return `${label} is already in use.`

  const rawDuplicate = message.match(/^([a-z][a-z0-9_]*)(?:\s+field)? already exists\.$/i)
  if (rawDuplicate?.[1]) return `${fieldLabel(rawDuplicate[1])} is already in use.`

  return null
}

function fallbackMessageForStatus(status?: number) {
  if (status === 0) return 'Unable to reach the server. Check your network connection and try again.'
  if (status == null) return 'Request failed.'
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status === 403) return 'You do not have permission to perform this action.'
  if (status === 404) return 'The requested data was not found.'
  if (status === 409) return 'The request conflicts with the current data state.'
  if (status === 422) return 'Please review the highlighted fields.'
  if (status >= 500) return 'The server could not process the request. Please try again or contact an administrator.'
  return 'Request failed.'
}

export function sanitizeErrorMessage(message: string | undefined, status?: number, field?: string) {
  const fallback = fallbackMessageForStatus(status)
  if (!message) return fallback

  const constraintMessage = friendlyConstraintMessage(message, field)
  if (constraintMessage) return constraintMessage

  const validationMessage = friendlyValidationMessage(message, field)
  if (validationMessage) return validationMessage

  if (containsTechnicalDetails(message)) return fallback
  if (
    message === 'The given data was invalid.'
    || message === 'The submitted data is invalid.'
    || message === 'Validation failed.'
  ) {
    return fallbackMessageForStatus(422)
  }

  return message
}

function inferConstraintErrors(message: string | undefined): ValidationErrors | undefined {
  if (!message) return undefined
  const constraint = detectConstraintError(message)
  if (!constraint?.field) return undefined
  return {
    [constraint.field]: [
      constraint.type === 'required'
        ? `${fieldLabel(constraint.field)} is required.`
        : `${fieldLabel(constraint.field)} is already in use.`,
    ],
  }
}

function inferKnownFieldErrors(code: string | undefined, message: string | undefined): ValidationErrors | undefined {
  if (code && DUPLICATE_ERROR_FIELDS[code]) {
    const field = DUPLICATE_ERROR_FIELDS[code]
    return { [field]: [`${fieldLabel(field)} is already in use.`] }
  }

  if (!message) return undefined
  const duplicate = message.match(/^([a-z][a-z0-9_]*)(?:\s+field)? already exists\.$/i)
  if (!duplicate?.[1]) return undefined

  const field = duplicate[1]
  return { [field]: [`${fieldLabel(field)} is already in use.`] }
}

function mergeValidationErrors(...items: Array<ValidationErrors | undefined>): ValidationErrors | undefined {
  const merged: ValidationErrors = {}
  for (const item of items) {
    if (!item) continue
    for (const [field, messages] of Object.entries(item)) {
      merged[field] = [...new Set([...(merged[field] ?? []), ...messages])]
    }
  }
  return Object.keys(merged).length ? merged : undefined
}

function requestPath(url: string | undefined): string {
  if (!url) return ''
  try {
    return new URL(url, 'http://tenant-app.local').pathname
  } catch {
    const path = url.split('?')[0] ?? ''
    return path.startsWith('/') ? path : `/${path}`
  }
}

function hasRequestBody(config: InternalAxiosRequestConfig) {
  return config.data != null && typeof config.data !== 'undefined'
}

function isFormData(value: unknown) {
  return typeof FormData !== 'undefined' && value instanceof FormData
}

export function isPublicApiEndpoint(url: string | undefined) {
  return PUBLIC_API_ENDPOINTS.has(requestPath(url))
}

export function applyApiRequestHeaders(config: InternalAxiosRequestConfig) {
  const headers = AxiosHeaders.from(config.headers)
  const token = authToken()
  const companyId = activeCompanyId()

  headers.set('Accept', 'application/json')

  if (hasRequestBody(config) && !isFormData(config.data) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  } else {
    headers.delete('Authorization')
  }

  if (!isPublicApiEndpoint(config.url) && companyId != null && companyId !== '') {
    headers.set('X-Company-ID', String(companyId))
  } else {
    headers.delete('X-Company-ID')
  }

  config.headers = headers
  return config
}

export function clearInvalidAuth() {
  try {
    useAuthStore().clearAuth()
  } catch {
    localStorage.removeItem('ta_token')
    localStorage.removeItem('ta_user')
    localStorage.removeItem('ta_permissions')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_permissions')
  }

  try {
    useCompanyStore().clearCompanyState()
  } catch {
    localStorage.removeItem('ta_active_company_id')
    localStorage.removeItem('ta_active_company')
    localStorage.removeItem('ta_companies')
    localStorage.removeItem('active_company_id')
    localStorage.removeItem('active_company')
  }
}

export function clearInvalidCompany() {
  try {
    useCompanyStore().clearCompanyState()
  } catch {
    localStorage.removeItem('ta_active_company_id')
    localStorage.removeItem('ta_active_company')
    localStorage.removeItem('ta_companies')
    localStorage.removeItem('active_company_id')
    localStorage.removeItem('active_company')
  }
}

export function normalizeApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    const existing = error as Partial<ApiError> | undefined
    const rawMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : typeof existing?.message === 'string'
            ? existing.message
            : 'Request failed.'
    const code = typeof existing?.code === 'string' ? existing.code : undefined
    const status = existing?.status ?? (existing?.errors ? 422 : undefined)
    const errors = mergeValidationErrors(
      normalizeValidationErrors(existing?.errors),
      inferKnownFieldErrors(code, rawMessage),
      inferConstraintErrors(rawMessage),
    )

    return {
      status,
      code,
      message: errors && status === 422
        ? fallbackMessageForStatus(422)
        : sanitizeErrorMessage(rawMessage, status),
      errors,
      meta:
        existing?.meta && typeof existing.meta === 'object'
          ? (existing.meta as Record<string, unknown>)
          : undefined,
      raw: error,
    }
  }

  const status = error.response?.status ?? 0
  const payload = error.response?.data as Record<string, unknown> | undefined
  const rawMessage = typeof payload?.message === 'string' ? payload.message : error.message
  const code = typeof payload?.code === 'string' ? payload.code : undefined
  const errors = mergeValidationErrors(
    normalizeValidationErrors(payload?.errors),
    inferKnownFieldErrors(code, rawMessage),
    inferConstraintErrors(rawMessage),
  )

  return {
    status,
    code,
    message: errors && status === 422 ? fallbackMessageForStatus(422) : sanitizeErrorMessage(rawMessage, status),
    errors,
    meta:
      payload?.meta && typeof payload.meta === 'object'
        ? (payload.meta as Record<string, unknown>)
        : undefined,
    raw: error,
  }
}

export const axiosApi: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    Accept: 'application/json',
  },
})

export const api: AxiosInstance = axiosApi

export default api
