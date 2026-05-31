import api from '@/services/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'
import type { PaginatedResponse } from '@/types/api'

export type SourceDocumentLine = {
  id: number | string
  product_id?: number | string | null
  product_code?: string | null
  description: string
  quantity: number
  remaining_quantity?: number
  unit_id?: number | string | null
  unit_price?: number
  estimated_unit_price?: number
  discount_type?: string | null
  discount_value?: number | string | null
  tax_id?: number | string | null
  tax_rate?: number | string | null
  warehouse_id?: number | string | null
  department_id?: number | string | null
  project_id?: number | string | null
  expense_account_id?: number | string | null
  quotation_line_id?: number | string | null
  sales_order_line_id?: number | string | null
  delivery_order_line_id?: number | string | null
  proforma_invoice_line_id?: number | string | null
  purchase_request_line_id?: number | string | null
  purchase_order_line_id?: number | string | null
  goods_receipt_line_id?: number | string | null
  source_line_type?: string | null
  source_line_id?: number | string | null
}

export type SourceDocument = {
  id: number | string
  target_type: string
  source_type: string
  source_id: number | string
  source_number?: string | null
  source_revision?: number | string | null
  document_number?: string | null
  document_date?: string | null
  status?: string | null
  partner_id?: number | string | null
  description?: string | null
  header?: Record<string, unknown>
  lines: SourceDocumentLine[]
}

export type SourceDocumentAvailability = {
  target_type: string
  source_type: string
  available: boolean
  count: number
}

export type SourceDocumentParams = {
  moduleKey: 'sales' | 'purchase'
  targetType: string
  sourceType?: string
  partnerId?: string | number | null
  search?: string
  page?: number
  perPage?: number
}

function endpoint(moduleKey: 'sales' | 'purchase', suffix: string) {
  return `/${moduleKey}/source-documents${suffix}`
}

function params(input: SourceDocumentParams) {
  return {
    target_type: input.targetType,
    source_type: input.sourceType,
    partner_id: input.partnerId || undefined,
    search: input.search || undefined,
    page: input.page,
    per_page: input.perPage,
  }
}

export async function checkSourceDocumentAvailability(input: SourceDocumentParams) {
  const response = await api.get<ApiResponse<SourceDocumentAvailability>>(endpoint(input.moduleKey, '/availability'), {
    params: params(input),
  })

  return unwrap(response.data)
}

export async function listSourceDocuments(input: SourceDocumentParams) {
  const response = await api.get<ApiResponse<PaginatedResponse<SourceDocument>>>(endpoint(input.moduleKey, ''), {
    params: params(input),
  })

  return unwrap(response.data)
}
