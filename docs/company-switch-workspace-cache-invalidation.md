# Company Switch Workspace Cache Invalidation

Tanggal update: 2026-05-26

## Problem From Audit

Point 10 sudah menutup sebagian besar API interceptor dan error handling: request baru membaca `activeCompanyId` terkini, `X-Company-ID` dikirim dari request interceptor, 401 membersihkan auth, dan 403 tidak memaksa logout.

Gap tersisa adalah state workspace yang sudah terbuka. Setelah user berpindah dari Company A ke Company B, tab, list rows, selected rows, form draft, dan cached component di `KeepAlive` masih berisiko menampilkan data tenant lama sampai user refresh manual.

## Chosen Behavior

Company switch memakai strategi clear, bukan refresh semua tab.

Saat active company berubah:

- semua primary tab selain Dashboard ditutup,
- semua secondary tab ditutup,
- draft form dan dirty state dibuang,
- list state/cached workspace state dibersihkan,
- workspace cache generation dinaikkan agar component `KeepAlive` remount,
- Access Management store dibersihkan,
- permission lama dikosongkan sebelum permission company baru diambil,
- user diarahkan ke Dashboard.

Strategi ini lebih aman daripada refresh tab lama karena record ID, permission, dan draft bisa berbeda antar company.

## Dirty Draft Confirmation

Jika user sudah berada di company aktif dan memilih company lain:

- jika ada workspace state terbuka, UI meminta konfirmasi sebelum switch,
- jika ada dirty secondary tab, pesan konfirmasi menyebut unsaved changes akan dibuang,
- jika user cancel, backend company select tidak dipanggil dan state lama tetap aman,
- jika user confirm, switch dilanjutkan dan tenant-scoped state dibersihkan.

Initial company selection setelah login tidak menampilkan warning karena belum ada active company lama.

## State Cleared

`workspaceTabsStore.resetForCompanySwitch()` membersihkan:

- `primaryTabs`,
- `activePrimaryTabId`,
- `secondaryTabsByPrimaryId`,
- `activeSecondaryTabIdByPrimaryId`,
- `draftStateBySecondaryTabId`,
- `listStateByPrimaryTabId`.

Store juga menaikkan `tenantStateVersion`. `WorkspaceContentArea` memasukkan version ini ke component key:

```text
tenant:<tenantStateVersion>:primary:<activePrimaryTabId>
```

Dengan begitu cached workspace component lama tidak dipakai ulang setelah company switch.

## Permission Refresh

Flow switch mengosongkan `auth.permissions` sebelum memanggil `/auth/permissions` untuk company baru. Jika fetch permission gagal, permission lama tidak tetap aktif.

Access Management state juga dibersihkan supaya daftar users, roles, permission matrix, dan selected company user dari company lama tidak tetap terlihat.

## Dashboard Redirect

Setelah company dipilih dan permission baru berhasil diambil, router diarahkan ke `/dashboard`. Dashboard menjadi satu-satunya active primary tab dan akan mount ulang karena cache generation berubah.

## Manual QA Checklist

- [ ] Login sebagai user dengan akses ke minimal 2 company.
- [ ] Select Company A.
- [ ] Buka Products list.
- [ ] Buka Sales Invoice list.
- [ ] Select beberapa rows.
- [ ] Buka create/edit form dan isi field tanpa save.
- [ ] Pergi ke Select Company dan pilih Company B.
- [ ] Pastikan warning muncul jika workspace terbuka.
- [ ] Cancel switch; pastikan Company A dan workspace lama tetap aktif.
- [ ] Ulang switch dan confirm.
- [ ] Pastikan user kembali ke Dashboard.
- [ ] Pastikan tabs lama tertutup.
- [ ] Pastikan rows Company A tidak terlihat.
- [ ] Pastikan selected rows hilang.
- [ ] Pastikan form draft tertutup/terhapus.
- [ ] Pastikan sidebar mengikuti permission Company B.
- [ ] Pastikan request setelah switch memakai `X-Company-ID` Company B.
- [ ] Switch kembali ke Company A dan pastikan data load fresh.

## Known Limitations / Follow-up

- Belum ada global toast system, jadi implementasi tidak menambahkan notification baru agar tidak mengubah desain shell.
- Draft tidak dinamespace per company. Ini disengaja untuk keamanan tenant; restore draft saat switch balik bisa menjadi enhancement terpisah.
- Manual browser QA tetap diperlukan untuk memverifikasi header `X-Company-ID` dan sidebar permission lintas role nyata.
