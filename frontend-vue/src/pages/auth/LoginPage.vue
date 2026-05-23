<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-vue-next'

import AuthShell from '@/components/auth/AuthShell.vue'
import AuthTextField from '@/components/auth/AuthTextField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'
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

type LoginData = {
  user: { id: string | number; name: string; email: string }
  token: string
  token_type: 'Bearer'
}

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    const res = await api.post<ApiResponse<LoginData>>('/auth/login', {
      email: email.value,
      password: password.value,
    })
    const data = unwrap(res.data)
    auth.setAuth({ token: data.token, user: data.user })

    // After login, fetch companies and go to select-company.
    const companiesRes = await api.get<ApiResponse<unknown[]>>('/companies')
    const companiesData = unwrap(companiesRes.data) as Array<{ id: string | number; name: string; user_role?: string }>
    company.setCompanies(companiesData.map((c) => ({ id: c.id, name: c.name, user_role: c.user_role })))

    const next = (route.query.next as string | undefined) ?? '/select-company'
    await router.push(next)
  } catch (e) {
    const message =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      (e as Error).message ??
      'Login gagal'
    errorMessage.value = message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell>
    <div class="w-full max-w-md">
      <div class="mb-8 text-center lg:text-left">
        <div class="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#06131e] text-[#b4db24] lg:mx-0">
          <ShieldCheck class="h-7 w-7" />
        </div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-950">Masuk ke akun</h2>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          Gunakan email dan password yang terdaftar untuk mengakses workspace perusahaan.
        </p>
      </div>

      <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
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
