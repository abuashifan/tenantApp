import type { Component } from 'vue'

import DashboardWorkspaceContent from '@/pages/dashboard/DashboardWorkspaceContent.vue'
import JournalWorkspaceContent from '@/pages/accounting/journals/JournalWorkspaceContent.vue'
import ChartOfAccountsWorkspaceContent from '@/pages/accounting/chart-of-accounts/ChartOfAccountsWorkspaceContent.vue'
import PlaceholderWorkspaceContent from '@/pages/workspace/PlaceholderWorkspaceContent.vue'

export const workspaceRegistry: Record<string, Component> = {
  '/dashboard': DashboardWorkspaceContent,
  '/accounting/journals': JournalWorkspaceContent,
  '/accounting/chart-of-accounts': ChartOfAccountsWorkspaceContent,
}

export const defaultWorkspaceComponent = PlaceholderWorkspaceContent
