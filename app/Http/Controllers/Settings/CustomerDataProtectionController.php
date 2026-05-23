<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDataProtectionController extends Controller
{
    /**
     * Show the customer data protection settings page.
     */
    public function edit(): Response
    {
        $setting = Setting::where('key', 'customer_edit_password')->first();
        
        return Inertia::render('settings/customer-protection', [
            'hasPassword' => !empty($setting?->value),
        ]);
    }

    /**
     * Update the customer edit password.
     */
    public function update(Request $request): RedirectResponse
    {
        $setting = Setting::where('key', 'customer_edit_password')->first();
        $hasPassword = !empty($setting?->value);

        $rules = [
            'password' => ['required', 'string', 'min:4', 'confirmed'],
        ];

        if ($hasPassword) {
            $rules['current_password'] = ['required', 'string'];
        }

        $validated = $request->validate($rules);

        if ($hasPassword && !Hash::check($validated['current_password'], $setting->value)) {
            throw ValidationException::withMessages([
                'current_password' => 'The provided password does not match your current password.',
            ]);
        }

        Setting::updateOrCreate(
            ['key' => 'customer_edit_password'],
            ['value' => Hash::make($validated['password'])]
        );

        return back();
    }
}
