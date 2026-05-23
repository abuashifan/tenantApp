<template>
  <div class="space-y-6">
    <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-semibold text-[#1d81af]">Dashboard</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Selamat datang di workspace ERP.</h1>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Main AppShell ini menjadi fondasi untuk full sidebar, collapsed sidebar, floating submenu, topbar, primary tabs,
        dan secondary tabs.
      </p>
      <p class="mt-3 text-xs text-slate-400">
        TODO: Dashboard final menunggu design prototype/canvas untuk widget dan layout detail.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <div
        v-for="item in ['Kas & Bank', 'Piutang', 'Laba Rugi']"
        :key="item"
        class="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p class="text-sm font-semibold text-slate-500">{{ item }}</p>
        <p class="mt-3 text-2xl font-black text-slate-950">Rp 0</p>
        <p class="mt-2 text-xs text-slate-400">Placeholder dashboard metric</p>
      </div>
    </div>
  </div>
</template>
