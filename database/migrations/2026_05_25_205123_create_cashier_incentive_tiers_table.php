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
        Schema::create('cashier_incentive_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('min_packets');
            $table->integer('max_packets')->nullable();
            $table->integer('commission_per_packet');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cashier_incentive_tiers');
    }
};
