<?php

namespace App\Http\Controllers\Api\Access;

use App\Http\Controllers\Controller;
use App\Http\Requests\Access\StoreRoleRequest;
use App\Http\Requests\Access\UpdateRolePermissionsRequest;
use App\Http\Requests\Access\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleAccessController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->successResponse(Role::query()->withCount('permissions')->orderBy('name')->get(), 'Roles retrieved.');
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $role = Role::query()->create([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'is_system' => false,
        ]);

        $this->syncPermissions($role, $data['permission_keys'] ?? []);

        return $this->successResponse($this->rolePayload($role->refresh()), 'Role created.', 201);
    }

    public function show(int $roleId): JsonResponse
    {
        return $this->successResponse($this->rolePayload(Role::query()->findOrFail($roleId)), 'Role retrieved.');
    }

    public function update(UpdateRoleRequest $request, int $roleId): JsonResponse
    {
        $role = Role::query()->findOrFail($roleId);
        $role->fill($request->validated())->save();

        return $this->successResponse($this->rolePayload($role->refresh()), 'Role updated.');
    }

    public function cloneRole(Request $request, int $roleId): JsonResponse
    {
        $source = Role::query()->findOrFail($roleId);
        $clone = Role::query()->create([
            'name' => $request->input('name', $source->name.' Copy'),
            'slug' => str($request->input('slug', $source->slug.'-copy-'.time()))->slug()->toString(),
            'description' => $request->input('description', $source->description),
            'is_system' => false,
            'is_active' => true,
        ]);
        $clone->permissions()->sync($source->permissions()->pluck('permissions.id')->all());

        return $this->successResponse($this->rolePayload($clone), 'Role cloned.', 201);
    }

    public function updatePermissions(UpdateRolePermissionsRequest $request, int $roleId): JsonResponse
    {
        $role = Role::query()->findOrFail($roleId);
        $this->syncPermissions($role, $request->validated('permission_keys'));

        return $this->successResponse($this->rolePayload($role->refresh()), 'Role permissions updated.');
    }

    public function deactivate(int $roleId): JsonResponse
    {
        $role = Role::query()->findOrFail($roleId);
        $role->forceFill(['is_active' => false])->save();

        return $this->successResponse($this->rolePayload($role), 'Role deactivated.');
    }

    public function activate(int $roleId): JsonResponse
    {
        $role = Role::query()->findOrFail($roleId);
        $role->forceFill(['is_active' => true])->save();

        return $this->successResponse($this->rolePayload($role), 'Role activated.');
    }

    private function syncPermissions(Role $role, array $permissionKeys): void
    {
        $permissionIds = Permission::query()->whereIn('key', $permissionKeys)->pluck('id')->all();
        $role->permissions()->sync($permissionIds);
    }

    private function rolePayload(Role $role): array
    {
        $role->load('permissions:id,key,label,module,feature,action');

        return [
            'id' => $role->id,
            'name' => $role->name,
            'slug' => $role->slug,
            'description' => $role->description,
            'is_system' => $role->is_system,
            'is_active' => $role->is_active,
            'permission_keys' => $role->permissions->pluck('key')->values()->all(),
            'permissions' => $role->permissions,
        ];
    }
}
