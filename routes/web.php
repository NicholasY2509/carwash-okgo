<?php

use App\Http\Controllers\CarController;
use App\Http\Controllers\CarTypeController;
use App\Http\Controllers\CarWashController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductController;
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
        'roles'             => RoleController::class,
        'permissions'       => PermissionController::class,
        'sales-transactions'=> SalesTransactionController::class,
        'car-types'         => CarTypeController::class,
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
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';