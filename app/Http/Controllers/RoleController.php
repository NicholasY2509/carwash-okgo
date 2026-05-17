<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $roles = Role::with('permissions:id,name')->latest()->paginate($perPage)->withQueryString();
        $permission = Permission::all(['id', 'name']);

        return Inertia::render("roles/index", [
            "roles" => $roles,
            "permissions" => $permission
        ]);
    }

    public function store(CreateRoleRequest $request)
    {
        DB::beginTransaction();

        try {
            $role = Role::create([
                'name' => $request->name,
                'guard_name' => 'web',
            ]);

            $role->permissions()->sync($request->permission_ids);

            DB::commit();

            return Redirect::route("roles.index");
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        if ($role->name === 'super-admin') {
            return Redirect::route("roles.index")->with('error', 'Role Super Admin tidak dapat diubah.');
        }

        DB::beginTransaction();

        try {
            // Update nama role
            $role->update([
                'name' => $request->name,
            ]);
            $role->permissions()->sync($request->permission_ids);

            DB::commit();

            return Redirect::route("roles.index")->with('success', 'Role berhasil diperbarui.');
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'super-admin') {
            return Redirect::route("roles.index")->with('error', 'Role Super Admin tidak dapat dihapus.');
        }

        $role->delete();

        return Redirect::route("roles.index")->with('success', 'Role berhasil dihapus.');
    }
}
