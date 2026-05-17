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
        Schema::create('sales_transactions', function (Blueprint $table) {
            $table->id();
            $table->dateTime('transaction_date');
            $table->foreignUuid('customer_id')->references('id')->on('customers');
            $table->foreignUuid('car_id')->references('id')->on('cars')->nullable();
            $table->foreignId('staff_id')->references('id')->on('staffs');
            $table->decimal('total_amount', 10, 2);
            $table->string('payment_method');
            $table->string('transaction_type');
            $table->foreignUuid('purchased_packet_id')->nullable()->references('id')->on('purchased_packets');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_transactions');
    }
};
