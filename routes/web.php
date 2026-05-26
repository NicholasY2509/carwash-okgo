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

    // Products & Parties
    Route::resource('products', ProductController::class)->middleware('permission:product');
    Route::resource('parties', PartyController::class)->middleware('permission:party');

    // Stock & Barang
    Route::resource('items', ItemController::class)->middleware('permission:item');
    Route::resource('suppliers', SupplierController::class)->middleware('permission:supplier');
    Route::resource('purchases', PurchaseController::class)->middleware('permission:purchase');
    Route::resource('stock-adjustments', StockAdjustmentController::class)->middleware('permission:stock adjustment');

    // Transactions
    Route::resource('purchased-packets', PurchasedPacketController::class)->only(['index', 'update'])->middleware('permission:packet voucher');
    Route::resource('purchased-packets', PurchasedPacketController::class)->only(['create', 'store'])->middleware('permission:purchase packet');
    Route::post('purchased-packets/{id}/cancel', [PurchasedPacketController::class, 'cancel'])->name('purchased-packets.cancel')->middleware('permission:packet voucher');
    
    Route::resource('car-washes', CarWashController::class)->middleware('permission:car wash');
    Route::post('car-washes/{id}/cancel', [CarWashController::class, 'cancel'])->name('car-washes.cancel')->middleware('permission:car wash');
    Route::controller(CarWashController::class)->middleware('permission:car wash')->group(function () {
        Route::post('car-washes/voucher', 'voucherPayment')->name('car-washes.voucher');
        Route::post('car-washes/return', 'returnPayment')->name('car-washes.return');
        Route::post('car-washes/special-program', 'specialProgramPayment')->name('car-washes.special-program');
    });

    Route::resource('sales-transactions', SalesTransactionController::class)->middleware('permission:sales transaction');

    // Customers
    Route::resource('customers', CustomerController::class)->middleware('permission:customer');
    Route::get('customers/export', [CustomerController::class, 'export'])->name('customers.export')->middleware('permission:customer');
    Route::post('customers/verify-edit-password', [CustomerController::class, 'verifyEditPassword'])->name('customers.verify-edit-password')->middleware('permission:customer');
    
    Route::resource('cars', CarController::class)->middleware('permission:car');
    Route::post('cars/verify-edit-password', [CarController::class, 'verifyEditPassword'])->name('cars.verify-edit-password')->middleware('permission:car');
    Route::resource('car-types', CarTypeController::class)->middleware('permission:car type');

    // Stalls (commented out in sidebar, keeping without permissions or with tentative ones)
    Route::resource('stalls', StallController::class);
    Route::resource('stall-assignments', StallAssignmentController::class);
    Route::post('set-stall-head', [StallAssignmentController::class, 'setStallHead'])->name('stall-assignments.set-stall-head');

    // Staff
    Route::get('/staffs/meta', [StaffController::class, 'meta'])->name('staffs.meta')->middleware('permission:staff');
    Route::resource('staffs', StaffController::class)->middleware('permission:staff');
    Route::resource('work-positions', WorkPositionController::class)->middleware('permission:work position');
    Route::controller(StaffPerformanceController::class)->group(function () {
        Route::get('staff-performances', 'index')->name('staff-performances.index');
    });
    Route::controller(\App\Http\Controllers\StaffIncentiveController::class)->group(function () {
        Route::get('staff-incentives/summary', 'summary')->name('staff-incentives.summary')->middleware('permission:staff incentive summary');
        Route::get('staff-incentives', 'index')->name('staff-incentives.index')->middleware('permission:staff incentive');
    });

    // Queue
    Route::controller(QueueController::class)->middleware('permission:queue')->group(function () {
        Route::get('queue', 'index')->name('queue.index');
        Route::post('queue/{id}/status', 'updateStatus')->name('queue.update-status');
    });

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('car-wash-revenue', [CarWashRevenueReportController::class, 'index'])->name('reports.car-wash-revenue')->middleware('permission:report car wash');
        Route::get('voucher-sales', [VoucherSalesReportController::class, 'index'])->name('reports.voucher-sales')->middleware('permission:report voucher sales');
        Route::get('stock', [StockReportController::class, 'index'])->name('reports.stock')->middleware('permission:report stock');
        Route::get('split-profit', [\App\Http\Controllers\Reports\SplitProfitReportController::class, 'index'])->name('reports.split-profit')->middleware('permission:report split profit');
    });

    // Vouchers
    Route::resource('vouchers', VoucherController::class)->middleware('permission:voucher');
    Route::controller(VoucherController::class)->middleware('permission:voucher')->group(function () {
        Route::get('vouchers/serials', 'getAllSerialNumbers')->name('vouchers.serials');
        Route::get('vouchers/search', 'searchJson')->name('vouchers.search');
        Route::post('vouchers/batch-update', 'batchUpdate')->name('vouchers.batch_update');
        Route::post('vouchers/generate-report', 'generateReport')->name('vouchers.generate-report');
        Route::post('vouchers/update-expiration', 'updateExpiration')->name('vouchers.update-expiration');
        Route::get('vouchers/print-barcodes', 'printBarcodes')->name('vouchers.print-barcodes');
    });
    Route::resource('voucher-types', VoucherTypeController::class)->middleware('permission:voucher type');
    Route::resource('voucher-packets', VoucherPacketController::class)->middleware('permission:voucher packet');

    // Settings
    Route::resource('users', UserController::class)->middleware('permission:user');
    Route::resource('roles', RoleController::class)->middleware('permission:role');
    Route::resource('permissions', PermissionController::class)->middleware('permission:permission');
    Route::resource('settings/incentive-tiers', \App\Http\Controllers\Settings\IncentiveTierController::class)->middleware('permission:incentive tier');
    Route::resource('settings/staff-incentive-tiers', \App\Http\Controllers\Settings\StaffIncentiveTierController::class)->middleware('permission:incentive tier');
    Route::resource('settings/cashier-incentive-tiers', \App\Http\Controllers\Settings\CashierIncentiveTierController::class)->middleware('permission:incentive tier');

    // New Incentive Calculation Pages
    Route::controller(\App\Http\Controllers\StaffLevelIncentiveController::class)->group(function () {
        Route::get('staff-level-incentives', 'index')->name('staff-level-incentives.index')->middleware('permission:staff incentive');
    });
    Route::controller(\App\Http\Controllers\CashierIncentiveController::class)->group(function () {
        Route::get('cashier-incentives', 'index')->name('cashier-incentives.index')->middleware('permission:staff incentive');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';