<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:open-daily-cash-log')->dailyAt('07.30')->timezone('Asia/Jakarta');
Schedule::command('app:close-daily-cash-log')->dailyAt('21.00')->timezone('Asia/Jakarta');
Schedule::command('app:close-stall-assignments')->dailyAt('21.00')->timezone('Asia/Jakarta');
