# Phase 3B — Tenant Migration Runner (Internal)

Phase 3B menambahkan **runner migration tenant internal** via Artisan command. Tidak ada endpoint publik atau UI frontend untuk migrate tenant.

## Tujuan

- Menjalankan migration **khusus tenant** pada koneksi `tenant`
- Migration yang dijalankan hanya dari path `backend/database/migrations/tenant`
- Mendukung migrate 1 tenant (berdasarkan `company_id`) dan migrate semua tenant aktif

## Security & Batasan

- Tidak ada endpoint publik untuk migrate tenant
- Tidak ada UI frontend migrate tenant
- Command ini hanya untuk operator/server admin

## Command yang Tersedia

### Migrate satu tenant

`php artisan tenant:migrate --company-id=3`

### Migrate semua tenant aktif

`php artisan tenant:migrate --all`

## Migration Path yang Digunakan

- `database/migrations/tenant`
- Connection: `tenant`

Runner **tidak** menjalankan migration central dan **tidak** menjalankan migration default `database/migrations`.

## Validasi yang Dilakukan

Untuk `--company-id`:
- `company_id` harus integer
- company harus ada dan status `active`
- tenant_databases untuk company harus ada dan status `active`
- `database_name` tidak boleh kosong
- file SQLite tenant harus ada dan writable
- migration path `database/migrations/tenant` harus ada

Untuk `--all`:
- mengambil hanya `tenant_databases` status `active`
- jika tidak ada tenant aktif: menampilkan pesan jelas
- menjalankan migration satu per satu dan menampilkan summary
- return `FAILURE` jika minimal satu tenant gagal

## Manual Testing Checklist

1. Pastikan tenant sudah dibuat (Phase 3A):

`php artisan tenant:create --name="PT Contoh Baru" --slug="pt-contoh-baru" --owner-email="admin@example.com"`

2. Pastikan folder migration tenant ada:

`backend/database/migrations/tenant`

3. Jalankan migration tenant tertentu:

`php artisan tenant:migrate --company-id=3`

4. Jalankan migration semua tenant aktif:

`php artisan tenant:migrate --all`

## Notes Commit

- Pastikan commit hanya mencakup service + command + docs Phase 3B.

