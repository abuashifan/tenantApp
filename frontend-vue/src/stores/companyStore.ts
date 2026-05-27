import { defineStore } from 'pinia'

export type Company = {
  id: string | number
  name: string
  legal_name?: string
  slug?: string
  code?: string
  status?: string
  user_role?: string
  tenant_database?: {
    database_name?: string
    database_path?: string
    status?: string
  } | null
}

export const useCompanyStore = defineStore('company', {
  state: () => ({
    activeCompanyId: null as Company['id'] | null,
    activeCompanyData: null as Company | null,
    companies: [] as Company[],
    switching: false as boolean,
  }),
  getters: {
    activeCompany(state) {
      if (state.activeCompanyId == null) return null
      return state.activeCompanyData ?? state.companies.find((c) => c.id === state.activeCompanyId) ?? null
    },
  },
  actions: {
    loadFromStorage() {
      const activeRaw = localStorage.getItem('ta_active_company_id')
      this.activeCompanyId = activeRaw ? (JSON.parse(activeRaw) as Company['id']) : null
      const activeCompanyRaw = localStorage.getItem('ta_active_company')
      this.activeCompanyData = activeCompanyRaw ? (JSON.parse(activeCompanyRaw) as Company) : null
      const companiesRaw = localStorage.getItem('ta_companies')
      this.companies = companiesRaw ? (JSON.parse(companiesRaw) as Company[]) : []
    },

    persist() {
      localStorage.setItem('ta_active_company_id', JSON.stringify(this.activeCompanyId))
      localStorage.setItem('ta_active_company', JSON.stringify(this.activeCompany))
      localStorage.setItem('ta_companies', JSON.stringify(this.companies ?? []))
    },

    setCompanies(companies: Company[]) {
      this.companies = companies
      this.persist()
    },
    setActiveCompany(id: Company['id'] | null) {
      this.activeCompanyId = id
      this.activeCompanyData =
        id == null ? null : this.companies.find((company) => String(company.id) === String(id)) ?? null
      this.persist()
    },
    setActiveCompanyData(company: Company | null) {
      this.activeCompanyId = company?.id ?? null
      this.activeCompanyData = company
      this.persist()
    },
    clearActiveCompany() {
      this.activeCompanyId = null
      this.activeCompanyData = null
      this.persist()
    },
    clearCompanyState() {
      this.activeCompanyId = null
      this.activeCompanyData = null
      this.companies = []
      this.switching = false
      localStorage.removeItem('ta_active_company_id')
      localStorage.removeItem('ta_active_company')
      localStorage.removeItem('ta_companies')
      localStorage.removeItem('active_company_id')
      localStorage.removeItem('active_company')
    },
  },
})
