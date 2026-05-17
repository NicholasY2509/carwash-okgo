<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(){

        $users = User::all();
        $roles = Role::all();

        return Inertia::render('users/index', [
            'users' => $users,
            'roles'=> $roles
        ]);
    }

    public function store(CreateUserRequest $request)
    {
        DB::beginTransaction();

        try {
            // Create the user from the validated data (excluding role_id)
            $user = User::create($request->safe()->except('role_id'));

            // --- FIX: Find the role by ID before syncing ---
            if ($request->filled('role_id')) {
                $role = Role::findById($request->input('role_id'));
                if ($role) {
                    // Pass the Role object or its name to syncRoles
                    $user->syncRoles($role->name);
                }
            } else {
                // If no role_id is provided, remove any existing roles
                $user->syncRoles([]);
            }

            DB::commit();

            return to_route('users.index')->with('success', 'User berhasil ditambahkan.');

        } catch (\Throwable $th) {
            DB::rollBack();
            // It's better to report the error and return a user-friendly message
            report($th);
            return back()->with('error', 'Terjadi kesalahan saat menambahkan user.');
        }
    }

    /**
     * Update the specified user in storage and update their role.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        DB::beginTransaction();

        try {
            // Get validated data, excluding the role_id for now
            $data = $request->safe()->except('role_id');

            // Only update the password if a new one is provided
            if (empty($request->password)) {
                unset($data['password']);
            } else {
                $data['password'] = Hash::make($request->password);
            }

            // Update the user's main details
            $user->update($data);

            // --- FIX: Find the role by ID before syncing ---
            if ($request->filled('role_id')) {
                $role = Role::findById($request->input('role_id'));
                if ($role) {
                    // Pass the Role object or its name to syncRoles
                    $user->syncRoles($role->name);
                }
            } else {
                // If no role_id is provided, remove any existing roles
                $user->syncRoles([]);
            }

            DB::commit();

            return to_route('users.index')->with('success', 'User berhasil diperbarui.');

        } catch (\Throwable $th) {
            DB::rollBack();
            report($th);
            return back()->with('error', 'Terjadi kesalahan saat memperbarui user.');
        }
    }
}
