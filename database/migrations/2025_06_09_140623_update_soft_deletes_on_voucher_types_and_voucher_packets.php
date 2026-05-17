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
        Schema::table('voucher_types', function (Blueprint $table) {
            $table->softDeletes()->after('description');
        });

        Schema::table('voucher_packets', function (Blueprint $table) {
            $table->softDeletes()->after('has_unlimited_issuance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voucher_types', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('voucher_packets', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
