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
        Schema::create('stall_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stall_id')->references('id')->on('stalls');
            $table->foreignId('staff_id')->references('id')->on('staffs');
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('assigned_by')->references('id')->on('staffs');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stall_assignments');
    }
};
