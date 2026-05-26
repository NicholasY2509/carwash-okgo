<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\CashierIncentiveTier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierIncentiveTierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tiers = CashierIncentiveTier::orderBy('min_packets', 'asc')->get();

        return Inertia::render('settings/cashier_incentive_tiers/index', [
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
            'min_packets' => 'required|integer|min:0',
            'max_packets' => 'nullable|integer|gt:min_packets',
            'commission_per_packet' => 'required|integer|min:0',
        ], [
            'name.required' => 'Nama tier harus diisi.',
            'min_packets.required' => 'Minimal jumlah paket harus diisi.',
            'min_packets.integer' => 'Minimal jumlah paket harus berupa angka.',
            'min_packets.min' => 'Minimal jumlah paket tidak boleh negatif.',
            'max_packets.integer' => 'Maksimal jumlah paket harus berupa angka.',
            'max_packets.gt' => 'Maksimal jumlah paket harus lebih besar dari minimal jumlah paket.',
            'commission_per_packet.required' => 'Komisi per paket harus diisi.',
            'commission_per_packet.integer' => 'Komisi per paket harus berupa angka.',
            'commission_per_packet.min' => 'Komisi per paket tidak boleh negatif.',
        ]);

        CashierIncentiveTier::create($validated);

        return redirect()->back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $tier = CashierIncentiveTier::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_packets' => 'required|integer|min:0',
            'max_packets' => 'nullable|integer|gt:min_packets',
            'commission_per_packet' => 'required|integer|min:0',
        ], [
            'name.required' => 'Nama tier harus diisi.',
            'min_packets.required' => 'Minimal jumlah paket harus diisi.',
            'min_packets.integer' => 'Minimal jumlah paket harus berupa angka.',
            'min_packets.min' => 'Minimal jumlah paket tidak boleh negatif.',
            'max_packets.integer' => 'Maksimal jumlah paket harus berupa angka.',
            'max_packets.gt' => 'Maksimal jumlah paket harus lebih besar dari minimal jumlah paket.',
            'commission_per_packet.required' => 'Komisi per paket harus diisi.',
            'commission_per_packet.integer' => 'Komisi per paket harus berupa angka.',
            'commission_per_packet.min' => 'Komisi per paket tidak boleh negatif.',
        ]);

        $tier->update($validated);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tier = CashierIncentiveTier::findOrFail($id);
        $tier->delete();

        return redirect()->back();
    }
}
