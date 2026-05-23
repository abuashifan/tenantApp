<script setup lang="ts">
import { BarChart3, Building2, CheckCircle2, Layers3 } from 'lucide-vue-next'

import AuthFeatureCard from '@/components/auth/AuthFeatureCard.vue'
</script>

<template>
  <main
    class="min-h-screen bg-[radial-gradient(circle_at_top_left,#f7fbe9,transparent_32%),linear-gradient(135deg,#f8fafc_0%,#edf7f5_48%,#e9f6fb_100%)] p-6 text-slate-900"
  >
    <div
      class="mx-auto grid min-h-[calc(100vh-48px)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 shadow-2xl shadow-slate-900/10 backdrop-blur lg:grid-cols-[1.05fr_0.95fr]"
    >
      <section class="relative hidden overflow-hidden bg-[#06131e] p-10 text-white lg:block">
        <div
          class="absolute inset-0 opacity-25"
          style="
            background: radial-gradient(circle at 20% 18%, #b4db24 0, transparent 24%),
              radial-gradient(circle at 82% 10%, #24a1db 0, transparent 22%),
              radial-gradient(circle at 54% 92%, #4bb496 0, transparent 28%);
          "
        />
        <div class="absolute right-[-120px] top-24 h-80 w-80 rounded-full border border-white/10" />
        <div class="absolute bottom-[-90px] left-[-80px] h-72 w-72 rounded-full border border-[#b4db24]/20" />

        <div class="relative z-10 flex h-full flex-col justify-between">
          <div>
            <div class="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
              <div class="grid h-10 w-10 place-items-center rounded-xl bg-[#b4db24] text-[#06131e]">
                <Building2 class="h-5 w-5" />
              </div>
              <div>
                <p class="text-sm font-semibold text-white">Akuntansiku ERP</p>
                <p class="text-xs text-white/60">Accounting workspace</p>
              </div>
            </div>

            <div class="mt-16 max-w-xl">
              <p
                class="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#f0f8d3] ring-1 ring-white/15"
              >
                ERP Accounting System
              </p>
              <h1 class="text-5xl font-bold tracking-tight">
                Kelola akuntansi perusahaan dalam satu workspace yang rapi.
              </h1>
              <p class="mt-6 text-base leading-8 text-white/70">
                Login aman untuk mengakses dashboard, jurnal, laporan, sales, purchase, cash bank, dan inventory sesuai
                hak akses perusahaan.
              </p>
            </div>

            <div class="mt-10 grid max-w-xl grid-cols-2 gap-4">
              <AuthFeatureCard
                title="Financial Control"
                description="Data jurnal dan laporan berbasis tenant aktif."
                tone="lime"
              >
                <BarChart3 class="h-5 w-5" />
              </AuthFeatureCard>
              <AuthFeatureCard
                title="Multi Company"
                description="Satu user dapat memiliki akses ke beberapa perusahaan."
                tone="blue"
              >
                <Layers3 class="h-5 w-5" />
              </AuthFeatureCard>
            </div>
          </div>

          <div class="grid gap-3 rounded-3xl bg-white/10 p-5 ring-1 ring-white/15">
            <div class="flex items-center gap-3 text-sm text-white/80">
              <CheckCircle2 class="h-5 w-5 text-[#b4db24]" />
              Akses perusahaan divalidasi sesuai role user
            </div>
            <div class="flex items-center gap-3 text-sm text-white/80">
              <CheckCircle2 class="h-5 w-5 text-[#b4db24]" />
              Tenant aktif dikirim melalui X-Company-ID
            </div>
            <div class="flex items-center gap-3 text-sm text-white/80">
              <CheckCircle2 class="h-5 w-5 text-[#b4db24]" />
              Create tenant/company tidak tersedia untuk client
            </div>
          </div>
        </div>
      </section>

      <section class="flex items-center justify-center p-6 sm:p-10">
        <slot />
      </section>
    </div>
  </main>
</template>
