<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PermissionController;
use App\Http\Controllers\Api\Accounting\FiscalYearStatusController;
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
