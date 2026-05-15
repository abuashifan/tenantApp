<?php

namespace App\Http\Middleware;

use App\Models\Company;
use App\Models\CompanyUser;
use App\Models\TenantDatabase;
use App\Services\Tenant\TenantContext;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnsureCompanyAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $companyId = $request->header('X-Company-ID');

        if (!$companyId) {
            return response()->json([
                'success' => false,
                'message' => 'X-Company-ID wajib dikirim.',
            ], 422);
        }

        $company = Company::find($companyId);

        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'Company tidak ditemukan.',
            ], 404);
        }

        $companyUser = CompanyUser::query()
            ->where('company_id', $company->id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$companyUser) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak punya akses ke company ini.',
            ], 403);
        }

        $tenantDatabase = TenantDatabase::query()
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->first();

        if (!$tenantDatabase) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant database belum aktif.',
            ], 422);
        }

        app(TenantContext::class)->set($company, $companyUser, $tenantDatabase);

        $request->attributes->set('active_company', $company);
        $request->attributes->set('active_company_user', $companyUser);
        $request->attributes->set('active_tenant_database', $tenantDatabase);

        return $next($request);
    }
}

