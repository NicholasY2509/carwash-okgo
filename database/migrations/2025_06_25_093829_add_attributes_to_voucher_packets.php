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
        Schema::table('voucher_packets', function (Blueprint $table) {
            $table->boolean('assign_on_sale')->default(false)->after('has_unlimited_issuance');
            $table->boolean('until_year_end')->default(false)->after('assign_on_sale');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voucher_packets', function (Blueprint $table) {
            $table->dropColumn('assign_on_sale');
        });
    }
};
