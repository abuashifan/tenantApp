# Root Project

[ ] Buat folder accounting-app
[ ] Buat folder backend
[ ] Buat folder frontend
[ ] Buat folder docs
[ ] Buat folder backups
[ ] Setup Git repository
[ ] Buat .gitignore root
[ ] Buat README.md
[ ] Pastikan .env dan .sqlite tidak ikut Git

# Backend Laravel

[ ] Install Laravel di folder backend
[ ] Laravel bisa jalan di http://127.0.0.1:8000
[ ] Generate APP_KEY
[ ] Set APP_NAME
[ ] Set APP_URL
[ ] Set DB_CONNECTION=sqlite
[ ] Set DB_DATABASE=database/central.sqlite
[ ] Buat database/central.sqlite
[ ] Buat database/tenants
[ ] Buat database/tenants/.gitkeep
[ ] Jalankan php artisan migrate
[ ] Install Laravel Sanctum
[ ] Jalankan migration Sanctum
[ ] Setup CORS untuk localhost:3000

# Backend API

[ ] Buat routes/api.php
[ ] Buat GET /api/health
[ ] Buat ApiResponse trait
[ ] Buat HealthController
[ ] Test /api/health dari browser
[ ] Response API sudah punya format success/message/data

# Backend Tenant Foundation

[ ] Buat config/tenant.php
[ ] Tambahkan koneksi tenant di config/database.php
[ ] Buat TenantConnectionManager
[ ] Buat folder database/migrations/central
[ ] Buat folder database/migrations/tenant
[ ] Buat command tenant:check-storage
[ ] Test php artisan tenant:check-storage

# Backend Struktur Folder

[ ] Buat app/Services/Auth
[ ] Buat app/Services/Tenant
[ ] Buat app/Services/Accounting
[ ] Buat app/Services/Report
[ ] Buat app/Services/Database
[ ] Buat app/Services/Backup
[ ] Buat app/Http/Controllers/Api/Auth
[ ] Buat app/Http/Controllers/Api/Companies
[ ] Buat app/Http/Controllers/Api/Tenant
[ ] Buat app/Http/Controllers/Api/Accounting
[ ] Buat app/Http/Controllers/Api/Reports
[ ] Buat app/Http/Controllers/Api/Settings
[ ] Buat app/Http/Requests/Auth
[ ] Buat app/Http/Requests/Companies
[ ] Buat app/Http/Requests/Accounting

# Frontend Next.js

[ ] Install Next.js di folder frontend
[ ] Pilih TypeScript
[ ] Pilih App Router
[ ] Pilih TailwindCSS
[ ] Next.js bisa jalan di http://localhost:3000
[ ] Buat .env.local
[ ] Set NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
[ ] Buat .env.example

# Frontend Struktur

[ ] Buat components/layout
[ ] Buat components/ui
[ ] Buat features/auth
[ ] Buat features/companies
[ ] Buat features/accounting
[ ] Buat hooks
[ ] Buat lib
[ ] Buat store
[ ] Buat types
[ ] Buat lib/api.ts
[ ] Buat types/api.ts
[ ] Buat components/layout/AppShell.tsx
[ ] Buat app/dashboard/page.tsx

# Integration Check

[ ] Backend jalan
[ ] Frontend jalan
[ ] Frontend bisa fetch /api/health
[ ] Halaman utama menampilkan API Status: ok
[ ] Halaman /dashboard bisa dibuka
[ ] Tidak ada error CORS
[ ] Tidak ada file .sqlite masuk Git
[ ] Tidak ada file .env masuk Git
