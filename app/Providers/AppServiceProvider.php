<?php

namespace App\Providers;

use App\Models\DailyCashLog;
use App\Models\Expense;
use App\Models\PurchasedPacket;
use App\Models\SalesTransaction;
use App\Models\VoucherIssuance;
use App\Observers\DailyCashLogObserver;
use App\Observers\ExpenseObserver;
use App\Observers\PurchasedPacketObserver;
use App\Observers\SalesTransactionObserver;
use App\Observers\VoucherIssuanceObserver;
use Carbon\Carbon;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Carbon::setLocale('id');

        // Register observers
        // SalesTransaction::observe(SalesTransactionObserver::class);
        // PurchasedPacket::observe(PurchasedPacketObserver::class);
        // VoucherIssuance::observe(VoucherIssuanceObserver::class);
        // DailyCashLog::observe(DailyCashLogObserver::class);
        // Expense::observe(ExpenseObserver::class);
    }
}
