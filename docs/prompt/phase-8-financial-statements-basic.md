# Phase 8 — Financial Statements (Basic)

Phase 8 berisi laporan financial statements berbasis data jurnal posted pada tenant database.

Dokumen ini adalah ringkasan roadmap minimal:

## Phase 8A — Profit & Loss Statement
- Endpoint: `GET /api/reports/profit-loss`
- Fokus: total revenue, total expense, net profit/loss (MVP).

## Phase 8B — Balance Sheet (planned)
- Endpoint: `GET /api/reports/balance-sheet`
- Asset / Liability / Equity snapshot pada `as_of_date`, termasuk Current Year Profit/Loss di equity (MVP).

## Phase 8C — Cash Flow (planned)
- Endpoint: `GET /api/reports/cash-flow`
- Simple cash flow basis (MVP) berbasis akun `is_cash_bank`, tanpa modul transaksi khusus.

## Phase 8D — Integration & consistency tests
- Endpoint opsional: `GET /api/reports/financial-summary`
- Integration tests lintas report untuk memastikan konsistensi PL/BS/CF dan rule reportable journal.

Catatan:
- Export PDF/Excel belum termasuk.
- Frontend UI belum termasuk.
- Closing wizard tidak termasuk dalam Phase 8 basic ini.
