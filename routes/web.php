<?php

use App\Http\Controllers\CarController;
use App\Http\Controllers\CarTypeController;
use App\Http\Controllers\CarWashController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PartyController;
use App\Http\Controllers\PurchasedPacketController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SalesTransactionController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StaffPerformanceController;
use App\Http\Controllers\StallAssignmentController;
use App\Http\Controllers\StallController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\VoucherPacketController;
use App\Http\Controllers\VoucherTypeController;
use App\Http\Controllers\WorkPositionController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\StockAdjustmentController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\Reports\CarWashRevenueReportController;
use App\Http\Controllers\Reports\VoucherSalesReportController;
use App\Http\Controllers\Reports\StockReportController;
use App\Http\Controllers\QueueController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return to_route('dashboard');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::controller(DashboardController::class)->group(function () {
        Route::get('dashboard', 'index')->name('dashboard');
        Route::post('dashboard/clear-cache', 'clearCache')->name('dashboard.clear-cache');
        Route::post('dashboard/generate-excel-report', 'generateExcelReport')->name('dashboard.generate-excel-report');
    });

    Route::get('/staffs/meta', [StaffController::class, 'meta'])->name('staffs.meta');

    Route::controller(VoucherController::class)->group(function () {
        Route::get('vouchers/serials', 'getAllSerialNumbers')->name('vouchers.serials');
        Route::get('vouchers/search', 'searchJson')->name('vouchers.search');
        Route::post('vouchers/batch-update', 'batchUpdate')->name('vouchers.batch_update');
        Route::post('vouchers/generate-report', 'generateReport')->name('vouchers.generate-report');
        Route::post('vouchers/update-expiration', 'updateExpiration')->name('vouchers.update-expiration');
    });

    Route::get('customers/export', [CustomerController::class, 'export'])->name('customers.export');
    Route::post('customers/verify-edit-password', [CustomerController::class, 'verifyEditPassword'])->name('customers.verify-edit-password');
    Route::post('cars/verify-edit-password', [CarController::class, 'verifyEditPassword'])->name('cars.verify-edit-password');
    Route::post('car-washes/{id}/cancel', [CarWashController::class, 'cancel'])->name('car-washes.cancel');
    Route::post('purchased-packets/{id}/cancel', [PurchasedPacketController::class, 'cancel'])->name('purchased-packets.cancel');

    Route::resources([
        'car-washes'        => CarWashController::class,
        'stalls'            => StallController::class,
        'stall-assignments' => StallAssignmentController::class,
        'work-positions'    => WorkPositionController::class,
        'users'             => UserController::class,
        'staffs'            => StaffController::class,
        'vouchers'          => VoucherController::class,
        'voucher-types'     => VoucherTypeController::class,
        'voucher-packets'   => VoucherPacketController::class,
        'purchased-packets' => PurchasedPacketController::class,
        'customers'         => CustomerController::class,
        'cars'              => CarController::class,
        'products'          => ProductController::class,
        'parties'           => PartyController::class,
        'roles'             => RoleController::class,
        'permissions'       => PermissionController::class,
        'sales-transactions'=> SalesTransactionController::class,
        'car-types'         => CarTypeController::class,
        'settings/incentive-tiers' => \App\Http\Controllers\Settings\IncentiveTierController::class,
        'items'             => ItemController::class,
        'purchases'         => PurchaseController::class,
        'stock-adjustments' => StockAdjustmentController::class,
        'suppliers'         => SupplierController::class,
    ]);

    Route::controller(StallAssignmentController::class)->group(function () {
        Route::post('set-stall-head', 'setStallHead')->name('stall-assignments.set-stall-head');
    });

    Route::controller(CarWashController::class)->group(function () {
        Route::post('car-washes/voucher', 'voucherPayment')->name('car-washes.voucher');
        Route::post('car-washes/return', 'returnPayment')->name('car-washes.return');
        Route::post('car-washes/special-program', 'specialProgramPayment')->name('car-washes.special-program');
    });

    Route::controller(StaffPerformanceController::class)->group(function () {
        Route::get('staff-performances', 'index')->name('staff-performances.index');
    });

    Route::controller(\App\Http\Controllers\StaffIncentiveController::class)->group(function () {
        Route::get('staff-incentives/summary', 'summary')->name('staff-incentives.summary');
        Route::get('staff-incentives', 'index')->name('staff-incentives.index');
    });

    Route::controller(QueueController::class)->group(function () {
        Route::get('queue', 'index')->name('queue.index');
        Route::post('queue/{id}/status', 'updateStatus')->name('queue.update-status');
    });

    // Report Routes
    Route::prefix('reports')->group(function () {
        Route::get('car-wash-revenue', [CarWashRevenueReportController::class, 'index'])->name('reports.car-wash-revenue');
        Route::get('voucher-sales', [VoucherSalesReportController::class, 'index'])->name('reports.voucher-sales');
        Route::get('stock', [StockReportController::class, 'index'])->name('reports.stock');
        Route::get('split-profit', [\App\Http\Controllers\Reports\SplitProfitReportController::class, 'index'])->name('reports.split-profit');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';