<?php

namespace App\Console\Commands;

use App\Models\DailyCashLog;
use Illuminate\Console\Command;

class OpenDailyCashLog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:open-daily-cash-log';

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
        DailyCashLog::create([
            'staff_id' => 1,
            'opening_cash'=> 200000,
            'session_date'=> date('Y-m-d'),
            'status' => 'Approved',
        ]);
    }
}
