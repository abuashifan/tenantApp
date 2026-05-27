import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'
import { sidebarPlaceholderItems } from '@/navigation/sidebar'

const placeholderWorkspaceRoutes = sidebarPlaceholderItems.map((item) => ({
  path: item.href.slice(1),
  name: `workspace-${item.id}`,
  component: () => import('@/pages/workspace/RouteIntent.vue'),
  meta: {
    permissions: [item.permission],
    apiEndpoint: item.endpoint,
    primaryTabId: item.href,
    primaryTabLabel: item.label,
    primaryTabClosable: true,
    workspacePlaceholder: true,
  },
}))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { public: true, guestOnly: true },
    },
    {
      path: '/select-company',
      name: 'select-company',
      component: () => import('@/pages/auth/SelectCompanyPage.vue'),
      meta: { requiresAuth: true, requiresCompany: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppWorkspaceShell.vue'),
      meta: { requiresAuth: true, requiresCompany: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['dashboard.view'],
            apiEndpoint: '/accounting/fiscal-year/status',
            primaryTabId: '/dashboard',
            primaryTabLabel: 'Dashboard',
            primaryTabClosable: false,
          },
        },
        {
          path: 'accounting/journals',
          name: 'journals',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['journal.view'],
            apiEndpoint: '/journals',
            primaryTabId: '/accounting/journals',
            primaryTabLabel: 'Journal Entries',
            primaryTabClosable: true,
          },
        },
        // Draft placeholders for routes that exist in menu but not implemented yet
        {
          path: 'accounting/chart-of-accounts',
          name: 'chart-of-accounts',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['coa.view'],
            apiEndpoint: '/master-data/chart-of-accounts',
            primaryTabId: '/accounting/chart-of-accounts',
            primaryTabLabel: 'Chart of Accounts',
            primaryTabClosable: true,
          },
        },
        {
          path: 'accounting/fiscal-closing',
          name: 'fiscal-closing',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['fiscal_year.view'],
            apiEndpoint: '/accounting/fiscal-year/status',
            primaryTabId: '/accounting/fiscal-closing',
            primaryTabLabel: 'Fiscal Closing',
            primaryTabClosable: true,
          },
        },
        {
          path: 'accounting/period-locks',
          name: 'period-locks',
          redirect: '/accounting/fiscal-closing',
        },
        {
          path: 'reports/general-ledger',
          name: 'general-ledger',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['reports.view'],
            apiEndpoint: '/reports/general-ledger',
            primaryTabId: '/reports/general-ledger',
            primaryTabLabel: 'General Ledger',
            primaryTabClosable: true,
          },
        },
        {
          path: 'reports/trial-balance',
          name: 'trial-balance',
          redirect: '/accounting/trial-balance',
        },
        {
          path: 'accounting/trial-balance',
          name: 'accounting-trial-balance',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['reports.view'],
            apiEndpoint: '/reports/trial-balance',
            primaryTabId: '/accounting/trial-balance',
            primaryTabLabel: 'Trial Balance',
            primaryTabClosable: true,
          },
        },
        {
          path: 'cash-bank/account-statement',
          name: 'cash-bank-account-statement',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['cash_bank.view'],
            apiEndpoint: '/cash-bank/reports/account-statement',
            primaryTabId: '/cash-bank/account-statement',
            primaryTabLabel: 'Account Statement',
            primaryTabClosable: true,
          },
        },
        {
          path: 'settings/company',
          name: 'company-settings',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['settings.company.view'],
            apiEndpoint: '/settings/company',
            primaryTabId: '/settings/company',
            primaryTabLabel: 'Company Settings',
            primaryTabClosable: true,
          },
        },
        {
          path: 'reports/profit-loss',
          name: 'profit-loss',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['reports.view'],
            apiEndpoint: '/reports/profit-loss',
            primaryTabId: '/reports/profit-loss',
            primaryTabLabel: 'Profit & Loss',
            primaryTabClosable: true,
          },
        },
        {
          path: 'reports/balance-sheet',
          name: 'balance-sheet',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['reports.view'],
            apiEndpoint: '/reports/balance-sheet',
            primaryTabId: '/reports/balance-sheet',
            primaryTabLabel: 'Balance Sheet',
            primaryTabClosable: true,
          },
        },
        {
          path: 'reports/cash-flow',
          name: 'cash-flow',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['reports.view'],
            apiEndpoint: '/reports/cash-flow',
            primaryTabId: '/reports/cash-flow',
            primaryTabLabel: 'Cash Flow',
            primaryTabClosable: true,
          },
        },
        {
          path: 'reports/financial-summary',
          name: 'financial-summary',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['reports.view'],
            apiEndpoint: '/reports/financial-summary',
            primaryTabId: '/reports/financial-summary',
            primaryTabLabel: 'Financial Summary',
            primaryTabClosable: true,
          },
        },
        ...placeholderWorkspaceRoutes,
        {
          path: 'sales/ar/customers/:customerId/ledger',
          name: 'sales-ar-customer-ledger',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['sales.ar.view'],
            apiEndpoint: '/sales/ar/customers/:customerId/ledger',
            primaryTabLabel: 'AR Customer Ledger',
            primaryTabClosable: true,
            primaryTabUseRoutePath: true,
            workspaceRegistryKey: '/sales/ar/customer-ledger',
          },
        },
        {
          path: 'sales/ar/invoices/:invoiceId/ledger',
          name: 'sales-ar-invoice-ledger',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['sales.ar.view'],
            apiEndpoint: '/sales/ar/invoices/:invoiceId/ledger',
            primaryTabLabel: 'AR Invoice Ledger',
            primaryTabClosable: true,
            primaryTabUseRoutePath: true,
            workspaceRegistryKey: '/sales/ar/invoice-ledger',
          },
        },
        {
          path: 'purchase/ap/vendors/:vendorId/ledger',
          name: 'purchase-ap-vendor-ledger',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['purchase.ap.view'],
            apiEndpoint: '/purchase/ap/vendors/:vendorId/ledger',
            primaryTabLabel: 'AP Vendor Ledger',
            primaryTabClosable: true,
            primaryTabUseRoutePath: true,
            workspaceRegistryKey: '/purchase/ap/vendor-ledger',
          },
        },
        {
          path: 'purchase/ap/bills/:billId/ledger',
          name: 'purchase-ap-bill-ledger',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['purchase.ap.view'],
            apiEndpoint: '/purchase/ap/bills/:billId/ledger',
            primaryTabLabel: 'AP Bill Ledger',
            primaryTabClosable: true,
            primaryTabUseRoutePath: true,
            workspaceRegistryKey: '/purchase/ap/bill-ledger',
          },
        },
        // Design/demo routes (restricted)
        {
          path: 'access/company-users',
          name: 'access-company-users',
          component: () => import('@/pages/access/CompanyUsersPage.vue'),
          meta: {
            permissions: ['access.users.view'],
            primaryTabId: '/access/company-users',
            primaryTabLabel: 'Company Users',
            primaryTabClosable: true,
          },
        },
        {
          path: 'access/users',
          name: 'access-users',
          redirect: '/access/company-users',
        },
        {
          path: 'access/users/:id',
          name: 'access-user-detail',
          component: () => import('@/pages/access/UserAccessPage.vue'),
          meta: {
            permissions: ['access.permissions.view'],
            primaryTabId: '/access/users',
            primaryTabLabel: 'User Access',
            primaryTabClosable: true,
          },
        },
        {
          path: 'access/permissions',
          name: 'access-permissions',
          component: () => import('@/pages/access/UserAccessPage.vue'),
          meta: {
            permissions: ['access.permissions.view'],
            primaryTabId: '/access/permissions',
            primaryTabLabel: 'Permission Matrix',
            primaryTabClosable: true,
          },
        },
        {
          path: 'access/roles',
          name: 'access-roles',
          component: () => import('@/pages/access/RolesPage.vue'),
          meta: {
            permissions: ['access.roles.view'],
            primaryTabId: '/access/roles',
            primaryTabLabel: 'Roles',
            primaryTabClosable: true,
          },
        },
        {
          path: 'access/roles/:id',
          name: 'access-role-detail',
          component: () => import('@/pages/access/RoleDetailPage.vue'),
          meta: {
            permissions: ['access.roles.view'],
            primaryTabId: '/access/roles/detail',
            primaryTabLabel: 'Role Detail',
            primaryTabClosable: true,
          },
        },
        {
          path: 'access/invitations',
          name: 'access-invitations',
          component: () => import('@/pages/access/InvitationsPage.vue'),
          meta: {
            permissions: ['access.invitations.view'],
            primaryTabId: '/access/invitations',
            primaryTabLabel: 'Invitations',
            primaryTabClosable: true,
          },
        },
        {
          path: 'access/audit',
          name: 'access-audit',
          component: () => import('@/pages/access/AccessAuditPage.vue'),
          meta: {
            permissions: ['access.audit.view'],
            primaryTabId: '/access/audit',
            primaryTabLabel: 'Access Audit',
            primaryTabClosable: true,
          },
        },
        {
          path: 'design/reusable-table',
          name: 'design-reusable-table',
          component: () => import('@/pages/design/ReusableTableLayoutDemo.vue'),
          meta: { permissions: ['app.dev'] },
        },
        {
          path: 'design/reusable-form',
          name: 'design-reusable-form',
          component: () => import('@/pages/design/ReusableFormLayoutDemo.vue'),
          meta: { permissions: ['app.dev'] },
        },
        {
          path: 'design/dialogs',
          name: 'design-dialogs',
          component: () => import('@/pages/design/ModalDialogPatternDemo.vue'),
          meta: { permissions: ['app.dev'] },
        },
        {
          path: 'design/mobile',
          name: 'design-mobile',
          component: () => import('@/pages/design/MobileLayoutDemo.vue'),
          meta: { permissions: ['app.dev'] },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const company = useCompanyStore()

  const isPublic = to.matched.some((r) => Boolean(r.meta.public))
  const guestOnly = to.matched.some((r) => Boolean(r.meta.guestOnly))
  const requiresAuth = to.matched.some((r) => Boolean(r.meta.requiresAuth)) || (!isPublic && to.path !== '/login')
  const requiresCompany = to.matched.some((r) => Boolean(r.meta.requiresCompany))

  if (requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { next: to.fullPath } }
  }

  if (guestOnly && auth.isAuthenticated) {
    return { path: company.activeCompanyId == null ? '/select-company' : '/dashboard' }
  }

  if (requiresCompany && company.activeCompanyId == null) {
    return { path: '/select-company', query: { next: to.fullPath } }
  }

  const requiredPermissions = to.matched.flatMap((r) => (r.meta.permissions as string[] | undefined) ?? [])
  if (requiredPermissions.length > 0) {
    const allowed = auth.permissions.includes('*') || requiredPermissions.every((p) => auth.permissions.includes(p))
    if (!allowed) {
      // Basic deny: redirect to dashboard (or login if not authed)
      return auth.isAuthenticated && to.path !== '/dashboard' ? { path: '/dashboard' } : true
    }
  }

  return true
})

export default router
