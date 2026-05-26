TASK TITLE:
Redesign Transaction Form Layout — Remove Inner Header Card and Attach Secondary Virtual Tabs to Form Content

PROJECT:
TenantAppDevelopment / frontend-vue

CONTEXT:
User memberikan screenshot form input Sales Quotation dan referensi aplikasi profesional.

Masalah pada form input saat ini:

1. Di dalam form masih ada card/section besar bertuliskan "Header".
2. Section "Header" memakan terlalu banyak ruang vertikal.
3. Secondary virtual tabs masih terasa terpisah dari form.
4. User ingin secondary virtual tabs terlihat seolah menempel dengan form content, seperti aplikasi ERP profesional.
5. Tujuannya agar jelas bahwa form yang sedang dibuka adalah bagian dari secondary tab aktif, misalnya:
   - Daftar
   - Data Baru
   - Data Baru 2
   - SQ-2026-0001
   - dan seterusnya.

REFERENCE:
Screenshot project saat ini:

- Sales Quotation form masih menampilkan card besar:
  - breadcrumb kecil "sales"
  - title "Sales Quotation"
  - subtitle "create"
  - card/section "Header"
- Ini harus dirapikan agar area form lebih hemat ruang.

Screenshot aplikasi profesional:

- Secondary tabs terlihat menempel langsung dengan area form.
- Tab aktif berada tepat di atas form content.
- Tidak ada header card besar yang membuang ruang.
- Form content langsung dimulai setelah tab aktif.

MAIN OBJECTIVE:
Ubah layout form input transaksi agar lebih compact dan profesional:

1. Hapus section/card "Header" yang ada di dalam form.
2. Jangan tampilkan lagi kotak besar hanya untuk label "Header".
3. Secondary virtual tabs harus secara visual menempel dengan form container.
4. Form content harus dimulai tepat di bawah secondary tabs.
5. Layout harus terasa seperti:
   secondary tabs = bagian atas dari workspace form.

SCOPE:
Fokus pada form input transaksi/workspace form, terutama:

- Sales Quotation create/edit form
- Form transaksi lain yang menggunakan layout/form wrapper yang sama
- Jika component form wrapper reusable, ubah di reusable component-nya
- Jika Sales Quotation punya layout khusus, perbaiki di sana dan pastikan pattern bisa dipakai ulang

Kemungkinan area/file:

- frontend-vue/src/components/workspace/\*
- frontend-vue/src/components/transaction-form/\*
- frontend-vue/src/pages/sales/\*
- frontend-vue/src/modules/sales/\*
- frontend-vue/src/features/sales/\*
- component form shell / form layout / workspace detail panel
- SecondaryVirtualTabs component jika spacing/position berasal dari sana

Search keyword:

- "Header"
- "Sales Quotation"
- "create"
- "Data Baru"
- "SecondaryVirtualTabs"
- "TransactionForm"
- "FormShell"
- "WorkspaceForm"
- "FormHeader"
- "TransactionHeader"
- "Rincian Data"

DO NOT RELIST ENTIRE REPOSITORY.
Search hanya file yang relevan.

REQUIRED DESIGN CHANGES:

A. Remove Inner Header Section
Hapus atau nonaktifkan rendering section/card yang hanya menampilkan:

- title "Header"
- card kosong besar
- wrapper header yang membuat form terlalu turun

Jika ada field header transaksi seperti customer, date, number, status, tax, discount:

- Jangan hapus field datanya.
- Yang dihapus hanya visual wrapper/section title "Header" yang memakan ruang.
- Field header tetap harus ada jika memang bagian dari form input.
- Jika field header belum tampil karena baru skeleton, jangan buat card kosong baru.

B. Compact Page Title
Bagian title atas seperti:

- sales
- Sales Quotation
- create

Boleh tetap ada, tetapi harus dibuat lebih compact.

Rekomendasi:

- Kurangi margin bottom.
- Jangan buat jarak besar sebelum form.
- Jika title sudah ada di secondary tab, boleh cukup tampilkan title kecil atau breadcrumb tipis.
- Jangan membuat area title lebih tinggi dari kebutuhan.

