<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PermissionController;
use App\Http\Controllers\Api\Accounting\FiscalYearStatusController;
use App\Http\Controllers\Api\Accounting\FiscalYearClosingController;
use App\Http\Controllers\Api\Accounting\PeriodLockController;
use App\Http\Controllers\Api\Companies\CompanyController;
use App\Http\Controllers\Api\Settings\CompanySettingController;
use App\Http\Controllers\Api\Tenant\TenantContextTestController;
use App\Http\Controllers\Api\MasterData\AccountMappingController;
use App\Http\Controllers\Api\MasterData\ChartOfAccountController;
use App\Http\Controllers\Api\MasterData\ContactController;
use App\Http\Controllers\Api\MasterData\ProductCategoryController;
use App\Http\Controllers\Api\MasterData\ProductController;
use App\Http\Controllers\Api\MasterData\UnitController;
use App\Http\Controllers\Api\MasterData\WarehouseController;
use App\Http\Controllers\Api\MasterData\DepartmentController;
use App\Http\Controllers\Api\MasterData\ProjectController;
use App\Http\Controllers\Api\Journal\JournalEntryController;
use App\Http\Controllers\Api\Reports\GeneralLedgerController;
use App\Http\Controllers\Api\Reports\AccountLedgerDetailController;
use App\Http\Controllers\Api\Reports\TrialBalanceController;
use App\Http\Controllers\Api\Reports\ProfitLossController;
use App\Http\Controllers\Api\Reports\BalanceSheetController;
use App\Http\Controllers\Api\Reports\CashFlowController;
use App\Http\Controllers\Api\Reports\FinancialSummaryController;
use App\Http\Controllers\Api\Sales\DeliveryOrderController;
use App\Http\Controllers\Api\Sales\BillingInvoiceController;
use App\Http\Controllers\Api\Sales\CustomerDepositController;
use App\Http\Controllers\Api\Sales\ProformaInvoiceController;
use App\Http\Controllers\Api\Sales\SalesReceiptController;
use App\Http\Controllers\Api\Sales\SalesReturnController;
use App\Http\Controllers\Api\Sales\SalesInvoiceController;
use App\Http\Controllers\Api\Sales\SalesOrderController;
use App\Http\Controllers\Api\Sales\SalesQuotationController;

Route::get('/health', [HealthController::class, 'index']);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/companies', [CompanyController::class, 'index']);
    Route::post('/companies/select', [CompanyController::class, 'select']);
});

Route::middleware(['auth:sanctum', 'company.access'])->group(function () {
    Route::get('/tenant-context-test', TenantContextTestController::class);

    Route::get('/auth/permissions', [PermissionController::class, 'index']);

    Route::get('/settings/company', [CompanySettingController::class, 'show'])
        ->middleware('permission:settings.company.view');
    Route::patch('/settings/company/accounting', [CompanySettingController::class, 'updateAccounting'])
        ->middleware('permission:settings.company.edit');
    Route::patch('/settings/company/modules', [CompanySettingController::class, 'updateModules'])
        ->middleware('permission:settings.company.edit');
});

Route::middleware(['auth:sanctum', 'company.access', 'permission:dashboard.view'])->group(function () {
    Route::get('/accounting/fiscal-year/status', FiscalYearStatusController::class);
});

Route::middleware(['auth:sanctum', 'company.access'])->prefix('accounting')->group(function () {
    Route::get('/fiscal-years/{id}/closing-preview', [FiscalYearClosingController::class, 'preview'])
        ->middleware('permission:fiscal_year.view');
    Route::get('/fiscal-years/{id}/closing-checklist', [FiscalYearClosingController::class, 'checklist'])
        ->middleware('permission:fiscal_year.closing_wizard');
    Route::post('/fiscal-years/{id}/close', [FiscalYearClosingController::class, 'close'])
        ->middleware('permission:fiscal_year.close');
    Route::post('/fiscal-years/{id}/reopen', [FiscalYearClosingController::class, 'reopen'])
        ->middleware('permission:fiscal_year.reopen');

    Route::get('/period-locks/status', [PeriodLockController::class, 'status'])
        ->middleware('permission:fiscal_year.view');
    Route::patch('/period-locks', [PeriodLockController::class, 'update'])
        ->middleware('permission:fiscal_year.lock_manage');
});

// NOTE: Phase 1B demo endpoint `/api/my-companies-demo` has been disabled in Phase 2A.

