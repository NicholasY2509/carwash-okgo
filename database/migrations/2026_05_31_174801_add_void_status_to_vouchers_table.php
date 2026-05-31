<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE vouchers MODIFY COLUMN status ENUM('Active', 'Redeemed', 'Expired', 'Sold', 'Void') DEFAULT 'Active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE vouchers MODIFY COLUMN status ENUM('Active', 'Redeemed', 'Expired', 'Sold') DEFAULT 'Active'");
    }
};
