import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCompanyStore } from '@/stores/companyStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/LoginPage.vue'),
      meta: { public: true },
    },
    {
      path: '/select-company',
      name: 'select-company',
      component: () => import('@/pages/auth/SelectCompanyPage.vue'),
      meta: { requiresAuth: true },
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
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['reports.view'],
            apiEndpoint: '/reports/trial-balance',
            primaryTabId: '/reports/trial-balance',
            primaryTabLabel: 'Trial Balance',
            primaryTabClosable: true,
          },
        },
        {
          path: 'sales/invoices',
          name: 'sales-invoices',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['sales.invoices.view'],
            apiEndpoint: '/sales/invoices',
            primaryTabId: '/sales/invoices',
            primaryTabLabel: 'Sales Invoices',
            primaryTabClosable: true,
          },
        },
        {
          path: 'sales/orders',
          name: 'sales-orders',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['sales.orders.view'],
            apiEndpoint: '/sales/orders',
            primaryTabId: '/sales/orders',
            primaryTabLabel: 'Sales Orders',
            primaryTabClosable: true,
          },
        },
        {
          path: 'sales/ar-aging',
          name: 'ar-aging',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['sales.ar.view'],
            apiEndpoint: '/sales/ar/aging',
            primaryTabId: '/sales/ar-aging',
            primaryTabLabel: 'AR Aging',
            primaryTabClosable: true,
          },
        },
        {
          path: 'cash-bank/cash-in',
          name: 'cash-in',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['cash_bank.view'],
            apiEndpoint: '/cash-bank/cash-receipts',
            primaryTabId: '/cash-bank/cash-in',
            primaryTabLabel: 'Cash In',
            primaryTabClosable: true,
          },
        },
        {
          path: 'cash-bank/cash-out',
          name: 'cash-out',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['cash_bank.view'],
            apiEndpoint: '/cash-bank/cash-payments',
            primaryTabId: '/cash-bank/cash-out',
            primaryTabLabel: 'Cash Out',
            primaryTabClosable: true,
          },
        },
        {
          path: 'cash-bank/bank-transfer',
          name: 'bank-transfer',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['cash_bank.view'],
            apiEndpoint: '/cash-bank/bank-transfers',
            primaryTabId: '/cash-bank/bank-transfer',
            primaryTabLabel: 'Bank Transfer',
            primaryTabClosable: true,
          },
        },
        {
          path: 'inventory/products',
          name: 'inventory-products',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['products.view'],
            apiEndpoint: '/master-data/products',
            primaryTabId: '/inventory/products',
            primaryTabLabel: 'Products',
            primaryTabClosable: true,
          },
        },
        {
          path: 'inventory/stock',
          name: 'inventory-stock',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['inventory.stock.view'],
            apiEndpoint: '/inventory/stock-balances',
            primaryTabId: '/inventory/stock',
            primaryTabLabel: 'Stock Balance',
            primaryTabClosable: true,
          },
        },
        {
          path: 'inventory/movements',
          name: 'inventory-movements',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['inventory.movements.view'],
            apiEndpoint: '/inventory/stock-movements',
            primaryTabId: '/inventory/movements',
            primaryTabLabel: 'Stock Movement',
            primaryTabClosable: true,
          },
        },
        {
          path: 'settings/company',
          name: 'settings-company',
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
          path: 'settings/permissions',
          name: 'settings-permissions',
          component: () => import('@/pages/workspace/RouteIntent.vue'),
          meta: {
            permissions: ['app.dev'],
            apiEndpoint: '/auth/permissions',
            primaryTabId: '/settings/permissions',
            primaryTabLabel: 'Role & Permission',
            primaryTabClosable: true,
          },
        },
        // Design/demo routes (restricted)
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
  const requiresAuth = to.matched.some((r) => Boolean(r.meta.requiresAuth)) || (!isPublic && to.path !== '/login')
  const requiresCompany = to.matched.some((r) => Boolean(r.meta.requiresCompany))

  if (!isPublic && requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { next: to.fullPath } }
  }

  if (!isPublic && requiresCompany && company.activeCompanyId == null) {
    return { path: '/select-company', query: { next: to.fullPath } }
  }

  const requiredPermissions = to.matched.flatMap((r) => (r.meta.permissions as string[] | undefined) ?? [])
  if (requiredPermissions.length > 0) {
    const allowed = auth.permissions.includes('*') || requiredPermissions.every((p) => auth.permissions.includes(p))
    if (!allowed) {
      // Basic deny: redirect to dashboard (or login if not authed)
      return auth.isAuthenticated ? { path: '/dashboard' } : { path: '/login' }
    }
  }

  if (to.path === '/login' && auth.isAuthenticated) {
    return { path: company.activeCompanyId == null ? '/select-company' : '/dashboard' }
  }
  return true
})

export default router
