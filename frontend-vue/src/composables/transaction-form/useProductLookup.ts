import { computed, ref } from 'vue'
import { listProducts } from '@/services/master-data/products.service'
import { normalizeProductList, type NormalizedProduct } from '@/utils/normalizeProduct'

type ProductLookupParams = {
  is_active?: boolean
  product_type?: string
}

export function useProductLookup() {
  const allProducts = ref<NormalizedProduct[]>([])
  const keyword = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  let loaded = false

  const products = computed(() => {
    const query = keyword.value.trim().toLowerCase()
    if (!query) return allProducts.value
    return allProducts.value.filter((product) => product.label.toLowerCase().includes(query))
  })

  async function loadProducts(params: ProductLookupParams = { is_active: true }) {
    loading.value = true
    error.value = null
    try {
      const response = await listProducts(params)
      allProducts.value = normalizeProductList(response)
      loaded = true
    } catch (cause) {
      const message = (cause as { message?: unknown } | null)?.message
      error.value = typeof message === 'string' ? message : 'Unable to load products.'
      allProducts.value = []
    } finally {
      loading.value = false
    }
  }

  async function searchProducts(searchKeyword: string) {
    keyword.value = searchKeyword
    if (!loaded && !loading.value) await loadProducts()
  }

  async function resetProducts() {
    keyword.value = ''
    if (!loaded && !loading.value) await loadProducts()
  }

  return { products, loading, error, searchProducts, resetProducts }
}
