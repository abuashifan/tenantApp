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

type CoaFilters = {
  search: string
  type: MockChartOfAccountType | ''
  active: 'active' | 'inactive' | 'all'
}

type JournalFilters = {
  search: string
  status: MockJournalStatus | 'All'
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function containsText(haystack: string, needle: string) {
  if (!needle) return true
  return normalizeText(haystack).includes(needle)
}

function makeMockCoa(): MockChartOfAccount[] {
  // Temporary mock balances for UI testing only.
  // TODO: Real balances must come from posted journal lines / reports API in backend later.
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

export const useMockAccountingDataStore = defineStore('mockAccountingData', {
  state: () => ({
    chartOfAccounts: makeMockCoa() as MockChartOfAccount[],
    journals: makeMockJournals() as MockJournal[],
    coaFilters: {
      search: '',
      type: '' as CoaFilters['type'],
      active: 'active' as CoaFilters['active'],
    },
    journalFilters: {
      search: '',
      status: 'All' as JournalFilters['status'],
    },
    selectedCoaId: null as string | null,
    selectedJournalId: null as string | null,
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
      const status = state.journalFilters.status

      return state.journals.filter((row) => {
        const matchesText =
          containsText(`${row.journalNo} ${row.description} ${row.source}`, search)
        const matchesStatus = status === 'All' ? true : row.status === status
        return matchesText && matchesStatus
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
  },

  actions: {
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
      this.journalFilters.search = keyword
    },
    setJournalStatusFilter(status: JournalFilters['status']) {
      this.journalFilters.status = status
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
  },
})
