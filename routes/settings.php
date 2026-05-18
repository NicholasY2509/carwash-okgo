<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\WhatsAppSettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::get('settings/whatsapp', [WhatsAppSettingsController::class, 'edit'])->name('whatsapp.edit');
    Route::get('settings/whatsapp/status', [WhatsAppSettingsController::class, 'status'])->name('whatsapp.status');
    Route::post('settings/whatsapp/initialize', [WhatsAppSettingsController::class, 'initialize'])->name('whatsapp.initialize');
    Route::get('settings/whatsapp/qr', [WhatsAppSettingsController::class, 'getQR'])->name('whatsapp.qr');
    Route::post('settings/whatsapp/logout', [WhatsAppSettingsController::class, 'logout'])->name('whatsapp.logout');
});
