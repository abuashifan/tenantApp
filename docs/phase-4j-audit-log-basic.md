# Phase 4J — Audit Log Basic

Phase 4J menambahkan fondasi **audit log basic** untuk mencatat aktivitas user/sistem di tenant database, dan memakai `activity_logs` (central) untuk aktivitas yang relevan di central bila kompatibel.

## Tujuan

Audit log basic mencatat:
- siapa melakukan apa, kapan, di company mana
- event/action/module
- record yang terkait (type/id/number)
- result: `success/failed/denied/warning`
- IP dan user agent (jika ada request context)
- source link fields (Phase 4H)
- referensi `revision_id` (Phase 4I)
- old/new values opsional

## Beda Audit Log vs Revision Tracking

- Revision Tracking (Phase 4I): fokus detail perubahan data transaksi (`old_values/new_values/changed_fields`) → `transaction_revisions` (tenant).
- Audit Log (Phase 4J): fokus aktivitas (`user X melakukan action Y pada record Z`) → `tenant_audit_logs` (tenant).

## Tenant Database Schema

Migration: `backend/database/migrations/tenant/2026_05_18_000004_create_tenant_audit_logs_table.php`

Table: `tenant_audit_logs`

Menyimpan:
- `event`, `action`, `module`
- record info: `record_type`, `record_id`, `record_number`
- source link: `source_type`, `source_id`, `source_number`, `source_revision`, `source_module`, `source_batch_id`
- `revision_id` (referensi ke `transaction_revisions.id` bila ada)
- `user_id`, `company_id` (id central, tanpa foreign key)
- `result`, `message`
- `old_values`, `new_values` (opsional)
- `metadata`, `ip_address`, `user_agent`

## Service

Service: `backend/app/Services/Audit/AuditLogService.php`

Metode utama:
- `logTenant()`: insert ke tenant audit log (fail-safe → return null bila error)
- `logCentral()`: insert ke `activity_logs` (central) bila kompatibel
- helper: `logSuccess/logFailed/logDenied/logWarning`
- `withRequestContext()`: attach IP/user agent bila tersedia

## Integrasi Ringan

- Permission denied (Phase 4B): middleware dapat memanggil audit log dengan event `permission.denied`.
- Company setting update (Phase 4A): controller/service settings dapat memanggil `logCentral()` dengan event `settings.company.updated` / `settings.modules.updated`.

Integrasi harus **aman**: logging error tidak boleh membuat request utama crash.

## Hubungan Dengan Phase Lain

- Phase 4H: source link fields tersedia di audit log.
- Phase 4I: audit log dapat menyimpan `revision_id`.
- Phase 17: audit log viewer/export/filter advanced akan dibuat nanti.

## Batasan Scope

Phase 4J tidak membuat:
- audit viewer UI, filter, export
- tabel transaksi nyata
- endpoint edit/void transaksi

## Testing

Jalankan:
- `cd backend`
- `php artisan test --filter=AuditLogServiceTest`

## Notes Commit

Commit message:
`add audit log basic foundation`