Route::middleware(['auth:sanctum', 'company.access'])->prefix('master-data')->group(function () {
    // Chart of Accounts
    Route::get('/chart-of-accounts', [ChartOfAccountController::class, 'index'])->middleware('permission:coa.view');
    Route::post('/chart-of-accounts', [ChartOfAccountController::class, 'store'])->middleware('permission:coa.create');
    Route::get('/chart-of-accounts/{id}', [ChartOfAccountController::class, 'show'])->middleware('permission:coa.view');
    Route::patch('/chart-of-accounts/{id}', [ChartOfAccountController::class, 'update'])->middleware('permission:coa.edit');
    Route::patch('/chart-of-accounts/{id}/deactivate', [ChartOfAccountController::class, 'deactivate'])->middleware('permission:coa.deactivate');
    Route::patch('/chart-of-accounts/{id}/activate', [ChartOfAccountController::class, 'activate'])->middleware('permission:coa.edit');

    // Contacts
    Route::get('/contacts', [ContactController::class, 'index'])->middleware('permission:contacts.view');
    Route::post('/contacts', [ContactController::class, 'store'])->middleware('permission:contacts.create');
    Route::get('/contacts/{id}', [ContactController::class, 'show'])->middleware('permission:contacts.view');
    Route::patch('/contacts/{id}', [ContactController::class, 'update'])->middleware('permission:contacts.edit');
    Route::patch('/contacts/{id}/deactivate', [ContactController::class, 'deactivate'])->middleware('permission:contacts.deactivate');
    Route::patch('/contacts/{id}/activate', [ContactController::class, 'activate'])->middleware('permission:contacts.edit');

    // Units
    Route::get('/units', [UnitController::class, 'index'])->middleware('permission:units.view');
    Route::post('/units', [UnitController::class, 'store'])->middleware('permission:units.create');
    Route::get('/units/{id}', [UnitController::class, 'show'])->middleware('permission:units.view');
    Route::patch('/units/{id}', [UnitController::class, 'update'])->middleware('permission:units.edit');
    Route::patch('/units/{id}/deactivate', [UnitController::class, 'deactivate'])->middleware('permission:units.deactivate');
    Route::patch('/units/{id}/activate', [UnitController::class, 'activate'])->middleware('permission:units.edit');

    // Product Categories
    Route::get('/product-categories', [ProductCategoryController::class, 'index'])->middleware('permission:products.view');
    Route::post('/product-categories', [ProductCategoryController::class, 'store'])->middleware('permission:products.create');
    Route::get('/product-categories/{id}', [ProductCategoryController::class, 'show'])->middleware('permission:products.view');
    Route::patch('/product-categories/{id}', [ProductCategoryController::class, 'update'])->middleware('permission:products.edit');
    Route::patch('/product-categories/{id}/deactivate', [ProductCategoryController::class, 'deactivate'])->middleware('permission:products.deactivate');
    Route::patch('/product-categories/{id}/activate', [ProductCategoryController::class, 'activate'])->middleware('permission:products.edit');

    // Products
    Route::get('/products', [ProductController::class, 'index'])->middleware('permission:products.view');
    Route::post('/products', [ProductController::class, 'store'])->middleware('permission:products.create');
    Route::get('/products/{id}', [ProductController::class, 'show'])->middleware('permission:products.view');
    Route::patch('/products/{id}', [ProductController::class, 'update'])->middleware('permission:products.edit');
    Route::patch('/products/{id}/deactivate', [ProductController::class, 'deactivate'])->middleware('permission:products.deactivate');
    Route::patch('/products/{id}/activate', [ProductController::class, 'activate'])->middleware('permission:products.edit');

    // Warehouses
    Route::get('/warehouses', [WarehouseController::class, 'index'])->middleware('permission:warehouses.view');
    Route::post('/warehouses', [WarehouseController::class, 'store'])->middleware('permission:warehouses.create');
    Route::get('/warehouses/{id}', [WarehouseController::class, 'show'])->middleware('permission:warehouses.view');
    Route::patch('/warehouses/{id}', [WarehouseController::class, 'update'])->middleware('permission:warehouses.edit');
    Route::patch('/warehouses/{id}/deactivate', [WarehouseController::class, 'deactivate'])->middleware('permission:warehouses.deactivate');
    Route::patch('/warehouses/{id}/activate', [WarehouseController::class, 'activate'])->middleware('permission:warehouses.edit');

    // Departments (Analytical Dimensions)
    Route::get('/departments', [DepartmentController::class, 'index'])->middleware('permission:departments.view');
    Route::post('/departments', [DepartmentController::class, 'store'])->middleware('permission:departments.create');
    Route::get('/departments/{id}', [DepartmentController::class, 'show'])->middleware('permission:departments.view');
    Route::patch('/departments/{id}', [DepartmentController::class, 'update'])->middleware('permission:departments.edit');
    Route::patch('/departments/{id}/deactivate', [DepartmentController::class, 'deactivate'])->middleware('permission:departments.deactivate');
    Route::patch('/departments/{id}/activate', [DepartmentController::class, 'activate'])->middleware('permission:departments.edit');

    // Projects (Analytical Dimensions)
    Route::get('/projects', [ProjectController::class, 'index'])->middleware('permission:projects.view');
    Route::post('/projects', [ProjectController::class, 'store'])->middleware('permission:projects.create');
    Route::get('/projects/{id}', [ProjectController::class, 'show'])->middleware('permission:projects.view');
    Route::patch('/projects/{id}', [ProjectController::class, 'update'])->middleware('permission:projects.edit');
    Route::patch('/projects/{id}/deactivate', [ProjectController::class, 'deactivate'])->middleware('permission:projects.deactivate');
    Route::patch('/projects/{id}/activate', [ProjectController::class, 'activate'])->middleware('permission:projects.edit');

    // Account Mappings
    Route::get('/account-mappings', [AccountMappingController::class, 'index'])->middleware('permission:settings.company.view');
    Route::patch('/account-mappings/{mappingKey}', [AccountMappingController::class, 'update'])->middleware('permission:settings.company.edit');
});

