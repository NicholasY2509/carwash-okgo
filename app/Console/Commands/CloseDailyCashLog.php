<?php

namespace App\Console\Commands;

use App\Models\DailyCashLog;
use Illuminate\Console\Command;

class CloseDailyCashLog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:close-daily-cash-log';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = now();
        $this->info('Closing daily cash log for ' . $today->toDateString());
        DailyCashLog::where('session_date', $today->toDateString())
                    ->update([
                        'status' => 'Pending Closing'
                    ]);
    }
}
