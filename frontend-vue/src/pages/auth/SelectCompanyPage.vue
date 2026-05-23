<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import { ArrowLeftRight, Building2, Check, ChevronRight, LogOut, Star, Users } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import ToneBadge from '@/components/ui/ToneBadge.vue'
import { useCompanyStore } from '@/stores/companyStore'
import { useAuthStore } from '@/stores/authStore'
import { fetchCompanies, fetchPermissions, selectCompany } from '@/services/companyApi'
import { logout } from '@/services/authApi'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const router = useRouter()
const route = useRoute()
const companyStore = useCompanyStore()
const authStore = useAuthStore()
const workspaceTabs = useWorkspaceTabsStore()

const query = ref('')
const selected = ref<string | number | null>(companyStore.companies[0]?.id ?? null)
const loading = ref(false)
const selecting = ref(false)
const loggingOut = ref(false)
const errorMessage = ref('')

const filtered = computed(() =>
  companyStore.companies.filter((c) => c.name.toLowerCase().includes(query.value.trim().toLowerCase())),
)

function errorText(e: unknown, fallback: string) {
  if (axios.isAxiosError(e)) {
    return e.response?.data?.message ?? (e.response ? e.message : 'Network Error: tidak bisa terhubung ke API.')
  }
  return (e as Error)?.message ?? fallback
}

onMounted(async () => {
  if (companyStore.companies.length > 0) return

  loading.value = true
  errorMessage.value = ''
  try {
    const companies = await fetchCompanies()
    companyStore.setCompanies(companies)
    selected.value = companies[0]?.id ?? null
  } catch (e) {
    errorMessage.value = errorText(e, 'Gagal mengambil daftar company.')
  } finally {
    loading.value = false
  }
})

async function handleLogout() {
  loggingOut.value = true
  errorMessage.value = ''
  try {
    await logout()
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status !== 401) {
      errorMessage.value = errorText(e, 'Logout gagal.')
      loggingOut.value = false
      return
    }
  }

  authStore.clearAuth()
  companyStore.clearActiveCompany()
  workspaceTabs.closeAllTabs()
  loggingOut.value = false
  await router.push('/login')
}

async function handleContinue() {
  if (selected.value == null) return

  selecting.value = true
  errorMessage.value = ''
  try {
    const activeCompany = await selectCompany(selected.value)
    const merged = companyStore.companies.some((c) => c.id === activeCompany.id)
      ? companyStore.companies.map((c) => (c.id === activeCompany.id ? activeCompany : c))
      : [...companyStore.companies, activeCompany]

    companyStore.setCompanies(merged)
    companyStore.setActiveCompany(activeCompany.id)

    const permissionData = await fetchPermissions()
    authStore.setPermissions(permissionData.permissions)

    const next = (route.query.next as string | undefined) ?? '/dashboard'
    await router.push(next)
  } catch (e) {
    errorMessage.value = errorText(e, 'Gagal memilih company.')
  } finally {
    selecting.value = false
  }
}
</script>

<template>
  <main
    class="min-h-screen bg-[radial-gradient(circle_at_top_left,#f7fbe9,transparent_34%),linear-gradient(135deg,#f8fafc_0%,#edf7f5_52%,#e9f6fb_100%)] p-5 text-slate-900 sm:p-8"
  >
    <div class="mx-auto max-w-6xl">
      <header
        class="mb-8 flex flex-col gap-5 rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-xl shadow-slate-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div class="flex items-center gap-4">
          <div class="grid h-14 w-14 place-items-center rounded-2xl bg-[#06131e] text-[#b4db24]">
            <ArrowLeftRight class="h-7 w-7" />
          </div>
          <div>
            <p class="text-sm font-semibold text-[#1d81af]">Phase 1 · Company Access</p>
            <h1 class="text-2xl font-bold tracking-tight text-slate-950">Pilih perusahaan aktif</h1>
            <p class="mt-1 text-sm text-slate-500">Satu user bisa memiliki akses ke banyak company.</p>
          </div>
        </div>

        <BaseButton variant="secondary" size="lg" :loading="loggingOut" @click="handleLogout">
          <LogOut class="h-4 w-4" />
          Keluar
        </BaseButton>
      </header>

      <div class="grid gap-6">
        <section
          class="rounded-[2rem] border border-white/80 bg-white/82 p-5 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-6"
        >
          <div class="mb-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <SearchInput v-model="query" placeholder="Cari perusahaan..." />
            <ToneBadge tone="lime">
              <Star class="mr-1 h-3.5 w-3.5" />
              {{ filtered.length }} company
            </ToneBadge>
          </div>

          <p v-if="errorMessage" class="mb-4 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {{ errorMessage }}
          </p>

          <div v-if="loading" class="rounded-[1.75rem] border border-slate-200 bg-white p-5 text-sm text-slate-500">
            Mengambil daftar company...
          </div>

          <div v-else-if="filtered.length === 0" class="rounded-[1.75rem] border border-slate-200 bg-white p-5 text-sm text-slate-500">
            Tidak ada company yang cocok.
          </div>

          <div v-else class="space-y-4">
            <button
              v-for="company in filtered"
              :key="company.id"
              type="button"
              class="group w-full rounded-[1.75rem] border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/8"
              :class="
                selected === company.id
                  ? 'border-[#b4db24] ring-4 ring-[#f0f8d3]'
                  : 'border-slate-200'
              "
              @click="selected = company.id"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex gap-4">
                  <div
                    class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
                    :class="
                      selected === company.id
                        ? 'bg-[#06131e] text-[#b4db24]'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-[#e9f6fb] group-hover:text-[#24a1db]'
                    "
                  >
                    <Building2 class="h-7 w-7" />
                  </div>
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="text-base font-bold text-slate-950">{{ company.name }}</h3>
                      <ToneBadge v-if="selected === company.id" tone="lime">
                        <Check class="mr-1 h-3.5 w-3.5" />
                        Dipilih
                      </ToneBadge>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <ToneBadge tone="green">{{ company.user_role ?? 'Member' }}</ToneBadge>
                      <ToneBadge tone="blue">{{ company.tenant_database?.status ?? company.status ?? 'active' }}</ToneBadge>
                    </div>
                  </div>
                </div>
                <ChevronRight
                  class="mt-4 h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500"
                  :class="selected === company.id ? 'text-[#b4db24]' : ''"
                />
              </div>

              <div class="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <Users class="h-4 w-4 text-slate-400" />
                Company code: {{ company.code ?? '-' }}
              </div>
            </button>
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-slate-500">
              Company terpilih akan menjadi konteks tenant untuk dashboard dan seluruh modul ERP.
            </p>
            <BaseButton class="sm:min-w-44" size="lg" :disabled="selected == null" :loading="selecting" @click="handleContinue">
              Lanjutkan
              <ChevronRight class="h-4 w-4" />
            </BaseButton>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
