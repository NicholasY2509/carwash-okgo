<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\StaffIncentiveTier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffIncentiveTierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tiers = StaffIncentiveTier::orderBy('min_cars', 'asc')->get();

        return Inertia::render('settings/staff_incentive_tiers/index', [
            'tiers' => $tiers
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_cars' => 'required|integer|min:0',
            'max_cars' => 'nullable|integer|gt:min_cars',
            'flat_amount' => 'required|integer|min:0',
        ], [
            'name.required' => 'Nama tier harus diisi.',
            'min_cars.required' => 'Minimal jumlah mobil harus diisi.',
            'min_cars.integer' => 'Minimal jumlah mobil harus berupa angka.',
            'min_cars.min' => 'Minimal jumlah mobil tidak boleh negatif.',
            'max_cars.integer' => 'Maksimal jumlah mobil harus berupa angka.',
            'max_cars.gt' => 'Maksimal jumlah mobil harus lebih besar dari minimal jumlah mobil.',
            'flat_amount.required' => 'Nominal insentif harus diisi.',
            'flat_amount.integer' => 'Nominal insentif harus berupa angka.',
            'flat_amount.min' => 'Nominal insentif tidak boleh negatif.',
        ]);

        StaffIncentiveTier::create($validated);

        return redirect()->back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $tier = StaffIncentiveTier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_cars' => 'required|integer|min:0',
            'max_cars' => 'nullable|integer|gt:min_cars',
            'flat_amount' => 'required|integer|min:0',
        ], [
            'name.required' => 'Nama tier harus diisi.',
            'min_cars.required' => 'Minimal jumlah mobil harus diisi.',
            'min_cars.integer' => 'Minimal jumlah mobil harus berupa angka.',
            'min_cars.min' => 'Minimal jumlah mobil tidak boleh negatif.',
            'max_cars.integer' => 'Maksimal jumlah mobil harus berupa angka.',
            'max_cars.gt' => 'Maksimal jumlah mobil harus lebih besar dari minimal jumlah mobil.',
            'flat_amount.required' => 'Nominal insentif harus diisi.',
            'flat_amount.integer' => 'Nominal insentif harus berupa angka.',
            'flat_amount.min' => 'Nominal insentif tidak boleh negatif.',
        ]);

        $tier->update($validated);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tier = StaffIncentiveTier::findOrFail($id);
        $tier->delete();

        return redirect()->back();
    }
}
