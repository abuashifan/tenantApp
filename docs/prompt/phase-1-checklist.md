# Phase 1 Checklist (1A + 1B)

Checklist ini untuk memastikan hasil Phase 1 berjalan konsisten (central schema + demo seed + demo endpoint + demo frontend).

## Central Migration (1A)

- [ ] `php artisan migrate:status` menunjukkan semua migration central utama **Ran**
- [ ] Tidak ada duplikasi migration `personal_access_tokens`
- [ ] Semua table central ada: `users`, `companies`, `company_users`, `tenant_databases`, `plans`, `subscriptions`, `company_invitations`, `activity_logs`

## Model (1A)

- [ ] Semua model ada di namespace `App\Models`
- [ ] `User` tetap memakai `Laravel\\Sanctum\\HasApiTokens`
- [ ] Relationship utama berjalan: `User->companies`, `Company->tenantDatabase`, `Company->activeSubscription->plan`

## Seeder (1B)

- [ ] `PlanSeeder` memakai `updateOrCreate` berdasarkan `code`
- [ ] `DemoCentralSeeder` membuat:
  - [ ] user demo (`admin@example.com`)
  - [ ] 2 company demo (`pt-maju-jaya`, `cv-sumber-rejeki`)
  - [ ] pivot `company_users` sesuai role
  - [ ] metadata `tenant_databases` untuk masing-masing company
  - [ ] subscription trial menggunakan plan `free`
  - [ ] file tenant SQLite demo dibuat jika belum ada (tanpa overwrite)

## Endpoint Demo (1B)

- [ ] `GET /api/my-companies-demo` mengembalikan 2 company demo
- [ ] Endpoint tidak diproteksi auth (sementara)
- [ ] Endpoint diberi komentar untuk dihapus/diganti di Phase 2

## Frontend Demo (1B)

- [ ] Halaman `GET /companies-demo` menampilkan 2 card perusahaan
- [ ] Memakai Tailwind: background `slate-100`, card putih `rounded-2xl border shadow-sm`
- [ ] Responsive grid: 1 kolom mobile, 2 kolom desktop

## Testing Commands

Backend:
- `cd backend`
- `php artisan migrate:fresh --seed`
- `php artisan migrate:status`
- `php artisan tinker`
- Tinker test:
  - `$user = App\\Models\\User::where('email', 'admin@example.com')->first();`
  - `$user->companies->pluck('name');`
- `php artisan serve`
- Buka: `http://127.0.0.1:8000/api/my-companies-demo`

Frontend:
- `cd frontend`
- `npm run dev`
- Buka: `http://localhost:3000/companies-demo`

