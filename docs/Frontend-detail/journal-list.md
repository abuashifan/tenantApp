Kamu bekerja pada project frontend Next.js + Tailwind CSS untuk TenantApp.

Tugas:
Implementasikan desain workspace List Journal berdasarkan konsep berikut ke halaman/fitur List Journal yang sudah ada di project.

Target:

- Cari halaman/component List Journal / General Journal / Journal List yang sudah ada.
- Jangan membuat halaman baru jika halaman list journal sudah tersedia.
- Refactor UI list journal agar mengikuti desain workspace berikut:
  1. Filter card di bagian atas.
  2. Tabel list jurnal di bawahnya.
  3. Tidak perlu sidebar/layout dashboard baru.
  4. Gunakan layout, warna, spacing, border, rounded, shadow, dan style Tailwind yang konsisten dengan project existing.

Fitur filter yang harus ada:

1. Filter tanggal awal:
   - input type date
   - state: dateFrom
   - ditempatkan di depan search bar.

2. Filter tanggal akhir:
   - input type date
   - state: dateTo
   - ditempatkan setelah tanggal awal.

3. Filter Jenis Transaksi:
   - bukan select biasa.
   - gunakan dropdown card berisi checkbox multi-select.
   - bisa memilih lebih dari satu jenis transaksi.
   - pilihan minimal:
     - Jurnal Umum / general_journal
     - Depresiasi / depreciation
     - Sales Invoice / sales_invoice
     - Vendor Payment / vendor_payment
     - Cash Receipt / cash_receipt
   - Jika project punya enum/constant transaction type existing, gunakan data existing project, jangan hardcode jika sudah tersedia.

4. Search bar:
   - cari berdasarkan nomor jurnal, deskripsi, source type, source number, atau created_by.
   - posisinya setelah filter jenis transaksi.

5. Filter Status:
   - dropdown card checkbox multi-select.
   - bisa memilih lebih dari satu status.
   - pilihan minimal:
     - draft
     - approved
     - posted
     - void
   - Jika project punya enum/constant status existing, gunakan data existing project.

6. Clear Filter:
   - tombol untuk reset:
     - dateFrom
     - dateTo
     - search
     - selectedTransactionTypes
     - selectedStatuses
     - selectedJournalIds
   - Tombol disabled jika tidak ada filter aktif dan tidak ada jurnal terpilih.

Behavior dropdown checkbox:

- Dropdown card harus tertutup otomatis ketika user klik di luar container selection list.
- Gunakan useRef + useEffect untuk click outside.
- Tetap bisa memilih banyak checkbox tanpa dropdown langsung tertutup.
- Di dalam dropdown sediakan tombol kecil "Reset filter" untuk clear pilihan pada dropdown tersebut saja.

Tabel List Journal:
Kolom tabel:

1. Checkbox selection
2. No. Jurnal
3. Tanggal
4. Deskripsi
5. Sumber
6. Status
7. Debit
8. Credit

Hapus/ganti kolom action Detail:

- Jangan tampilkan tombol Detail di kolom action.
- Ganti dengan checkbox selection di kolom paling kiri.

Selection behavior:

- Ada checkbox select-all di header tabel.
- Select-all hanya memilih jurnal yang sedang terlihat setelah filter.
- Jurnal dengan status `void` tidak boleh bisa dipilih.
- Checkbox jurnal status void harus disabled.
- Jika user klik select-all lagi saat semua visible selectable row sudah dipilih, maka unselect semua visible row.
- Selection harus tetap aman saat filter berubah.

Bulk Void:

- Tambahkan tombol "Bulk Void" di header card List Jurnal.
- Tombol disabled jika tidak ada jurnal dipilih.
- Ketika diklik, kirim array jurnal terpilih atau id jurnal terpilih ke handler/API existing.
- Jangan langsung mengubah data lokal tanpa mengikuti pola project.
- Jika project sudah punya endpoint void journal, gunakan endpoint/pola service existing.
- Jika belum ada endpoint bulk void, buat integrasi frontend dengan handler sementara yang jelas TODO-nya, atau sesuaikan dengan API backend existing.

Important implementation notes:

- Gunakan TypeScript jika file existing menggunakan TypeScript.
- Gunakan Tailwind CSS.
- Gunakan lucide-react icon jika project sudah memakai lucide-react.
- Jika lucide-react belum terinstall, ikuti icon system existing project, jangan menambah dependency tanpa perlu.
- Jangan memakai import alias yang tidak ada.
- Jangan mengubah routing besar project.
- Jangan membuat layout dashboard/sidebar baru.
- Jangan menambahkan mock data ke production page kecuali hanya untuk fallback development yang tidak aktif di production.
- Data harus tetap berasal dari API/service existing List Journal.
- Pastikan format currency dan format date memakai helper existing project jika tersedia.
- Jika helper belum ada, buat helper kecil lokal atau gunakan Intl.NumberFormat dan Intl.DateTimeFormat.

Logika filter:

- Dalam satu grup filter multi-select gunakan OR.
  Contoh: status draft + approved berarti tampilkan status draft ATAU approved.
- Antar grup filter gunakan AND.
  Contoh: tanggal + jenis transaksi + search + status harus semuanya match.
- Jika selectedStatuses kosong, berarti semua status.
- Jika selectedTransactionTypes kosong, berarti semua jenis transaksi.

Function yang boleh dibuat:

- filterGeneralJournals(items, search, selectedStatuses, selectedTransactionTypes, dateFrom, dateTo)
- hasActiveFilters(search, selectedStatuses, selectedTransactionTypes, dateFrom, dateTo)
- getSelectableJournals(items)
- getSelectedJournals(items, selectedIds)
- CheckboxFilter component
- RowCheckbox component
- StatusBadge component

Tambahkan atau update test jika project punya test frontend:

- filter tanpa kondisi mengembalikan semua data.
- filter status single.
- filter status multi.
- filter transaction type single.
- filter transaction type multi.
- filter tanggal awal/akhir.
- search keyword.
- void journal tidak selectable.
- select all hanya memilih visible selectable rows.
- clear filter menghapus filter dan selection.

Acceptance criteria:

1. Halaman List Journal tetap bisa build tanpa error.
2. UI filter muncul di atas tabel.
3. Jenis transaksi dan status berupa checkbox multi-select dropdown.
4. Dropdown menutup saat klik di luar.
5. Search dan filter bisa bekerja bersama.
6. Tombol Clear Filter bekerja.
7. Kolom Detail/action sudah hilang.
8. Checkbox selection tersedia di setiap row.
9. Select all tersedia di header tabel.
10. Status void tidak bisa dipilih.
11. Tombol Bulk Void aktif hanya ketika ada jurnal dipilih.
12. Implementasi mengikuti struktur file, service, hooks, dan style existing project.
