<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For MySQL/MariaDB, we need to use raw SQL to modify enum
        // For SQLite, TEXT is used instead of ENUM
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE vouchers MODIFY COLUMN status ENUM('Active', 'Redeemed', 'Expired','Sold', 'Billed', 'Paid') NOT NULL DEFAULT 'Active'");
        }
        // SQLite doesn't need modification as TEXT can hold any string value
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This will fail if any records have 'Billed' or 'Paid' status
        // You may want to update those records first in the down migration
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE vouchers MODIFY COLUMN status ENUM('Active', 'Redeemed','Sold', 'Expired') NOT NULL DEFAULT 'Active'");
        }
    }

};
