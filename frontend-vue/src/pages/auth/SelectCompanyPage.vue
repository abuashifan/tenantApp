<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  ArrowLeftRight,
  Building2,
  Check,
  ChevronRight,
  LogOut,
  Star,
  Users,
} from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import ToneBadge from '@/components/ui/ToneBadge.vue'
import { useCompanyStore } from '@/stores/companyStore'
import { useAuthStore } from '@/stores/authStore'
import { fetchCompanies, fetchPermissions, selectCompany } from '@/services/companyApi'
import { normalizeApiError } from '@/services/api'
import { invalidateTenantScopedState } from '@/services/tenantWorkspaceState'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const router = useRouter()
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
  companyStore.companies.filter((c) =>
    c.name.toLowerCase().includes(query.value.trim().toLowerCase()),
  ),
)
const selectedCompany = computed(
  () => companyStore.companies.find((company) => String(company.id) === String(selected.value)) ?? null,
)
const userInitial = computed(() => (authStore.user?.name?.trim().charAt(0) || 'U').toUpperCase())

function errorText(e: unknown, fallback: string) {
  const error = normalizeApiError(e)
  if (error.status === 0) return 'Network Error: tidak bisa terhubung ke API.'
  return error.message || fallback
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
  await authStore.logout()
  loggingOut.value = false
  await router.push('/login')
}

async function handleContinue() {
  if (selected.value == null) return

  const isSwitchingCompany =
    companyStore.activeCompanyId != null && String(companyStore.activeCompanyId) !== String(selected.value)
  if (isSwitchingCompany && workspaceTabs.hasTenantScopedState) {
    const message = workspaceTabs.hasDirtySecondaryTabs
      ? 'Switching company will close the current workspace and discard unsaved changes. Continue?'
      : 'Switching company will close the current workspace and refresh tenant data. Continue?'
    if (!window.confirm(message)) return
  }

  selecting.value = true
  errorMessage.value = ''
  try {
    const activeCompany = await selectCompany(selected.value)
    const merged = companyStore.companies.some((c) => c.id === activeCompany.id)
      ? companyStore.companies.map((c) => (c.id === activeCompany.id ? activeCompany : c))
      : [...companyStore.companies, activeCompany]

    companyStore.setCompanies(merged)
    companyStore.setActiveCompanyData(activeCompany)
    authStore.setPermissions([])
    invalidateTenantScopedState()

    const permissionData = await fetchPermissions()
    authStore.setPermissions(permissionData.permissions)

    await router.push('/dashboard')
  } catch (e) {
    errorMessage.value = errorText(e, 'Gagal memilih company.')
  } finally {
    selecting.value = false
  }
}

function handleCardDoubleClick(companyId: string | number) {
  if (String(selected.value) === String(companyId)) {
    void handleContinue()
    return
  }

  selected.value = companyId
}
</script>