C. Secondary Virtual Tabs Attached to Form
Secondary virtual tabs harus terlihat menyatu dengan form container.

Expected structure:

[Secondary Tabs Row]
┌────────────────────────────────────────────┐
│ Form content starts here │
│ Header fields / main fields │
│ Rincian Data / line table │
└────────────────────────────────────────────┘

Visual rule:

- Secondary tabs berada tepat di atas form card/container.
- Tab aktif seolah menjadi bagian atas card.
- Hilangkan jarak/gap besar antara tabs dan form.
- Form container top border/radius harus disesuaikan agar tab terlihat menempel.
- Tab aktif boleh memiliki border bottom putih/transparent agar menyatu dengan form body.
- Tab inactive tetap terlihat sebagai tab kecil.
- Jangan beri margin vertikal besar antara tabs dan form content.

D. Form Container
Form container harus:

- tetap rounded dan rapi
- lebih compact
- tidak terlalu banyak padding atas
- tidak membuat section kosong
- tetap mengikuti theme warna existing
- tidak meniru warna screenshot profesional secara mentah jika tidak cocok dengan theme project

E. Rincian Data / Line Table
Bagian detail line seperti "Rincian Data" tetap boleh ada.
Tapi:

- pastikan posisinya tidak terlalu jauh dari top form
- jangan membuat jarak kosong besar
- table line tetap rapi
- jangan merusak dropdown product
- jangan merusak form line input

SPECIFIC UI TARGET:
Sebelum:
Secondary tabs terpisah
lalu ada area title
lalu card besar "Header"
lalu baru form/detail.

Sesudah:
Secondary tabs menempel ke form.
Form langsung berisi input utama / detail transaksi.
Tidak ada card kosong bertuliskan "Header".

Contoh target struktur:

Secondary tabs:
[ Daftar ] [ Data Baru x ] [ Data Baru 2 x ]

Form attached:
┌───────────────────────────────────────────────┐
│ Sales Quotation / Create compact title optional│
│ Main transaction fields if available │
│ Rincian Data │
│ Line table │
└───────────────────────────────────────────────┘

IMPORTANT:
Jika saat ini form memang belum punya field header lengkap dan hanya ada placeholder "Header":

- hapus placeholder itu.
- jangan ganti dengan placeholder baru.
- langsung tampilkan content yang sudah ada, seperti Rincian Data / line table.

VIRTUAL TABS RULE:
Jangan ubah logic virtual tabs.
Hanya ubah visual positioning/spacing agar secondary tabs terlihat attached dengan form.

Jangan merusak:

- open create secondary tab
- open edit secondary tab
- close secondary tab
- active secondary tab state
- dirty state
- draft state persistence
- list tab icon-only
- multiple "Data Baru" tabs
- switching primary tabs

FORM STATE RULE:
Jangan mengubah state form.
Jangan reset form ketika pindah tab.
Jangan membuat form unmount/remount berlebihan.
Jangan menghapus draft state.

DESIGN LOCK / REGRESSION GUARDRAIL:
Area yang sudah benar tidak boleh rusak.

Jangan mengubah:

- sidebar
- primary virtual tabs
- secondary virtual tabs behavior
- sales list toolbar
- search bar
- start date / end date filter
- filter button
- create button
- void button
- checkbox bulk selection
- table header sales list
- table row height list
- dropdown product behavior
- transaction line table behavior
- API/backend contract
- route names
- Pinia store contract

IMPLEMENTATION RULES:

1. Perubahan harus minimal dan fokus pada layout form.
2. Jika ada reusable FormShell/WorkspaceFormLayout, gunakan itu agar pattern konsisten.
3. Jangan membuat desain baru dari nol.
4. Jangan mengganti UI library.
5. Jangan menambahkan dependency baru.
6. Jangan mengubah business logic.
7. Jangan menghapus field transaksi yang diperlukan.
8. Jangan hardcode hanya untuk Sales Quotation jika ternyata layout ini dipakai banyak form.
9. Jika harus membuat class baru, beri nama jelas seperti:
   - attached-secondary-tabs
   - workspace-form-attached
   - transaction-form-compact
