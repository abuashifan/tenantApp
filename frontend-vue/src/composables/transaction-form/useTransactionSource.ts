import { ref } from 'vue'

export function useTransactionSource() {
  const sourceLoading = ref(false)
  const sourceError = ref<string | null>(null)

  return { sourceLoading, sourceError }
}