<template>
  <main
    class="min-h-[100dvh] overflow-y-auto bg-[radial-gradient(circle_at_top_left,#f7fbe9,transparent_30%),linear-gradient(135deg,#f8fafc_0%,#edf7f5_52%,#e9f6fb_100%)] px-4 py-4 pb-24 text-slate-900 sm:px-6 lg:px-8 lg:py-4 lg:pb-6"
  >
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <header
        class="flex flex-col gap-4 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-lg shadow-slate-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:p-4"
      >
        <div class="flex min-w-0 items-center gap-3">
          <div class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#06131e] text-[#b4db24]">
            <ArrowLeftRight class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <h1 class="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">Pilih Perusahaan</h1>
            <p class="truncate text-sm text-slate-500">Pilih company aktif untuk mulai bekerja</p>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3 sm:justify-end">
          <div class="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div
              class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f7fbe9] text-xs font-black text-[#48580e] ring-1 ring-[#e1f1a7]"
            >
              {{ userInitial }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-bold text-slate-900">{{ authStore.user?.name ?? 'User' }}</p>
              <p class="truncate text-xs text-slate-500">{{ authStore.user?.email ?? 'Authenticated user' }}</p>
            </div>
          </div>

          <BaseButton variant="secondary" size="md" :loading="loggingOut" @click="handleLogout">
            <LogOut class="h-4 w-4" />
            Keluar
          </BaseButton>
        </div>
      </header>

      <section class="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-lg shadow-slate-900/5 backdrop-blur">
        <div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div class="min-w-0">
            <SearchInput v-model="query" placeholder="Cari perusahaan..." />
          </div>
          <ToneBadge tone="lime">
            <Star class="mr-1 h-3.5 w-3.5" />
            {{ filtered.length }} company
          </ToneBadge>
        </div>

        <p
          v-if="errorMessage"
          class="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {{ errorMessage }}
        </p>
      </section>

      <section
        v-if="loading"
        class="rounded-2xl border border-white/80 bg-white/90 p-5 text-sm text-slate-500 shadow-lg shadow-slate-900/5 backdrop-blur"
      >
        Mengambil daftar company...
      </section>

      <section
        v-else-if="filtered.length === 0"
        class="rounded-2xl border border-white/80 bg-white/90 p-5 text-sm text-slate-500 shadow-lg shadow-slate-900/5 backdrop-blur"
      >
        Tidak ada company yang cocok.
      </section>

      <section
        v-else
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(260px,1fr))] lg:gap-4"
      >
        <article
          v-for="company in filtered"
          :key="company.id"
          class="group flex min-h-36 cursor-pointer flex-col justify-between rounded-2xl border bg-white/95 p-4 text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/10 lg:min-h-32"
          :class="
            String(selected) === String(company.id)
              ? 'border-[#b4db24] bg-[#fbfdf3] ring-2 ring-[#e1f1a7]'
              : 'border-slate-200'
          "
          @click="selected = company.id"
          @dblclick="handleCardDoubleClick(company.id)"
        >
          <div class="flex items-start gap-3">
            <div
              class="grid h-12 w-12 shrink-0 place-items-center rounded-xl lg:h-11 lg:w-11"
              :class="
                String(selected) === String(company.id)
                  ? 'bg-[#06131e] text-[#b4db24]'
                  : 'bg-slate-100 text-slate-500 group-hover:bg-[#e9f6fb] group-hover:text-[#24a1db]'
              "
            >
              <Building2 class="h-6 w-6 lg:h-5 lg:w-5" />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <h2 class="min-w-0 text-sm font-black leading-5 text-slate-950">
                  {{ company.name }}
                </h2>
                <span
                  v-if="String(selected) === String(company.id)"
                  class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#b4db24] text-[#06131e]"
                >
                  <Check class="h-3.5 w-3.5" />
                </span>
              </div>

              <div class="mt-2 flex flex-wrap gap-1.5">
                <ToneBadge tone="green">{{ company.user_role ?? 'Member' }}</ToneBadge>
                <ToneBadge tone="blue">
                  {{ company.tenant_database?.status ?? company.status ?? 'active' }}
                </ToneBadge>
              </div>
            </div>
          </div>

          <div class="mt-3 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <div class="min-w-0 text-xs text-slate-500">
              <div class="flex min-w-0 items-center gap-1.5">
                <Users class="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span class="truncate">Code: {{ company.code ?? '-' }}</span>
              </div>
            </div>

            <BaseButton
              v-if="String(selected) === String(company.id)"
              size="sm"
              :loading="selecting"
              @click.stop="handleContinue"
            >
              Masuk
              <ChevronRight class="h-3.5 w-3.5" />
            </BaseButton>
          </div>
        </article>
      </section>

      <footer
        class="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl shadow-slate-900/15 backdrop-blur lg:hidden"
      >
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-xs font-semibold text-slate-500">Company terpilih</p>
            <p class="truncate text-sm font-black text-slate-950">
              {{ selectedCompany?.name ?? 'Belum dipilih' }}
            </p>
          </div>
          <BaseButton
            class="shrink-0"
            size="md"
            :disabled="selected == null"
            :loading="selecting"
            @click="handleContinue"
          >
            Lanjutkan
            <ChevronRight class="h-4 w-4" />
          </BaseButton>
        </div>
      </footer>
    </div>
  </main>
</template>
