<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-vue-next'

import AuthShell from '@/components/auth/AuthShell.vue'
import AuthTextField from '@/components/auth/AuthTextField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { fetchCompanies } from '@/services/companyApi'
import { normalizeApiError } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'

const email = ref('admin@example.com')
const password = ref('password')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const company = useCompanyStore()

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    await auth.login({
      email: email.value,
      password: password.value,
    })

    const companies = await fetchCompanies()
    company.setCompanies(companies)
    company.clearActiveCompany()

    const next = (route.query.next as string | undefined) ?? '/select-company'
    await router.push(next)
  } catch (e) {
    const error = normalizeApiError(e)
    errorMessage.value =
      error.status === 0
        ? 'Network Error: tidak bisa terhubung ke API. Pastikan backend jalan dan Vite proxy/env sudah benar.'
        : error.message || 'Login gagal'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell>
    <div class="w-full max-w-md">
      <div class="mb-8 text-center lg:text-left">
        <div
          class="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#06131e] text-[#b4db24] lg:mx-0"
        >
          <ShieldCheck class="h-7 w-7" />
        </div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-950">Masuk ke akun</h2>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          Gunakan email dan password yang terdaftar untuk mengakses workspace perusahaan.
        </p>
      </div>

      <div
        class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"
      >
        <form class="space-y-5" @submit.prevent="handleLogin">
          <AuthTextField
            v-model="email"
            label="Email"
            type="email"
            placeholder="nama@email.com"
            :icon="Mail"
          />

          <AuthTextField
            v-model="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Masukkan password"
            :icon="LockKeyhole"
          >
            <template #right>
              <button
                type="button"
                class="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-5 w-5" />
                <Eye v-else class="h-5 w-5" />
              </button>
            </template>
          </AuthTextField>

          <BaseButton class="w-full" size="lg" type="submit" :loading="loading">
            Masuk
            <ArrowRight class="h-4 w-4" />
          </BaseButton>
        </form>

        <p v-if="errorMessage" class="mt-4 text-sm font-semibold text-rose-600">
          {{ errorMessage }}
        </p>

        <div class="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
          Jika lupa password, hubungi administrator perusahaan.
        </div>
      </div>
    </div>
  </AuthShell>
</template>
