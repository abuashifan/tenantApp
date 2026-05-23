Kita lanjut pengembangan frontend TenantAppDevelopment.

TUGAS:
Buat / rapikan Login Card yang responsif untuk halaman login, support mobile view dan desktop view, menggunakan TailwindCSS.

PENTING:
Login card / halaman root yang sekarang berisi:

- Phase 0 Check
- Accounting App
- API Status
- Login / Register button

JANGAN DIHAPUS dulu.
Pertahankan halaman development check tersebut selama project masih development progress.

Artinya:

- Jangan ubah frontend/app/page.tsx jika itu masih dipakai sebagai Phase 0 Check / development check page.
- Buat atau update halaman login production-style di frontend/app/login/page.tsx.
- Jika sudah ada frontend/app/login/page.tsx, rapikan desainnya.
- Jika belum ada, buat halaman login baru.

KONTEKS PROJECT:

- Frontend: Next.js App Router
- Styling: TailwindCSS
- Backend API: Laravel API
- Login endpoint: POST /api/auth/login
- Setelah login sukses, frontend menyimpan token dan user.
- Setelah login sukses, arahkan user ke /select-company atau flow existing yang sudah ada.
- Project multi-tenant: user login dulu, lalu memilih company aktif.

FILE YANG WAJIB DIBACA:

- frontend/app/page.tsx
- frontend/app/login/page.tsx jika sudah ada
- frontend/lib/api.ts
- frontend/types/api.ts
- frontend/types/auth.ts jika sudah ada
- frontend/app/register/page.tsx jika sudah ada sebagai style reference
- frontend/app/select-company/page.tsx jika sudah ada sebagai style reference
- frontend/components/layout/AppShell.tsx jika diperlukan untuk konsistensi warna

JANGAN:

- Jangan hapus Phase 0 Check page.
- Jangan ubah backend.
- Jangan ubah endpoint API.
- Jangan membuat register flow baru.
- Jangan membuat company creation.
- Jangan membuat dashboard baru.
- Jangan menambah UI library baru.
- Jangan memakai CSS module atau file CSS custom baru.
- Jangan memakai inline style.
- Jangan memakai plain CSS.
- Semua styling wajib memakai TailwindCSS.

DESIGN GOAL:
Login page harus terlihat seperti aplikasi SaaS accounting yang clean, modern, aman, dan profesional.

Gunakan konsep warna yang sudah ada di frontend saat ini:

- Background utama: slate / soft gray
- Primary button: dark navy / slate-900
- Text utama: slate-900
- Text secondary: slate-500 / slate-600
- Border: slate-200
- Card: white
- Accent boleh memakai blue ringan jika sudah sesuai style existing

LAYOUT RESPONSIVE:

Desktop:

- Gunakan layout 2 kolom.
- Kiri: branding / short value proposition.
- Kanan: login card.
- Login card maksimal lebar sekitar 420px - 460px.
- Page full height min-h-screen.
- Background soft slate.
- Card rounded-2xl atau rounded-3xl.
- Gunakan shadow halus dan border.

Mobile:

- Layout 1 kolom.
- Branding panel besar disembunyikan atau diringkas.
- Login card berada di tengah.
- Padding nyaman untuk layar kecil.
- Form input full width.
- Tidak boleh overflow horizontal.
- Button full width.
- Text tetap mudah dibaca.

LOGIN CARD CONTENT:
Login card minimal berisi:

1. App identity
   - Accounting App
   - optional small logo mark berbentuk kotak/rounded dengan huruf A

2. Title
   - "Masuk ke akun Anda"

3. Subtitle
   - "Kelola pembukuan, transaksi, dan laporan perusahaan dalam satu sistem."

4. Email input
   - label: Email
   - type email
   - placeholder: nama@email.com
   - autocomplete email

5. Password input
   - label: Password
   - type password
   - placeholder: Masukkan password
   - autocomplete current-password
   - tombol show/hide password

6. Remember me checkbox
   - label: Ingat saya

7. Forgot password link
   - tampilkan sebagai placeholder link
   - jika belum ada route forgot password, gunakan href="#"
   - jangan implement backend forgot password

8. Submit button
   - text normal: Masuk
   - loading: Memproses...
   - disable saat loading

