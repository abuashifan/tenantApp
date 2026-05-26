# Point 9 - Company Settings Edit Surface

## Endpoint Status

Endpoint backend existing sudah lengkap dan tidak diubah:

| Endpoint | Middleware | Penggunaan Frontend |
|---|---|---|
| `GET /api/settings/company` | `auth:sanctum`, `company.access`, `permission:settings.company.view` | Memuat accounting dan module settings |
| `PATCH /api/settings/company/accounting` | `auth:sanctum`, `company.access`, `permission:settings.company.edit` | Menyimpan form accounting |
| `PATCH /api/settings/company/modules` | `auth:sanctum`, `company.access`, `permission:settings.company.edit` | Menyimpan module toggles |

API client existing tetap menyisipkan bearer token dan `X-Company-ID` dari active company store.

## Frontend Integration

- Route `/settings/company` kini route workspace eksplisit dan menu `Settings > Company Settings` ditandai implemented.
- Workspace registry mengarahkan route tersebut ke `CompanySettingsPage`, bukan generic backend resource.
- Service `src/services/settings/companySettings.service.ts` menyediakan GET dan dua PATCH typed.
- Info perusahaan bersifat read-only dan mengambil nama, kode, serta status dari company aktif; base currency serta ringkasan modul berasal dari settings response.

Backend GET settings tidak mengembalikan timezone atau profil perusahaan lengkap, sehingga halaman tidak mengarang field tersebut dan tidak menambahkan edit/create company.

## Supported Fields

Accounting settings yang ditampilkan dan disimpan mengikuti `UpdateCompanyAccountingSettingRequest`:

- `base_currency`, `amount_precision`, `quantity_precision`, `rounding_method`
- `transaction_workflow_mode`, `user_permission_mode`
- `auto_post_transactions`, `approval_enabled`, `tax_enabled`
- `allow_edit_transactions`, `allow_edit_posted_transactions`, `allow_void_transactions`
- `hide_voided_transactions`, `require_void_reason`
- `block_outside_current_fiscal_year`, `date_warning_enabled`
- `allow_backdated_transactions`, `max_backdate_days`
- `allow_future_transactions`, `max_future_days`

Module settings yang ditampilkan dan disimpan:

- `sales_enabled`, `purchase_enabled`, `cash_bank_enabled`
- `inventory_enabled`, `warehouse_enabled`, `fixed_asset_enabled`
- `approval_enabled`, `tax_enabled`, `reports_enabled`

## Permission And Error Behavior

- User dengan `settings.company.view` dapat membuka dan membaca halaman.
- Tombol save dan kontrol edit hanya aktif bila user memiliki `settings.company.edit`.
- Accounting dan module settings memiliki aksi save dan loading state terpisah.
- Setelah save berhasil, settings dimuat ulang agar normalisasi consistency backend terlihat di UI.
- Error `422` ditampilkan sebagai pesan dan daftar validasi field, termasuk validasi kombinasi workflow/approval.
- Error `403` pada PATCH ditampilkan sebagai penolakan permission yang jelas.

## Manual QA Checklist

- Masuk sebagai user dengan `settings.company.view` dan buka `/settings/company`; pastikan data berasal dari GET settings.
- Masuk dengan `settings.company.edit`, ubah accounting settings, simpan, dan pastikan data hasil refresh sesuai response backend.
- Ubah module toggle, simpan, dan pastikan module summary diperbarui.
- Pilih workflow `draft_approve_post` dengan approval nonaktif untuk memastikan error validasi tampil.
- Masuk sebagai viewer tanpa permission edit; pastikan settings terbaca dan tombol save tidak tersedia.
- Pastikan tidak ada UI pembuatan company/tenant dan pergantian company existing tetap tidak berubah.

## Verification

- `cd backend && php artisan route:list --path=api`: lulus, menampilkan 307 route termasuk tiga endpoint company settings.
- `cd backend && php artisan test --filter=CompanySetting`: lulus, 6 test dan 18 assertions.
- `cd backend && php artisan test --filter=Settings`: lulus, 11 test dan 25 assertions.
- `cd frontend-vue && npm run typecheck`: dijalankan dan gagal karena script package bernama `type-check`.
- `cd frontend-vue && npm run type-check`: lulus.
- `cd frontend-vue && npm run lint`: lulus.
- `cd frontend-vue && npm run build`: lulus.
- `git diff --check`: lulus.
