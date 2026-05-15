# Phase 3A — Tenant Generator (Internal)

Phase 3A menambahkan **tenant provisioning internal** berbasis Artisan command. Ini hanya untuk operator/staf internal dan **tidak menyediakan endpoint publik** untuk membuat company/tenant.

## Tujuan

- Membuat company baru di central database (`central.sqlite`)
- Membuat file SQLite tenant baru di `backend/database/tenants`
- Membuat metadata tenant di `tenant_databases`
- Menghubungkan owner user ke company melalui `company_users` (role `owner`)

## Security & Batasan

- Tidak ada endpoint publik `POST /api/companies`
- Tidak ada endpoint publik `POST /api/tenants`
- Tidak ada UI frontend untuk create company/tenant
- Pembuatan tenant/company **hanya** lewat command internal: `php artisan tenant:create`

## Command yang Tersedia

### 1) Mode interaktif

Jalankan:

`php artisan tenant:create`

Lalu isi prompt:
- Company name
- Company slug
- Owner user email

### 2) Mode non-interaktif

Contoh:

`php artisan tenant:create --name="PT Contoh Baru" --slug="pt-contoh-baru" --owner-email="admin@example.com"`

## Hasil yang Dibuat Command

Saat sukses, command akan:
1. Membuat record `companies` (status `active`)
2. Membuat file tenant SQLite: `backend/database/tenants/company_00000X.sqlite`
3. Membuat record `tenant_databases` (status `active`)
4. Membuat record `company_users` untuk owner (role `owner`, status `active`)

Database name menggunakan format berbasis `company.id`, contoh:
- company id = 3 → `company_000003.sqlite`

## Hal yang Tidak Dikerjakan di Phase 3A

- Endpoint API create company/tenant
- UI frontend create company/tenant
- Tenant migration akuntansi
- Modul akuntansi (COA, jurnal, invoice, inventory, laporan, dll)

