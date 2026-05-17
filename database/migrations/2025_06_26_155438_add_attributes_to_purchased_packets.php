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
        Schema::table('purchased_packets', function (Blueprint $table) {
            $table->unsignedBigInteger('sales_transaction_id')->nullable()->after('id');
        $table->foreign('sales_transaction_id')->references('id')->on('sales_transactions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchased_packets', function (Blueprint $table) {
            $table->dropForeign(['sales_transaction_id']);
            $table->dropColumn('sales_transaction_id');
        });
    }
};
