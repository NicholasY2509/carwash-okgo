<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class FixVoucherPackets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-voucher-packets {transaction_id : The ID of the sales transaction}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Consolidate multiple 1-voucher packets back into 1 packet containing multiple vouchers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $transactionId = $this->argument('transaction_id');

        \Illuminate\Support\Facades\DB::transaction(function () use ($transactionId) {
            $packets = \App\Models\PurchasedPacket::where('sales_transaction_id', $transactionId)
                ->orderBy('created_at', 'asc')
                ->get();
            
            if ($packets->count() <= 1) {
                $this->info("Transaksi ini tidak memiliki lebih dari 1 paket. Tidak ada yang perlu diperbaiki.");
                return;
            }

            // Paket utama adalah paket pertama
            $mainPacket = $packets->first();
            
            // Sisa paket yang akan digabungkan
            $otherPackets = $packets->slice(1);
            $otherPacketIds = $otherPackets->pluck('id')->toArray();
            
            // Pindahkan semua voucher ke paket utama
            $vouchersMoved = \App\Models\Voucher::whereIn('purchased_packet_id', $otherPacketIds)
                ->update(['purchased_packet_id' => $mainPacket->id]);
                
            $this->info("Berhasil memindahkan {$vouchersMoved} voucher ke paket utama (ID: {$mainPacket->id}).");

            // Opsional: total harga disesuaikan
            $totalPrice = $packets->sum('price');
            $mainPacket->update(['price' => $totalPrice]);
            $this->info("Harga paket utama diperbarui menjadi {$totalPrice}.");

            // Hapus sisa paket yang sudah kosong
            \App\Models\PurchasedPacket::whereIn('id', $otherPacketIds)->delete();
            
            $this->info("Berhasil menghapus " . count($otherPacketIds) . " paket yang kosong.");
        });

        return Command::SUCCESS;
    }
}
