import type { Component } from 'vue'

import DashboardWorkspaceContent from '@/pages/dashboard/DashboardWorkspaceContent.vue'
import JournalWorkspaceContent from '@/pages/accounting/journals/JournalWorkspaceContent.vue'
import ChartOfAccountsWorkspaceContent from '@/pages/accounting/chart-of-accounts/ChartOfAccountsWorkspaceContent.vue'
import TrialBalanceWorkspaceContent from '@/pages/accounting/trial-balance/TrialBalanceWorkspaceContent.vue'
import GeneralLedgerWorkspaceContent from '@/pages/reports/general-ledger/GeneralLedgerWorkspaceContent.vue'
import FinancialStatementWorkspace from '@/features/reports/financial-statements/FinancialStatementWorkspace.vue'
import BackendResourceWorkspaceContent from '@/pages/workspace/BackendResourceWorkspaceContent.vue'
import UserAccessPage from '@/pages/access/UserAccessPage.vue'
import RolesPage from '@/pages/access/RolesPage.vue'
import SalesQuotationFormPage from '@/pages/sales/SalesQuotationFormPage.vue'
import SalesOrderFormPage from '@/pages/sales/SalesOrderFormPage.vue'
import DeliveryOrderFormPage from '@/pages/sales/DeliveryOrderFormPage.vue'
import ProformaInvoiceFormPage from '@/pages/sales/ProformaInvoiceFormPage.vue'
import SalesInvoiceFormPage from '@/pages/sales/SalesInvoiceFormPage.vue'
import BillingInvoiceFormPage from '@/pages/sales/BillingInvoiceFormPage.vue'
import CustomerDepositFormPage from '@/pages/sales/CustomerDepositFormPage.vue'
import SalesReceiptFormPage from '@/pages/sales/SalesReceiptFormPage.vue'
import SalesReturnFormPage from '@/pages/sales/SalesReturnFormPage.vue'
import CustomerSummaryPage from '@/pages/sales/CustomerSummaryPage.vue'
import OpenInvoicesPage from '@/pages/sales/OpenInvoicesPage.vue'
import ArAgingPage from '@/pages/sales/ArAgingPage.vue'
import ArReconciliationPage from '@/pages/sales/ArReconciliationPage.vue'

import PurchaseRequestFormPage from '@/pages/purchase/PurchaseRequestFormPage.vue'
import PurchaseOrderFormPage from '@/pages/purchase/PurchaseOrderFormPage.vue'
import GoodsReceiptFormPage from '@/pages/purchase/GoodsReceiptFormPage.vue'
import VendorBillFormPage from '@/pages/purchase/VendorBillFormPage.vue'
import VendorDepositFormPage from '@/pages/purchase/VendorDepositFormPage.vue'
import VendorPaymentFormPage from '@/pages/purchase/VendorPaymentFormPage.vue'
import PurchaseReturnFormPage from '@/pages/purchase/PurchaseReturnFormPage.vue'
import VendorSummaryPage from '@/pages/purchase/VendorSummaryPage.vue'
import OpenBillsPage from '@/pages/purchase/OpenBillsPage.vue'
import ApAgingPage from '@/pages/purchase/ApAgingPage.vue'
import ApReconciliationPage from '@/pages/purchase/ApReconciliationPage.vue'

export const workspaceRegistry: Record<string, Component> = {
  '/dashboard': DashboardWorkspaceContent,
  '/accounting/journals': JournalWorkspaceContent,
  '/accounting/chart-of-accounts': ChartOfAccountsWorkspaceContent,
  '/accounting/trial-balance': TrialBalanceWorkspaceContent,
  '/reports/general-ledger': GeneralLedgerWorkspaceContent,
  '/reports/profit-loss': FinancialStatementWorkspace,
  '/reports/balance-sheet': FinancialStatementWorkspace,
  '/reports/cash-flow': FinancialStatementWorkspace,
  '/reports/financial-summary': FinancialStatementWorkspace,
  '/access/users': UserAccessPage,
  '/access/roles': RolesPage,

  // Sales & AR
  '/sales/quotations': SalesQuotationFormPage,
  '/sales/orders': SalesOrderFormPage,
  '/sales/delivery-orders': DeliveryOrderFormPage,
  '/sales/proformas': ProformaInvoiceFormPage,
  '/sales/invoices': SalesInvoiceFormPage,
  '/sales/billings': BillingInvoiceFormPage,
  '/sales/customer-deposits': CustomerDepositFormPage,
  '/sales/receipts': SalesReceiptFormPage,
  '/sales/returns': SalesReturnFormPage,
  '/sales/ar/customer-summary': CustomerSummaryPage,
  '/sales/ar/open-invoices': OpenInvoicesPage,
  '/sales/ar/aging': ArAgingPage,
  '/sales/ar/reconciliation': ArReconciliationPage,

  // Purchase & AP
  '/purchase/requests': PurchaseRequestFormPage,
  '/purchase/orders': PurchaseOrderFormPage,
  '/purchase/goods-receipts': GoodsReceiptFormPage,
  '/purchase/bills': VendorBillFormPage,
  '/purchase/vendor-deposits': VendorDepositFormPage,
  '/purchase/payments': VendorPaymentFormPage,
  '/purchase/returns': PurchaseReturnFormPage,
  '/purchase/ap/vendor-summary': VendorSummaryPage,
  '/purchase/ap/open-bills': OpenBillsPage,
  '/purchase/ap/aging': ApAgingPage,
  '/purchase/ap/reconciliation': ApReconciliationPage,
}

export const defaultWorkspaceComponent = BackendResourceWorkspaceContent