10. Jika memakai Tailwind, gunakan class yang konsisten dengan theme existing.

ACCEPTANCE CRITERIA:

1. Section/card "Header" kosong sudah tidak tampil.
2. Tidak ada lagi area besar yang hanya berisi text "Header".
3. Secondary virtual tabs terlihat menempel dengan form container.
4. Gap antara secondary tabs dan form content sangat kecil atau nol.
5. Form terlihat lebih compact.
6. Sales Quotation create form tidak terlalu banyak makan tempat di atas.
7. Rincian Data / detail line table tetap tampil.
8. Data Baru tab tetap aktif dan jelas terhubung dengan form yang dibuka.
9. Multiple secondary tabs tetap berjalan.
10. Close tab tetap berjalan.
11. Switching tab tidak menghilangkan form state.
12. Tidak ada regression pada Sales Quotation list toolbar.
13. Tidak ada regression pada checkbox bulk selection dan Void toolbar.
14. Tidak ada regression pada product dropdown / line table.

MANUAL TEST:
Lakukan test manual berikut:

1. Buka Sales Quotation list.
2. Klik Create Sales Quotation.
3. Pastikan secondary tab "Data Baru" muncul.
4. Pastikan form create muncul.
5. Pastikan section/card "Header" tidak ada.
6. Pastikan secondary tabs terlihat menempel dengan form.
7. Isi beberapa field atau line jika tersedia.
8. Buka tab lain.
9. Kembali ke Data Baru.
10. Pastikan form state tidak hilang.
11. Buka Data Baru kedua.
12. Pastikan kedua form punya secondary tab sendiri.
13. Tutup salah satu tab.
14. Pastikan tab lain tidak ikut rusak.
15. Kembali ke daftar.
16. Pastikan list layout sales tetap sama seperti sebelumnya.

COMMANDS:
Jika environment memungkinkan jalankan:

- npm run lint
- npm run typecheck
- npm run dev

Jika command tidak tersedia/gagal, jelaskan alasannya di final summary.

FINAL RESPONSE WAJIB:
Laporkan:

- file yang diubah
- component layout/form yang diperbaiki
- bagaimana section Header dihapus
- bagaimana secondary tabs dibuat attached dengan form
- hasil regression check
- command yang dijalankan dan hasilnya
- jika ada command gagal/tidak dijalankan, jelaskan alasannya

IMPORTANT SCOPE CLARIFICATION:
Perubahan ini berlaku untuk SEMUA form input transaksi dan master data yang memakai workspace/form layout, bukan hanya Sales Quotation.

Sales Quotation hanya contoh screenshot/reference.

Codex wajib mencari reusable form shell/layout yang dipakai bersama, lalu memperbaiki di level reusable component jika memungkinkan.

Target berlaku untuk:

- Sales Quotation form
- Sales Order form
- Sales Invoice form
- Purchase Request form
- Purchase Order form
- Vendor Bill form
- Journal Entry form
- Chart of Account form jika memakai layout yang sama
- Product form jika memakai layout yang sama
- form create/edit lain yang dibuka melalui secondary virtual tabs

RULE:
Jangan hardcode perbaikan hanya di Sales Quotation.
Jangan membuat solusi khusus sales saja jika ada reusable layout.
Jika form berbeda-beda tetapi memakai pola Header card kosong yang sama, hapus pola itu dari semua form terkait.
Jika ada satu component seperti:

- FormShell
- WorkspaceFormLayout
- TransactionFormLayout
- ModuleFormPage
- FormCard
- TransactionHeader
  maka perbaiki component tersebut agar semua form otomatis ikut compact.

ACCEPTANCE UPDATE:

- Sales Quotation create/edit form compact.
- Purchase Request create/edit form compact.
- Journal Entry create/edit form compact jika memakai workspace form.
- Semua form yang memakai secondary virtual tabs terlihat attached dengan form container.
- Tidak ada lagi placeholder/card kosong bertuliskan "Header" di seluruh form input.

COMMIT MESSAGE:
compact transaction form layout and attach secondary tabs
