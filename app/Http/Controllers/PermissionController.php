<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(Request $request){
        $perPage = $request->input('per_page', 10);
        $permissions = Permission::orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();

        return Inertia::render("permissions/index",[
            "permissions"=> $permissions
        ]);
    }

    public function store(Request $request){
        Permission::create($request->all());

        return Redirect::route("permissions.index");
    }

    public function update(Request $request, String $id){
        $permission = Permission::find($id);

        $permission->update($request->all());

        return Redirect::route("permissions.index");
    }

    public function destroy(String $id){
        $permission = Permission::find($id);

        $permission->delete();

        return Redirect::route("permissions.index");
    }
}
