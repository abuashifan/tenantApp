<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, ChevronDown, LogOut, Menu, UserRound } from 'lucide-vue-next'

import IconButton from '@/components/ui/IconButton.vue'
import PrimaryTabsBar from '@/components/navigation/PrimaryTabsBar.vue'
import type { PrimaryTab } from '@/stores/workspaceTabsStore'
import { useAuthStore } from '@/stores/authStore'

defineProps<{
  tabs: PrimaryTab[]
  activeId: string
}>()

const emit = defineEmits<{
  activate: [tabId: string]
  close: [tabId: string]
  mobileMenu: []
}>()

const router = useRouter()
const auth = useAuthStore()
const userMenuOpen = ref(false)
const loggingOut = ref(false)
const userName = computed(() => auth.user?.name ?? 'Admin User')

async function handleLogout() {
  userMenuOpen.value = false
  loggingOut.value = true
  await auth.logout()
  loggingOut.value = false
  await router.push('/login')
}
</script>

<template>
  <header class="tablet-topbar flex h-20 min-w-0 flex-none items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
    <button
      type="button"
      class="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 lg:hidden"
      @click="emit('mobileMenu')"
    >
      <Menu class="h-5 w-5" />
    </button>

    <PrimaryTabsBar :tabs="tabs" :active-id="activeId" @activate="(id) => emit('activate', id)" @close="(id) => emit('close', id)" />

    <div class="flex items-center gap-2">
      <IconButton variant="ghost" size="md">
        <Bell class="h-5 w-5" />
      </IconButton>
      <div class="relative">
        <button
          type="button"
          class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50"
          @click="userMenuOpen = !userMenuOpen"
        >
          <div class="grid h-8 w-8 place-items-center rounded-xl bg-[#06131e] text-[#b4db24]">
            <UserRound class="h-4 w-4" />
          </div>
          <div class="hidden text-left md:block">
            <p class="text-xs font-bold text-slate-900">{{ userName }}</p>
            <p class="text-[11px] text-slate-400">Owner</p>
          </div>
          <ChevronDown class="h-4 w-4 text-slate-400" />
        </button>

        <div
          v-if="userMenuOpen"
          class="absolute right-0 z-30 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            :disabled="loggingOut"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
