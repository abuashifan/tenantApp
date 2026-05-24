import { defineStore } from 'pinia'

export type MockChartOfAccountType =
  | 'Kas & Bank'
  | 'Piutang'
  | 'Persediaan'
  | 'Aset Tetap'
  | 'Hutang'
  | 'Modal'
  | 'Pendapatan'
  | 'Beban'

export type MockNormalBalance = 'Debit' | 'Credit'

export type MockChartOfAccount = {
  id: string
  code: string
  name: string
  type: MockChartOfAccountType
  normalBalance: MockNormalBalance
  parentCode: string | null
  level: number
  isGroup: boolean
  isActive: boolean
  isSystemLocked: boolean
  balance: number
}

export type MockJournalSource = 'Manual' | 'Sales Invoice' | 'Cash Receipt' | 'Adjustment'
export type MockJournalStatus = 'Draft' | 'Posted' | 'Void'

export type MockLedgerSource = 'Manual' | 'Sales Invoice' | 'Cash Receipt' | 'Cash Payment' | 'Adjustment'

export type MockJournal = {
  id: string
  journalNo: string
  date: string
  description: string
  source: MockJournalSource
  status: MockJournalStatus
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
  createdBy: string
  updatedAt: string
}

export type MockLedgerLine = {
  id: string
  accountCode: string
  accountName: string
  accountType: string
  normalBalance: MockNormalBalance
  date: string
  journalId: string
  journalNo: string
  description: string
  source: MockLedgerSource
  status: MockJournalStatus
  debit: number
  credit: number
}

type CoaFilters = {
  search: string
  type: MockChartOfAccountType | ''
  active: 'active' | 'inactive' | 'all'
}

type JournalFilters = {
  search: string
  startDate: string
  endDate: string
  statuses: MockJournalStatus[]
}

type LedgerFilters = {
  search: string
  accountCode: string | null
  dateFrom: string | null
  dateTo: string | null
  statuses: MockJournalStatus[]
}

type MockAccountingState = {
  chartOfAccounts: MockChartOfAccount[]
  journals: MockJournal[]
  ledgerLines: MockLedgerLine[]
  coaFilters: CoaFilters
  journalFilters: JournalFilters
  journalFiltersDraft: JournalFilters
  ledgerFilters: LedgerFilters
  selectedCoaId: string | null
  selectedJournalId: string | null
  selectedLedgerAccountCode: string | null
  trialBalanceFiltersDraft?: TrialBalanceFilters
  trialBalanceFilters?: TrialBalanceFilters
}

export type TrialBalanceAccountType = 'All' | 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
export type TrialBalanceBalanceView = 'hide_zero' | 'show_all' | 'only_with_balance'

export type TrialBalanceFilters = {
  search: string
  asOfDate: string
  accountType: TrialBalanceAccountType
  balanceView: TrialBalanceBalanceView
}

export type TrialBalanceRow = {
  id: string
  accountCode: string
  accountName: string
  accountType: Exclude<TrialBalanceAccountType, 'All'>
  debit: number
  credit: number
  netBalance: number
}

