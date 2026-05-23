# Phase V0 — Vue Frontend Project Setup & Library Installation (Result)

Tanggal: 2026-05-23

## Output

- Folder baru: `frontend-vue/`
- Vue 3 + Vite + TypeScript aktif
- Vue Router 4 aktif
- Pinia aktif
- TailwindCSS aktif (via `@tailwindcss/vite` + `src/assets/main.css`)
- Placeholder routes tersedia:
  - `/login`
  - `/select-company`
  - `/dashboard`

## File/folder penting yang dibuat/diubah

- `frontend-vue/.env.example`
- `frontend-vue/src/api.ts` (Axios instance)
- `frontend-vue/src/router/index.ts` (routes placeholder)
- `frontend-vue/src/assets/main.css` (Tailwind import)
- `frontend-vue/src/pages/auth/LoginPage.vue`
- `frontend-vue/src/pages/auth/SelectCompanyPage.vue`
- `frontend-vue/src/pages/dashboard/DashboardPage.vue`
- Struktur folder `frontend-vue/src/components/*`, `frontend-vue/src/composables/*`, `frontend-vue/src/layouts/*`, `frontend-vue/src/pages/*`

## Dependency yang ditambahkan

Dependencies:

- `axios`
- `@tanstack/vue-table`
- `vee-validate`
- `zod` (v3.x untuk kompatibilitas `@vee-validate/zod`)
- `@vee-validate/zod`
- `vue-router` (v4.x)

Dev dependencies:

- `tailwindcss`
- `@tailwindcss/vite`

## Script package.json

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run type-check`
- `npm run lint`
- `npm run format`

## Command yang dijalankan (hasil)

- `cd frontend-vue && npm install` ✅
- `cd frontend-vue && npm install axios @tanstack/vue-table vee-validate zod @vee-validate/zod` ✅
- `cd frontend-vue && npm install vue-router@^4` ✅
- `cd frontend-vue && npm install -D tailwindcss @tailwindcss/vite` ✅
- `cd frontend-vue && npm run type-check` ✅
- `cd frontend-vue && npm run lint` ✅
- `cd frontend-vue && npm run build` ✅

Catatan: saat beberapa `npm install` muncul warning peer dependency dari dependency tooling Vite devtools. Install tetap sukses dan `npm run build` berhasil.

## Batasan yang sengaja tidak dikerjakan

- Tidak membuat dashboard/sidebar/AppShell final, form bisnis, table bisnis, atau design system (menunggu design spec canvas/prototype).
- Tidak mengubah backend.
- Tidak menghapus atau mengubah Next.js frontend existing (`frontend/`).

## Konfirmasi

- Backend tidak diubah ✅
- Next.js frontend existing tidak dihapus/diubah ✅
- UI final belum dibuat (design-first rule) ✅
