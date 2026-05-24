import { ref } from 'vue'
import { productsService } from '@/services/master-data/products.service'
import type { ApiResponse } from '@/types/api'

export type ProductLookupItem = { id: number; label: string }

export function useProductLookup() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function listProducts() {
    loading.value = true
    error.value = null
    try {
      const res = await productsService.list({ is_active: true })
      const payload = res.data as ApiResponse<any[]>
      const items = Array.isArray(payload.data) ? payload.data : []
      return items.map((p) => ({
        id: Number(p.id),
        label: p.code || p.sku ? `${p.code || p.sku} - ${p.name}` : String(p.name),
      }))
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Unable to load products.'
      return []
    } finally {
      loading.value = false
    }
  }

  return { loading, error, listProducts }
}

