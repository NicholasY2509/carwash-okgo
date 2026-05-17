<?php

namespace App\Http\Controllers;

use App\Models\SalesTransaction;
use App\Models\ServiceRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ServiceRecordController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'plate_number' => 'required|string'
        ]);

        $latestTransaction = SalesTransaction::with([
            'car:id,plate_number,customer_id',
            'car.customer:id,name',
            'serviceRecords'
        ])
        ->whereHas('car', function ($query) use ($request) {
            $query->where('plate_number', $request->plate_number);
        })
        ->where('transaction_type', '!=', 'Klaim Garansi') // Klaim garansi tidak bisa diklaim lagi
        ->latest('transaction_date')
        ->first();

        if (!$latestTransaction) {
            return response()->json(['message' => 'Tidak ditemukan riwayat transaksi untuk nomor polisi ini.'], 404);
        }

        $hasBeenClaimed = $latestTransaction->warranty_claimed_at !== null;

        $isWithin24Hours = Carbon::parse($latestTransaction->transaction_date)->gt(Carbon::now('Asia/Jakarta')->subDay());

        $isEligibleForReturn = !$hasBeenClaimed && $isWithin24Hours;

        $responseData = [
            'service_record' => [
                'id' => $latestTransaction->serviceRecords->first()->id, // Kirim ID service record untuk form submission
                'service_date' => $latestTransaction->transaction_date,
                'car' => $latestTransaction->car,
            ],
            'return_info' => [
                'has_been_claimed' => $hasBeenClaimed,
                'is_eligible' => $isEligibleForReturn,
            ]
        ];

        return response()->json($responseData, 200);
    }
}