function mapCoaTypeToTrialBalanceType(type: MockChartOfAccountType): Exclude<TrialBalanceAccountType, 'All'> {
  if (type === 'Hutang') return 'Liability'
  if (type === 'Modal') return 'Equity'
  if (type === 'Pendapatan') return 'Revenue'
  if (type === 'Beban') return 'Expense'
  return 'Asset'
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function containsText(haystack: string, needle: string) {
  if (!needle) return true
  return normalizeText(haystack).includes(needle)
}

function getLedgerAccountCode(state: MockAccountingState) {
  return state.ledgerFilters.accountCode ?? state.selectedLedgerAccountCode
}

function getSelectedLedgerAccount(state: MockAccountingState): MockChartOfAccount | null {
  const code = getLedgerAccountCode(state)
  if (!code) return null
  return state.chartOfAccounts.find((a) => a.code === code) ?? null
}

function getFilteredLedgerLinesFromState(state: MockAccountingState): MockLedgerLine[] {
  const accountCode = getLedgerAccountCode(state)
  if (!accountCode) return []

  const search = normalizeText(state.ledgerFilters.search)
  const dateFrom = state.ledgerFilters.dateFrom
  const dateTo = state.ledgerFilters.dateTo
  const statuses = state.ledgerFilters.statuses

  return state.ledgerLines.filter((row) => {
    if (row.accountCode !== accountCode) return false
    if (statuses.length > 0 && !statuses.includes(row.status)) return false
    if (dateFrom && row.date < dateFrom) return false
    if (dateTo && row.date > dateTo) return false
    if (search) {
      const hay = `${row.journalNo} ${row.description} ${row.source}`.toLowerCase()
      if (!hay.includes(search)) return false
    }
    return true
  })
}

function defaultJournalFilters(): JournalFilters {
  return {
    search: '',
    startDate: '',
    endDate: '',
    statuses: ['Draft', 'Posted', 'Void'],
  }
}

function makeMockCoa(): MockChartOfAccount[] {
  // Temporary mock balances for UI testing only.
  // TODO: Real balances must come from posted journal lines / reports API in backend later.
  // Temporary frontend mock balance only. Final official account balances must be derived from posted journal lines on the backend. Do not treat COA balance as permanent master data.
  const rows: MockChartOfAccount[] = [
    { id: '111.000-00', code: '111.000-00', name: 'Kas dan Setara Kas', type: 'Kas & Bank', normalBalance: 'Debit', parentCode: null, level: 0, isGroup: true, isActive: true, isSystemLocked: true, balance: 125_000_000 },
    { id: '111.100-00', code: '111.100-00', name: 'Kas dan Setara Kas Jakarta', type: 'Kas & Bank', normalBalance: 'Debit', parentCode: '111.000-00', level: 1, isGroup: true, isActive: true, isSystemLocked: false, balance: 80_000_000 },
    { id: '111.101-00', code: '111.101-00', name: 'Kas Jakarta', type: 'Kas & Bank', normalBalance: 'Debit', parentCode: '111.100-00', level: 2, isGroup: true, isActive: true, isSystemLocked: false, balance: 12_500_000 },
    { id: '111.101-01', code: '111.101-01', name: 'Kas Kecil Kantor Jakarta', type: 'Kas & Bank', normalBalance: 'Debit', parentCode: '111.101-00', level: 3, isGroup: false, isActive: true, isSystemLocked: false, balance: 2_250_000 },
    { id: '111.101-02', code: '111.101-02', name: 'Kas Besar Kantor Jakarta', type: 'Kas & Bank', normalBalance: 'Debit', parentCode: '111.101-00', level: 3, isGroup: false, isActive: true, isSystemLocked: false, balance: 10_250_000 },
    { id: '111.102-00', code: '111.102-00', name: 'Bank Jakarta', type: 'Kas & Bank', normalBalance: 'Debit', parentCode: '111.100-00', level: 2, isGroup: true, isActive: true, isSystemLocked: false, balance: 67_500_000 },
    { id: '111.102-01', code: '111.102-01', name: 'Bank BCA IDR Jakarta', type: 'Kas & Bank', normalBalance: 'Debit', parentCode: '111.102-00', level: 3, isGroup: false, isActive: true, isSystemLocked: true, balance: 55_000_000 },
    { id: '111.102-02', code: '111.102-02', name: 'Bank BCA USD Jakarta', type: 'Kas & Bank', normalBalance: 'Debit', parentCode: '111.102-00', level: 3, isGroup: false, isActive: true, isSystemLocked: false, balance: 12_500_000 },
    { id: '111.200-00', code: '111.200-00', name: 'Kas dan Setara Kas Surabaya', type: 'Kas & Bank', normalBalance: 'Debit', parentCode: '111.000-00', level: 1, isGroup: true, isActive: true, isSystemLocked: false, balance: 45_000_000 },
    { id: '111.201-00', code: '111.201-00', name: 'Kas Surabaya', type: 'Kas & Bank', normalBalance: 'Debit', parentCode: '111.200-00', level: 2, isGroup: false, isActive: true, isSystemLocked: false, balance: 6_500_000 },
    { id: '111.202-00', code: '111.202-00', name: 'Bank Surabaya', type: 'Kas & Bank', normalBalance: 'Debit', parentCode: '111.200-00', level: 2, isGroup: false, isActive: true, isSystemLocked: false, balance: 38_500_000 },

    { id: '112.000-00', code: '112.000-00', name: 'Piutang Usaha', type: 'Piutang', normalBalance: 'Debit', parentCode: null, level: 0, isGroup: true, isActive: true, isSystemLocked: true, balance: 210_000_000 },
    { id: '112.100-00', code: '112.100-00', name: 'Piutang Usaha Jakarta', type: 'Piutang', normalBalance: 'Debit', parentCode: '112.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 160_000_000 },
    { id: '112.200-00', code: '112.200-00', name: 'Piutang Usaha Surabaya', type: 'Piutang', normalBalance: 'Debit', parentCode: '112.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 50_000_000 },

    { id: '113.000-00', code: '113.000-00', name: 'Persediaan', type: 'Persediaan', normalBalance: 'Debit', parentCode: null, level: 0, isGroup: true, isActive: true, isSystemLocked: true, balance: 95_000_000 },
    { id: '113.100-00', code: '113.100-00', name: 'Persediaan LPG', type: 'Persediaan', normalBalance: 'Debit', parentCode: '113.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 75_000_000 },
    { id: '113.200-00', code: '113.200-00', name: 'Persediaan Sparepart', type: 'Persediaan', normalBalance: 'Debit', parentCode: '113.000-00', level: 1, isGroup: false, isActive: false, isSystemLocked: false, balance: 20_000_000 },

    { id: '121.000-00', code: '121.000-00', name: 'Aset Tetap', type: 'Aset Tetap', normalBalance: 'Debit', parentCode: null, level: 0, isGroup: true, isActive: true, isSystemLocked: true, balance: 550_000_000 },
    { id: '121.100-00', code: '121.100-00', name: 'Kendaraan Operasional', type: 'Aset Tetap', normalBalance: 'Debit', parentCode: '121.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 320_000_000 },
    { id: '121.200-00', code: '121.200-00', name: 'Peralatan Kantor', type: 'Aset Tetap', normalBalance: 'Debit', parentCode: '121.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 230_000_000 },

    { id: '211.000-00', code: '211.000-00', name: 'Hutang Usaha', type: 'Hutang', normalBalance: 'Credit', parentCode: null, level: 0, isGroup: true, isActive: true, isSystemLocked: true, balance: 185_000_000 },
    { id: '211.100-00', code: '211.100-00', name: 'Hutang Supplier LPG', type: 'Hutang', normalBalance: 'Credit', parentCode: '211.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 150_000_000 },
    { id: '211.200-00', code: '211.200-00', name: 'Hutang Biaya Operasional', type: 'Hutang', normalBalance: 'Credit', parentCode: '211.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 35_000_000 },

    { id: '311.000-00', code: '311.000-00', name: 'Modal Pemilik', type: 'Modal', normalBalance: 'Credit', parentCode: null, level: 0, isGroup: false, isActive: true, isSystemLocked: true, balance: 700_000_000 },

    { id: '411.000-00', code: '411.000-00', name: 'Pendapatan Penjualan', type: 'Pendapatan', normalBalance: 'Credit', parentCode: null, level: 0, isGroup: true, isActive: true, isSystemLocked: true, balance: 1_250_000_000 },
    { id: '411.100-00', code: '411.100-00', name: 'Penjualan LPG Jakarta', type: 'Pendapatan', normalBalance: 'Credit', parentCode: '411.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 900_000_000 },
    { id: '411.200-00', code: '411.200-00', name: 'Penjualan LPG Surabaya', type: 'Pendapatan', normalBalance: 'Credit', parentCode: '411.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 350_000_000 },

    { id: '511.000-00', code: '511.000-00', name: 'Harga Pokok Penjualan', type: 'Beban', normalBalance: 'Debit', parentCode: null, level: 0, isGroup: true, isActive: true, isSystemLocked: true, balance: 880_000_000 },
    { id: '511.100-00', code: '511.100-00', name: 'HPP LPG', type: 'Beban', normalBalance: 'Debit', parentCode: '511.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 880_000_000 },

    { id: '611.000-00', code: '611.000-00', name: 'Beban Operasional', type: 'Beban', normalBalance: 'Debit', parentCode: null, level: 0, isGroup: true, isActive: true, isSystemLocked: true, balance: 120_000_000 },
    { id: '611.100-00', code: '611.100-00', name: 'Beban Gaji', type: 'Beban', normalBalance: 'Debit', parentCode: '611.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 70_000_000 },
    { id: '611.200-00', code: '611.200-00', name: 'Beban Transport', type: 'Beban', normalBalance: 'Debit', parentCode: '611.000-00', level: 1, isGroup: false, isActive: true, isSystemLocked: false, balance: 25_000_000 },
    { id: '611.300-00', code: '611.300-00', name: 'Beban Kantor', type: 'Beban', normalBalance: 'Debit', parentCode: '611.000-00', level: 1, isGroup: false, isActive: false, isSystemLocked: false, balance: 25_000_000 },
  ]

  return rows
}

function makeMockJournals(): MockJournal[] {
  const baseDate = '2026-05'
  const rows: MockJournal[] = []

  function push(i: number, data: Omit<MockJournal, 'id'>) {
    rows.push({ id: `JRN-${i}`, ...data })
  }

  push(1, { journalNo: 'JRN.2026.0001', date: `${baseDate}-01`, description: 'Penjualan LPG harian Jakarta', source: 'Sales Invoice', status: 'Posted', totalDebit: 12_500_000, totalCredit: 12_500_000, isBalanced: true, createdBy: 'Admin', updatedAt: '2026-05-01 10:00' })
  push(2, { journalNo: 'JRN.2026.0002', date: `${baseDate}-01`, description: 'Penerimaan kas pelanggan', source: 'Cash Receipt', status: 'Posted', totalDebit: 4_200_000, totalCredit: 4_200_000, isBalanced: true, createdBy: 'Admin', updatedAt: '2026-05-01 12:20' })
  push(3, { journalNo: 'JRN.2026.0003', date: `${baseDate}-02`, description: 'Pembayaran supplier LPG', source: 'Manual', status: 'Posted', totalDebit: 8_900_000, totalCredit: 8_900_000, isBalanced: true, createdBy: 'Admin', updatedAt: '2026-05-02 09:10' })
  push(4, { journalNo: 'JRN.2026.0004', date: `${baseDate}-02`, description: 'Biaya operasional kantor', source: 'Manual', status: 'Posted', totalDebit: 1_250_000, totalCredit: 1_250_000, isBalanced: true, createdBy: 'Admin', updatedAt: '2026-05-02 15:40' })
  push(5, { journalNo: 'JRN.2026.0005', date: `${baseDate}-03`, description: 'Setoran bank', source: 'Manual', status: 'Posted', totalDebit: 3_000_000, totalCredit: 3_000_000, isBalanced: true, createdBy: 'Admin', updatedAt: '2026-05-03 11:05' })
  push(6, { journalNo: 'JRN.2026.0006', date: `${baseDate}-03`, description: 'Koreksi biaya transport', source: 'Adjustment', status: 'Draft', totalDebit: 350_000, totalCredit: 350_000, isBalanced: true, createdBy: 'Rina', updatedAt: '2026-05-03 16:22' })
  push(7, { journalNo: 'JRN.2026.0007', date: `${baseDate}-04`, description: 'Penyesuaian persediaan', source: 'Adjustment', status: 'Draft', totalDebit: 1_100_000, totalCredit: 1_100_000, isBalanced: true, createdBy: 'Rina', updatedAt: '2026-05-04 09:10' })
  push(8, { journalNo: 'JRN.2026.0008', date: `${baseDate}-04`, description: 'Pembayaran gaji', source: 'Manual', status: 'Posted', totalDebit: 7_500_000, totalCredit: 7_500_000, isBalanced: true, createdBy: 'Admin', updatedAt: '2026-05-04 17:45' })
  push(9, { journalNo: 'JRN.2026.0009', date: `${baseDate}-05`, description: 'Depresiasi aset tetap', source: 'Adjustment', status: 'Draft', totalDebit: 900_000, totalCredit: 900_000, isBalanced: true, createdBy: 'Dedi', updatedAt: '2026-05-05 13:30' })
  push(10, { journalNo: 'JRN.2026.0010', date: `${baseDate}-05`, description: 'Jurnal penutup sementara', source: 'Adjustment', status: 'Void', totalDebit: 2_000_000, totalCredit: 2_000_000, isBalanced: true, createdBy: 'Dedi', updatedAt: '2026-05-05 18:10' })
  // Intentionally unbalanced draft for warning testing
  push(11, { journalNo: 'JRN.2026.0011', date: `${baseDate}-06`, description: 'Draft tidak balance untuk test', source: 'Manual', status: 'Draft', totalDebit: 500_000, totalCredit: 450_000, isBalanced: false, createdBy: 'Rina', updatedAt: '2026-05-06 10:00' })

  const descriptions = [
    'Penjualan LPG harian Jakarta',
    'Penerimaan kas pelanggan',
    'Pembayaran supplier LPG',
    'Biaya operasional kantor',
    'Koreksi biaya transport',
    'Penyesuaian persediaan',
    'Setoran bank',
    'Pembayaran gaji',
    'Depresiasi aset tetap',
    'Jurnal penutup sementara',
  ]

  for (let i = 12; i <= 30; i += 1) {
    const desc = descriptions[(i - 1) % descriptions.length] ?? 'Transaksi'
    const day = String(((i - 1) % 20) + 7).padStart(2, '0')
    const posted = i % 3 === 0
    const voided = i % 17 === 0
    const status: MockJournalStatus = voided ? 'Void' : posted ? 'Posted' : 'Draft'
    const amount = 250_000 * ((i % 9) + 1)
    const balanced = !(i % 11 === 0) || status !== 'Draft'

    push(i, {
      journalNo: `JRN.2026.${String(i).padStart(4, '0')}`,
      date: `${baseDate}-${day}`,
      description: desc,
      source: i % 4 === 0 ? 'Cash Receipt' : i % 5 === 0 ? 'Sales Invoice' : i % 2 === 0 ? 'Adjustment' : 'Manual',
      status,
      totalDebit: amount,
      totalCredit: balanced ? amount : amount - 50_000,
      isBalanced: balanced,
      createdBy: i % 2 === 0 ? 'Rina' : 'Admin',
      updatedAt: `2026-05-${day} 16:00`,
    })
  }

  return rows
}

function makeMockLedgerLines(coa: MockChartOfAccount[], journals: MockJournal[]): MockLedgerLine[] {
  const leafAccounts = coa.filter((a) => !a.isGroup)
  const byCode = new Map<string, MockChartOfAccount>()
  for (const acc of coa) byCode.set(acc.code, acc)

  function account(code: string) {
    const acc = byCode.get(code)
    if (!acc) {
      return {
        accountCode: code,
        accountName: code,
        accountType: 'Beban' as MockChartOfAccountType,
        normalBalance: 'Debit' as MockNormalBalance,
      }
    }
    return {
      accountCode: acc.code,
      accountName: acc.name,
      accountType: acc.type,
      normalBalance: acc.normalBalance,
    }
  }

  const lines: MockLedgerLine[] = []

  function push(i: number, payload: Omit<MockLedgerLine, 'id'>) {
    lines.push({ id: `LED-${String(i).padStart(4, '0')}`, ...payload })
  }

  const bank = account('111.102-01')
  const cashSmall = account('111.101-01')
  const ar = account('112.100-00')
  const inventory = account('113.100-00')
  const ap = account('211.100-00')
  const revenue = account('411.100-00')
  const cogs = account('511.100-00')
  const salary = account('611.100-00')
  const transport = account('611.200-00')
  const office = account('611.300-00')

  let idx = 1

  for (const j of journals) {
    const amount = Math.max(j.totalDebit, j.totalCredit)
    const status = j.status
    const source = (j.source === 'Manual' ? 'Manual' : j.source) as MockLedgerSource

    if (j.description.toLowerCase().includes('penjualan')) {
      push(idx++, { ...bank, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: amount, credit: 0 })
      push(idx++, { ...revenue, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: 0, credit: amount })
      push(idx++, { ...cogs, date: j.date, journalId: j.id, journalNo: j.journalNo, description: `HPP - ${j.description}`, source, status, debit: Math.round(amount * 0.7), credit: 0 })
      push(idx++, { ...inventory, date: j.date, journalId: j.id, journalNo: j.journalNo, description: `Persediaan keluar - ${j.description}`, source, status, debit: 0, credit: Math.round(amount * 0.7) })
      continue
    }

    if (j.description.toLowerCase().includes('penerimaan kas')) {
      push(idx++, { ...bank, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: amount, credit: 0 })
      push(idx++, { ...ar, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: 0, credit: amount })
      continue
    }

    if (j.description.toLowerCase().includes('pembayaran supplier')) {
      push(idx++, { ...ap, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source: 'Cash Payment', status, debit: amount, credit: 0 })
      push(idx++, { ...bank, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source: 'Cash Payment', status, debit: 0, credit: amount })
      continue
    }

    if (j.description.toLowerCase().includes('gaji')) {
      push(idx++, { ...salary, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: amount, credit: 0 })
      push(idx++, { ...bank, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: 0, credit: amount })
      continue
    }

    if (j.description.toLowerCase().includes('transport')) {
      push(idx++, { ...transport, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: amount, credit: 0 })
      push(idx++, { ...cashSmall, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: 0, credit: amount })
      continue
    }

    if (j.description.toLowerCase().includes('operasional') || j.description.toLowerCase().includes('kantor')) {
      push(idx++, { ...office, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: amount, credit: 0 })
      push(idx++, { ...cashSmall, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: 0, credit: amount })
      continue
    }

    if (j.description.toLowerCase().includes('setoran bank')) {
      push(idx++, { ...bank, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: amount, credit: 0 })
      push(idx++, { ...cashSmall, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit: 0, credit: amount })
      continue
    }

    // fallback: assign to a deterministic account to reach >= 60 lines
    const fallback = leafAccounts[(idx - 1) % leafAccounts.length] ?? leafAccounts[0]
    const acc = fallback ? account(fallback.code) : bank
    const debit = idx % 2 === 0 ? amount : 0
    const credit = debit === 0 ? amount : 0
    push(idx++, { ...acc, date: j.date, journalId: j.id, journalNo: j.journalNo, description: j.description, source, status, debit, credit })
    // Offset line to keep the mock ledger balanced for trial balance testing.
    push(idx++, { ...bank, date: j.date, journalId: j.id, journalNo: j.journalNo, description: `${j.description} (offset)`, source, status, debit: credit, credit: debit })
  }

  // Ensure minimum 60 lines by duplicating a few operational adjustments if needed.
  while (lines.length < 60) {
    const j = journals[(lines.length + 1) % journals.length]
    if (!j) break
    const amount = 150_000 * ((lines.length % 7) + 1)
    push(idx++, { ...office, date: j.date, journalId: j.id, journalNo: j.journalNo, description: `Koreksi biaya operasional (${lines.length + 1})`, source: 'Adjustment', status: 'Draft', debit: amount, credit: 0 })
    push(idx++, { ...cashSmall, date: j.date, journalId: j.id, journalNo: j.journalNo, description: `Koreksi biaya operasional (${lines.length + 1}) (offset)`, source: 'Adjustment', status: 'Draft', debit: 0, credit: amount })
  }

  return lines
}

export const useMockAccountingDataStore = defineStore('mockAccountingData', {
  state: () => ({
    chartOfAccounts: makeMockCoa() as MockChartOfAccount[],
    journals: makeMockJournals() as MockJournal[],
    ledgerLines: [] as MockLedgerLine[],
    coaFilters: {
      search: '',
      type: '' as CoaFilters['type'],
      active: 'active' as CoaFilters['active'],
    },
    journalFilters: {
      ...defaultJournalFilters(),
    },
    journalFiltersDraft: {
      ...defaultJournalFilters(),
    },
    ledgerFilters: {
      search: '',
      accountCode: '111.102-01' as string | null,
      dateFrom: '2026-05-01' as string | null,
      dateTo: '2026-05-31' as string | null,
      statuses: ['Posted'] as LedgerFilters['statuses'],
    },
    selectedCoaId: null as string | null,
    selectedJournalId: null as string | null,
    selectedLedgerAccountCode: '111.102-01' as string | null,
    trialBalanceFiltersDraft: {
      search: '',
      asOfDate: '2026-05-31',
      accountType: 'All' as TrialBalanceAccountType,
      balanceView: 'hide_zero' as TrialBalanceBalanceView,
    },
    trialBalanceFilters: {
      search: '',
      asOfDate: '2026-05-31',
      accountType: 'All' as TrialBalanceAccountType,
      balanceView: 'hide_zero' as TrialBalanceBalanceView,
    },
  }),

  getters: {
    filteredChartOfAccounts(state): MockChartOfAccount[] {
      const search = normalizeText(state.coaFilters.search)
      const type = state.coaFilters.type
      const active = state.coaFilters.active
      const base = state.chartOfAccounts.filter((row) => {
        const matchesType = !type || row.type === type
        const matchesActive = active === 'all' ? true : active === 'active' ? row.isActive : !row.isActive
        return matchesType && matchesActive
      })

      if (!search) return base

      const byCode = new Map<string, MockChartOfAccount>()
      for (const row of base) byCode.set(row.code, row)

      const included = new Set<string>()
      for (const row of base) {
        const matchesText = containsText(`${row.code} ${row.name} ${row.type}`, search)
        if (!matchesText) continue
        included.add(row.code)

        let parent = row.parentCode
        while (parent) {
          included.add(parent)
          parent = byCode.get(parent)?.parentCode ?? null
        }
      }

      return base.filter((row) => included.has(row.code))
    },
    activeChartOfAccounts(state): MockChartOfAccount[] {
      return state.chartOfAccounts.filter((row) => row.isActive)
    },
    inactiveChartOfAccounts(state): MockChartOfAccount[] {
      return state.chartOfAccounts.filter((row) => !row.isActive)
    },
    filteredJournals(state): MockJournal[] {
      const search = normalizeText(state.journalFilters.search)
      const statuses = state.journalFilters.statuses

      return state.journals.filter((row) => {
        const matchesText =
          containsText(`${row.journalNo} ${row.description} ${row.source}`, search)
        const matchesStatus = statuses.length > 0 && statuses.includes(row.status)
        const matchesStart = state.journalFilters.startDate ? row.date >= state.journalFilters.startDate : true
        const matchesEnd = state.journalFilters.endDate ? row.date <= state.journalFilters.endDate : true
        return matchesText && matchesStatus && matchesStart && matchesEnd
      })
    },
    postedJournals(state): MockJournal[] {
      return state.journals.filter((row) => row.status === 'Posted')
    },
    draftJournals(state): MockJournal[] {
      return state.journals.filter((row) => row.status === 'Draft')
    },
    journalCountByStatus(state): Record<MockJournalStatus, number> {
      const counts: Record<MockJournalStatus, number> = { Draft: 0, Posted: 0, Void: 0 }
      for (const row of state.journals) counts[row.status] += 1
      return counts
    },
    coaCountByType(state): Record<string, number> {
      const counts: Record<string, number> = {}
      for (const row of state.chartOfAccounts) {
        counts[row.type] = (counts[row.type] ?? 0) + 1
      }
      return counts
    },

    ledgerAccounts(state): MockChartOfAccount[] {
      const used = new Set(state.ledgerLines.map((l) => l.accountCode))
      return state.chartOfAccounts.filter((a) => !a.isGroup && used.has(a.code))
    },

    selectedLedgerAccount(state): MockChartOfAccount | null {
      return getSelectedLedgerAccount(state as MockAccountingState)
    },

    filteredLedgerLines(state): MockLedgerLine[] {
      return getFilteredLedgerLinesFromState(state as MockAccountingState)
    },

    ledgerOpeningBalance(state): number {
      const account = getSelectedLedgerAccount(state as MockAccountingState)
      const code = getLedgerAccountCode(state as MockAccountingState)
      const dateFrom = state.ledgerFilters.dateFrom
      if (!account || !code || !dateFrom) return 0

      const lines = state.ledgerLines.filter((l) => l.accountCode === code && l.date < dateFrom && l.status !== 'Void')
      const debit = lines.reduce((sum, l) => sum + l.debit, 0)
      const credit = lines.reduce((sum, l) => sum + l.credit, 0)
      return account.normalBalance === 'Debit' ? debit - credit : credit - debit
    },

    ledgerRunningLines(_state): Array<MockLedgerLine & { runningBalance: number }> {
      const state = _state as MockAccountingState
      const account = getSelectedLedgerAccount(state)
      const opening = (this as unknown as { ledgerOpeningBalance: number }).ledgerOpeningBalance
      const lines = [...getFilteredLedgerLinesFromState(state)]
      if (!account) return []

      lines.sort((a, b) => (a.date === b.date ? a.journalNo.localeCompare(b.journalNo) : a.date.localeCompare(b.date)))
      let balance = opening
      return lines.map((l) => {
        balance =
          account.normalBalance === 'Debit'
            ? balance + l.debit - l.credit
            : balance + l.credit - l.debit
        return { ...l, runningBalance: balance }
      })
    },

    ledgerSummary(_state): {
      accountCode: string
      accountName: string
      accountType: string
      normalBalance: MockNormalBalance
      openingBalance: number
      periodDebit: number
      periodCredit: number
      endingBalance: number
      lineCount: number
    } | null {
      const state = _state as MockAccountingState
      const account = getSelectedLedgerAccount(state)
      if (!account) return null

      const openingBalance = (this as unknown as { ledgerOpeningBalance: number }).ledgerOpeningBalance
      const running = (this as unknown as { ledgerRunningLines: Array<MockLedgerLine & { runningBalance: number }> }).ledgerRunningLines
      const periodDebit = running.reduce((sum, l) => sum + l.debit, 0)
      const periodCredit = running.reduce((sum, l) => sum + l.credit, 0)
      const endingBalance = running.length > 0 ? running[running.length - 1]!.runningBalance : openingBalance

      return {
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        normalBalance: account.normalBalance,
        openingBalance,
        periodDebit,
        periodCredit,
        endingBalance,
        lineCount: running.length,
      }
    },

    trialBalanceRows(state): TrialBalanceRow[] {
      const filters = state.trialBalanceFilters ?? state.trialBalanceFiltersDraft
      if (!filters) return []

      const end = filters.asOfDate
      const query = normalizeText(filters.search)

      const coaLeaf = state.chartOfAccounts.filter((a) => !a.isGroup)
      const byCode = new Map(coaLeaf.map((a) => [a.code, a]))

      const totals = new Map<string, { debit: number; credit: number }>()
      for (const line of state.ledgerLines) {
        if (line.status !== 'Posted') continue
        if (line.date > end) continue
        const bucket = totals.get(line.accountCode) ?? { debit: 0, credit: 0 }
        bucket.debit += line.debit
        bucket.credit += line.credit
        totals.set(line.accountCode, bucket)
      }

      const rows: TrialBalanceRow[] = []
      for (const [code, amount] of totals.entries()) {
        const acc = byCode.get(code)
        if (!acc) continue

        const accountType = mapCoaTypeToTrialBalanceType(acc.type)
        if (filters.accountType !== 'All' && accountType !== filters.accountType) continue

        const debit = amount.debit
        const credit = amount.credit
        const netBalance = debit - credit

        if (filters.balanceView === 'hide_zero' && debit === 0 && credit === 0) continue
        if (filters.balanceView === 'only_with_balance' && netBalance === 0) continue

        if (query) {
          const hay = `${acc.code} ${acc.name}`.toLowerCase()
          if (!hay.includes(query)) continue
        }

        rows.push({
          id: acc.code,
          accountCode: acc.code,
          accountName: acc.name,
          accountType,
          debit,
          credit,
          netBalance,
        })
      }

      // Keep it clean: sort by type then account code
      const order: Record<TrialBalanceRow['accountType'], number> = {
        Asset: 1,
        Liability: 2,
        Equity: 3,
        Revenue: 4,
        Expense: 5,
      }
      rows.sort((a, b) => (order[a.accountType] - order[b.accountType]) || a.accountCode.localeCompare(b.accountCode))

      if (filters.balanceView === 'show_all') {
        // Include accounts with zero movement as well (posted only).
        const existing = new Set(rows.map((r) => r.accountCode))
        for (const acc of coaLeaf) {
          if (existing.has(acc.code)) continue
          const accountType = mapCoaTypeToTrialBalanceType(acc.type)
          if (filters.accountType !== 'All' && accountType !== filters.accountType) continue
          if (query) {
            const hay = `${acc.code} ${acc.name}`.toLowerCase()
            if (!hay.includes(query)) continue
          }
          rows.push({
            id: acc.code,
            accountCode: acc.code,
            accountName: acc.name,
            accountType,
            debit: 0,
            credit: 0,
            netBalance: 0,
          })
        }
        rows.sort((a, b) => (order[a.accountType] - order[b.accountType]) || a.accountCode.localeCompare(b.accountCode))
      }

      return rows
    },

    trialBalanceTotals(_state): { totalDebit: number; totalCredit: number; difference: number; isBalanced: boolean; accountCount: number } {
      const rows = (this as unknown as { trialBalanceRows: TrialBalanceRow[] }).trialBalanceRows
      const totalDebit = rows.reduce((s, r) => s + r.debit, 0)
      const totalCredit = rows.reduce((s, r) => s + r.credit, 0)
      const difference = totalDebit - totalCredit
      return {
        totalDebit,
        totalCredit,
        difference,
        isBalanced: totalDebit === totalCredit,
        accountCount: rows.length,
      }
    },
  },

  actions: {
    initLedgerLines() {
      if (this.ledgerLines.length > 0) return
      this.ledgerLines = makeMockLedgerLines(this.chartOfAccounts, this.journals)
    },
    setCoaSearch(keyword: string) {
      this.coaFilters.search = keyword
    },
    setCoaTypeFilter(type: CoaFilters['type']) {
      this.coaFilters.type = type
    },
    setCoaActiveFilter(value: CoaFilters['active']) {
      this.coaFilters.active = value
    },
    selectCoa(id: string) {
      this.selectedCoaId = id
    },
    addMockCoa(payload: Omit<MockChartOfAccount, 'id'>) {
      const id = payload.code
      this.chartOfAccounts = [{ ...payload, id }, ...this.chartOfAccounts]
    },
    updateMockCoa(id: string, payload: Partial<MockChartOfAccount>) {
      this.chartOfAccounts = this.chartOfAccounts.map((row) => (row.id === id ? { ...row, ...payload } : row))
    },
    deactivateMockCoa(id: string) {
      this.updateMockCoa(id, { isActive: false })
    },

    setJournalSearch(keyword: string) {
      this.journalFiltersDraft.search = keyword
    },
    setJournalDateRange(startDate: string, endDate: string) {
      this.journalFiltersDraft.startDate = startDate
      this.journalFiltersDraft.endDate = endDate
    },
    setJournalStatuses(statuses: MockJournalStatus[]) {
      this.journalFiltersDraft.statuses = statuses
    },
    setJournalStatusFilter(status: MockJournalStatus | 'All') {
      this.journalFiltersDraft.statuses = status === 'All' ? ['Draft', 'Posted', 'Void'] : [status]
    },
    applyJournalFilters() {
      this.journalFilters = {
        search: this.journalFiltersDraft.search,
        startDate: this.journalFiltersDraft.startDate,
        endDate: this.journalFiltersDraft.endDate,
        statuses: [...this.journalFiltersDraft.statuses],
      }
    },
    resetJournalFilters() {
      const next = defaultJournalFilters()
      this.journalFiltersDraft = { ...next, statuses: [...next.statuses] }
      this.journalFilters = { ...next, statuses: [...next.statuses] }
    },
    selectJournal(id: string) {
      this.selectedJournalId = id
    },
    addMockJournal(payload: Omit<MockJournal, 'id'>) {
      const id = payload.journalNo
      this.journals = [{ ...payload, id }, ...this.journals]
    },
    updateMockJournal(id: string, payload: Partial<MockJournal>) {
      this.journals = this.journals.map((row) => (row.id === id ? { ...row, ...payload } : row))
    },
    markJournalPosted(id: string) {
      this.updateMockJournal(id, { status: 'Posted' })
    },
    voidJournal(id: string) {
      this.updateMockJournal(id, { status: 'Void' })
    },

    setLedgerSearch(keyword: string) {
      this.ledgerFilters.search = keyword
    },
    setLedgerAccountCode(accountCode: string | null) {
      this.ledgerFilters.accountCode = accountCode
      this.selectedLedgerAccountCode = accountCode
    },
    setLedgerDateRange(from: string | null, to: string | null) {
      this.ledgerFilters.dateFrom = from
      this.ledgerFilters.dateTo = to
    },
    setLedgerStatuses(statuses: LedgerFilters['statuses']) {
      this.ledgerFilters.statuses = statuses
    },
    resetLedgerFilters() {
      this.ledgerFilters = {
        search: '',
        accountCode: '111.102-01',
        dateFrom: '2026-05-01',
        dateTo: '2026-05-31',
        statuses: ['Posted'],
      }
      this.selectedLedgerAccountCode = '111.102-01'
    },
    selectLedgerAccount(accountCode: string | null) {
      this.selectedLedgerAccountCode = accountCode
      this.ledgerFilters.accountCode = accountCode
    },

    addMockLedgerLine(payload: Omit<MockLedgerLine, 'id'>) {
      const id = `LED-${Math.random().toString(16).slice(2)}`
      this.ledgerLines = [{ id, ...payload }, ...this.ledgerLines]
    },
    updateMockLedgerLine(id: string, payload: Partial<MockLedgerLine>) {
      this.ledgerLines = this.ledgerLines.map((row) => (row.id === id ? { ...row, ...payload } : row))
    },

    setTrialBalanceSearch(keyword: string) {
      if (!this.trialBalanceFiltersDraft) return
      this.trialBalanceFiltersDraft.search = keyword
    },
    setTrialBalanceAsOfDate(asOfDate: string) {
      if (!this.trialBalanceFiltersDraft) return
      this.trialBalanceFiltersDraft.asOfDate = asOfDate
    },
    setTrialBalanceAccountType(accountType: TrialBalanceAccountType) {
      if (!this.trialBalanceFiltersDraft) return
      this.trialBalanceFiltersDraft.accountType = accountType
    },
    setTrialBalanceBalanceView(balanceView: TrialBalanceBalanceView) {
      if (!this.trialBalanceFiltersDraft) return
      this.trialBalanceFiltersDraft.balanceView = balanceView
    },
    resetTrialBalanceFilters() {
      this.trialBalanceFiltersDraft = {
        search: '',
        asOfDate: '2026-05-31',
        accountType: 'All',
        balanceView: 'hide_zero',
      }
    },
    applyTrialBalanceFilters() {
      if (!this.trialBalanceFiltersDraft) return
      this.trialBalanceFilters = { ...this.trialBalanceFiltersDraft }
    },
    refreshTrialBalance() {
      // mock-only refresh: recompute ledger lines if needed
      this.initLedgerLines()
    },
  },
})
