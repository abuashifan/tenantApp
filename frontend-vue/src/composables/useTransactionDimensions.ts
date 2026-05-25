import { computed, ref } from 'vue'

import { departmentsService } from '@/services/accounting/departments.service'
import { projectsService } from '@/services/accounting/projects.service'

type DimensionOption = {
  id: string | number
  name: string
  code?: string
  label: string
  is_active?: boolean
  status?: string
  raw: unknown
}

type UnknownRecord = Record<string, unknown>

const departments = ref<DimensionOption[]>([])
const projects = ref<DimensionOption[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
let loaded = false

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function extractArray(response: unknown): unknown[] {
  if (Array.isArray(response)) return response
  if (!isRecord(response)) return []
  if (Array.isArray(response.items)) return response.items
  if (Array.isArray(response.data)) return response.data
  if ('data' in response) return extractArray(response.data)
  return []
}

function firstString(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function firstId(record: UnknownRecord) {
  const value = record.id ?? record.department_id ?? record.project_id
  return typeof value === 'string' || typeof value === 'number' ? value : ''
}

function normalizeDimension(raw: unknown): DimensionOption | null {
  const record = isRecord(raw) ? raw : {}
  const id = firstId(record)
  if (id === '') return null

  const code = firstString(record, ['code', 'department_code', 'project_code'])
  const name = firstString(record, ['name', 'department_name', 'project_name', 'description'])
  const label = code && name ? `${code} - ${name}` : name || code || String(id)
  const isActive = typeof record.is_active === 'boolean' ? record.is_active : undefined
  const status = typeof record.status === 'string' ? record.status : undefined

  return { id, code, name, label, is_active: isActive, status, raw }
}

function activeForNewForms(option: DimensionOption) {
  const activeFlag = option.is_active !== false
  const statusFlag = !option.status || option.status === 'active'
  return activeFlag && statusFlag
}

async function loadDimensions() {
  if (loaded || loading.value) return
  loading.value = true
  error.value = null
  try {
    const [departmentResponse, projectResponse] = await Promise.all([
      departmentsService.list(),
      projectsService.list(),
    ])
    departments.value = extractArray(departmentResponse).map(normalizeDimension).filter((item): item is DimensionOption => !!item)
    projects.value = extractArray(projectResponse).map(normalizeDimension).filter((item): item is DimensionOption => !!item)
    loaded = true
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Failed to load dimensions.'
  } finally {
    loading.value = false
  }
}

export function useTransactionDimensions() {
  return {
    departments: computed(() => departments.value.filter(activeForNewForms)),
    projects: computed(() => projects.value.filter(activeForNewForms)),
    allDepartments: computed(() => departments.value),
    allProjects: computed(() => projects.value),
    loading,
    error,
    loadDimensions,
  }
}
