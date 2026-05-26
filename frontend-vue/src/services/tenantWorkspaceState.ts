import { useAccessStore } from '@/stores/access.store'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

export function invalidateTenantScopedState() {
  useWorkspaceTabsStore().resetForCompanySwitch()
  useAccessStore().clearTenantState()
}
