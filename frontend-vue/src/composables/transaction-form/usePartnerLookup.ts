import { ref } from 'vue'
import { contactsService } from '@/services/master-data/contacts.service'
import type { ApiResponse } from '@/types/api'

export type PartnerLookupItem = { id: number; label: string }

export function usePartnerLookup() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function listPartners(partnerType: 'customer' | 'vendor') {
    loading.value = true
    error.value = null
    try {
      const res = await contactsService.list({ is_active: true })
      const payload = res.data as ApiResponse<Array<Record<string, unknown>>>
      const items = Array.isArray(payload.data) ? payload.data : []
      return items
        .filter((c) => (partnerType === 'customer' ? Boolean((c as any)?.is_customer) : Boolean((c as any)?.is_supplier)))
        .map((c) => ({
          id: Number((c as any).id),
          label: (c as any).contact_code ? `${(c as any).contact_code} - ${(c as any).name}` : String((c as any).name),
        }))
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Unable to load partners.'
      return []
    } finally {
      loading.value = false
    }
  }

  return { loading, error, listPartners }
}
