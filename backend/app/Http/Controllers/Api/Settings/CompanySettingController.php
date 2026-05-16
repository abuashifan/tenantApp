<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateCompanyAccountingSettingRequest;
use App\Http\Requests\Settings\UpdateCompanyModuleSettingRequest;
use App\Services\Settings\CompanySettingService;
use App\Services\Tenant\TenantContext;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class CompanySettingController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly CompanySettingService $service,
        private readonly TenantContext $tenantContext
    ) {
    }

    public function show(): JsonResponse
    {
        $company = $this->tenantContext->company();
        if (! $company) {
            return $this->errorResponse('Active company context not found.', 422);
        }

        return $this->successResponse(
            $this->service->getSettings($company),
            'Company settings retrieved successfully'
        );
    }

    public function updateAccounting(UpdateCompanyAccountingSettingRequest $request): JsonResponse
    {
        $company = $this->tenantContext->company();
        if (! $company) {
            return $this->errorResponse('Active company context not found.', 422);
        }
        $setting = $this->service->updateAccountingSetting($company, $request->validated());

        return $this->successResponse([
            'accounting' => $setting->toArray(),
        ], 'Accounting settings updated successfully');
    }

    public function updateModules(UpdateCompanyModuleSettingRequest $request): JsonResponse
    {
        $company = $this->tenantContext->company();
        if (! $company) {
            return $this->errorResponse('Active company context not found.', 422);
        }
        $setting = $this->service->updateModuleSetting($company, $request->validated());

        return $this->successResponse([
            'modules' => $setting->toArray(),
        ], 'Module settings updated successfully');
    }
}
