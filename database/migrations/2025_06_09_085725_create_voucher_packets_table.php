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
        Schema::create('voucher_packets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voucher_type_id')->references('id')->on('voucher_types');
            $table->string('name')->index();
            $table->decimal('price', 10, 2);
            $table->integer('quantity');
            $table->integer('valid_period_months')->nullable();
            $table->boolean('has_unlimited_issuance')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('voucher_packets');
    }
};
