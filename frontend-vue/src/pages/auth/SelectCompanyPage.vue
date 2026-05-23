<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { ArrowLeftRight, Building2, Check, ChevronRight, LogOut, Star, Users } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import ToneBadge from '@/components/ui/ToneBadge.vue'
import { useCompanyStore } from '@/stores/companyStore'
import { useAuthStore } from '@/stores/authStore'

type CompanyItem = {
  id: number
  name: string
  role: string
  status: 'active'
  plan: string
  lastAccess: string
}

const companies: CompanyItem[] = [
  {
    id: 1,
    name: 'PT Maju Jaya',
    role: 'Owner',
    status: 'active',
    plan: 'Professional',
    lastAccess: 'Hari ini, 09:42',
  },
  {
    id: 2,
    name: 'CV Sumber Rejeki',
    role: 'Admin',
    status: 'active',
    plan: 'Starter',
    lastAccess: 'Kemarin, 18:10',
  },
  {
    id: 3,
    name: 'PT Contoh Demo',
    role: 'Finance Manager',
    status: 'active',
    plan: 'Trial',
    lastAccess: '2 hari lalu',
  },
]

const router = useRouter()
const companyStore = useCompanyStore()
const authStore = useAuthStore()

const query = ref('')
const selected = ref<number>(companies[0]?.id ?? 1)

const filtered = computed(() =>
  companies.filter((c) => c.name.toLowerCase().includes(query.value.trim().toLowerCase())),
)

function notify(message: string) {
  alert(message)
}

function handleLogout() {
  authStore.clearAuth()
  notify('Logout (placeholder)')
}

function handleContinue() {
  companyStore.setCompanies(companies)
  companyStore.setActiveCompany(selected.value)
  router.push('/dashboard')
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

        <BaseButton variant="secondary" size="lg" @click="handleLogout">
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

          <div class="space-y-4">
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
                      <ToneBadge tone="green">{{ company.role }}</ToneBadge>
                      <ToneBadge tone="blue">{{ company.plan }}</ToneBadge>
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
                Akses terakhir: {{ company.lastAccess }}
              </div>
            </button>
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-slate-500">
              Company terpilih akan menjadi konteks tenant untuk dashboard dan seluruh modul ERP.
            </p>
            <BaseButton class="sm:min-w-44" size="lg" @click="handleContinue">
              Lanjutkan
              <ChevronRight class="h-4 w-4" />
            </BaseButton>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
