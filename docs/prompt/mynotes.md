setelah selesai, buat catatan dalam satu block code agar aku copy paste sebagai catatan di progress notes. tulis juga daftar file yang kamu edit atau buat baru, lengkap dengan foldernya contoh : backend/routes/api.php

## UX Design Guardrails

```text
Jangan revert atau longgarkan perbaikan UX compact yang sudah dibuat untuk workspace list dan reusable transaction forms.

Target utama desain saat ini:
- Tampilan tablet landscape 11.5 inch harus tetap nyaman, dense, dan terasa seperti desktop worksheet.
- Form input transaksi harus muat dalam satu viewport normal; page-level scroll tidak boleh menjadi kebutuhan utama.
- Jika data panjang, yang scroll adalah table/list internal, bukan seluruh form.
- Komponen kecil seperti search box, date input, payment term, customer/vendor selector, filter, dan action bar harus shrink mengikuti lebar layar, bukan membuat layout menumpuk.
- Jangan mengembalikan metadata card besar untuk Number/Date/Due Date/Payment Term pada transaction form.
- Due Date tidak ditampilkan di header utama transaction worksheet; payment term dan date tetap sejajar.
- Partner/customer/vendor selector berada di area header kiri transaction worksheet.
- Tabs Rincian/Informasi Lainnya berada di side rail kiri, bukan mengambil tinggi di atas table.
- Product line table adalah area utama form dan harus menampilkan beberapa row awal pada tablet/laptop sebelum scroll internal.
- TransactionTotalsPanel harus tetap compact, tidak horizontal-scroll melewati viewport, dan teks tidak boleh wrap/menumpuk.
- Footer action seperti Void/Close/Save harus menyatu di bawah form dan tidak overlay di atas table/form.
- Perubahan global list/workspace/table sebelumnya juga jangan di-revert: layout harus tetap compact, responsive untuk tablet, dan tidak membuat toolbar/filter/search menumpuk.

Sebelum mengubah desain terkait area di atas, cek ulang di viewport:
- 1024x768 tablet landscape
- 1180x820 tablet landscape
- 1366x768 laptop
```
