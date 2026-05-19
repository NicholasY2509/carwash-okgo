<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('purchased_packets', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->default(0)->after('voucher_packet_id');
        });

        // Backfill existing purchased_packets price from voucher_packets.price
        DB::table('purchased_packets')
            ->join('voucher_packets', 'purchased_packets.voucher_packet_id', '=', 'voucher_packets.id')
            ->update(['purchased_packets.price' => DB::raw('voucher_packets.price')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchased_packets', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }
};
