# Central Database Schema (central.sqlite)

Dokumen ini menjelaskan **central database** untuk aplikasi akuntansi multi-company (multi-tenant) dengan 1 domain:

- **Central DB**: menyimpan identitas user, perusahaan, akses user ke perusahaan, subscription, dan metadata tenant DB.
- **Tenant DB (per company)**: menyimpan data transaksi akuntansi (bukan bagian Phase 1A/1B).

Lokasi:
- Central: `backend/database/central.sqlite`
- Tenant folder: `backend/database/tenants/`

## Tujuan Central Database

1. Menjadi sumber kebenaran untuk: user, perusahaan, membership/peran, subscription, dan penunjuk database tenant.
2. Memungkinkan 1 user memiliki akses ke banyak perusahaan.
3. Menjadi dasar untuk pemilihan tenant DB saat user bekerja pada perusahaan tertentu.

## Daftar Tabel Central

- `users`
  - Profil user, status, metadata login (contoh `last_login_at`).
- `companies`
  - Master data perusahaan (nama, slug, kode, status, dll).
- `company_users`
  - Pivot akses user ke perusahaan: `role`, `status`, `joined_at`, dll.
- `tenant_databases`
  - Metadata koneksi tenant per perusahaan (nama file/path SQLite, status provisioning, metadata).
- `plans`
  - Master paket berlangganan (kuota/fitur/harga).
- `subscriptions`
  - Subscription per company ke plan tertentu (trial/active/dll).
- `company_invitations`
  - Undangan user ke company (email, role, token, status).
- `activity_logs`
  - Audit log aktivitas user/company, subject polymorphic, properties JSON.

## Relasi Utama

Alur relasi yang paling penting:

`users` → `company_users` → `companies` → `tenant_databases`

Ringkasnya:
- user memiliki akses ke banyak company melalui `company_users`
- setiap company memiliki 1 tenant DB yang direferensikan oleh `tenant_databases`

## Access Flow (Gambaran Besar)

1. User login (akan dibuat di Phase 2; belum ada auth final di Phase 1).
2. Sistem membaca `central.sqlite`.
3. Sistem mengembalikan daftar perusahaan yang bisa diakses user.
4. User memilih perusahaan aktif (company switcher final akan dibuat di Phase 2).
5. Frontend mengirim header `X-Company-ID` pada request.
6. Backend memvalidasi bahwa user memiliki akses ke `company_id` pada `company_users`.
7. Backend menghubungkan koneksi DB ke tenant SQLite perusahaan terpilih (path di `tenant_databases.database_path`).

