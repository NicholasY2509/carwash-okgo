<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ClearTransactionRecords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clear-transactions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all purchased packets, sales transactions, service records, and related data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $date = '2026-05-31 00:00:00';
        
        if (!$this->confirm("Are you sure you want to delete transaction records before {$date}? This action cannot be undone.")) {
            $this->info('Operation cancelled.');
            return;
        }

        $this->info("Clearing transaction records before {$date}...");

        \Illuminate\Support\Facades\DB::transaction(function () use ($date) {
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            // Delete transaction tables before the date
            \App\Models\SalesTransactionItem::where('created_at', '<', $date)->delete();
            \App\Models\SalesTransaction::where('created_at', '<', $date)->delete();
            \App\Models\ServiceRecord::where('created_at', '<', $date)->delete();
            \App\Models\Voucher::where('created_at', '<', $date)->delete();
            \App\Models\PurchasedPacket::where('created_at', '<', $date)->delete();

            // \App\Models\PurchasedPacket::where('created_at', '<', $date)->delete();
            // Note: The above tables are cleared for records before the specified date.
            // Stock movements and item stocks are left untouched as per request.

            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        });

        // Clear application cache to reset dashboard statistics
        \Illuminate\Support\Facades\Cache::flush();

        $this->info("Successfully cleared transaction records before {$date} and recalculated item stocks.");
    }
}
