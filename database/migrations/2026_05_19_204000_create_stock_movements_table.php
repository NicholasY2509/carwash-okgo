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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->integer('quantity'); // Positive for add, negative for subtract
            $table->integer('resulting_stock'); // Stock after this change
            $table->string('type')->index(); // 'purchase', 'adjustment', 'waste', 'service_usage', 'service_cancellation'
            $table->text('reason')->nullable();
            $table->nullableMorphs('reference'); // Polymorphic link to SalesTransaction, ServiceRecord, Purchase, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
