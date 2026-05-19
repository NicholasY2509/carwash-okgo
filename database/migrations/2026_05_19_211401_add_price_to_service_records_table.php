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
        Schema::table('service_records', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->default(0)->after('product_id');
        });

        // Backfill existing service_records price from products.price
        DB::table('service_records')
            ->join('products', 'service_records.product_id', '=', 'products.id')
            ->update(['service_records.price' => DB::raw('products.price')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_records', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }
};
