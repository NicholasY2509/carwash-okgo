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
            $table->boolean('autogenerate_vouchers')->default(false)->after('assign_on_sale');
        });

        Schema::table('voucher_types', function (Blueprint $table) {
            $table->string('voucher_suffix')->nullable()->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('voucher_types', function (Blueprint $table) {
            $table->dropColumn('voucher_suffix');
        });

        Schema::table('voucher_packets', function (Blueprint $table) {
            $table->dropColumn('autogenerate_vouchers');
        });
    }
};