9. Error message
   - tampilkan error login dengan bahasa user-friendly
   - jangan tampilkan error teknis mentah ke user
   - contoh: "Email atau password tidak sesuai."

10. Footer text

- "Belum punya akun? Hubungi admin perusahaan."
- Jika register page existing tetap ada, boleh link ke /register.
- Jika project policy tidak mengizinkan self-register, arahkan ke info admin saja.

STATE YANG WAJIB ADA:

- email state
- password state
- remember me state
- showPassword state
- loading state
- error state

BEHAVIOR:

1. Saat submit:
   - prevent default
   - clear error
   - loading true
   - call login API sesuai pattern existing frontend/lib/api.ts

2. Jika login sukses:
   - simpan auth_token sesuai pattern existing
   - simpan auth_user jika response menyediakan user
   - redirect sesuai flow existing:
     - jika project sudah punya select company flow, redirect ke /select-company
     - jika existing login page sudah punya logic GET /companies dan auto redirect, pertahankan logic existing itu

3. Jika login gagal:
   - tampilkan error card kecil di atas form
   - jangan crash page
   - loading false

4. Jika NEXT_PUBLIC_API_URL belum configured:
   - tampilkan error user-friendly
   - jangan tampilkan stack trace

TAILWIND REQUIREMENTS:

- Gunakan class Tailwind langsung di JSX.
- Tidak membuat file CSS tambahan.
- Gunakan utility class seperti:
  min-h-screen
  bg-slate-100
  grid
  lg:grid-cols-2
  rounded-2xl
  border
  border-slate-200
  shadow-sm / shadow-xl
  text-slate-900
  text-slate-500
  bg-slate-900
  hover:bg-slate-800
  focus:ring-4
  focus:ring-slate-200
  disabled:opacity-60

ACCESSIBILITY:

- Semua input punya label.
- Button show/hide password punya type="button".
- Submit button punya disabled state.
- Error message bisa dibaca jelas.
- Gunakan focus ring yang terlihat.
- Jangan hanya mengandalkan warna untuk error.

VALIDASI FRONTEND MINIMAL:

- Email wajib diisi.
- Password wajib diisi.
- Jika kosong, tampilkan error sederhana sebelum call API.
- Jangan menambahkan library validasi baru.

DESKTOP BRANDING PANEL:
Di desktop, buat panel kiri berisi:

- Logo / app name
- Heading:
  "Akuntansi bisnis lebih rapi dalam satu sistem."
- Deskripsi pendek:
  "Pantau transaksi, laporan keuangan, dan akses perusahaan dari satu akun yang aman."
- 3 atau 4 highlight kecil:
  - Multi Company
  - Tenant Database
  - Audit Ready
  - Secure Access

Di mobile, branding panel ini boleh disembunyikan agar login fokus.

OUTPUT YANG DIHARAPKAN:

- frontend/app/page.tsx tetap menjadi Phase 0 Check / development check jika sebelumnya begitu.
- frontend/app/login/page.tsx menjadi login form responsif production-style.
- Styling memakai TailwindCSS.
- Tidak ada custom CSS.
- Tidak ada backend changes.
- Login flow existing tetap berjalan.

TEST MANUAL:
Jalankan:

cd backend
php artisan serve

cd frontend
npm run dev

Cek:

- http://localhost:3000
  Harus tetap menampilkan Phase 0 Check / development check.

- http://localhost:3000/login
  Harus menampilkan login card baru.

Mobile check:

- Buka DevTools responsive mode.
- Pastikan layout tidak overflow.
- Input dan button full width.
- Branding besar tidak mengganggu mobile view.

Desktop check:

- Layout 2 kolom tampil rapi.
- Login card berada di sisi kanan.
- Branding panel tampil di sisi kiri.

FINAL SUMMARY WAJIB:
Setelah selesai, jelaskan:

- file yang dibuat
- file yang diubah
- apakah frontend/app/page.tsx dipertahankan
- bagaimana responsive behavior mobile/desktop
- bagaimana login flow bekerja
- command yang dijalankan
- command yang gagal atau belum dijalankan

COMMIT MESSAGE:
improve responsive login card design
