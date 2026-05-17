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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('serial_number')->unique();
            $table->foreignId('voucher_type_id')->references('id')->on('voucher_types');
            $table->enum('status', ['Active', 'Redeemed', 'Expired','Sold'])->default('Active');
            $table->foreignUuid('purchased_packet_id')->nullable()->references('id')->on('purchased_packets');
            $table->date('redeemed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
