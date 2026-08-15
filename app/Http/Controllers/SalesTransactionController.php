<?php

namespace App\Http\Controllers;

use App\Models\SalesTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesTransactionController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $type = $request->input('type', ''); // Filter by transaction type

        $query = SalesTransaction::with([
            'customer:id,name',
            'car:id,plate_number',
            'staff:id,full_name',
            'purchasedPackets.voucherPacket:id,name,price',
            'serviceRecords.product:id,name,price',
            'serviceRecords.stall:id,name',
            'serviceRecords.staff:id,full_name',
            'items.item',
        ]);

        if (!empty($type)) {
            if ($type === 'car_wash') {
                $query->whereIn('transaction_type', ['Cuci Mobil', 'Cuci Mobil Voucher', 'Klaim Garansi']);
            } elseif ($type === 'voucher') {
                $query->where('transaction_type', 'Paket Voucher');
            }
        }
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($customerQuery) use ($search) {
                    $customerQuery->where('name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('car', function ($carQuery) use ($search) {
                    $carQuery->where('plate_number', 'like', '%' . $search . '%');
                });
            });
        }

        $salesTransactions = $query
            ->orderBy('transaction_date', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('sales_transactions/index', [
            'salesTransactions' => $salesTransactions,
            'filters' => [
                'type' => $type,
                'search' => $search,
            ]
        ]);
    }

    public function resendReceipt(string $id)
    {
        $transaction = SalesTransaction::findOrFail($id);
        
        if ($transaction->status === 'cancelled') {
            return back()->with('error', 'Tidak dapat mengirim struk untuk transaksi yang dibatalkan.');
        }

        \App\Jobs\SendWhatsAppReceiptJob::dispatch($transaction)->afterResponse();

        return back()->with('success', 'Struk WhatsApp sedang dikirim ulang.');
    }

    public function sendEmailReceipt(Request $request, string $id)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $transaction = SalesTransaction::findOrFail($id);
        
        if ($transaction->status === 'cancelled') {
            return back()->with('error', 'Tidak dapat mengirim struk untuk transaksi yang dibatalkan.');
        }

        try {
            \App\Jobs\SendEmailReceiptJob::dispatchSync($transaction, $request->email);
            return back()->with('success', 'Struk Email berhasil dikirim.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengirim email: ' . $e->getMessage());
        }
    }
}