Route::middleware(['auth:sanctum', 'company.access'])->prefix('reports')->group(function () {
    Route::get('/general-ledger', [GeneralLedgerController::class, 'index'])->middleware('permission:reports.view');
    Route::get('/account-ledger/{account}', [AccountLedgerDetailController::class, 'show'])->middleware('permission:reports.view');
    Route::get('/trial-balance', [TrialBalanceController::class, 'index'])->middleware('permission:reports.view');
    Route::get('/profit-loss', [ProfitLossController::class, 'index'])->middleware('permission:reports.view');
    Route::get('/balance-sheet', [BalanceSheetController::class, 'index'])->middleware('permission:reports.view');
    Route::get('/cash-flow', [CashFlowController::class, 'index'])->middleware('permission:reports.view');
    Route::get('/financial-summary', [FinancialSummaryController::class, 'index'])->middleware('permission:reports.view');
});

Route::middleware(['auth:sanctum', 'company.access'])->prefix('sales')->group(function () {
    Route::get('/quotations', [SalesQuotationController::class, 'index'])->middleware('permission:sales.quotations.view');
    Route::post('/quotations', [SalesQuotationController::class, 'store'])->middleware('permission:sales.quotations.create');
    Route::get('/quotations/{id}', [SalesQuotationController::class, 'show'])->middleware('permission:sales.quotations.view');
    Route::patch('/quotations/{id}', [SalesQuotationController::class, 'update'])->middleware('permission:sales.quotations.edit');
    Route::patch('/quotations/{id}/send', [SalesQuotationController::class, 'send'])->middleware('permission:sales.quotations.edit');
    Route::patch('/quotations/{id}/approve', [SalesQuotationController::class, 'approve'])->middleware('permission:sales.quotations.approve');
    Route::patch('/quotations/{id}/accept', [SalesQuotationController::class, 'accept'])->middleware('permission:sales.quotations.approve');
    Route::patch('/quotations/{id}/reject', [SalesQuotationController::class, 'reject'])->middleware('permission:sales.quotations.cancel');
    Route::patch('/quotations/{id}/cancel', [SalesQuotationController::class, 'cancel'])->middleware('permission:sales.quotations.cancel');

    Route::get('/orders', [SalesOrderController::class, 'index'])->middleware('permission:sales.orders.view');
    Route::post('/orders', [SalesOrderController::class, 'store'])->middleware('permission:sales.orders.create');
    Route::get('/orders/{id}', [SalesOrderController::class, 'show'])->middleware('permission:sales.orders.view');
    Route::patch('/orders/{id}', [SalesOrderController::class, 'update'])->middleware('permission:sales.orders.edit');
    Route::post('/orders/from-quotation/{quotationId}', [SalesOrderController::class, 'createFromQuotation'])->middleware('permission:sales.orders.convert');
    Route::patch('/orders/{id}/approve', [SalesOrderController::class, 'approve'])->middleware('permission:sales.orders.approve');
    Route::patch('/orders/{id}/confirm', [SalesOrderController::class, 'confirm'])->middleware('permission:sales.orders.confirm');
    Route::patch('/orders/{id}/cancel', [SalesOrderController::class, 'cancel'])->middleware('permission:sales.orders.cancel');
    Route::patch('/orders/{id}/close', [SalesOrderController::class, 'close'])->middleware('permission:sales.orders.confirm');

    Route::get('/delivery-orders', [DeliveryOrderController::class, 'index'])->middleware('permission:sales.delivery_orders.view');
    Route::post('/delivery-orders', [DeliveryOrderController::class, 'store'])->middleware('permission:sales.delivery_orders.create');
    Route::get('/delivery-orders/{id}', [DeliveryOrderController::class, 'show'])->middleware('permission:sales.delivery_orders.view');
    Route::patch('/delivery-orders/{id}', [DeliveryOrderController::class, 'update'])->middleware('permission:sales.delivery_orders.edit');
    Route::post('/delivery-orders/from-sales-order/{salesOrderId}', [DeliveryOrderController::class, 'createFromSalesOrder'])->middleware('permission:sales.delivery_orders.create');
    Route::patch('/delivery-orders/{id}/ready', [DeliveryOrderController::class, 'ready'])->middleware('permission:sales.delivery_orders.ship');
    Route::patch('/delivery-orders/{id}/ship', [DeliveryOrderController::class, 'ship'])->middleware('permission:sales.delivery_orders.ship');
    Route::patch('/delivery-orders/{id}/deliver', [DeliveryOrderController::class, 'deliver'])->middleware('permission:sales.delivery_orders.deliver');
    Route::patch('/delivery-orders/{id}/cancel', [DeliveryOrderController::class, 'cancel'])->middleware('permission:sales.delivery_orders.cancel');
    Route::patch('/delivery-orders/{id}/void', [DeliveryOrderController::class, 'void'])->middleware('permission:sales.delivery_orders.void');

    Route::get('/proformas', [ProformaInvoiceController::class, 'index'])->middleware('permission:sales.proformas.view');
    Route::post('/proformas', [ProformaInvoiceController::class, 'store'])->middleware('permission:sales.proformas.create');
    Route::get('/proformas/{id}', [ProformaInvoiceController::class, 'show'])->middleware('permission:sales.proformas.view');
    Route::patch('/proformas/{id}', [ProformaInvoiceController::class, 'update'])->middleware('permission:sales.proformas.edit');
    Route::post('/proformas/from-quotation/{quotationId}', [ProformaInvoiceController::class, 'createFromQuotation'])->middleware('permission:sales.proformas.convert');
    Route::post('/proformas/from-sales-order/{salesOrderId}', [ProformaInvoiceController::class, 'createFromSalesOrder'])->middleware('permission:sales.proformas.convert');
    Route::patch('/proformas/{id}/issue', [ProformaInvoiceController::class, 'issue'])->middleware('permission:sales.proformas.issue');
    Route::patch('/proformas/{id}/accept', [ProformaInvoiceController::class, 'accept'])->middleware('permission:sales.proformas.issue');
    Route::patch('/proformas/{id}/cancel', [ProformaInvoiceController::class, 'cancel'])->middleware('permission:sales.proformas.cancel');

    Route::get('/invoices', [SalesInvoiceController::class, 'index'])->middleware('permission:sales.invoices.view');
    Route::post('/invoices', [SalesInvoiceController::class, 'store'])->middleware('permission:sales.invoices.create');
    Route::get('/invoices/{id}', [SalesInvoiceController::class, 'show'])->middleware('permission:sales.invoices.view');
    Route::patch('/invoices/{id}', [SalesInvoiceController::class, 'update'])->middleware('permission:sales.invoices.edit');
    Route::post('/invoices/from-sales-order/{salesOrderId}', [SalesInvoiceController::class, 'createFromSalesOrder'])->middleware('permission:sales.invoices.create');
    Route::post('/invoices/from-delivery-order/{deliveryOrderId}', [SalesInvoiceController::class, 'createFromDeliveryOrder'])->middleware('permission:sales.invoices.create');
    Route::post('/invoices/from-proforma/{proformaId}', [SalesInvoiceController::class, 'createFromProforma'])->middleware('permission:sales.invoices.create');
    Route::patch('/invoices/{id}/approve', [SalesInvoiceController::class, 'approve'])->middleware('permission:sales.invoices.approve');
    Route::patch('/invoices/{id}/post', [SalesInvoiceController::class, 'post'])->middleware('permission:sales.invoices.post');
    Route::patch('/invoices/{id}/void', [SalesInvoiceController::class, 'void'])->middleware('permission:sales.invoices.void');

    Route::get('/billings', [BillingInvoiceController::class, 'index'])->middleware('permission:sales.billings.view');
    Route::post('/billings', [BillingInvoiceController::class, 'store'])->middleware('permission:sales.billings.create');
    Route::get('/billings/{id}', [BillingInvoiceController::class, 'show'])->middleware('permission:sales.billings.view');
    Route::post('/billings/from-sales-invoice/{salesInvoiceId}', [BillingInvoiceController::class, 'createFromSalesInvoice'])->middleware('permission:sales.billings.create');
    Route::patch('/billings/{id}/issue', [BillingInvoiceController::class, 'issue'])->middleware('permission:sales.billings.issue');
    Route::patch('/billings/{id}/cancel', [BillingInvoiceController::class, 'cancel'])->middleware('permission:sales.billings.cancel');

    Route::get('/customer-deposits', [CustomerDepositController::class, 'index'])->middleware('permission:sales.deposits.view');
    Route::post('/customer-deposits', [CustomerDepositController::class, 'store'])->middleware('permission:sales.deposits.create');
    Route::get('/customer-deposits/{id}', [CustomerDepositController::class, 'show'])->middleware('permission:sales.deposits.view');
    Route::patch('/customer-deposits/{id}/post', [CustomerDepositController::class, 'post'])->middleware('permission:sales.deposits.post');
    Route::patch('/customer-deposits/{id}/void', [CustomerDepositController::class, 'void'])->middleware('permission:sales.deposits.void');
    Route::patch('/customer-deposits/{id}/refund', [CustomerDepositController::class, 'refund'])->middleware('permission:sales.deposits.refund');
    Route::post('/customer-deposits/{id}/allocate-to-invoice/{invoiceId}', [CustomerDepositController::class, 'allocateToInvoice'])->middleware('permission:sales.deposits.post');

    Route::get('/receipts', [SalesReceiptController::class, 'index'])->middleware('permission:sales.receipts.view');
    Route::post('/receipts', [SalesReceiptController::class, 'store'])->middleware('permission:sales.receipts.create');
    Route::get('/receipts/{id}', [SalesReceiptController::class, 'show'])->middleware('permission:sales.receipts.view');
    Route::patch('/receipts/{id}/post', [SalesReceiptController::class, 'post'])->middleware('permission:sales.receipts.post');
    Route::patch('/receipts/{id}/void', [SalesReceiptController::class, 'void'])->middleware('permission:sales.receipts.void');

    Route::get('/returns', [SalesReturnController::class, 'index'])->middleware('permission:sales.returns.view');
    Route::post('/returns', [SalesReturnController::class, 'store'])->middleware('permission:sales.returns.create');
    Route::get('/returns/{id}', [SalesReturnController::class, 'show'])->middleware('permission:sales.returns.view');
    Route::patch('/returns/{id}', [SalesReturnController::class, 'update'])->middleware('permission:sales.returns.create');
    Route::post('/returns/from-invoice/{invoiceId}', [SalesReturnController::class, 'createFromSalesInvoice'])->middleware('permission:sales.returns.create');
    Route::post('/returns/from-delivery-order/{deliveryOrderId}', [SalesReturnController::class, 'createFromDeliveryOrder'])->middleware('permission:sales.returns.create');
    Route::patch('/returns/{id}/approve', [SalesReturnController::class, 'approve'])->middleware('permission:sales.returns.approve');
    Route::patch('/returns/{id}/post', [SalesReturnController::class, 'post'])->middleware('permission:sales.returns.post');
    Route::patch('/returns/{id}/void', [SalesReturnController::class, 'void'])->middleware('permission:sales.returns.void');
});

Route::middleware(['auth:sanctum', 'company.access'])->group(function () {
    // Phase 6: Journal Entry Engine (manual journals only). No DELETE routes.
    Route::get('/journals', [JournalEntryController::class, 'index'])->middleware('permission:journal.view');
    Route::post('/journals', [JournalEntryController::class, 'store'])->middleware('permission:journal.create');
    Route::get('/journals/{id}', [JournalEntryController::class, 'show'])->middleware('permission:journal.view');
    Route::patch('/journals/{id}', [JournalEntryController::class, 'update'])->middleware('permission:journal.edit');
    Route::post('/journals/{id}/approve', [JournalEntryController::class, 'approve'])->middleware('permission:journal.approve');
    Route::post('/journals/{id}/post', [JournalEntryController::class, 'post'])->middleware('permission:journal.post');
    Route::post('/journals/{id}/void', [JournalEntryController::class, 'void'])->middleware('permission:journal.void');
});
