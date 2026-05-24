<?php

namespace App\Http\Controllers\Api\Access;

use App\Http\Controllers\Controller;
use App\Http\Requests\Access\InviteCompanyUserRequest;
use App\Models\CompanyInvitation;
use App\Models\Role;
use App\Services\Tenant\TenantContext;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CompanyInvitationAccessController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly TenantContext $tenantContext)
    {
    }

    public function index(): JsonResponse
    {
        $invitations = CompanyInvitation::query()
            ->where('company_id', $this->tenantContext->company()?->id)
            ->orderByDesc('created_at')
            ->get();

        return $this->successResponse($invitations, 'Invitations retrieved.');
    }

    public function store(InviteCompanyUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $role = isset($data['role_id']) ? Role::query()->find($data['role_id']) : null;

        $invitation = CompanyInvitation::query()->updateOrCreate(
            [
                'company_id' => $this->tenantContext->company()?->id,
                'email' => $data['email'],
            ],
            [
                'role' => $role?->slug ?? ($data['role'] ?? 'viewer'),
                'token' => Str::random(48),
                'status' => 'pending',
                'invited_by' => $request->user()?->id,
                'expires_at' => $data['expires_at'] ?? now()->addDays(7),
                'accepted_at' => null,
            ]
        );

        return $this->successResponse($invitation, 'Invitation created.', 201);
    }

    public function resend(Request $request, int $id): JsonResponse
    {
        $invitation = $this->invitation($id);
        $invitation->forceFill([
            'token' => Str::random(48),
            'status' => 'pending',
            'invited_by' => $request->user()?->id,
            'expires_at' => now()->addDays(7),
        ])->save();

        return $this->successResponse($invitation, 'Invitation resent.');
    }

    public function revoke(int $id): JsonResponse
    {
        $invitation = $this->invitation($id);
        $invitation->forceFill(['status' => 'revoked'])->save();

        return $this->successResponse($invitation, 'Invitation revoked.');
    }

    private function invitation(int $id): CompanyInvitation
    {
        return CompanyInvitation::query()
            ->where('company_id', $this->tenantContext->company()?->id)
            ->whereKey($id)
            ->firstOrFail();
    }
}
