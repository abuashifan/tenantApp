import { defineStore } from 'pinia'

export type Company = {
  id: string | number
  name: string
  user_role?: string
}

export const useCompanyStore = defineStore('company', {
  state: () => ({
    activeCompanyId: null as Company['id'] | null,
    companies: [] as Company[],
    switching: false as boolean,
  }),
  getters: {
    activeCompany(state) {
      if (state.activeCompanyId == null) return null
      return state.companies.find((c) => c.id === state.activeCompanyId) ?? null
    },
  },
  actions: {
    loadFromStorage() {
      const activeRaw = localStorage.getItem('ta_active_company_id')
      this.activeCompanyId = activeRaw ? (JSON.parse(activeRaw) as Company['id']) : null
      const companiesRaw = localStorage.getItem('ta_companies')
      this.companies = companiesRaw ? (JSON.parse(companiesRaw) as Company[]) : []
    },

    persist() {
      localStorage.setItem('ta_active_company_id', JSON.stringify(this.activeCompanyId))
      localStorage.setItem('ta_companies', JSON.stringify(this.companies ?? []))
    },

    setCompanies(companies: Company[]) {
      this.companies = companies
      this.persist()
    },
    setActiveCompany(id: Company['id'] | null) {
      this.activeCompanyId = id
      this.persist()
    },
    clearActiveCompany() {
      this.activeCompanyId = null
      this.persist()
    },
  },
})
