<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SplitVoucherPackets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:split-voucher-packets {transaction_id : The ID of the sales transaction}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Split a single purchased packet containing too many vouchers into multiple normal packets';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $transactionId = $this->argument('transaction_id');

        \Illuminate\Support\Facades\DB::transaction(function () use ($transactionId) {
            $packets = \App\Models\PurchasedPacket::where('sales_transaction_id', $transactionId)
                ->with(['voucherPacket', 'vouchers'])
                ->get();
            
            if ($packets->count() !== 1) {
                $this->error("Transaksi ini tidak memiliki tepat 1 paket. Jika ingin memisahkan, harus ada tepat 1 paket yang berisi gabungan dari banyak voucher.");
                return;
            }

            $mainPacket = $packets->first();
            $baseVoucherPacket = $mainPacket->voucherPacket;

            if (!$baseVoucherPacket) {
                $this->error("Data master VoucherPacket tidak ditemukan untuk paket ini.");
                return;
            }

            $expectedVouchersPerPacket = $baseVoucherPacket->quantity;
            $currentVouchersCount = $mainPacket->vouchers->count();

            if ($expectedVouchersPerPacket <= 0) {
                $this->error("Master VoucherPacket memiliki quantity tidak valid: {$expectedVouchersPerPacket}");
                return;
            }

            if ($currentVouchersCount <= $expectedVouchersPerPacket) {
                $this->info("Jumlah voucher di paket ini sudah normal ({$currentVouchersCount} voucher, master: {$expectedVouchersPerPacket}). Tidak perlu dipisah.");
                return;
            }

            // Hitung berapa paket yang seharusnya ada
            $expectedPacketsCount = (int) ceil($currentVouchersCount / $expectedVouchersPerPacket);
            
            $this->info("Ditemukan {$currentVouchersCount} voucher, seharusnya {$expectedVouchersPerPacket} voucher/paket.");
            $this->info("Akan dipisah menjadi {$expectedPacketsCount} paket.");

            $vouchers = $mainPacket->vouchers->sortBy('id')->values();
            
            // Paket utama akan menjadi paket ke-1 (index 0)
            // Sesuaikan harganya ke harga master
            $mainPacket->update(['price' => $baseVoucherPacket->price]);
            
            $vouchersToMove = $vouchers->slice($expectedVouchersPerPacket);

            // Kita mulai memecah sisanya
            $remainingChunks = $vouchersToMove->chunk($expectedVouchersPerPacket);

            foreach ($remainingChunks as $index => $chunk) {
                $newPacket = $mainPacket->replicate();
                $newPacket->price = $baseVoucherPacket->price;
                $newPacket->save();

                $voucherIds = $chunk->pluck('id')->toArray();
                \App\Models\Voucher::whereIn('id', $voucherIds)
                    ->update(['purchased_packet_id' => $newPacket->id]);

                $this->info("Memindahkan " . count($voucherIds) . " voucher ke paket baru (ID: {$newPacket->id}).");
            }
            
            $this->info("Berhasil! Semua voucher sudah disebar ke {$expectedPacketsCount} paket sesuai dengan jumlah di master data.");
        });

        return Command::SUCCESS;
    }
}
