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
        Schema::table('service_records', function (Blueprint $table) {
            $table->timestamp('queue_ongoing_at')->nullable()->after('queue_status');
            $table->timestamp('queue_finished_at')->nullable()->after('queue_ongoing_at');
            $table->timestamp('queue_settled_at')->nullable()->after('queue_finished_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_records', function (Blueprint $table) {
            $table->dropColumn([
                'queue_ongoing_at',
                'queue_finished_at',
                'queue_settled_at'
            ]);
        });
    }
};
