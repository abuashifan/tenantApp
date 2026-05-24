import { ref } from 'vue'

import type { RuntimeTransactionFormConfig } from '@/composables/transaction-form/types'
import { toErrorMessage } from '@/composables/transaction-form/useTransactionValidation'

export function useTransactionActions(options: {
  config: RuntimeTransactionFormConfig
  entityId?: string | number
}) {
  const actionLoading = ref(false)
  const actionError = ref<string | null>(null)

  async function runAction(key: string, payload?: unknown) {
    if (!options.config.apiService.action) throw new Error('Service does not support actions')
    if (options.entityId == null) throw new Error('Missing entityId for action')
    actionLoading.value = true
    actionError.value = null
    try {
      await options.config.apiService.action(key, options.entityId, payload)
      return true
    } catch (cause) {
      actionError.value = toErrorMessage(cause)
      return false
    } finally {
      actionLoading.value = false
    }
  }

  return { actionLoading, actionError, runAction }
}
