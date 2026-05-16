<?php

namespace App\Http\Middleware;

use App\Services\Permissions\PermissionService;
use Closure;
use Illuminate\Http\Request;

class EnsurePermission
{
    public function __construct(private readonly PermissionService $permissionService)
    {
    }

    public function handle(Request $request, Closure $next, string $permission): mixed
    {
        if ($this->permissionService->cannot($permission)) {
            return response()->json([
                'success' => false,
                'code' => 'PERMISSION_DENIED',
                'message' => 'You do not have permission to perform this action.',
            ], 403);
        }

        return $next($request);
    }
}

