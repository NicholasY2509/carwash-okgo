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
        Schema::create('staff_incentive_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('min_cars');
            $table->integer('max_cars')->nullable();
            $table->integer('flat_amount');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_incentive_tiers');
    }
};
