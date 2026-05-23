<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

import {
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  WalletCards,
  Warehouse,
} from 'lucide-vue-next'

import AppSidebarCollapsed, { type SidebarItem, type SidebarModule } from '@/components/layout/AppSidebarCollapsed.vue'
import AppSidebarFull from '@/components/layout/AppSidebarFull.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import SecondaryTabsBar from '@/components/navigation/SecondaryTabsBar.vue'
import UnsavedChangesDialog from '@/components/dialog/UnsavedChangesDialog.vue'
import WorkspaceContentArea from '@/workspace/WorkspaceContentArea.vue'
import { useCompanyStore } from '@/stores/companyStore'
import { useUiStore } from '@/stores/uiStore'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const router = useRouter()
const ui = useUiStore()
const company = useCompanyStore()
const tabs = useWorkspaceTabsStore()

const modules: SidebarModule[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, items: [] },
  {
    key: 'accounting',
    label: 'Accounting',
    icon: ClipboardList,
    items: [
      { id: 'journal', label: 'Journal Entries', href: '/accounting/journals' },
      { id: 'coa', label: 'Chart of Accounts', href: '/accounting/chart-of-accounts' },
      { id: 'ledger', label: 'General Ledger', href: '/reports/general-ledger' },
      { id: 'trial', label: 'Trial Balance', href: '/reports/trial-balance' },
    ],
  },
  {
    key: 'sales',
    label: 'Sales & AR',
    icon: ShoppingCart,
    items: [
      { id: 'sales-invoice', label: 'Sales Invoices', href: '/sales/invoices' },
      { id: 'sales-order', label: 'Sales Orders', href: '/sales/orders' },
      { id: 'ar-aging', label: 'AR Aging', href: '/sales/ar-aging' },
    ],
  },
  {
    key: 'cashbank',
    label: 'Cash & Bank',
    icon: WalletCards,
    items: [
      { id: 'cash-in', label: 'Cash In', href: '/cash-bank/cash-in' },
      { id: 'cash-out', label: 'Cash Out', href: '/cash-bank/cash-out' },
      { id: 'bank-transfer', label: 'Bank Transfer', href: '/cash-bank/bank-transfer' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: Warehouse,
    items: [
      { id: 'products', label: 'Products', href: '/inventory/products' },
      { id: 'stock', label: 'Stock Balance', href: '/inventory/stock' },
      { id: 'movement', label: 'Stock Movement', href: '/inventory/movements' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      { id: 'company-setting', label: 'Company Settings', href: '/settings/company' },
      { id: 'permissions', label: 'Role & Permission', href: '/settings/permissions' },
    ],
  },
]

const activeModuleKey = ref('dashboard')
const floatingModuleKey = ref<string | null>(null)

watchEffect(() => {
  if (activeModuleKey.value === 'dashboard') floatingModuleKey.value = null
})

const activePrimaryId = computed(() => tabs.activePrimaryTabId)
const primaryTabs = computed(() => tabs.primaryTabs)

async function openPrimary(path: string, label: string, closable = true) {
  tabs.openPrimaryTab({ id: path, label, path, closable })
  await router.push(path)
}

async function onToggleModule(moduleKey: string) {
  activeModuleKey.value = activeModuleKey.value === moduleKey ? '' : moduleKey
  if (moduleKey === 'dashboard') {
    tabs.activatePrimaryTab('/dashboard')
    await router.push('/dashboard')
  }
}

async function onCollapsedModule(moduleKey: string) {
  activeModuleKey.value = moduleKey
  if (moduleKey === 'dashboard') {
    floatingModuleKey.value = null
    tabs.activatePrimaryTab('/dashboard')
    await router.push('/dashboard')
    return
  }
  floatingModuleKey.value = moduleKey
}

async function onOpenItem(item: SidebarItem) {
  await openPrimary(item.href, item.label, true)
  floatingModuleKey.value = null
}

const secondaryTabs = computed(() => tabs.secondaryTabsByPrimaryId[activePrimaryId.value] ?? [])
const visibleSecondaryTabs = computed(() => secondaryTabs.value.filter((t) => t.mode !== 'list'))
const activeSecondaryId = computed(
  () => tabs.activeSecondaryTabIdByPrimaryId[activePrimaryId.value] ?? `${activePrimaryId.value}::list`,
)
const showSecondary = computed(() => activePrimaryId.value !== '/dashboard' && visibleSecondaryTabs.value.length > 0)
const closePendingSecondaryId = ref<string | null>(null)
const unsavedOpen = computed(() => closePendingSecondaryId.value != null)

async function closePrimary(tabId: string) {
  tabs.closePrimaryTab(tabId)
  await router.push(tabs.activePrimaryTab?.path ?? '/dashboard')
}

async function activatePrimary(tabId: string) {
  tabs.activatePrimaryTab(tabId)
  await router.push(tabId)
}

function closeSecondary(tabId: string) {
  const tab = secondaryTabs.value.find((t) => t.id === tabId)
  if (!tab || !tab.closable) return

  if (!tab.dirty) {
    tabs.closeSecondaryTab(activePrimaryId.value, tabId)
    return
  }

  closePendingSecondaryId.value = tabId
}

function discardCloseSecondary() {
  if (!closePendingSecondaryId.value) return
  tabs.clearDraftState(closePendingSecondaryId.value)
  tabs.closeSecondaryTab(activePrimaryId.value, closePendingSecondaryId.value)
  closePendingSecondaryId.value = null
}

function saveCloseSecondary() {
  if (!closePendingSecondaryId.value) return
  tabs.setSecondaryDirty(closePendingSecondaryId.value, false)
  tabs.closeSecondaryTab(activePrimaryId.value, closePendingSecondaryId.value)
  closePendingSecondaryId.value = null
}

const activeCompanyName = computed(() => company.activeCompany?.name ?? 'PT Maju Jaya')
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-100 text-slate-900">
    <AppSidebarCollapsed
      v-if="ui.sidebarCollapsed"
      :modules="modules"
      :active-module-key="activeModuleKey"
      :floating-module-key="floatingModuleKey"
      @expand="ui.toggleSidebar()"
      @activate-module="onCollapsedModule"
      @set-floating="(v) => (floatingModuleKey = v)"
      @open-item="onOpenItem"
    />
    <AppSidebarFull
      v-else
      :modules="modules"
      :active-module-key="activeModuleKey"
      :active-company-name="activeCompanyName"
      :active-company-id="company.activeCompanyId"
      @collapse="ui.toggleSidebar()"
      @toggle-module="onToggleModule"
      @open-item="onOpenItem"
    />

    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <AppTopbar
        :tabs="primaryTabs"
        :active-id="activePrimaryId"
        @activate="activatePrimary"
        @close="closePrimary"
        @mobile-menu="ui.openMobileSidebar()"
      />

      <div v-if="showSecondary" class="border-b border-slate-200 bg-white px-4 py-2 lg:px-6">
        <SecondaryTabsBar
          :tabs="visibleSecondaryTabs"
          :active-id="activeSecondaryId"
          @activate="(id) => tabs.activateSecondaryTab(activePrimaryId, id)"
          @close="closeSecondary"
        />
      </div>

      <main class="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        <WorkspaceContentArea />
      </main>
    </div>

    <UnsavedChangesDialog
      :open="unsavedOpen"
      @close="closePendingSecondaryId = null"
      @discard="discardCloseSecondary"
      @save="saveCloseSecondary"
    />
  </div>
</template>
