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
        Schema::create('incentive_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('min_cars');
            $table->integer('max_cars')->nullable(); // null means no upper limit
            $table->integer('commission'); // commission per car in Rp
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incentive_tiers');
    }
};
