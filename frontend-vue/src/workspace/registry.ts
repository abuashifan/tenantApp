import type { Component } from 'vue'

import DashboardWorkspaceContent from '@/pages/dashboard/DashboardWorkspaceContent.vue'
import JournalWorkspaceContent from '@/pages/accounting/journals/JournalWorkspaceContent.vue'
import PlaceholderWorkspaceContent from '@/pages/workspace/PlaceholderWorkspaceContent.vue'

export const workspaceRegistry: Record<string, Component> = {
  '/dashboard': DashboardWorkspaceContent,
  '/accounting/journals': JournalWorkspaceContent,
}

export const defaultWorkspaceComponent = PlaceholderWorkspaceContent
