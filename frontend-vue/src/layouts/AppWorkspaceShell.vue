<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppSidebarCollapsed from '@/components/layout/AppSidebarCollapsed.vue'
import AppSidebarFull from '@/components/layout/AppSidebarFull.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import SecondaryTabsBar from '@/components/navigation/SecondaryTabsBar.vue'
import UnsavedChangesDialog from '@/components/dialog/UnsavedChangesDialog.vue'
import { sidebarMenuGroups, type SidebarMenuGroup, type SidebarMenuItem } from '@/navigation/sidebar'
import WorkspaceContentArea from '@/workspace/WorkspaceContentArea.vue'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'
import { useUiStore } from '@/stores/uiStore'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()
const company = useCompanyStore()
const tabs = useWorkspaceTabsStore()

function canAccessItem(item: SidebarMenuItem) {
  return auth.permissions.includes('*') || auth.permissions.includes(item.permission)
}

const modules = computed<SidebarMenuGroup[]>(() =>
  sidebarMenuGroups
    .map((module) => ({
      ...module,
      items: module.items.filter(canAccessItem),
    }))
    .filter((module) => module.key === 'dashboard' || module.items.length > 0),
)

const activeModuleKey = ref('dashboard')
const floatingModuleKey = ref<string | null>(null)

watchEffect(() => {
  if (activeModuleKey.value === 'dashboard') floatingModuleKey.value = null
})

const activePrimaryId = computed(() => tabs.activePrimaryTabId)
const primaryTabs = computed(() => tabs.primaryTabs)

watch(
  activePrimaryId,
  (path) => {
    tabs.ensureListSecondaryTab(path)
    const module = modules.value.find((item) => item.href === path || item.items.some((child) => child.href === path))
    if (module) activeModuleKey.value = module.key
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    const primaryId = route.meta.primaryTabUseRoutePath ? route.path : (route.meta.primaryTabId as string | undefined)
    const primaryLabel = route.meta.primaryTabLabel as string | undefined
    if (!primaryId || !primaryLabel) return

    tabs.openPrimaryTab({
      id: primaryId,
      label: primaryLabel,
      path: route.path,
      closable: route.meta.primaryTabClosable !== false,
    })
  },
  { immediate: true },
)

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

async function onOpenItem(item: SidebarMenuItem) {
  await openPrimary(item.href, item.label, true)
  floatingModuleKey.value = null
}

const secondaryTabs = computed(() => tabs.secondaryTabsByPrimaryId[activePrimaryId.value] ?? [])
const activeSecondaryId = computed(
  () => tabs.activeSecondaryTabIdByPrimaryId[activePrimaryId.value] ?? `${activePrimaryId.value}::list`,
)
const showSecondary = computed(() => activePrimaryId.value !== '/dashboard' && secondaryTabs.value.length > 0)
const attachedSecondaryWorkspace = computed(() => showSecondary.value)
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

async function saveCloseSecondary() {
  if (!closePendingSecondaryId.value) return
  const pendingId = closePendingSecondaryId.value
  const handled = await tabs.saveSecondaryTab(pendingId)
  if (handled) {
    tabs.closeSecondaryTab(activePrimaryId.value, pendingId)
    closePendingSecondaryId.value = null
    return
  }

  if (tabs.hasSecondarySaveHandler(pendingId)) {
    closePendingSecondaryId.value = null
    return
  }

  tabs.setSecondaryDirty(closePendingSecondaryId.value, false)
  tabs.closeSecondaryTab(activePrimaryId.value, closePendingSecondaryId.value)
  closePendingSecondaryId.value = null
}

const activeCompanyName = computed(() => company.activeCompany?.name ?? 'PT Maju Jaya')
</script>

<template>
  <div class="app-viewport flex min-w-0 overflow-hidden bg-slate-100 text-slate-900">
    <AppSidebarCollapsed
      v-if="ui.sidebarCollapsed"
      :modules="modules"
      :active-module-key="activeModuleKey"
      :active-href="activePrimaryId"
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
      :active-href="activePrimaryId"
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

      <div
        v-if="showSecondary"
        :class="
          attachedSecondaryWorkspace
            ? 'min-w-0 flex-none bg-transparent px-4 pt-4 lg:px-6 lg:pt-6 tablet-workspace-padding tablet-workspace-top-padding'
            : 'min-w-0 flex-none border-b border-slate-200 bg-white px-4 py-2 lg:px-6'
        "
      >
        <SecondaryTabsBar
          :tabs="secondaryTabs"
          :active-id="activeSecondaryId"
          :attached="attachedSecondaryWorkspace"
          @activate="(id) => tabs.activateSecondaryTab(activePrimaryId, id)"
          @close="closeSecondary"
        />
      </div>

      <main
        :class="
          attachedSecondaryWorkspace
            ? 'workspace-scrollbar min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-4 pt-0 lg:px-6 lg:pb-6 tablet-workspace-padding'
            : 'workspace-scrollbar min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 tablet-workspace-padding tablet-workspace-top-padding'
        "
      >
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
