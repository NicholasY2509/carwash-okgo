<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_transactions', function (Blueprint $table) {
            $table->string('status')->default('active')->after('transaction_type');
        });

        Schema::table('service_records', function (Blueprint $table) {
            $table->string('status')->default('active')->after('payment_type');
        });

        Schema::table('purchased_packets', function (Blueprint $table) {
            $table->string('status')->default('active')->after('expired_at');
        });
    }

    public function down(): void
    {
        Schema::table('sales_transactions', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('service_records', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('purchased_packets', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
