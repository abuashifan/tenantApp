import { ref } from 'vue'
import { contactsService } from '@/services/master-data/contacts.service'
import type { ApiResponse } from '@/types/api'

export type PartnerLookupItem = { id: number; label: string }
type PartnerResponse = {
  id: string | number
  contact_code?: string | null
  name?: string | null
  is_customer?: boolean
  is_supplier?: boolean
}

export function usePartnerLookup() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function listPartners(partnerType: 'customer' | 'vendor') {
    loading.value = true
    error.value = null
    try {
      const res = await contactsService.list({ is_active: true })
      const payload = res.data as ApiResponse<PartnerResponse[]>
      const items = Array.isArray(payload.data) ? payload.data : []
      return items
        .filter((contact) => (partnerType === 'customer' ? Boolean(contact.is_customer) : Boolean(contact.is_supplier)))
        .map((contact) => ({
          id: Number(contact.id),
          label: contact.contact_code ? `${contact.contact_code} - ${contact.name ?? ''}` : String(contact.name ?? ''),
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
