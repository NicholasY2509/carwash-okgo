<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ServiceRecordController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\StallAssignmentController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\CarController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::controller(StaffController::class)->group(function () {
    Route::get('/generate-nik/{workPositionId}', 'generateNik');
});

Route::controller(StallAssignmentController::class)->group(function () {
    Route::get('/get-washer-staff', 'getWasherStaff')->name('api.getWasherStaff');
});

Route::controller(CustomerController::class)->group(function () {
    Route::get('/customers/search', 'search')->name('api.getCustomer');
});

Route::controller(VoucherController::class)->group(function () {
    Route::get('/vouchers/check-validity', 'checkValidity')->name('api.getVoucher');
    Route::get('/vouchers/available', 'getAvailableVouchers')->name('api.getAvailableVouchers');
});

Route::controller(ServiceRecordController::class)->group(function () {
    Route::get('/service-records/search', 'search')->name('api.getServiceRecord');
});

Route::controller(CarController::class)->group(function () {
    Route::get('/cars/search', 'search');
});

Route::controller(\App\Http\Controllers\MidtransController::class)->group(function () {
    Route::post('/midtrans/webhook', 'webhook');
    Route::get('/transactions/{id}/status', 'status');
});
