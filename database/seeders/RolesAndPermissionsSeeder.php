<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        $permissions = [
            'car wash',
            'purchase packet',
            'queue',
            'master product',
            'product',
            'party',
            'master stock',
            'item',
            'supplier',
            'purchase',
            'stock adjustment',
            'master transaction',
            'packet voucher',
            'sales transaction',
            'master customer',
            'customer',
            'car',
            'car type',
            'master staff',
            'staff incentive summary',
            'staff incentive',
            'staff',
            'work position',
            'report',
            'report car wash',
            'report voucher sales',
            'report stock',
            'report split profit',
            'master voucher',
            'voucher',
            'voucher packet',
            'voucher type',
            'user',
            'role',
            'permission',
            'incentive tier',
            'setting whatsapp',
            'setting customer protection',
            'master stall',
            'stall assignment',
            'stall'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // create roles
        $roleKasir = Role::firstOrCreate(['name' => 'Kasir']);
        $roleOwner = Role::firstOrCreate(['name' => 'Owner']);
        $roleSPV = Role::firstOrCreate(['name' => 'SPV']);
        $roleSuperAdmin = Role::firstOrCreate(['name' => 'Super Admin']);

        // assign Super Admin to user with ID 1
        $user = User::find(1);
        if ($user) {
            $user->assignRole($roleSuperAdmin);
        }
    }
}
